/**
 * Raid Service — manages raid rooms in memory and combat logic.
 * Rooms are ephemeral (in-memory), results are persisted to DB.
 */

import { randomBytes } from 'node:crypto'
import { getTeamDps } from '../data/raid_dps.js'
import { pickRaidBoss } from '../data/raid_legendaries.js'
import type { RaidLegendary } from '../data/raid_legendaries.js'
import type { RaidPokemon } from '../data/raid_dps.js'
import type { PokemonType } from '../data/type_chart.js'
import UserPokemon from '#models/user_pokemon'
import type { EvolutionStage } from '#models/species'

// ── Types ────────────────────────────────────────────────────────────

export interface RaidPlayer {
  userId: number
  username: string
  socketId: string
  team: RaidPokemon[]
  ready: boolean
  connected: boolean
  dps: number          // current computed DPS vs boss
  totalDamage: number  // accumulated damage dealt
}

export type RaidPhase = 'lobby' | 'combat' | 'victory' | 'defeat' | 'closed'

export interface RaidRoom {
  code: string
  generation: number
  boss: RaidLegendary & { isShiny: boolean; maxHp: number; currentHp: number }
  phase: RaidPhase
  players: Map<number, RaidPlayer> // keyed by userId
  hostUserId: number
  createdAt: number
  combatStartedAt: number | null
  combatTimer: ReturnType<typeof setInterval> | null
  timeLeft: number // seconds remaining in combat
}

export interface RaidResult {
  roomCode: string
  generation: number
  bossSlug: string
  bossIsShiny: boolean
  victory: boolean
  players: Array<{
    userId: number
    username: string
    totalDamage: number
    caught: boolean
    goldReward: number
    candyReward: Record<string, number>
  }>
}

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Determine evolution stage from the Species.evolutionFamily array.
 * Stage 1 = base form, 2 = first evo, 3 = second evo.
 */
function getEvoStageFromFamily(slug: string, family: EvolutionStage[]): number {
  if (!family || family.length === 0) return 1
  const idx = family.findIndex(f => f.name?.toLowerCase() === slug || f.pokedexId?.toString() === slug)
  if (idx < 0) return 1
  return Math.min(idx + 1, 3)
}

// ── Constants ────────────────────────────────────────────────────────

const MIN_PLAYERS = 2
const MAX_PLAYERS = 4
const COMBAT_DURATION = 180 // 3 minutes
const SHINY_CHANCE = 1 / 100
const CATCH_CHANCE = 0.5
const TICK_INTERVAL = 1000 // 1 second

// Base HP for raid bosses per generation (scales with player count)
const BASE_BOSS_HP: Record<number, number> = {
  1: 500_000,
  2: 1_000_000,
  3: 2_000_000,
  4: 4_000_000,
  5: 8_000_000,
  6: 12_000_000,
  7: 18_000_000,
  8: 25_000_000,
  9: 35_000_000,
}

// Gold rewards per generation
const GOLD_REWARDS: Record<number, number> = {
  1: 25_000,
  2: 50_000,
  3: 100_000,
  4: 200_000,
  5: 400_000,
  6: 600_000,
  7: 900_000,
  8: 1_200_000,
  9: 1_500_000,
}

// Candy rewards per generation: { S, M, L, XL }
const CANDY_REWARDS: Record<number, Record<string, number>> = {
  1: { S: 5, M: 2, L: 0, XL: 0 },
  2: { S: 5, M: 3, L: 1, XL: 0 },
  3: { S: 5, M: 3, L: 2, XL: 0 },
  4: { S: 5, M: 5, L: 3, XL: 1 },
  5: { S: 5, M: 5, L: 3, XL: 1 },
  6: { S: 5, M: 5, L: 5, XL: 2 },
  7: { S: 5, M: 5, L: 5, XL: 3 },
  8: { S: 5, M: 5, L: 5, XL: 4 },
  9: { S: 5, M: 5, L: 5, XL: 5 },
}

// ── Singleton service ────────────────────────────────────────────────

class RaidService {
  private rooms = new Map<string, RaidRoom>()
  // userId → roomCode for quick lookup
  private playerRooms = new Map<number, string>()
  // userId → last raid result (for notifications on reconnect)
  private pendingResults = new Map<number, RaidResult>()
  // Callback for emitting events to Socket.IO (set by ws.ts)
  public onEmit: ((roomCode: string, event: string, data: any) => void) | null = null
  // Callback for giving rewards to a player (set by ws.ts)
  public onReward: ((userId: number, result: RaidResult, playerResult: RaidResult['players'][0]) => Promise<void>) | null = null

  generateCode(): string {
    return randomBytes(3).toString('hex').toUpperCase() // 6-char hex
  }

  async createRoom(userId: number, username: string, socketId: string, generation: number): Promise<RaidRoom | { error: string }> {
    // Check if player already in a room
    if (this.playerRooms.has(userId)) {
      return { error: 'already_in_room' }
    }

    const boss = await pickRaidBoss(generation)
    if (!boss) {
      return { error: 'invalid_generation' }
    }

    const isShiny = Math.random() < SHINY_CHANCE
    const code = this.generateCode()
    const baseHp = BASE_BOSS_HP[generation] ?? 500_000

    const room: RaidRoom = {
      code,
      generation,
      boss: {
        ...boss,
        isShiny,
        maxHp: baseHp,
        currentHp: baseHp,
      },
      phase: 'lobby',
      players: new Map(),
      hostUserId: userId,
      createdAt: Date.now(),
      combatStartedAt: null,
      combatTimer: null,
      timeLeft: COMBAT_DURATION,
    }

    const player: RaidPlayer = {
      userId,
      username,
      socketId,
      team: [],
      ready: false,
      connected: true,
      dps: 0,
      totalDamage: 0,
    }

    room.players.set(userId, player)
    this.rooms.set(code, room)
    this.playerRooms.set(userId, code)

    return room
  }

  joinRoom(code: string, userId: number, username: string, socketId: string): RaidRoom | { error: string } {
    if (this.playerRooms.has(userId)) {
      const existingCode = this.playerRooms.get(userId)!
      if (existingCode === code) {
        // Reconnecting to same room
        const room = this.rooms.get(code)!
        const player = room.players.get(userId)
        if (player) {
          player.socketId = socketId
          player.connected = true
          return room
        }
      }
      return { error: 'already_in_room' }
    }

    const room = this.rooms.get(code)
    if (!room) return { error: 'room_not_found' }
    if (room.phase !== 'lobby') return { error: 'room_not_in_lobby' }
    if (room.players.size >= MAX_PLAYERS) return { error: 'room_full' }

    const player: RaidPlayer = {
      userId,
      username,
      socketId,
      team: [],
      ready: false,
      connected: true,
      dps: 0,
      totalDamage: 0,
    }

    room.players.set(userId, player)
    this.playerRooms.set(userId, code)

    return room
  }

  leaveRoom(userId: number): { code: string; disbanded: boolean } | null {
    const code = this.playerRooms.get(userId)
    if (!code) return null

    const room = this.rooms.get(code)
    if (!room) {
      this.playerRooms.delete(userId)
      return null
    }

    if (room.phase === 'combat') {
      // During combat, just mark as disconnected — team keeps fighting
      const player = room.players.get(userId)
      if (player) player.connected = false
      return { code, disbanded: false }
    }

    // In lobby: remove from room
    room.players.delete(userId)
    this.playerRooms.delete(userId)

    // If host left or room empty → disband
    if (room.players.size === 0 || userId === room.hostUserId) {
      this.disbandRoom(code)
      return { code, disbanded: true }
    }

    return { code, disbanded: false }
  }

  /**
   * Set team from client-provided pokemon IDs.
   * Resolves types & evo stage from Species DB (no duplication).
   */
  async setTeam(userId: number, teamInput: Array<{ id: number; slug: string; level: number; stars: number; isShiny: boolean; rarity: string }>): Promise<boolean> {
    const code = this.playerRooms.get(userId)
    if (!code) return false
    const room = this.rooms.get(code)
    if (!room || room.phase !== 'lobby') return false
    const player = room.players.get(userId)
    if (!player) return false

    if (teamInput.length > 6) return false

    // Verify ownership: all pokemon must belong to this user
    const pokemonIds = teamInput.map(p => p.id)
    const ownedPokemon = await UserPokemon.query()
      .where('userId', userId)
      .whereIn('id', pokemonIds)
      .preload('species')
    const ownedMap = new Map(ownedPokemon.map(p => [p.id, p]))

    const team: RaidPokemon[] = []
    for (const input of teamInput.slice(0, 6)) {
      const owned = ownedMap.get(input.id)
      if (!owned) continue // skip if not owned

      const species = owned.species
      const types: PokemonType[] = species
        ? [species.type1 as PokemonType, ...(species.type2 ? [species.type2 as PokemonType] : [])]
        : ['normal' as PokemonType]

      const evoStage = species?.evolutionFamily
        ? getEvoStageFromFamily(species.slug, species.evolutionFamily)
        : 1

      team.push({
        slug: owned.species?.slug ?? input.slug,
        level: owned.level,
        stars: owned.stars,
        isShiny: owned.isShiny,
        rarity: owned.rarity,
        types,
        evoStage,
      })
    }

    player.team = team
    player.ready = false
    return true
  }

  setReady(userId: number, ready: boolean): { room: RaidRoom; allReady: boolean } | { error: string } {
    const code = this.playerRooms.get(userId)
    if (!code) return { error: 'not_in_room' }
    const room = this.rooms.get(code)
    if (!room || room.phase !== 'lobby') return { error: 'not_in_lobby' }
    const player = room.players.get(userId)
    if (!player) return { error: 'not_in_room' }
    if (player.team.length === 0) return { error: 'no_team' }

    player.ready = ready

    // Check if all players ready and enough players
    const allReady = room.players.size >= MIN_PLAYERS && 
      Array.from(room.players.values()).every(p => p.ready)

    return { room, allReady }
  }

  startCombat(code: string): boolean {
    // DPS already uses enriched RaidPokemon with types/evoStage from setTeam
    const room = this.rooms.get(code)
    if (!room || room.phase !== 'lobby') return false

    const playerCount = room.players.size
    if (playerCount < MIN_PLAYERS) return false

    // Scale boss HP based on player count: 2P=base, 3P=×1.5, 4P=×2
    const hpScale = 1 + (playerCount - 2) * 0.5
    const scaledHp = Math.round(room.boss.maxHp * hpScale)
    room.boss.maxHp = scaledHp
    room.boss.currentHp = scaledHp

    // Compute each player's DPS
    for (const player of room.players.values()) {
      player.dps = getTeamDps(player.team, room.boss.types as PokemonType[])
      player.totalDamage = 0
    }

    room.phase = 'combat'
    room.combatStartedAt = Date.now()
    room.timeLeft = COMBAT_DURATION

    // Start combat tick
    room.combatTimer = setInterval(() => this.tick(code), TICK_INTERVAL)

    return true
  }

  private tick(code: string) {
    const room = this.rooms.get(code)
    if (!room || room.phase !== 'combat') {
      return
    }

    // Decrease timer
    room.timeLeft--

    // Apply damage from all players (connected or not — teams keep fighting)
    let totalDamageTick = 0
    for (const player of room.players.values()) {
      const dmg = player.dps
      player.totalDamage += dmg
      totalDamageTick += dmg
    }
    room.boss.currentHp = Math.max(0, room.boss.currentHp - totalDamageTick)

    // Emit tick update
    this.emitUpdate(code, room)

    // Check victory
    if (room.boss.currentHp <= 0) {
      this.endCombat(code, true)
      return
    }

    // Check timeout
    if (room.timeLeft <= 0) {
      this.endCombat(code, false)
      return
    }
  }

  private endCombat(code: string, victory: boolean) {
    const room = this.rooms.get(code)
    if (!room) return

    if (room.combatTimer) {
      clearInterval(room.combatTimer)
      room.combatTimer = null
    }

    room.phase = victory ? 'victory' : 'defeat'

    // Build result
    const result: RaidResult = {
      roomCode: code,
      generation: room.generation,
      bossSlug: room.boss.slug,
      bossIsShiny: room.boss.isShiny,
      victory,
      players: [],
    }

    const goldReward = victory ? (GOLD_REWARDS[room.generation] ?? 25_000) : 0
    const candyReward = victory ? (CANDY_REWARDS[room.generation] ?? { S: 0, M: 0, L: 0, XL: 0 }) : { S: 0, M: 0, L: 0, XL: 0 }

    for (const player of room.players.values()) {
      const caught = victory && Math.random() < CATCH_CHANCE
      const playerResult = {
        userId: player.userId,
        username: player.username,
        totalDamage: player.totalDamage,
        caught,
        goldReward,
        candyReward: { ...candyReward },
      }
      result.players.push(playerResult)

      // Give rewards async
      if (victory && this.onReward) {
        this.onReward(player.userId, result, playerResult).catch(() => {})
      }

      // Store pending result for disconnected players
      if (!player.connected) {
        this.pendingResults.set(player.userId, result)
      }
    }

    // Emit result
    if (this.onEmit) {
      this.onEmit(code, 'raid:result', {
        victory,
        bossSlug: room.boss.slug,
        bossIsShiny: room.boss.isShiny,
        players: result.players,
      })
    }

    // Auto-cleanup after 30 seconds
    setTimeout(() => this.disbandRoom(code), 30_000)
  }

  private emitUpdate(code: string, room: RaidRoom) {
    if (!this.onEmit) return
    this.onEmit(code, 'raid:tick', {
      bossCurrentHp: room.boss.currentHp,
      bossMaxHp: room.boss.maxHp,
      timeLeft: room.timeLeft,
      players: Array.from(room.players.values()).map(p => ({
        userId: p.userId,
        username: p.username,
        dps: p.dps,
        totalDamage: p.totalDamage,
        connected: p.connected,
      })),
    })
  }

  private disbandRoom(code: string) {
    const room = this.rooms.get(code)
    if (!room) return

    if (room.combatTimer) {
      clearInterval(room.combatTimer)
      room.combatTimer = null
    }

    for (const player of room.players.values()) {
      this.playerRooms.delete(player.userId)
    }

    room.phase = 'closed'
    this.rooms.delete(code)
  }

  // Get pending result for a player (and clear it)
  getPendingResult(userId: number): RaidResult | null {
    const result = this.pendingResults.get(userId)
    if (result) {
      this.pendingResults.delete(userId)
      return result
    }
    return null
  }

  // Get room by player
  getRoomForPlayer(userId: number): RaidRoom | null {
    const code = this.playerRooms.get(userId)
    if (!code) return null
    return this.rooms.get(code) ?? null
  }

  // Get room by code
  getRoom(code: string): RaidRoom | null {
    return this.rooms.get(code) ?? null
  }

  // Get serializable room state for client
  getRoomState(room: RaidRoom) {
    return {
      code: room.code,
      generation: room.generation,
      phase: room.phase,
      boss: {
        slug: room.boss.slug,
        nameFr: room.boss.nameFr,
        nameEn: room.boss.nameEn,
        types: room.boss.types,
        isShiny: room.boss.isShiny,
        maxHp: room.boss.maxHp,
        currentHp: room.boss.currentHp,
      },
      hostUserId: room.hostUserId,
      timeLeft: room.timeLeft,
      players: Array.from(room.players.values()).map(p => ({
        userId: p.userId,
        username: p.username,
        team: p.team,
        ready: p.ready,
        connected: p.connected,
        dps: p.dps,
        totalDamage: p.totalDamage,
      })),
    }
  }

  // List open lobbies for a generation
  listOpenLobbies(generation?: number): Array<{ code: string; generation: number; bossSlug: string; bossNameFr: string; bossNameEn: string; bossIsShiny: boolean; playerCount: number; maxPlayers: number }> {
    const lobbies: Array<{ code: string; generation: number; bossSlug: string; bossNameFr: string; bossNameEn: string; bossIsShiny: boolean; playerCount: number; maxPlayers: number }> = []
    for (const room of this.rooms.values()) {
      if (room.phase !== 'lobby') continue
      if (generation !== undefined && room.generation !== generation) continue
      lobbies.push({
        code: room.code,
        generation: room.generation,
        bossSlug: room.boss.slug,
        bossNameFr: room.boss.nameFr,
        bossNameEn: room.boss.nameEn,
        bossIsShiny: room.boss.isShiny,
        playerCount: room.players.size,
        maxPlayers: MAX_PLAYERS,
      })
    }
    return lobbies
  }

  // Reconnect: update socketId
  reconnect(userId: number, socketId: string): RaidRoom | null {
    const code = this.playerRooms.get(userId)
    if (!code) return null
    const room = this.rooms.get(code)
    if (!room) return null
    const player = room.players.get(userId)
    if (player) {
      player.socketId = socketId
      player.connected = true
    }
    return room
  }
}

// Singleton
export const raidService = new RaidService()

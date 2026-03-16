/**
 * Socket.IO initialization and raid event handlers.
 * Attached to the AdonisJS HTTP server in bin/server.ts.
 */

import { Server as SocketServer } from 'socket.io'
import type { Server as HttpServer } from 'node:http'
import { raidService } from '../app/services/raid_service.js'
import User from '#models/user'
import UserPokemon from '#models/user_pokemon'
import Species from '#models/species'

let io: SocketServer | null = null

export function getIO(): SocketServer | null {
  return io
}

export function initSocketIO(httpServer: HttpServer, origin: string | string[] | boolean) {
  io = new SocketServer(httpServer, {
    cors: {
      origin,
      credentials: true,
    },
    path: '/ws',
  })

  // Wire up raid service emit callback
  raidService.onEmit = (roomCode: string, event: string, data: any) => {
    io?.to(`raid:${roomCode}`).emit(event, data)
  }

  // Wire up reward callback
  raidService.onReward = async (userId: number, result, playerResult) => {
    try {
      const user = await User.find(userId)
      if (!user) return

      // Give gold
      if (playerResult.goldReward > 0) {
        user.gold = (user.gold ?? 0) + playerResult.goldReward
      }

      // Give candies
      if (result.victory) {
        const candies = user.candies ?? { S: 0, M: 0, L: 0, XL: 0 }
        for (const [size, qty] of Object.entries(playerResult.candyReward)) {
          candies[size] = (candies[size] ?? 0) + qty
        }
        user.candies = candies
      }

      // Give caught legendary
      if (playerResult.caught) {
        // Find or create species
        let species = await Species.findBy('slug', result.bossSlug)
        if (!species) {
          species = await Species.create({
            slug: result.bossSlug,
            tyradexId: 0,
            nameFr: result.bossSlug,
            nameEn: result.bossSlug,
            type1: 'Normal',
            type2: null,
            generation: result.generation,
            baseStats: {},
            evolutionFamily: null,
            spriteRegular: `https://play.pokemonshowdown.com/sprites/ani/${result.bossSlug}.gif`,
            spriteShiny: `https://play.pokemonshowdown.com/sprites/ani-shiny/${result.bossSlug}.gif`,
          })
        }

        await UserPokemon.create({
          userId: user.id,
          speciesId: species.id,
          level: 1,
          xp: 0,
          stars: 1,
          isShiny: result.bossIsShiny,
          rarity: 'legendary',
          teamSlot: null,
        })
      }

      await user.save()
    } catch (err) {
      console.error(`[Raid] Failed to give rewards to user ${userId}:`, err)
    }
  }

  // ── Socket.IO connection handler ─────────────────────────────────

  io.on('connection', (socket) => {
    let currentUserId: number | null = null
    let currentUsername: string | null = null

    // Auth: client sends userId + username on connect
    const authUserId = Number(socket.handshake.auth?.userId)
    const authUsername = String(socket.handshake.auth?.username ?? '')

    if (!authUserId || !authUsername) {
      socket.disconnect()
      return
    }

    currentUserId = authUserId
    currentUsername = authUsername

    // Check for pending raid results (reconnect notification)
    const pending = raidService.getPendingResult(currentUserId)
    if (pending) {
      socket.emit('raid:pending_result', {
        victory: pending.victory,
        bossSlug: pending.bossSlug,
        bossIsShiny: pending.bossIsShiny,
        players: pending.players,
      })
    }

    // Check if player was in a room (reconnect)
    const existingRoom = raidService.reconnect(currentUserId, socket.id)
    if (existingRoom) {
      socket.join(`raid:${existingRoom.code}`)
      socket.emit('raid:room_state', raidService.getRoomState(existingRoom))
    }

    // ── List open lobbies ──────────────────────────────────────────

    socket.on('raid:list_lobbies', (data: { generation?: number }, callback) => {
      const lobbies = raidService.listOpenLobbies(data?.generation)
      if (typeof callback === 'function') callback({ lobbies })
    })

    // ── Create room ────────────────────────────────────────────────

    socket.on('raid:create', async (data: { generation: number }, callback) => {
      if (!currentUserId || !currentUsername) return
      const result = await raidService.createRoom(currentUserId, currentUsername, socket.id, data.generation)
      if ('error' in result) {
        if (typeof callback === 'function') callback({ error: result.error })
        return
      }
      socket.join(`raid:${result.code}`)
      const state = raidService.getRoomState(result)
      if (typeof callback === 'function') callback({ room: state })
      // Broadcast updated lobbies
      io?.emit('raid:lobbies_updated')
    })

    // ── Join room ──────────────────────────────────────────────────

    socket.on('raid:join', (data: { code: string }, callback) => {
      if (!currentUserId || !currentUsername) return
      const result = raidService.joinRoom(data.code.toUpperCase(), currentUserId, currentUsername, socket.id)
      if ('error' in result) {
        if (typeof callback === 'function') callback({ error: result.error })
        return
      }
      socket.join(`raid:${result.code}`)
      const state = raidService.getRoomState(result)
      if (typeof callback === 'function') callback({ room: state })
      // Notify others in room
      io?.to(`raid:${result.code}`).emit('raid:room_state', state)
      io?.emit('raid:lobbies_updated')
    })

    // ── Leave room ─────────────────────────────────────────────────

    socket.on('raid:leave', (_, callback) => {
      if (!currentUserId) return
      const result = raidService.leaveRoom(currentUserId)
      if (!result) {
        if (typeof callback === 'function') callback({ error: 'not_in_room' })
        return
      }
      socket.leave(`raid:${result.code}`)
      if (typeof callback === 'function') callback({ ok: true })

      if (result.disbanded) {
        io?.to(`raid:${result.code}`).emit('raid:disbanded')
      } else {
        // Update remaining players
        const room = raidService.getRoom(result.code)
        if (room) {
          io?.to(`raid:${result.code}`).emit('raid:room_state', raidService.getRoomState(room))
        }
      }
      io?.emit('raid:lobbies_updated')
    })

    // ── Set team ───────────────────────────────────────────────────

    socket.on('raid:set_team', async (data: { team: Array<{ id: number; slug: string; level: number; stars: number; isShiny: boolean; rarity: string }> }, callback) => {
      if (!currentUserId) return
      const ok = await raidService.setTeam(currentUserId, data.team)
      if (typeof callback === 'function') callback({ ok })

      // Broadcast updated room state
      const room = raidService.getRoomForPlayer(currentUserId)
      if (room) {
        io?.to(`raid:${room.code}`).emit('raid:room_state', raidService.getRoomState(room))
      }
    })

    // ── Toggle ready ───────────────────────────────────────────────

    socket.on('raid:ready', (data: { ready: boolean }, callback) => {
      if (!currentUserId) return
      const result = raidService.setReady(currentUserId, data.ready)
      if ('error' in result) {
        if (typeof callback === 'function') callback({ error: result.error })
        return
      }

      const state = raidService.getRoomState(result.room)
      if (typeof callback === 'function') callback({ ok: true, allReady: result.allReady })

      io?.to(`raid:${result.room.code}`).emit('raid:room_state', state)

      // If all ready, start combat
      if (result.allReady) {
        const started = raidService.startCombat(result.room.code)
        if (started) {
          const combatState = raidService.getRoomState(result.room)
          io?.to(`raid:${result.room.code}`).emit('raid:combat_start', combatState)
        }
      }
    })

    // ── Disconnect handling ────────────────────────────────────────

    socket.on('disconnect', () => {
      if (!currentUserId) return
      const room = raidService.getRoomForPlayer(currentUserId)
      if (room) {
        if (room.phase === 'combat') {
          // Mark as disconnected but keep in combat
          const player = room.players.get(currentUserId)
          if (player) player.connected = false
          io?.to(`raid:${room.code}`).emit('raid:room_state', raidService.getRoomState(room))
        } else if (room.phase === 'lobby') {
          // Leave lobby on disconnect
          raidService.leaveRoom(currentUserId)
          const updatedRoom = raidService.getRoom(room.code)
          if (updatedRoom) {
            io?.to(`raid:${room.code}`).emit('raid:room_state', raidService.getRoomState(updatedRoom))
          } else {
            io?.to(`raid:${room.code}`).emit('raid:disbanded')
          }
          io?.emit('raid:lobbies_updated')
        }
      }
    })
  })

  console.log('[Socket.IO] Raid WebSocket server initialized')
}

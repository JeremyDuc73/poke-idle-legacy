import { useCombatStore } from '~/stores/useCombatStore'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useInventoryStore } from '~/stores/useInventoryStore'
import { useDaycareStore } from '~/stores/useDaycareStore'
import { getSpriteUrl, getShinySpriteUrl, getTrainerSpriteUrl } from '~/utils/showdown'
import { getZone } from '~/data/zones'
import { getPokemonType, getPokemonTypes, getTypeEffectiveness } from '~/data/types'
import { getRarityDpsMult, getStarDpsMult, getSlugGeneration, RARITY_DPS_MULT, getShinyRate } from '~/data/gacha'
import { getEvoStageMult } from '~/data/evolutions'
import type { Rarity } from '~/data/gacha'
import type { PokemonType } from '~/data/types'
import type { WildPokemon, BossTrainer } from '~/data/zones'

let initialized = false

export function useCombatLoop() {
  const combat = useCombatStore()
  const player = usePlayerStore()
  const inventory = useInventoryStore()
  const daycare = useDaycareStore()

  // New damage formula:
  // base = level (1 at lv1, 100 at lv100)
  // permanent multipliers: evo stage (x1.2/x1.4), rarity (x1.1/x1.5/x2.0), shiny (x4)
  // type-dependent: effectiveness table
  function getPokeDps(poke: { slug: string; level: number; stars: number; isShiny: boolean; rarity?: Rarity }, enemyTypes?: PokemonType[]) {
    const baseDmg = poke.level * 2
    const evoMult = getEvoStageMult(poke.slug)
    const rarityMult = poke.rarity ? (RARITY_DPS_MULT[poke.rarity] ?? 1.0) : 1.0
    const shinyMult = poke.isShiny ? 4.0 : 1.0
    const starMult = getStarDpsMult(poke.stars, poke.isShiny)

    // Region penalty: 99.9% damage reduction if fighting outside native generation
    const pokeGen = getSlugGeneration(poke.slug)
    const combatGen = player.combatGeneration ?? player.currentGeneration
    const regionMult = pokeGen === combatGen ? 1.0 : 0.001
    
    // Pour un Pokémon avec doubles types, utiliser le MEILLEUR type offensif
    const attackerTypes = getPokemonTypes(poke.slug)
    let typeMult = 1
    if (enemyTypes && enemyTypes.length > 0) {
      typeMult = Math.max(...attackerTypes.map(atkType => 
        getTypeEffectiveness(atkType, enemyTypes)
      ))
    }
    
    const permanentDps = Math.floor(baseDmg * evoMult * rarityMult * shinyMult * starMult * regionMult)
    return {
      baseDmg,
      evoMult,
      rarityMult,
      shinyMult,
      regionMult,
      typeMult,
      permanentDps,
      effectiveDps: Math.round(permanentDps * typeMult),
    }
  }

  function getEffectiveDps(enemyTypes: PokemonType[]): number {
    const team = inventory.team
    if (team.length === 0) return 0
    let total = 0
    for (const poke of team) {
      total += getPokeDps(poke, enemyTypes).effectiveDps
    }
    return total
  }

  function currentZone() {
    return getZone(player.activeCombatGen, player.activeCombatZone)
  }

  function randomWild(): WildPokemon {
    const zone = currentZone()
    if (!zone || zone.wild.length === 0) {
      return { nameFr: 'Rattata', nameEn: 'Rattata', slug: 'rattata', type: 'normal', baseHp: 30, baseAtk: 6 }
    }
    return zone.wild[Math.floor(Math.random() * zone.wild.length)]!
  }

  function spawnEnemy() {
    const gen = player.activeCombatGen
    const zone = player.activeCombatZone
    const stage = player.isFarming ? 5 : player.currentStage

    // Local difficulty resets per generation so each region feels fresh
    const localDifficulty = (zone - 1) * 10 + stage

    // Adaptive gen scaling: stronger for early zones, gentler for late zones
    // Satisfies: Pierre~2K, Blue~400K, gen9-z1~15K, gen9-z13~1M
    const genDiffMult = 1 + (gen - 1) * (0.16 + 3.4 / localDifficulty)

    if (player.isBossStage) {
      const boss = currentZone()?.boss
      if (boss) spawnBoss(boss, localDifficulty, genDiffMult, gen)
    } else {
      spawnWild(localDifficulty, genDiffMult, gen)
    }
  }

  function spawnWild(localDiff: number, genDiffMult: number, gen: number) {
    const poke = randomWild()
    const isShiny = Math.random() < getShinyRate(player.shinyCharms, player.pokedexMaster)
    // HP scales with local difficulty (resets per gen) × gentle gen multiplier
    const hp = Math.round(poke.baseHp * (1 + localDiff * 0.6) * genDiffMult * 2)
    // Gold scales with banner cost: ~5 pulls/100 kills at start, ~10 at end
    // Gen 1 uses lower base (25) to match cheap Kanto banner (500g)
    const diffScale = 1 + localDiff * 0.02
    const goldBase = gen === 1 ? 50 : 400 * gen * gen
    const xpBase = gen === 1 ? 50 : 200 * gen * gen
    const goldReward = Math.round(goldBase * diffScale * (isShiny ? 5 : 1))
    const xpReward = Math.round(xpBase * diffScale * (isShiny ? 3 : 1))
    combat.setEnemy({
      nameFr: isShiny ? `✨ ${poke.nameFr} sauvage ✨` : `${poke.nameFr} sauvage`,
      nameEn: isShiny ? `✨ Wild ${poke.nameEn} ✨` : `Wild ${poke.nameEn}`,
      slug: poke.slug,
      types: getPokemonTypes(poke.slug),
      spriteUrl: isShiny ? getShinySpriteUrl(poke.slug) : getSpriteUrl(poke.slug),
      maxHp: hp,
      currentHp: hp,
      level: Math.max(3, Math.min(95, Math.round(3 + localDiff * 92 / 130))),
      goldReward,
      xpReward,
      isBoss: false,
      bossTimerSeconds: null,
      isShiny,
    })
  }

  function spawnBoss(boss: BossTrainer, localDiff: number, genDiffMult: number, gen: number) {
    // Boss HP: smooth team factor 2.0 (z1) → 6.0 (z13) — boss trainer teams are visual/lore only
    const zoneIdx = player.activeCombatZone - 1
    const smoothTeam = 2 + (zoneIdx / 12) * 4
    // Champion (z13) gets ×1.2 HP to stay hardest despite longer timer
    const championMult = zoneIdx === 12 ? 1.2 : 1.0
    const totalHp = Math.round(smoothTeam * 140 * Math.pow(localDiff, 1.21) * genDiffMult * championMult)
    // Boss rewards ≈ 10× wild rewards
    const diffScale = 1 + localDiff * 0.02
    const goldBase = gen === 1 ? 500 : 4000 * gen * gen
    const xpBase = gen === 1 ? 500 : 2000 * gen * gen
    const bossTypes = getPokemonTypes(boss.team[0]?.slug ?? 'normal')
    combat.setEnemy({
      nameFr: `Boss : ${boss.nameFr}`,
      nameEn: `Boss: ${boss.nameEn}`,
      slug: boss.slug,
      types: bossTypes,
      spriteUrl: getTrainerSpriteUrl(boss.slug),
      maxHp: totalHp,
      currentHp: totalHp,
      level: Math.max(5, Math.min(100, Math.round(5 + localDiff * 95 / 130))),
      goldReward: Math.round(goldBase * diffScale),
      xpReward: Math.round(xpBase * diffScale),
      isBoss: true,
      bossTimerSeconds: boss.timerSeconds,
    })
  }

  function checkEnemyDeath() {
    if (combat.isEnemyDead && combat.enemy) {
      const goldPenalty = player.penaltyType === 'gold' ? (1 - player.penaltyPercent / 100) : 1
      const goldReward = Math.max(1, Math.round(combat.enemy.goldReward * goldPenalty))
      const xpReward = combat.enemy.xpReward
      const wasBoss = combat.enemy.isBoss
      player.addGold(goldReward)
      player.addXp(xpReward)

      const team = inventory.team
      if (team.length > 0) {
        const xpPerPokemon = Math.max(1, Math.floor(xpReward / team.length))
        for (const poke of team) {
          inventory.addPokemonXp(poke.id, xpPerPokemon, player.currentGeneration)
        }
      }

      combat.killEnemy()

      // Only advance progression when fighting at the frontier (not farming)
      if (!player.isFarming) {
        if (wasBoss) {
          player.advanceStage()
        } else {
          player.addStageKill()
        }
      }

      setTimeout(() => spawnEnemy(), 400)
    }
  }

  function init() {
    if (initialized) return
    initialized = true

    // Sync persisted upgrade bonuses from player store
    combat.clickDamage = player.clickDamage

    // Keep click damage in sync when player levels up
    watch(() => player.clickDamage, (val) => {
      combat.clickDamage = val
    })

    // Override autoAttackTick to use type-effective DPS + player level multiplier
    combat.overrideAutoAttack = () => {
      if (!combat.enemy || combat.enemy.currentHp <= 0) return
      // Safety check: detect boss timeout directly in case watcher missed it
      if (combat.bossTimeRemaining !== null && combat.bossTimeRemaining <= 0) {
        combat.bossFailed()
        player.retreatStage()
        setTimeout(() => spawnEnemy(), 1000)
        return
      }
      const baseDps = getEffectiveDps(combat.enemy.types)
      if (baseDps <= 0) return
      const dpsPenalty = player.penaltyType === 'dps' ? (1 - player.penaltyPercent / 100) : 1
      const effectiveDps = Math.max(1, Math.round(baseDps * dpsPenalty))
      combat.enemy.currentHp = Math.max(0, combat.enemy.currentHp - effectiveDps)
      daycare.addDamage(effectiveDps)
      checkEnemyDeath()
    }

    // Watch for enemy HP changes (from clicks)
    watch(() => combat.enemy?.currentHp, () => {
      checkEnemyDeath()
    })

    // Watch boss timeout
    watch(() => combat.bossTimedOut, (timedOut) => {
      if (timedOut) {
        combat.bossFailed()
        player.retreatStage()
        setTimeout(() => spawnEnemy(), 1000)
      }
    })

    // Pause/resume when page visibility changes
    if (import.meta.client) {
      let hiddenAt: number | null = null
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          hiddenAt = Date.now()
          combat.clearTimers()
        } else {
          // Deduct elapsed time from boss timer while tab was hidden
          if (hiddenAt && combat.bossTimeRemaining !== null) {
            const elapsedSeconds = Math.floor((Date.now() - hiddenAt) / 1000)
            combat.bossTimeRemaining = Math.max(0, combat.bossTimeRemaining - elapsedSeconds)
          }
          hiddenAt = null

          if (combat.enemy && combat.enemy.currentHp > 0) {
            // Check if boss timed out while hidden
            if (combat.bossTimeRemaining !== null && combat.bossTimeRemaining <= 0) {
              combat.bossFailed()
              player.retreatStage()
              setTimeout(() => spawnEnemy(), 1000)
            } else {
              combat.resumeTimers()
            }
          } else {
            spawnEnemy()
          }
        }
      })
    }

    // Start combat
    spawnEnemy()
  }

  function forceBossSpawn(genId: number, zoneId: number) {
    const zone = getZone(genId, zoneId)
    if (!zone) return
    const boss = zone.boss
    const localDifficulty = (zoneId - 1) * 10 + 10
    const genDiffMult = 1 + (genId - 1) * (0.16 + 3.4 / localDifficulty)
    spawnBoss(boss, localDifficulty, genDiffMult, genId)
  }

  return {
    init,
    spawnEnemy,
    checkEnemyDeath,
    getEffectiveDps,
    getPokeDps,
    currentZone,
    forceBossSpawn,
  }
}

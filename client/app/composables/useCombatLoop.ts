import { useCombatStore } from '~/stores/useCombatStore'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useInventoryStore } from '~/stores/useInventoryStore'
import { useDaycareStore } from '~/stores/useDaycareStore'
import { getSpriteUrl, getTrainerSpriteUrl } from '~/utils/showdown'
import { getZone, GENERATIONS } from '~/data/zones'
import { getPokemonType, getPokemonTypes, getTypeEffectiveness } from '~/data/types'
import { getRarityDpsMult, getStarDpsMult, getSlugGeneration } from '~/data/gacha'
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
  // permanent multipliers: evo stage (x1.2/x1.4), rarity (x1.1/x1.5/x2.0), shiny (x1.2)
  // type-dependent: effectiveness table
  function getPokeDps(poke: { slug: string; level: number; stars: number; isShiny: boolean; rarity?: Rarity }, enemyTypes?: PokemonType[]) {
    const baseDmg = poke.level
    const evoMult = getEvoStageMult(poke.slug)
    const rarityMult = poke.rarity ? getRarityDpsMult(poke.slug) : 1.0
    const shinyMult = poke.isShiny ? 1.2 : 1.0
    const starMult = getStarDpsMult(poke.stars, poke.isShiny)

    // Region penalty: 50% damage if fighting outside native generation
    const pokeGen = getSlugGeneration(poke.slug)
    const combatGen = player.combatGeneration ?? player.currentGeneration
    const regionMult = pokeGen === combatGen ? 1.0 : 0.5
    
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

    // Local difficulty for HP/level (resets per gen so new regions feel fresh)
    const localDifficulty = (zone - 1) * 10 + stage

    // Continuous difficulty for gold/XP (accumulates across all gens)
    const prevZones = GENERATIONS
      .filter((g) => g.id < gen)
      .reduce((sum, g) => sum + g.zones.length, 0)
    const globalDifficulty = (prevZones + zone - 1) * 10 + stage

    // Generation multiplier so gold/XP keeps up with banner cost increases
    const genMultiplier = gen

    if (player.isBossStage) {
      const boss = currentZone()?.boss
      if (boss) spawnBoss(boss, localDifficulty, globalDifficulty, genMultiplier)
    } else {
      spawnWild(localDifficulty, globalDifficulty, genMultiplier)
    }
  }

  function spawnWild(localDiff: number, globalDiff: number, genMult: number) {
    const poke = randomWild()
    const hp = Math.round(poke.baseHp * (1 + localDiff * 0.55))
    combat.setEnemy({
      nameFr: `${poke.nameFr} sauvage`,
      nameEn: `Wild ${poke.nameEn}`,
      slug: poke.slug,
      types: getPokemonTypes(poke.slug),
      spriteUrl: getSpriteUrl(poke.slug),
      maxHp: hp,
      currentHp: hp,
      level: localDiff,
      goldReward: (10 + 3 * globalDiff) * genMult,
      xpReward: (5 + 4 * globalDiff) * genMult,
      isBoss: false,
      bossTimerSeconds: null,
    })
  }

  function spawnBoss(boss: BossTrainer, localDiff: number, globalDiff: number, genMult: number) {
    const zone = player.activeCombatZone
    const totalHp = boss.team.reduce((sum, p) => sum + Math.round(p.level * p.level), 0) * (1 + zone * 0.15)
    const bossTypes = getPokemonTypes(boss.team[0]?.slug ?? 'normal')
    combat.setEnemy({
      nameFr: `Boss : ${boss.nameFr}`,
      nameEn: `Boss: ${boss.nameEn}`,
      slug: boss.slug,
      types: bossTypes,
      spriteUrl: getTrainerSpriteUrl(boss.slug),
      maxHp: totalHp,
      currentHp: totalHp,
      level: Math.max(...boss.team.map((p) => p.level)),
      goldReward: (100 + 25 * globalDiff) * genMult,
      xpReward: (50 + 25 * globalDiff) * genMult,
      isBoss: true,
      bossTimerSeconds: boss.timerSeconds,
    })
  }

  function checkEnemyDeath() {
    if (combat.isEnemyDead && combat.enemy) {
      const goldReward = combat.enemy.goldReward
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
      const baseDps = getEffectiveDps(combat.enemy.types)
      if (baseDps <= 0) return
      const playerLevelMult = 1 + (player.level - 1) * 0.02
      const effectiveDps = Math.round(baseDps * playerLevelMult)
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
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          combat.clearTimers()
        } else {
          if (combat.enemy && combat.enemy.currentHp > 0) {
            combat.resumeTimers()
          } else {
            spawnEnemy()
          }
        }
      })
    }

    // Start combat
    spawnEnemy()
  }

  return {
    init,
    spawnEnemy,
    checkEnemyDeath,
    getEffectiveDps,
    getPokeDps,
    currentZone,
  }
}

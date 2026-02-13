import { useCombatStore } from '~/stores/useCombatStore'
import { usePlayerStore } from '~/stores/usePlayerStore'
import { useInventoryStore } from '~/stores/useInventoryStore'
import { useDaycareStore } from '~/stores/useDaycareStore'
import { getSpriteUrl, getTrainerSpriteUrl } from '~/utils/showdown'
import { getZone } from '~/data/zones'
import { getPokemonType, getEffectiveness } from '~/data/types'
import { getRarityDpsMult, getStarDpsMult } from '~/data/gacha'
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
  function getPokeDps(poke: { slug: string; level: number; stars: number; isShiny: boolean; rarity?: Rarity }, enemyType?: PokemonType) {
    const baseDmg = poke.level
    const evoMult = getEvoStageMult(poke.slug)
    const rarityMult = poke.rarity ? getRarityDpsMult(poke.slug) : 1.0
    const shinyMult = poke.isShiny ? 1.2 : 1.0
    const starMult = getStarDpsMult(poke.stars, poke.isShiny)
    const pokeType = getPokemonType(poke.slug)
    const typeMult = enemyType ? getEffectiveness(pokeType, enemyType) : 1
    const permanentDps = Math.floor(baseDmg * evoMult * rarityMult * shinyMult * starMult)
    return {
      baseDmg,
      evoMult,
      rarityMult,
      shinyMult,
      typeMult,
      permanentDps,
      effectiveDps: Math.round(permanentDps * typeMult),
    }
  }

  function getEffectiveDps(enemyType: PokemonType): number {
    const team = inventory.team
    if (team.length === 0) return 0
    let total = 0
    for (const poke of team) {
      total += getPokeDps(poke, enemyType).effectiveDps
    }
    return total
  }

  function currentZone() {
    return getZone(player.currentGeneration, player.currentZone)
  }

  function randomWild(): WildPokemon {
    const zone = currentZone()
    if (!zone || zone.wild.length === 0) {
      return { nameFr: 'Rattata', nameEn: 'Rattata', slug: 'rattata', type: 'normal', baseHp: 30, baseAtk: 6 }
    }
    return zone.wild[Math.floor(Math.random() * zone.wild.length)]!
  }

  function spawnEnemy() {
    const stage = player.currentStage
    const zone = player.currentZone
    const difficulty = (zone - 1) * 10 + stage

    if (player.isBossStage) {
      const boss = currentZone()?.boss
      if (boss) spawnBoss(boss, difficulty)
    } else {
      spawnWild(difficulty)
    }
  }

  function spawnWild(difficulty: number) {
    const poke = randomWild()
    const hp = Math.round(poke.baseHp * (1 + difficulty * 0.5))
    combat.setEnemy({
      nameFr: `${poke.nameFr} sauvage`,
      nameEn: `Wild ${poke.nameEn}`,
      slug: poke.slug,
      type: poke.type,
      spriteUrl: getSpriteUrl(poke.slug),
      maxHp: hp,
      currentHp: hp,
      level: difficulty,
      goldReward: 5 * difficulty,
      xpReward: 3 * difficulty,
      isBoss: false,
      bossTimerSeconds: null,
    })
  }

  function spawnBoss(boss: BossTrainer, difficulty: number) {
    const totalHp = boss.team.reduce((sum, p) => sum + Math.round(50 * p.level * (1 + difficulty * 0.1)), 0)
    const bossType = getPokemonType(boss.team[0]?.slug ?? 'normal')
    combat.setEnemy({
      nameFr: `Boss : ${boss.nameFr}`,
      nameEn: `Boss: ${boss.nameEn}`,
      slug: boss.slug,
      type: bossType,
      spriteUrl: getTrainerSpriteUrl(boss.slug),
      maxHp: totalHp,
      currentHp: totalHp,
      level: Math.max(...boss.team.map((p) => p.level)),
      goldReward: 50 * difficulty,
      xpReward: 20 * difficulty,
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

      if (wasBoss) {
        player.advanceStage()
      } else {
        player.addStageKill()
      }

      setTimeout(() => spawnEnemy(), 400)
    }
  }

  function init() {
    if (initialized) return
    initialized = true

    // Sync persisted upgrade bonuses from player store
    combat.clickDamage = player.clickDamage

    // Override autoAttackTick to use type-effective DPS
    combat.overrideAutoAttack = () => {
      if (!combat.enemy || combat.enemy.currentHp <= 0) return
      const effectiveDps = getEffectiveDps(combat.enemy.type)
      if (effectiveDps <= 0) return
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

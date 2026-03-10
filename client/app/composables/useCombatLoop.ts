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

    // Region penalty: 90% damage reduction if fighting outside native generation
    const pokeGen = getSlugGeneration(poke.slug)
    const combatGen = player.combatGeneration ?? player.currentGeneration
    const regionMult = pokeGen === combatGen ? 1.0 : 0.1
    
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

    // Gentle generation difficulty multiplier: x1.0, x1.2, x1.3, x1.4, x1.5…
    const genDiffMult = gen === 1 ? 1.0 : 1.0 + gen * 0.1

    if (player.isBossStage) {
      const boss = currentZone()?.boss
      if (boss) spawnBoss(boss, localDifficulty, genDiffMult, gen)
    } else {
      spawnWild(localDifficulty, genDiffMult, gen)
    }
  }

  function spawnWild(localDiff: number, genDiffMult: number, gen: number) {
    const poke = randomWild()
    const isShiny = Math.random() < getShinyRate(player.shinyCharms)
    // HP scales with local difficulty (resets per gen) × gentle gen multiplier
    const hp = Math.round(poke.baseHp * (1 + localDiff * 0.6) * genDiffMult)
    // Gold: 400 × gen² × (1 + localDiff × 0.008) — matches banner cost scaling
    // End-gen ≈ 10 pulls/100 kills, start-gen ≈ 5 pulls/100 kills
    const diffScale = 1 + localDiff * 0.008
    const goldReward = Math.round(400 * gen * gen * diffScale * (isShiny ? 5 : 1))
    const xpReward = Math.round(200 * gen * gen * diffScale * (isShiny ? 3 : 1))
    combat.setEnemy({
      nameFr: isShiny ? `✨ ${poke.nameFr} sauvage ✨` : `${poke.nameFr} sauvage`,
      nameEn: isShiny ? `✨ Wild ${poke.nameEn} ✨` : `Wild ${poke.nameEn}`,
      slug: poke.slug,
      types: getPokemonTypes(poke.slug),
      spriteUrl: isShiny ? getShinySpriteUrl(poke.slug) : getSpriteUrl(poke.slug),
      maxHp: hp,
      currentHp: hp,
      level: Math.max(1, Math.ceil(localDiff * 100 / 130)),
      goldReward,
      xpReward,
      isBoss: false,
      bossTimerSeconds: null,
      isShiny,
    })
  }

  function spawnBoss(boss: BossTrainer, localDiff: number, genDiffMult: number, gen: number) {
    // Boss HP: team base × local scaling × gentle gen multiplier
    const teamBase = boss.team.reduce((sum, p) => sum + Math.round(p.level * p.level), 0)
    const totalHp = Math.round(teamBase * (1.5 + localDiff * 0.05) * genDiffMult)
    // Boss rewards ≈ 10× wild rewards
    const diffScale = 1 + localDiff * 0.008
    const bossTypes = getPokemonTypes(boss.team[0]?.slug ?? 'normal')
    combat.setEnemy({
      nameFr: `Boss : ${boss.nameFr}`,
      nameEn: `Boss: ${boss.nameEn}`,
      slug: boss.slug,
      types: bossTypes,
      spriteUrl: getTrainerSpriteUrl(boss.slug),
      maxHp: totalHp,
      currentHp: totalHp,
      level: Math.max(1, Math.ceil(localDiff * 100 / 130)),
      goldReward: Math.round(4000 * gen * gen * diffScale),
      xpReward: Math.round(2000 * gen * gen * diffScale),
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
      // Safety check: detect boss timeout directly in case watcher missed it
      if (combat.bossTimeRemaining !== null && combat.bossTimeRemaining <= 0) {
        combat.bossFailed()
        player.retreatStage()
        setTimeout(() => spawnEnemy(), 1000)
        return
      }
      const baseDps = getEffectiveDps(combat.enemy.types)
      if (baseDps <= 0) return
      const effectiveDps = baseDps
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

  return {
    init,
    spawnEnemy,
    checkEnemyDeath,
    getEffectiveDps,
    getPokeDps,
    currentZone,
  }
}

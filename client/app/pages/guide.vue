<script setup lang="ts">
import { Swords, Star, Egg, ShoppingBag, Award, BookOpen, Sparkles, ChevronDown, ChevronUp } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'
import { GENERATIONS } from '~/data/zones'
import { RARITY_DPS_MULT } from '~/data/gacha'
import { HATCH_DAMAGE, FIVE_STAR_SHINY_CHANCE } from '~/stores/useDaycareStore'
import { STAR_DPS_MULT, STAR_DPS_MULT_SHINY } from '~/data/gacha'
import { getSpriteUrl, getTrainerSpriteUrl } from '~/utils/showdown'
import { TYPES, getEffectiveness } from '~/data/types'
import type { PokemonType } from '~/data/types'

definePageMeta({
  layout: 'game',
})

const { t } = useLocale()

const activeTab = ref<'wiki' | 'patchnotes'>('wiki')
const expandedGen = ref<number | null>(1)
const selectedType = ref<PokemonType | null>(null)

function getTypeMatchups(type: PokemonType) {
  // Defense: what damages this type
  const weakTo: PokemonType[] = []
  const resistsTo: PokemonType[] = []
  const immuneTo: PokemonType[] = []
  
  for (const attacker of TYPES) {
    const effectiveness = getEffectiveness(attacker.id, type)
    if (effectiveness === 2) weakTo.push(attacker.id)
    else if (effectiveness === 0.5) resistsTo.push(attacker.id)
    else if (effectiveness === 0) immuneTo.push(attacker.id)
  }
  
  // Attack: what this type damages
  const strongAgainst: PokemonType[] = []
  const weakAgainst: PokemonType[] = []
  const noEffectAgainst: PokemonType[] = []
  
  for (const defender of TYPES) {
    const effectiveness = getEffectiveness(type, defender.id)
    if (effectiveness === 2) strongAgainst.push(defender.id)
    else if (effectiveness === 0.5) weakAgainst.push(defender.id)
    else if (effectiveness === 0) noEffectAgainst.push(defender.id)
  }
  
  return { weakTo, resistsTo, immuneTo, strongAgainst, weakAgainst, noEffectAgainst }
}

function toggleGen(id: number) {
  expandedGen.value = expandedGen.value === id ? null : id
}
</script>

<template>
  <div class="mx-auto max-w-3xl pb-12">
    <!-- Title -->
    <div class="mb-6 text-center">
      <h1 class="text-3xl font-bold text-amber-400">
        {{ t('Comment jouer ?', 'How to Play?') }}
      </h1>
      <p class="mt-1 text-sm text-gray-400">
        {{ t('Tout savoir sur Poke-Idle Legacy', 'Everything about Poke-Idle Legacy') }}
      </p>
    </div>

    <!-- Tabs -->
    <div class="mb-6 flex justify-center gap-2">
      <button
        class="rounded-lg px-5 py-2 text-sm font-bold transition-all"
        :class="activeTab === 'wiki' ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'"
        @click="activeTab = 'wiki'"
      >
        {{ t('Wiki', 'Wiki') }}
      </button>
      <button
        class="rounded-lg px-5 py-2 text-sm font-bold transition-all"
        :class="activeTab === 'patchnotes' ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'"
        @click="activeTab = 'patchnotes'"
      >
        {{ t('Patch Notes', 'Patch Notes') }}
      </button>
    </div>

    <!-- ═══════════════ WIKI TAB ═══════════════ -->
    <div v-if="activeTab === 'wiki'" class="flex flex-col gap-6">

      <!-- ── Combat ── -->
      <section class="rounded-xl border border-gray-700/50 bg-gray-800/40 p-5">
        <h2 class="mb-3 flex items-center gap-2 text-lg font-bold text-red-400">
          <Swords class="h-5 w-5" /> {{ t('Combat', 'Combat') }}
        </h2>
        <div class="space-y-2 text-sm text-gray-300">
          <p>{{ t(
            'Ton équipe (max 6 Pokémon) combat automatiquement les Pokémon sauvages. Chaque zone contient 10 étapes : 9 combats sauvages + 1 boss.',
            'Your team (max 6 Pokémon) auto-fights wild Pokémon. Each zone has 10 stages: 9 wild fights + 1 boss.'
          ) }}</p>
          <p>{{ t(
            'Les dégâts sont calculés ainsi : Niveau × Évolution × Rareté × Shiny × Étoiles × Type.',
            'Damage formula: Level × Evolution × Rarity × Shiny × Stars × Type effectiveness.'
          ) }}</p>
          <p>{{ t(
            'Vaincre un boss débloque la zone suivante. Les boss ont un timer : si tu ne gagnes pas à temps, tu recules.',
            'Defeating a boss unlocks the next zone. Bosses have a timer: fail and you retreat.'
          ) }}</p>
        </div>
      </section>

      <!-- ── Gacha ── -->
      <section class="rounded-xl border border-gray-700/50 bg-gray-800/40 p-5">
        <h2 class="mb-3 flex items-center gap-2 text-lg font-bold text-yellow-400">
          <Star class="h-5 w-5" /> {{ t('Invocation (Gacha)', 'Summoning (Gacha)') }}
        </h2>
        <div class="space-y-2 text-sm text-gray-300">
          <p>{{ t(
            'Dépense de l\'or pour invoquer des Pokémon. 4 raretés : Commun, Rare, Épique, Légendaire.',
            'Spend gold to summon Pokémon. 4 rarities: Common, Rare, Epic, Legendary.'
          ) }}</p>
          <p>{{ t(
            'Les doublons augmentent les étoiles du Pokémon (max 5★). Chance de shiny : 1/1000.',
            'Duplicates increase the Pokémon\'s stars (max 5★). Shiny chance: 1/1000.'
          ) }}</p>
        </div>

        <h3 class="mt-3 mb-1 text-xs font-semibold text-gray-400 uppercase">{{ t('Probabilités de drop', 'Drop rates') }}</h3>
        <div class="flex flex-wrap gap-2 mb-3">
          <span class="rounded bg-gray-700 px-2 py-1 text-xs"><span class="text-gray-300">Commun</span> <span class="font-bold text-white">70%</span></span>
          <span class="rounded bg-gray-700 px-2 py-1 text-xs"><span class="text-blue-400">Rare</span> <span class="font-bold text-white">23%</span></span>
          <span class="rounded bg-gray-700 px-2 py-1 text-xs"><span class="text-purple-400">Épique</span> <span class="font-bold text-white">6.5%</span></span>
          <span class="rounded bg-gray-700 px-2 py-1 text-xs"><span class="text-amber-400">Légendaire</span> <span class="font-bold text-white">0.5%</span></span>
          <span class="rounded bg-gray-700 px-2 py-1 text-xs"><span class="text-yellow-400">✨ Shiny</span> <span class="font-bold text-white">0.1%</span></span>
        </div>

        <h3 class="mt-3 mb-1 text-xs font-semibold text-gray-400 uppercase">{{ t('Multiplicateurs de rareté', 'Rarity multipliers') }}</h3>
        <div class="flex flex-wrap gap-2">
          <span class="rounded bg-gray-700 px-2 py-1 text-xs"><span class="text-gray-300">Commun</span> <span class="font-bold text-white">x{{ RARITY_DPS_MULT.common }}</span></span>
          <span class="rounded bg-gray-700 px-2 py-1 text-xs"><span class="text-blue-400">Rare</span> <span class="font-bold text-white">x{{ RARITY_DPS_MULT.rare }}</span></span>
          <span class="rounded bg-gray-700 px-2 py-1 text-xs"><span class="text-purple-400">Épique</span> <span class="font-bold text-white">x{{ RARITY_DPS_MULT.epic }}</span></span>
          <span class="rounded bg-gray-700 px-2 py-1 text-xs"><span class="text-amber-400">Légendaire</span> <span class="font-bold text-white">x{{ RARITY_DPS_MULT.legendary }}</span></span>
        </div>
      </section>

      <!-- ── Stars ── -->
      <section class="rounded-xl border border-gray-700/50 bg-gray-800/40 p-5">
        <h2 class="mb-3 flex items-center gap-2 text-lg font-bold text-yellow-300">
          <Sparkles class="h-5 w-5" /> {{ t('Étoiles (Doublons)', 'Stars (Duplicates)') }}
        </h2>
        <div class="space-y-2 text-sm text-gray-300">
          <p>{{ t(
            'Obtenir un doublon augmente les étoiles. Les étoiles multiplient les dégâts.',
            'Getting a duplicate increases stars. Stars multiply damage.'
          ) }}</p>
        </div>
        <div class="mt-3 grid grid-cols-2 gap-3">
          <div>
            <h4 class="mb-1 text-xs font-semibold text-gray-400">{{ t('Normal', 'Normal') }}</h4>
            <div class="flex flex-wrap gap-1">
              <span v-for="s in 5" :key="s" class="rounded bg-gray-700 px-2 py-1 text-xs">
                <span class="text-yellow-400">{{ '★'.repeat(s) }}</span>
                <span class="ml-1 font-bold text-white">x{{ STAR_DPS_MULT[s] }}</span>
              </span>
            </div>
          </div>
          <div>
            <h4 class="mb-1 text-xs font-semibold text-amber-400">{{ t('Shiny', 'Shiny') }}</h4>
            <div class="flex flex-wrap gap-1">
              <span v-for="s in 5" :key="s" class="rounded bg-gray-700 px-2 py-1 text-xs">
                <span class="text-yellow-400">{{ '★'.repeat(s) }}</span>
                <span class="ml-1 font-bold text-amber-300">x{{ STAR_DPS_MULT_SHINY[s] }}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Daycare ── -->
      <section class="rounded-xl border border-gray-700/50 bg-gray-800/40 p-5">
        <h2 class="mb-3 flex items-center gap-2 text-lg font-bold text-green-400">
          <Egg class="h-5 w-5" /> {{ t('Pension', 'Daycare') }}
        </h2>
        <div class="space-y-2 text-sm text-gray-300">
          <p>{{ t(
            'Dépose un Pokémon niv.100 (non-shiny) à la pension (5 slots, 500 or par dépôt). Il éclot après avoir infligé assez de dégâts en combat.',
            'Deposit a Lv.100 Pokémon (non-shiny) at the daycare (5 slots, 500 gold each). It hatches after dealing enough combat damage.'
          ) }}</p>
          <p>{{ t(
            'Le Pokémon éclos est un doublon (augmente les étoiles). Un Pokémon en pension ne peut pas combattre.',
            'The hatched Pokémon is a duplicate (increases stars). A Pokémon in daycare can\'t fight.'
          ) }}</p>
          <p>{{ t(
            'Un même Pokémon ne peut être déposé qu\'une seule fois. Les 5★ ont 1/50 de chance de faire éclore un shiny !',
            'Each Pokémon can only be deposited once. 5★ have a 1/50 chance to hatch a shiny!'
          ) }}</p>
        </div>
        <h3 class="mt-3 mb-1 text-xs font-semibold text-gray-400 uppercase">{{ t('Dégâts requis', 'Damage required') }}</h3>
        <div class="flex flex-wrap gap-2">
          <span v-for="s in 5" :key="s" class="rounded bg-gray-700 px-2 py-1 text-xs">
            <span class="text-yellow-400">{{ '★'.repeat(s) }}</span>
            <span class="ml-1 text-white">{{ (HATCH_DAMAGE[s]! / 1000).toFixed(0) }}K</span>
            <span v-if="s === 5" class="ml-1 text-amber-400">(1/{{ Math.round(1 / FIVE_STAR_SHINY_CHANCE) }} shiny)</span>
          </span>
        </div>
      </section>

      <!-- ── Shop ── -->
      <section class="rounded-xl border border-gray-700/50 bg-gray-800/40 p-5">
        <h2 class="mb-3 flex items-center gap-2 text-lg font-bold text-cyan-400">
          <ShoppingBag class="h-5 w-5" /> {{ t('Boutique', 'Shop') }}
        </h2>
        <div class="space-y-2 text-sm text-gray-300">
          <p>{{ t(
            'Achète des améliorations permanentes (DPS d\'équipe, dégâts de clic) et des bonbons XP pour monter rapidement tes Pokémon de niveau.',
            'Buy permanent upgrades (team DPS, click damage) and XP candies to quickly level up your Pokémon.'
          ) }}</p>
          <p>{{ t(
            'Bonbons XP : S (+100), M (+500), L (+2000), XL (+10000). Attention : un bonbon peut déclencher une évolution !',
            'XP Candies: S (+100), M (+500), L (+2000), XL (+10000). Warning: a candy can trigger evolution!'
          ) }}</p>
          <p>{{ t(
            'La boutique propose aussi des items d\'évolution (Pierre Feu, Pierre Eau, Pierre Plante, etc.) pour faire évoluer certains Pokémon.',
            'The shop also offers evolution items (Fire Stone, Water Stone, Leaf Stone, etc.) to evolve certain Pokémon.'
          ) }}</p>
        </div>
      </section>

      <!-- ── Évolutions ── -->
      <section class="rounded-xl border border-gray-700/50 bg-gray-800/40 p-5">
        <h2 class="mb-3 flex items-center gap-2 text-lg font-bold text-purple-400">
          <Sparkles class="h-5 w-5" /> {{ t('Évolutions', 'Evolutions') }}
        </h2>
        <div class="space-y-2 text-sm text-gray-300">
          <p>{{ t(
            'Certains Pokémon évoluent automatiquement en atteignant un niveau spécifique, d\'autres nécessitent un item d\'évolution (disponible dans la Boutique).',
            'Some Pokémon evolve automatically upon reaching a specific level, others require an evolution item (available in the Shop).'
          ) }}</p>
        </div>
      </section>

      <!-- ── Badges ── -->
      <section class="rounded-xl border border-gray-700/50 bg-gray-800/40 p-5">
        <h2 class="mb-3 flex items-center gap-2 text-lg font-bold text-indigo-400">
          <Award class="h-5 w-5" /> {{ t('Badges', 'Badges') }}
        </h2>
        <div class="text-sm text-gray-300">
          <p>{{ t(
            'Chaque boss vaincu te donne un badge. Collectionne-les tous pour prouver ta maîtrise !',
            'Every boss defeated gives you a badge. Collect them all to prove your mastery!'
          ) }}</p>
        </div>
      </section>

      <!-- ── Pokédex ── -->
      <section class="rounded-xl border border-gray-700/50 bg-gray-800/40 p-5">
        <h2 class="mb-3 flex items-center gap-2 text-lg font-bold text-pink-400">
          <BookOpen class="h-5 w-5" /> {{ t('Pokédex', 'Pokédex') }}
        </h2>
        <div class="text-sm text-gray-300">
          <p>{{ t(
            'Consulte le Pokédex complet avec tous les Pokémon disponibles, leurs types et sprites. Accessible même sans compte !',
            'Browse the full Pokédex with all available Pokémon, types and sprites. Accessible even without an account!'
          ) }}</p>
        </div>
      </section>

      <!-- ── Table des Types ── -->
      <section class="rounded-xl border border-gray-700/50 bg-gray-800/40 p-5">
        <h2 class="mb-3 text-lg font-bold text-white">
          {{ t('Table des Types', 'Type Chart') }}
        </h2>
        <div class="text-sm text-gray-300 mb-4">
          <p>{{ t(
            'Sélectionnez un type pour voir ses forces et faiblesses en attaque et en défense.',
            'Select a type to see its offensive and defensive matchups.'
          ) }}</p>
        </div>

        <!-- Type Selection Grid -->
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-6">
          <button
            v-for="type in TYPES"
            :key="type.id"
            class="rounded-lg border-2 px-3 py-2 text-sm font-bold transition-all hover:scale-105"
            :class="selectedType === type.id ? 'ring-2 ring-white' : ''"
            :style="{
              borderColor: type.color,
              backgroundColor: selectedType === type.id ? type.color + '40' : type.color + '20',
              color: type.color
            }"
            @click="selectedType = type.id"
          >
            {{ t(type.nameFr, type.nameEn) }}
          </button>
        </div>

        <!-- Type Matchup Details -->
        <div v-if="selectedType" class="space-y-4">
          <div class="text-center mb-4">
            <h3 class="text-2xl font-bold" :style="{ color: TYPES.find(t => t.id === selectedType)!.color }">
              {{ t(TYPES.find(t => t.id === selectedType)!.nameFr, TYPES.find(t => t.id === selectedType)!.nameEn) }}
            </h3>
          </div>

          <!-- Defense Section -->
          <div class="rounded-lg border border-gray-700 bg-gray-900/50 p-4">
            <h4 class="mb-3 text-lg font-bold text-blue-400">
              🛡️ {{ t('Défense', 'Defense') }}
            </h4>
            
            <div class="space-y-3">
              <!-- Weaknesses -->
              <div v-if="getTypeMatchups(selectedType).weakTo.length > 0">
                <p class="mb-2 text-sm font-semibold text-red-400">
                  {{ t('Faible contre (×2)', 'Weak to (×2)') }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="typeId in getTypeMatchups(selectedType).weakTo"
                    :key="'weak-' + typeId"
                    class="rounded px-2 py-1 text-xs font-bold"
                    :style="{
                      backgroundColor: TYPES.find(t => t.id === typeId)!.color + '30',
                      color: TYPES.find(t => t.id === typeId)!.color,
                      borderColor: TYPES.find(t => t.id === typeId)!.color,
                      borderWidth: '1px'
                    }"
                  >
                    {{ t(TYPES.find(t => t.id === typeId)!.nameFr, TYPES.find(t => t.id === typeId)!.nameEn) }}
                  </span>
                </div>
              </div>

              <!-- Resistances -->
              <div v-if="getTypeMatchups(selectedType).resistsTo.length > 0">
                <p class="mb-2 text-sm font-semibold text-green-400">
                  {{ t('Résiste à (×0.5)', 'Resists (×0.5)') }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="typeId in getTypeMatchups(selectedType).resistsTo"
                    :key="'resist-' + typeId"
                    class="rounded px-2 py-1 text-xs font-bold"
                    :style="{
                      backgroundColor: TYPES.find(t => t.id === typeId)!.color + '30',
                      color: TYPES.find(t => t.id === typeId)!.color,
                      borderColor: TYPES.find(t => t.id === typeId)!.color,
                      borderWidth: '1px'
                    }"
                  >
                    {{ t(TYPES.find(t => t.id === typeId)!.nameFr, TYPES.find(t => t.id === typeId)!.nameEn) }}
                  </span>
                </div>
              </div>

              <!-- Immunities -->
              <div v-if="getTypeMatchups(selectedType).immuneTo.length > 0">
                <p class="mb-2 text-sm font-semibold text-purple-400">
                  {{ t('Immunisé contre (×0)', 'Immune to (×0)') }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="typeId in getTypeMatchups(selectedType).immuneTo"
                    :key="'immune-' + typeId"
                    class="rounded px-2 py-1 text-xs font-bold"
                    :style="{
                      backgroundColor: TYPES.find(t => t.id === typeId)!.color + '30',
                      color: TYPES.find(t => t.id === typeId)!.color,
                      borderColor: TYPES.find(t => t.id === typeId)!.color,
                      borderWidth: '1px'
                    }"
                  >
                    {{ t(TYPES.find(t => t.id === typeId)!.nameFr, TYPES.find(t => t.id === typeId)!.nameEn) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Attack Section -->
          <div class="rounded-lg border border-gray-700 bg-gray-900/50 p-4">
            <h4 class="mb-3 text-lg font-bold text-orange-400">
              ⚔️ {{ t('Attaque', 'Attack') }}
            </h4>
            
            <div class="space-y-3">
              <!-- Super Effective -->
              <div v-if="getTypeMatchups(selectedType).strongAgainst.length > 0">
                <p class="mb-2 text-sm font-semibold text-green-400">
                  {{ t('Super efficace contre (×2)', 'Super effective against (×2)') }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="typeId in getTypeMatchups(selectedType).strongAgainst"
                    :key="'strong-' + typeId"
                    class="rounded px-2 py-1 text-xs font-bold"
                    :style="{
                      backgroundColor: TYPES.find(t => t.id === typeId)!.color + '30',
                      color: TYPES.find(t => t.id === typeId)!.color,
                      borderColor: TYPES.find(t => t.id === typeId)!.color,
                      borderWidth: '1px'
                    }"
                  >
                    {{ t(TYPES.find(t => t.id === typeId)!.nameFr, TYPES.find(t => t.id === typeId)!.nameEn) }}
                  </span>
                </div>
              </div>

              <!-- Not Very Effective -->
              <div v-if="getTypeMatchups(selectedType).weakAgainst.length > 0">
                <p class="mb-2 text-sm font-semibold text-orange-400">
                  {{ t('Peu efficace contre (×0.5)', 'Not very effective against (×0.5)') }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="typeId in getTypeMatchups(selectedType).weakAgainst"
                    :key="'weak-against-' + typeId"
                    class="rounded px-2 py-1 text-xs font-bold"
                    :style="{
                      backgroundColor: TYPES.find(t => t.id === typeId)!.color + '30',
                      color: TYPES.find(t => t.id === typeId)!.color,
                      borderColor: TYPES.find(t => t.id === typeId)!.color,
                      borderWidth: '1px'
                    }"
                  >
                    {{ t(TYPES.find(t => t.id === typeId)!.nameFr, TYPES.find(t => t.id === typeId)!.nameEn) }}
                  </span>
                </div>
              </div>

              <!-- No Effect -->
              <div v-if="getTypeMatchups(selectedType).noEffectAgainst.length > 0">
                <p class="mb-2 text-sm font-semibold text-red-400">
                  {{ t('Sans effet contre (×0)', 'No effect against (×0)') }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="typeId in getTypeMatchups(selectedType).noEffectAgainst"
                    :key="'no-effect-' + typeId"
                    class="rounded px-2 py-1 text-xs font-bold"
                    :style="{
                      backgroundColor: TYPES.find(t => t.id === typeId)!.color + '30',
                      color: TYPES.find(t => t.id === typeId)!.color,
                      borderColor: TYPES.find(t => t.id === typeId)!.color,
                      borderWidth: '1px'
                    }"
                  >
                    {{ t(TYPES.find(t => t.id === typeId)!.nameFr, TYPES.find(t => t.id === typeId)!.nameEn) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p v-else class="py-8 text-center text-gray-500">
          {{ t('Sélectionnez un type ci-dessus pour voir les détails', 'Select a type above to see details') }}
        </p>
      </section>

      <!-- ═══════════════ ZONES & BOSSES ═══════════════ -->
      <h2 class="mt-4 text-xl font-bold text-white">{{ t('Zones & Boss', 'Zones & Bosses') }}</h2>

      <div v-for="gen in GENERATIONS" :key="gen.id" class="rounded-xl border border-gray-700/50 bg-gray-800/40 overflow-hidden">
        <!-- Generation header -->
        <button
          class="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-700/30"
          @click="toggleGen(gen.id)"
        >
          <div>
            <span class="text-lg font-bold text-white">{{ t(gen.nameFr, gen.nameEn) }}</span>
            <span class="ml-2 text-sm text-gray-400">{{ t(gen.regionFr, gen.regionEn) }}</span>
          </div>
          <component :is="expandedGen === gen.id ? ChevronUp : ChevronDown" class="h-5 w-5 text-gray-500" />
        </button>

        <!-- Zones list -->
        <div v-if="expandedGen === gen.id" class="border-t border-gray-700/50">
          <div
            v-for="(zone, zi) in gen.zones"
            :key="zone.id"
            class="border-b border-gray-700/30 p-4 last:border-b-0"
          >
            <div class="flex items-center gap-3">
              <span class="flex h-7 w-7 items-center justify-center rounded-full bg-gray-700 text-xs font-bold text-white">{{ zi + 1 }}</span>
              <div class="flex-1">
                <p class="text-sm font-bold text-white">{{ t(zone.nameFr, zone.nameEn) }}</p>
                <div class="flex flex-wrap gap-1 mt-0.5">
                  <span v-for="tp in zone.types" :key="tp" class="rounded bg-gray-700 px-1.5 py-0.5 text-[10px] text-gray-300 uppercase">{{ tp }}</span>
                </div>
              </div>
            </div>

            <!-- Boss -->
            <div class="mt-2 ml-10 flex items-center gap-3 rounded-lg bg-gray-900/50 p-2.5">
              <img :src="getTrainerSpriteUrl(zone.boss.slug)" :alt="t(zone.boss.nameFr, zone.boss.nameEn)" class="h-12 w-12 object-contain" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-red-400">{{ t(zone.boss.nameFr, zone.boss.nameEn) }}</p>
                <div class="flex flex-wrap gap-1 mt-1">
                  <div v-for="(poke, pi) in zone.boss.team" :key="pi" class="flex items-center gap-1 rounded bg-gray-800 px-1.5 py-0.5">
                    <img :src="getSpriteUrl(poke.slug)" :alt="t(poke.nameFr, poke.nameEn)" class="h-5 w-5 object-contain" />
                    <span class="text-[10px] text-gray-300">{{ t(poke.nameFr, poke.nameEn) }}</span>
                    <span class="text-[9px] text-gray-500">Lv.{{ poke.level }}</span>
                  </div>
                </div>
              </div>
              <span class="text-[10px] text-gray-500">{{ zone.boss.timerSeconds }}s</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════ PATCH NOTES TAB ═══════════════ -->
    <div v-if="activeTab === 'patchnotes'" class="flex flex-col gap-4">

      <!-- v1.2.0 -->
      <article class="rounded-xl border border-blue-500/50 bg-blue-900/20 p-5">
        <h3 class="mb-3 text-lg font-bold text-blue-300">v1.2.0 — Équilibrage & Farm — 4 Mars 2026</h3>
        
        <p class="mb-4 text-sm text-gray-300 italic">
          {{ t('Gros rééquilibrage économique, système de farm et nouvelles mécaniques de combat !', 'Major economy rebalancing, farming system and new combat mechanics!') }}
        </p>

        <div class="space-y-4">
          <div>
            <h4 class="mb-2 text-sm font-semibold text-blue-400">⚔️ {{ t('Combat', 'Combat') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Malus régional : un Pokémon qui combat hors de sa région native inflige 50% de dégâts en moins', 'Region penalty: a Pokémon fighting outside its native region deals 50% less damage') }}</li>
              <li>{{ t('Nouveau système de farm : retournez sur les anciennes routes pour gagner de l\'or et de l\'XP', 'New farming system: go back to old routes to earn gold and XP') }}</li>
              <li>{{ t('Sélecteur de route accessible depuis la page combat (icône ▼ à côté du nom de zone)', 'Route selector accessible from the combat page (▼ icon next to zone name)') }}</li>
              <li>{{ t('Difficulté des Pokémon sauvages augmentée (HP +57%)', 'Wild Pokémon difficulty increased (HP +57%)') }}</li>
              <li>{{ t('Boss de zone massivement renforcés : il faut upgrader son équipe pour les battre', 'Zone bosses massively buffed: team upgrades required to beat them') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-blue-400">💰 {{ t('Économie', 'Economy') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Boost des récompenses en début de partie : gold de base augmenté pour atteindre la première invocation plus vite', 'Early game rewards boosted: base gold increased to reach first summon faster') }}</li>
              <li>{{ t('Scaling gold/XP entre générations : les récompenses augmentent de façon continue entre les régions', 'Gold/XP scaling across generations: rewards increase continuously between regions') }}</li>
              <li>{{ t('Multiplicateur de génération sur les récompenses (×gen) pour suivre le coût des bannières', 'Generation multiplier on rewards (×gen) to match banner costs') }}</li>
              <li>{{ t('Gacha infini : les Pokémon 5★ ne sont plus retirés du pool de tirage', 'Infinite gacha: 5★ Pokémon are no longer removed from the pull pool') }}</li>
              <li>{{ t('Doublon d\'un Pokémon déjà 5★ = remboursement de 50% du coût du tirage', 'Duplicate of an already 5★ Pokémon = 50% pull cost refund') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-blue-400">🎨 {{ t('Interface', 'Interface') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Dropdowns inventaire entièrement redessinés (composant custom thémé)', 'Inventory dropdowns fully redesigned (custom themed component)') }}</li>
              <li>{{ t('Icônes navigation mobile modernisées', 'Mobile navigation icons modernized') }}</li>
              <li>{{ t('Section Évolutions ajoutée au guide', 'Evolutions section added to guide') }}</li>
            </ul>
          </div>
        </div>
      </article>

      <!-- v1.1.2 -->
      <article class="rounded-xl border border-emerald-500/50 bg-emerald-900/20 p-5">
        <h3 class="mb-3 text-lg font-bold text-emerald-300">v1.1.2 — Corrections & Gameplay — 3 Mars 2026</h3>
        
        <p class="mb-4 text-sm text-gray-300 italic">
          {{ t('Corrections majeures des évolutions Gen 4, équilibrage gacha et améliorations UX !', 'Major Gen 4 evolution fixes, gacha balancing and UX improvements!') }}
        </p>

        <div class="space-y-4">
          <div>
            <h4 class="mb-2 text-sm font-semibold text-emerald-400">🐛 {{ t('Corrections Critiques', 'Critical Fixes') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('FIX: Évolutions Gen 4 héritent maintenant de la rareté épique des starters', 'FIX: Gen 4 evolutions now inherit epic rarity from starters') }}</li>
              <li>{{ t('FIX: Pokémon niveau 100 peuvent désormais évoluer (bug bloquant retiré)', 'FIX: Level 100 Pokémon can now evolve (blocking bug removed)') }}</li>
              <li>{{ t('FIX: Bug pension multi-onglets corrigé (résultat shiny pré-déterminé)', 'FIX: Daycare multi-tab exploit fixed (shiny result pre-determined)') }}</li>
              <li>{{ t('FIX: Migration automatique rareté pour évolutions existantes dans inventaire', 'FIX: Automatic rarity migration for existing evolutions in inventory') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-emerald-400">✨ {{ t('Items Évolution Gen 4', 'Gen 4 Evolution Items') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Ajout Pierre Éclat (Roserade, Togekiss)', 'Added Shiny Stone (Roserade, Togekiss)') }}</li>
              <li>{{ t('Ajout Pierre Aube (Gallame, Momartik)', 'Added Dawn Stone (Gallade, Froslass)') }}</li>
              <li>{{ t('Ajout Pierre Glace (Givrali)', 'Added Ice Stone (Glaceon)') }}</li>
              <li>{{ t('Ajout Protecteur, Électriseur, Magmariseur (Rhinastoc, Élekable, Maganon)', 'Added Protector, Electirizer, Magmarizer (Rhyperior, Electivire, Magmortar)') }}</li>
              <li>{{ t('Ajout CD Douteux, Tissu Fauche (Porygon-Z, Noctunoir)', 'Added Dubious Disc, Reaper Cloth (Porygon-Z, Dusknoir)') }}</li>
              <li>{{ t('Papilord nécessite maintenant Pierre Plante (au lieu de niveau)', 'Mothim now requires Leaf Stone (instead of level)') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-emerald-400">💰 {{ t('Système Gacha Amélioré', 'Improved Gacha System') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('RETIRÉ: Gemmes complètement supprimées du système d\'invocation', 'REMOVED: Gems completely removed from summoning system') }}</li>
              <li>{{ t('NOUVEAU: Remboursement 50% par invocation si Pokémon déjà 5★ (avant: blocage)', 'NEW: 50% refund per summon if Pokémon already 5★ (before: blocked)') }}</li>
              <li>{{ t('Affichage visuel remboursement sur cartes gacha (badge -50%)', 'Visual refund display on gacha cards (-50% badge)') }}</li>
              <li>{{ t('Taux ajustés : Legendary 1%→0.5%, Epic 8%→6.5%, Rare 21%→23%', 'Rates adjusted: Legendary 1%→0.5%, Epic 8%→6.5%, Rare 21%→23%') }}</li>
              <li>{{ t('Légendaires 2× plus rares pour meilleur équilibrage', 'Legendaries 2× rarer for better balance') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-emerald-400">🎯 {{ t('Boutique & Évolutions', 'Shop & Evolutions') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Prix items évolution uniformisés par génération actuelle joueur', 'Evolution item prices standardized by player\'s current generation') }}</li>
              <li>{{ t('Gen 1: 5000, Gen 2: 7500, Gen 3: 10000, Gen 4: 20000 PokéDollar', 'Gen 1: 5000, Gen 2: 7500, Gen 3: 10000, Gen 4: 20000 PokéDollar') }}</li>
              <li>{{ t('Vérification évolutions automatique à chaque changement d\'onglet', 'Automatic evolution check on every tab change') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-emerald-400">🎨 {{ t('Interface & UX', 'Interface & UX') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('NOUVEAU: Clic droit sur équipe pour retirer un Pokémon rapidement', 'NEW: Right-click on team to quickly remove a Pokémon') }}</li>
              <li>{{ t('Retiré affichage bonus niveau joueur (DPS/Gold) de la sidebar', 'Removed player level bonus display (DPS/Gold) from sidebar') }}</li>
              <li>{{ t('Hover rouge sur slots équipe pour indiquer clic droit disponible', 'Red hover on team slots to indicate right-click available') }}</li>
            </ul>
          </div>

          <div class="rounded-lg border border-emerald-600/30 bg-emerald-950/30 p-3">
            <h4 class="mb-2 text-sm font-semibold text-emerald-300">🎯 {{ t('Points Clés', 'Key Points') }}</h4>
            <ul class="space-y-1 text-xs text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('✅ Toutes les évolutions Gen 4 maintenant fonctionnelles avec items corrects', '✅ All Gen 4 evolutions now functional with correct items') }}</li>
              <li>{{ t('✅ Système gacha plus équitable avec remboursement au lieu de blocage', '✅ Fairer gacha system with refund instead of blocking') }}</li>
              <li>{{ t('✅ Légendaires vraiment rares maintenant (0.5% au lieu de 1%)', '✅ Legendaries truly rare now (0.5% instead of 1%)') }}</li>
              <li>{{ t('✅ UX améliorée avec clic droit équipe et vérification auto évolutions', '✅ Improved UX with team right-click and auto evolution check') }}</li>
              <li>{{ t('✅ Migration automatique pour joueurs existants', '✅ Automatic migration for existing players') }}</li>
            </ul>
          </div>
        </div>
      </article>

      <!-- v1.1.1 -->
      <article class="rounded-xl border border-purple-500/50 bg-purple-900/20 p-5">
        <h3 class="mb-3 text-lg font-bold text-purple-300">v1.1.1 — Sinnoh & Améliorations — 3 Mars 2026</h3>
        
        <p class="mb-4 text-sm text-gray-300 italic">
          {{ t('Intégration complète de la Génération 4, améliorations de l\'inventaire et ajustements de l\'économie du jeu !', 'Full Generation 4 integration, inventory improvements and game economy adjustments!') }}
        </p>

        <div class="space-y-4">
          <div>
            <h4 class="mb-2 text-sm font-semibold text-purple-400">🌍 {{ t('Génération 4 Sinnoh', 'Generation 4 Sinnoh') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('107 Pokémon Gen 4 ajoutés avec tous les doubles types', '107 Gen 4 Pokémon added with all dual types') }}</li>
              <li>{{ t('Bannière Sinnoh : 68 Pokémon (22 common, 6 rare, 10 epic, 14 legendary)', 'Sinnoh Banner: 68 Pokémon (22 common, 6 rare, 10 epic, 14 legendary)') }}</li>
              <li>{{ t('32 lignes évolutives + préévolutions babies (Budew, Riolu, etc.)', '32 evolution lines + baby pre-evolutions (Budew, Riolu, etc.)') }}</li>
              <li>{{ t('13 zones : 8 champions + Conseil des 4 + Cynthia (Maître)', '13 zones: 8 gym leaders + Elite Four + Cynthia (Champion)') }}</li>
              <li>{{ t('Niveaux 60-78 : progression équilibrée après Hoenn', 'Levels 60-78: balanced progression after Hoenn') }}</li>
              <li>{{ t('Champions : Pierrick, Flo, Mélina, Lovis, Kiméra, Charles, Gladys, Tanguy', 'Gym Leaders: Roark, Gardenia, Maylene, Wake, Fantina, Byron, Candice, Volkner') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-purple-400">📦 {{ t('Inventaire Amélioré', 'Improved Inventory') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Tri par numéro Pokédex (#) : ordre national complet', 'Sort by Pokédex number (#): full national order') }}</li>
              <li>{{ t('Tri par rareté (🎨) : Legendary → Epic → Rare → Common', 'Sort by rarity (🎨): Legendary → Epic → Rare → Common') }}</li>
              <li>{{ t('Cycle de tri étendu : ⭐ → Lv → A-Z → DPS → # → 🎨', 'Extended sort cycle: ⭐ → Lv → A-Z → DPS → # → 🎨') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-purple-400">💰 {{ t('Économie & Gacha', 'Economy & Gacha') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Renommage : "Or" → "PokéDollar" partout dans le jeu', 'Renamed: "Gold" → "PokéDollar" throughout the game') }}</li>
              <li>{{ t('Probabilités gacha ajustées pour plus d\'équilibre :', 'Gacha probabilities adjusted for better balance:') }}</li>
              <li class="pl-4">{{ t('• Common : 60% → 70% (+10%)', '• Common: 60% → 70% (+10%)') }}</li>
              <li class="pl-4">{{ t('• Rare : 25% → 23% (-2%)', '• Rare: 25% → 23% (-2%)') }}</li>
              <li class="pl-4">{{ t('• Epic : 12% → 6.5% (-5.5%)', '• Epic: 12% → 6.5% (-5.5%)') }}</li>
              <li class="pl-4">{{ t('• Legendary : 3% → 0.5% (-2.5%) - extrêmement rares !', '• Legendary: 3% → 0.5% (-2.5%) - extremely rare!') }}</li>
              <li>{{ t('XP premiers niveaux réduite : facteur 0.5→1.0 pour niveaux 1-20', 'Early level XP reduced: 0.5→1.0 factor for levels 1-20') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-purple-400">✨ {{ t('Améliorations Interface', 'Interface Improvements') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Profil : "PokéDollar total" affiché correctement', 'Profile: "Total PokéDollar" displayed correctly') }}</li>
              <li>{{ t('Guide : probabilités de drop actualisées', 'Guide: updated drop rates') }}</li>
            </ul>
          </div>

          <div class="rounded-lg border border-purple-600/30 bg-purple-950/30 p-3">
            <h4 class="mb-2 text-sm font-semibold text-purple-300">🎯 {{ t('Points Clés', 'Key Points') }}</h4>
            <ul class="space-y-1 text-xs text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('✅ Contenu Gen 4 complet : 13 nouvelles zones de combat', '✅ Full Gen 4 content: 13 new battle zones') }}</li>
              <li>{{ t('✅ Légendaires extrêmement rares (divisés par 6)', '✅ Legendaries extremely rare (divided by 6)') }}</li>
              <li>{{ t('✅ Onboarding amélioré : premiers niveaux plus rapides', '✅ Improved onboarding: faster early levels') }}</li>
              <li>{{ t('✅ Inventaire plus flexible avec 2 nouveaux tris', '✅ More flexible inventory with 2 new sorts') }}</li>
              <li>{{ t('✅ Terminologie cohérente avec l\'univers Pokémon', '✅ Terminology consistent with Pokémon universe') }}</li>
            </ul>
          </div>
        </div>
      </article>

      <!-- v1.1.0 -->
      <article class="rounded-xl border border-cyan-500/50 bg-cyan-900/20 p-5">
        <h3 class="mb-3 text-lg font-bold text-cyan-300">v1.1.0 — Doubles Types & Équilibrage — 3 Mars 2026</h3>
        
        <p class="mb-4 text-sm text-gray-300 italic">
          {{ t('Mise à jour majeure ajoutant l\'intelligence tactique des doubles types et un rééquilibrage complet de la difficulté !', 'Major update adding dual-type tactical intelligence and complete difficulty rebalance!') }}
        </p>

        <div class="space-y-4">
          <div>
            <h4 class="mb-2 text-sm font-semibold text-cyan-400">🎨 {{ t('Interface Combat Améliorée', 'Improved Combat Interface') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Layout desktop 2 colonnes : combat/stats à gauche, équipe à droite (plus de scroll)', 'Desktop 2-column layout: combat/stats left, team right (no more scrolling)') }}</li>
              <li>{{ t('Boss Team Preview repositionnée en ligne au-dessus de la carte', 'Boss Team Preview repositioned in a line above the card') }}</li>
              <li>{{ t('Récompenses (Or/XP) affichées sous la carte, bien centrées', 'Rewards (Gold/XP) displayed under the card, centered') }}</li>
              <li>{{ t('HP des ennemis affichés en nombres arrondis (plus de décimales)', 'Enemy HP displayed as rounded numbers (no more decimals)') }}</li>
              <li>{{ t('Layout mobile conservé intact pour une meilleure expérience tactile', 'Mobile layout kept intact for better touch experience') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-cyan-400">⚔️ {{ t('Intelligence Tactique - Doubles Types', 'Tactical Intelligence - Dual Types') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Système intelligent : les Pokémon double-type utilisent automatiquement leur MEILLEUR type offensif', 'Smart system: dual-type Pokémon automatically use their BEST offensive type') }}</li>
              <li>{{ t('Calcul : Math.max(type1, type2) contre chaque ennemi', 'Calculation: Math.max(type1, type2) against each enemy') }}</li>
              <li>{{ t('Exemple : Bulbizarre (Plante/Poison) vs Aquali → utilise Plante ×2', 'Example: Bulbasaur (Grass/Poison) vs Vaporeon → uses Grass ×2') }}</li>
              <li>{{ t('Exemple : Léviator (Eau/Vol) vs Florizarre → utilise Vol ×2 (meilleur que Eau ×0.5)', 'Example: Gyarados (Water/Flying) vs Venusaur → uses Flying ×2 (better than Water ×0.5)') }}</li>
              <li>{{ t('Affichage complet des doubles types dans l\'inventaire et le combat', 'Full dual-type display in inventory and combat') }}</li>
              <li>{{ t('Fiche Pokémon mise à jour : table des types montre le meilleur multiplicateur', 'Pokémon card updated: type chart shows best multiplier') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-cyan-400">⚖️ {{ t('Rééquilibrage Difficulté', 'Difficulty Rebalance') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('XP Joueur : base 75→120 (+60%), exposant 1.9→2.0 = progression ~60% plus lente', 'Player XP: base 75→120 (+60%), exponent 1.9→2.0 = ~60% slower progression') }}</li>
              <li>{{ t('XP Pokémons : base 20→35 (+75%), exposant 1.6→1.7 = progression ~75% plus lente', 'Pokémon XP: base 20→35 (+75%), exponent 1.6→1.7 = ~75% slower progression') }}</li>
              <li>{{ t('Scaling niveau 50+ : 3%→5% par niveau (encore plus difficile en fin de game)', 'Level 50+ scaling: 3%→5% per level (even harder late game)') }}</li>
              <li>{{ t('Dégâts clics réduits de 50% : niveau×2→×1, badges×10→×5', 'Click damage reduced by 50%: level×2→×1, badges×10→×5') }}</li>
              <li>{{ t('HP sauvages ×3 : multiplicateur 0.12→0.35 (combats 2-3× plus longs)', 'Wild HP ×3: multiplier 0.12→0.35 (fights 2-3× longer)') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-cyan-400">🐛 {{ t('Corrections', 'Bug Fixes') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Fix : balises HTML mal fermées causant des erreurs de compilation', 'Fix: improperly closed HTML tags causing compilation errors') }}</li>
              <li>{{ t('Fix : sprites des Pokémon qui chevauchaient les éléments d\'interface', 'Fix: Pokémon sprites overlapping UI elements') }}</li>
              <li>{{ t('Fix : affichage HP avec trop de décimales (maintenant arrondis)', 'Fix: HP display with too many decimals (now rounded)') }}</li>
            </ul>
          </div>

          <div class="rounded-lg border border-cyan-600/30 bg-cyan-950/30 p-3">
            <h4 class="mb-2 text-sm font-semibold text-cyan-300">📊 {{ t('Impact Global', 'Overall Impact') }}</h4>
            <ul class="space-y-1 text-xs text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('✅ Progression plus équilibrée - le jeu n\'est plus trop facile', '✅ More balanced progression - game is no longer too easy') }}</li>
              <li>{{ t('✅ Stratégie de type améliorée - doubles types offrent avantages tactiques', '✅ Enhanced type strategy - dual types offer tactical advantages') }}</li>
              <li>{{ t('✅ Équipe primordiale - les clics seuls ne suffisent plus', '✅ Team is essential - clicks alone are no longer enough') }}</li>
              <li>{{ t('✅ Interface épurée - plus de chevauchements visuels', '✅ Clean interface - no more visual overlaps') }}</li>
              <li>{{ t('✅ Combats plus engageants - durée augmentée pour plus de profondeur', '✅ More engaging battles - increased duration for more depth') }}</li>
            </ul>
          </div>
        </div>
      </article>

      <article class="rounded-xl border border-emerald-500/50 bg-emerald-900/20 p-5">
        <h3 class="mb-3 text-lg font-bold text-emerald-300">v1.0.0 — Release Officielle — Mars 2026</h3>
        
        <p class="mb-4 text-sm text-gray-300 italic">
          {{ t('Première version stable de Poke-Idle Legacy avec toutes les fonctionnalités principales !', 'First stable release of Poke-Idle Legacy with all core features!') }}
        </p>

        <div class="space-y-4">
          <div>
            <h4 class="mb-2 text-sm font-semibold text-emerald-400">{{ t('Système de Combat', 'Combat System') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Combat automatique idle avec DPS d\'équipe calculé en temps réel', 'Automatic idle combat with real-time team DPS calculation') }}</li>
              <li>{{ t('Système de clics manuels avec bonus de dégâts personnalisables', 'Manual click system with customizable damage bonuses') }}</li>
              <li>{{ t('Efficacité de type complète (18 types × 18 défenses)', 'Full type effectiveness (18 types × 18 defenses)') }}</li>
              <li>{{ t('Barre de progression HP des ennemis avec timer pour les boss', 'Enemy HP progress bar with boss timers') }}</li>
              <li>{{ t('Système de zones avec 10 étapes chacune (9 sauvages + 1 boss)', 'Zone system with 10 stages each (9 wilds + 1 boss)') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-emerald-400">{{ t('Système Gacha', 'Gacha System') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('4 raretés : Commun (×1), Rare (×1.5), Épique (×2), Légendaire (×4)', '4 rarities: Common (×1), Rare (×1.5), Epic (×2), Legendary (×4)') }}</li>
              <li>{{ t('Système de doublons : 5 étoiles maximum (×1 à ×1.8)', 'Duplicate system: 5 stars maximum (×1 to ×1.8)') }}</li>
              <li>{{ t('Shiny 1/1000 avec multiplicateur ×2 des étoiles normales', 'Shiny 1/1000 with ×2 multiplier of normal stars') }}</li>
              <li>{{ t('Bannières de génération avec pool de Pokémon exclusifs', 'Generation banners with exclusive Pokémon pools') }}</li>
              <li>{{ t('Coûts évolutifs : 500/2000/8000 or par invocation', 'Scaling costs: 500/2000/8000 gold per summon') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-emerald-400">{{ t('Évolutions', 'Evolutions') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Évolutions par niveau avec seuils spécifiques', 'Level-based evolutions with specific thresholds') }}</li>
              <li>{{ t('Évolutions par pierre (Feu, Eau, Plante, Foudre, Lune, Soleil)', 'Stone evolutions (Fire, Water, Leaf, Thunder, Moon, Sun)') }}</li>
              <li>{{ t('Évolutions par objets spéciaux (Roche Royale, Carapace Mue)', 'Special item evolutions (King\'s Rock, Shed Shell)') }}</li>
              <li>{{ t('26 Mega Évolutions disponibles (Gen 1-3)', '26 Mega Evolutions available (Gen 1-3)') }}</li>
              <li>{{ t('Branches multiples : Roigada, Tarpaud, Kapoera, Munja', 'Multi-branch: Slowking, Politoed, Hitmontop, Shedinja') }}</li>
              <li>{{ t('Multiplicateurs d\'évolution : ×1.5 (stade 1) → ×2.5 (stade 2) → ×4.5 (Mega)', 'Evolution multipliers: ×1.5 (stage 1) → ×2.5 (stage 2) → ×4.5 (Mega)') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-emerald-400">{{ t('Pension (Daycare)', 'Daycare') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('5 slots de pension simultanés', '5 simultaneous daycare slots') }}</li>
              <li>{{ t('Éclosion basée sur les dégâts infligés en combat', 'Hatching based on combat damage dealt') }}</li>
              <li>{{ t('Seuils évolutifs : 1★ (10k), 2★ (50k), 3★ (250k), 4★ (500k), 5★ (1M dégâts)', 'Scaling thresholds: 1★ (10k), 2★ (50k), 3★ (250k), 4★ (500k), 5★ (1M damage)') }}</li>
              <li>{{ t('Pokémon 5★ en pension : 1/50 chance de shiny', '5★ Pokémon in daycare: 1/50 shiny chance') }}</li>
              <li>{{ t('Pokémon en pension retirés de l\'équipe automatiquement', 'Pokémon in daycare automatically removed from team') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-emerald-400">{{ t('Boutique', 'Shop') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Améliorations permanentes : Click Damage (+10/20/30%) et Team DPS (+15/30/50%)', 'Permanent upgrades: Click Damage (+10/20/30%) and Team DPS (+15/30/50%)') }}</li>
              <li>{{ t('Bonbons XP : S (100 XP), M (500), L (2k), XL (10k)', 'XP Candies: S (100 XP), M (500), L (2k), XL (10k)') }}</li>
              <li>{{ t('Pierres d\'évolution achetables avec gemmes', 'Evolution stones purchasable with gems') }}</li>
              <li>{{ t('Objets spéciaux rares disponibles', 'Rare special items available') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-emerald-400">{{ t('Contenu', 'Content') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('3 générations complètes : Kanto (13 zones), Johto (16 zones), Hoenn (24 zones)', '3 complete generations: Kanto (13 zones), Johto (16 zones), Hoenn (24 zones)') }}</li>
              <li>{{ t('53 zones totales avec boss uniques et équipes thématiques', '53 total zones with unique bosses and themed teams') }}</li>
              <li>{{ t('Tous les Pokémon de Gen 1-3 + formes alternatives', 'All Gen 1-3 Pokémon + alternate forms') }}</li>
              <li>{{ t('Système de badges : 8 par génération + Ligue', 'Badge system: 8 per generation + League') }}</li>
              <li>{{ t('Pokédex complet avec sprites officiels Showdown', 'Complete Pokédex with official Showdown sprites') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-emerald-400">{{ t('Mode Invité & Sauvegarde', 'Guest Mode & Saves') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Mode invité avec sauvegarde localStorage complète', 'Guest mode with full localStorage save') }}</li>
              <li>{{ t('Sauvegarde automatique toutes les 10 secondes', 'Auto-save every 10 seconds') }}</li>
              <li>{{ t('Synchronisation cloud pour comptes authentifiés', 'Cloud sync for authenticated accounts') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-emerald-400">{{ t('Interface', 'Interface') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Design inspiré de l\'univers Pokémon', 'Pokémon-inspired design') }}</li>
              <li>{{ t('Filtres avancés : génération, rareté, type, équipe', 'Advanced filters: generation, rarity, type, team') }}</li>
              <li>{{ t('Tri personnalisable : niveau, DPS, étoiles, alphabétique', 'Custom sorting: level, DPS, stars, alphabetical') }}</li>
              <li>{{ t('Équipes sauvegardées (jusqu\'à 5 compositions)', 'Saved teams (up to 5 compositions)') }}</li>
              <li>{{ t('Modal d\'information détaillée pour chaque Pokémon', 'Detailed info modal for each Pokémon') }}</li>
              <li>{{ t('Table des types interactive dans le guide', 'Interactive type chart in guide') }}</li>
            </ul>
          </div>
        </div>
      </article>

      <article class="rounded-xl border border-amber-500/50 bg-amber-900/20 p-5">
        <h3 class="text-sm font-bold text-amber-300">🎉 v0.5.0 — Mars 2026</h3>
        <ul class="mt-2 space-y-1 text-sm text-gray-300 list-disc list-inside">
          <li>{{ t('Gen 2 et Gen 3 complètes : tous les Pokémon de base + évolutions', 'Gen 2 and Gen 3 completed: all base Pokemon + evolutions') }}</li>
          <li>{{ t('26 Mega Évolutions ajoutées (Gen 1, 2 et 3) dans les gachas', '26 Mega Evolutions added (Gen 1, 2, 3) to gacha') }}</li>
          <li>{{ t('Starters Gen 2/3 passés en rareté Épique (violet)', 'Gen 2/3 Starters upgraded to Epic rarity (purple)') }}</li>
          <li>{{ t('Filtre par région dans l\'inventaire (Kanto/Johto/Hoenn)', 'Region filter in inventory (Kanto/Johto/Hoenn)') }}</li>
          <li>{{ t('Message de félicitation animé au déblocage d\'une nouvelle région', 'Animated congratulations message when unlocking new region') }}</li>
          <li>{{ t('Sprites des items d\'évolution ajoutés (King\'s Rock, Shed Shell, etc.)', 'Evolution item sprites added (King\'s Rock, Shed Shell, etc.)') }}</li>
          <li>{{ t('Rééquilibrage difficulté : XP dresseur augmentée (75*level^1.9)', 'Difficulty rebalance: trainer XP increased (75*level^1.9)') }}</li>
          <li>{{ t('Bonus d\'or réduit : 0.5% par niveau au lieu de 1%', 'Gold bonus reduced: 0.5% per level instead of 1%') }}</li>
          <li>{{ t('Évolutions branches multiples : Roigada, Tarpaud, Kapoera, Munja', 'Multi-branch evolutions: Slowking, Politoed, Hitmontop, Shedinja') }}</li>
          <li>{{ t('Nouveaux items : Roche Royale, Carapace Mue', 'New items: King\'s Rock, Shed Shell') }}</li>
          <li>{{ t('Table des types ajoutée au guide', 'Type chart added to guide') }}</li>
        </ul>
      </article>

      <article class="rounded-xl border border-gray-700/50 bg-gray-800/40 p-5">
        <h3 class="text-sm font-bold text-amber-400">v0.3.0 — 13/02/2026</h3>
        <ul class="mt-2 space-y-1 text-sm text-gray-300 list-disc list-inside">
          <li>{{ t('Refonte complète de la Pension : 5 slots, éclosion par dégâts en combat, seuils par étoile', 'Complete Daycare rework: 5 slots, damage-based hatching, star-scaled thresholds') }}</li>
          <li>{{ t('Les 5★ en pension ont 1/50 de chance de shiny', '5★ in daycare have 1/50 shiny chance') }}</li>
          <li>{{ t('Pokémon en pension retiré de l\'équipe et non-utilisable', 'Pokémon in daycare removed from team and unusable') }}</li>
          <li>{{ t('Multiplicateur de dégâts par étoile (normal et shiny)', 'Star-based damage multiplier (normal and shiny)') }}</li>
          <li>{{ t('Légendaire passe à x4 de multiplicateur', 'Legendary multiplier increased to x4') }}</li>
          <li>{{ t('L\'évolution crée un Pokémon à 1★ et niveau 1', 'Evolution creates a Pokémon at 1★ and level 1') }}</li>
          <li>{{ t('Correction du bug des bonbons XP causant des évolutions multiples', 'Fixed XP candy bug causing multiple evolutions') }}</li>
        </ul>
      </article>

      <article class="rounded-xl border border-gray-700/50 bg-gray-800/40 p-5">
        <h3 class="text-sm font-bold text-amber-400">v0.2.0 — 13/02/2026</h3>
        <ul class="mt-2 space-y-1 text-sm text-gray-300 list-disc list-inside">
          <li>{{ t('Correction de la persistance : les Pokémon et achats survivent au refresh', 'Fixed persistence: Pokémon and purchases survive refresh') }}</li>
          <li>{{ t('Proxy API pour cookies same-origin', 'API proxy for same-origin cookies') }}</li>
          <li>{{ t('Sauvegarde automatique toutes les 10s + sauvegarde au refresh', 'Auto-save every 10s + save on refresh') }}</li>
          <li>{{ t('Authentification obligatoire (sauf Pokédex)', 'Authentication required (except Pokédex)') }}</li>
          <li>{{ t('Bonbons XP ajoutés à la boutique (S, M, L, XL)', 'XP Candies added to shop (S, M, L, XL)') }}</li>
          <li>{{ t('Correction des slugs Nidoran/M.Mime', 'Fixed Nidoran/Mr.Mime slugs') }}</li>
        </ul>
      </article>

      <article class="rounded-xl border border-gray-700/50 bg-gray-800/40 p-5">
        <h3 class="text-sm font-bold text-amber-400">v0.1.0 — 12/02/2026</h3>
        <ul class="mt-2 space-y-1 text-sm text-gray-300 list-disc list-inside">
          <li>{{ t('Système de combat idle avec DPS automatique', 'Idle combat system with auto DPS') }}</li>
          <li>{{ t('Gacha avec bannières et raretés', 'Gacha with banners and rarities') }}</li>
          <li>{{ t('Système d\'évolution par niveau et par pierre', 'Evolution system by level and stone') }}</li>
          <li>{{ t('13 zones de Kanto avec 8 champions + Ligue', '13 Kanto zones with 8 gym leaders + League') }}</li>
          <li>{{ t('Pokédex complet (toutes générations)', 'Full Pokédex (all generations)') }}</li>
          <li>{{ t('Boutique avec améliorations permanentes', 'Shop with permanent upgrades') }}</li>
          <li>{{ t('Système de badges', 'Badge system') }}</li>
          <li>{{ t('Profil joueur avec stats', 'Player profile with stats') }}</li>
        </ul>
      </article>
    </div>
  </div>
</template>

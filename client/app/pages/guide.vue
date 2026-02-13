<script setup lang="ts">
import { Swords, Star, Egg, ShoppingBag, Award, BookOpen, Sparkles, ChevronDown, ChevronUp } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'
import { GENERATIONS } from '~/data/zones'
import { RARITY_DPS_MULT } from '~/data/gacha'
import { HATCH_DAMAGE, FIVE_STAR_SHINY_CHANCE } from '~/stores/useDaycareStore'
import { STAR_DPS_MULT, STAR_DPS_MULT_SHINY } from '~/data/gacha'
import { getSpriteUrl, getTrainerSpriteUrl } from '~/utils/showdown'

definePageMeta({
  layout: 'game',
})

const { t } = useLocale()

const activeTab = ref<'wiki' | 'patchnotes'>('wiki')
const expandedGen = ref<number | null>(1)

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

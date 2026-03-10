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
          <p>{{ t(
            'Tu peux aussi cliquer sur l\'ennemi pour infliger des dégâts de clic. Ces dégâts augmentent avec ton niveau et tes améliorations de la Boutique.',
            'You can also click the enemy to deal click damage. Click damage scales with your level and Shop upgrades.'
          ) }}</p>
          <p class="text-amber-400 font-medium">{{ t(
            '⚠️ Malus hors-région : tes Pokémon infligent 99.9% de dégâts en moins s\'ils ne sont pas de la même génération que la zone de combat !',
            '⚠️ Out-of-region penalty: your Pokémon deal 99.9% less damage if they\'re not from the same generation as the combat zone!'
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
            'Les doublons augmentent les étoiles du Pokémon (max 5★). Chance de shiny : 1/8192 (améliorable avec le Charme Chroma).',
            'Duplicates increase the Pokémon\'s stars (max 5★). Shiny chance: 1/8192 (improvable with Shiny Charm).'
          ) }}</p>
        </div>

        <h3 class="mt-3 mb-1 text-xs font-semibold text-gray-400 uppercase">{{ t('Probabilités de drop', 'Drop rates') }}</h3>
        <div class="flex flex-wrap gap-2 mb-3">
          <span class="rounded bg-gray-700 px-2 py-1 text-xs"><span class="text-gray-300">Commun</span> <span class="font-bold text-white">70%</span></span>
          <span class="rounded bg-gray-700 px-2 py-1 text-xs"><span class="text-blue-400">Rare</span> <span class="font-bold text-white">25%</span></span>
          <span class="rounded bg-gray-700 px-2 py-1 text-xs"><span class="text-purple-400">Épique</span> <span class="font-bold text-white">4.8%</span></span>
          <span class="rounded bg-gray-700 px-2 py-1 text-xs"><span class="text-amber-400">Légendaire</span> <span class="font-bold text-white">0.2%</span></span>
          <span class="rounded bg-gray-700 px-2 py-1 text-xs"><span class="text-yellow-400">✨ Shiny</span> <span class="font-bold text-white">1/8192</span></span>
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
            'Bonbons XP : S (+100), M (+500), L (+2000), XL (+10000). Achat possible en lot (×1, ×5, ×10, ×50). Attention : un bonbon peut déclencher une évolution !',
            'XP Candies: S (+100), M (+500), L (+2000), XL (+10000). Bulk buy available (×1, ×5, ×10, ×50). Warning: a candy can trigger evolution!'
          ) }}</p>
          <p>{{ t(
            'La boutique propose aussi des items d\'évolution (Pierre Feu, Pierre Eau, Pierre Plante, etc.) pour faire évoluer certains Pokémon.',
            'The shop also offers evolution items (Fire Stone, Water Stone, Leaf Stone, etc.) to evolve certain Pokémon.'
          ) }}</p>
          <p class="text-amber-400 font-medium">{{ t(
            '💡 Conseil : achetez tous les items d\'évolution de votre génération actuelle AVANT de passer à la suivante, car les prix augmentent fortement à chaque nouvelle région ! (5 000 en Gen 1 → 1 000 000 en Gen 9)',
            '💡 Tip: buy all evolution items for your current generation BEFORE advancing to the next one, as prices increase sharply with each new region! (5,000 in Gen 1 → 1,000,000 in Gen 9)'
          ) }}</p>
          <p>{{ t(
            'Dégâts de clic : 27 paliers d\'amélioration répartis sur les 9 régions (Kanto → Paldea). Les paliers d\'une région sont verrouillés tant que tu n\'as pas débloqué cette génération.',
            'Click damage: 27 upgrade tiers spread across all 9 regions (Kanto → Paldea). A region\'s tiers are locked until you unlock that generation.'
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
          <p>{{ t(
            'Living Dex : quand un Pokémon évolue, l\'original reste dans ta collection et la forme évoluée est ajoutée comme un nouveau Pokémon (niveau 1).',
            'Living Dex: when a Pokémon evolves, the original stays in your collection and the evolved form is added as a new Pokémon (level 1).'
          ) }}</p>
          <p>{{ t(
            'Multi-évolution : certains Pokémon ont plusieurs voies d\'évolution (ex : Ramoloss → Flagadoss par niveau ET Roigada par Pierre Royale). Le même exemplaire peut produire toutes ses évolutions !',
            'Multi-evolution: some Pokémon have multiple evolution paths (e.g., Slowpoke → Slowbro by level AND Slowking by King\'s Rock). The same copy can produce all its evolutions!'
          ) }}</p>
          <p>{{ t(
            'Méthodes : Niveau (automatique), Pierre (Feu, Eau, Plante, Foudre, Lune, Soleil, Aube), Échange (Câble Link, Pierre Royale, Peau Métal, etc.), Bonheur (Pierre Ovale).',
            'Methods: Level (automatic), Stone (Fire, Water, Leaf, Thunder, Moon, Sun, Dawn), Trade (Link Cable, King\'s Rock, Metal Coat, etc.), Happiness (Oval Stone).'
          ) }}</p>
        </div>
      </section>

      <!-- ── Régions & Générations ── -->
      <section class="rounded-xl border border-gray-700/50 bg-gray-800/40 p-5">
        <h2 class="mb-3 flex items-center gap-2 text-lg font-bold text-emerald-400">
          🌍 {{ t('Régions & Générations', 'Regions & Generations') }}
        </h2>
        <div class="space-y-2 text-sm text-gray-300">
          <p>{{ t(
            'Le jeu est divisé en générations (Kanto, Johto, Hoenn, Sinnoh…). Tu débloques la génération suivante en battant tous les boss de la région actuelle.',
            'The game is divided into generations (Kanto, Johto, Hoenn, Sinnoh…). Unlock the next generation by defeating all bosses in the current region.'
          ) }}</p>
          <p>{{ t(
            'Chaque génération débloque de nouveaux Pokémon à invoquer (bannière gacha dédiée), de nouvelles zones et de nouveaux boss.',
            'Each generation unlocks new Pokémon to summon (dedicated gacha banner), new zones and new bosses.'
          ) }}</p>
          <p class="text-amber-400 font-medium">{{ t(
            '⚠️ Utilise des Pokémon de la bonne région ! Un Pokémon hors-région subit un malus de 99.9% de dégâts. Compose ton équipe avec des Pokémon natifs de la zone que tu combats.',
            '⚠️ Use Pokémon from the right region! An out-of-region Pokémon takes a 99.9% damage penalty. Build your team with Pokémon native to the zone you\'re fighting in.'
          ) }}</p>
        </div>
      </section>

      <!-- ── Équipes sauvegardées ── -->
      <section class="rounded-xl border border-gray-700/50 bg-gray-800/40 p-5">
        <h2 class="mb-3 flex items-center gap-2 text-lg font-bold text-cyan-400">
          💾 {{ t('Équipes sauvegardées', 'Saved Teams') }}
        </h2>
        <div class="space-y-2 text-sm text-gray-300">
          <p>{{ t(
            'Tu peux sauvegarder ta composition d\'équipe actuelle (6 Pokémon) et la recharger plus tard. Pratique pour alterner entre une équipe Kanto et une équipe Johto !',
            'You can save your current team composition (6 Pokémon) and reload it later. Handy for switching between a Kanto team and a Johto team!'
          ) }}</p>
          <p>{{ t(
            'Utilise les boutons Sauvegarder / Charger dans l\'inventaire. Tu peux aussi vider ton équipe d\'un clic.',
            'Use the Save / Load buttons in the inventory. You can also clear your team with one click.'
          ) }}</p>
        </div>
      </section>

      <!-- ── Charme Chroma ── -->
      <section class="rounded-xl border border-gray-700/50 bg-gray-800/40 p-5">
        <h2 class="mb-3 flex items-center gap-2 text-lg font-bold text-amber-300">
          ✨ {{ t('Charme Chroma', 'Shiny Charm') }}
        </h2>
        <div class="space-y-2 text-sm text-gray-300">
          <p>{{ t(
            'Complète le Pokédex d\'une génération entière (possède au moins un exemplaire de chaque Pokémon de la région) pour recevoir un Charme Chroma + une récompense en or.',
            'Complete an entire generation\'s Pokédex (own at least one of every Pokémon from the region) to receive a Shiny Charm + a gold reward.'
          ) }}</p>
          <p>{{ t(
            'Chaque Charme Chroma double ta chance de shiny de base (1/8192 → 2/8192 → 3/8192, etc.). Tes chances de shiny apparaissent sur ta page Profil.',
            'Each Shiny Charm doubles your base shiny chance (1/8192 → 2/8192 → 3/8192, etc.). Your shiny odds appear on your Profile page.'
          ) }}</p>
        </div>
      </section>

      <!-- ── Classement ── -->
      <section class="rounded-xl border border-gray-700/50 bg-gray-800/40 p-5">
        <h2 class="mb-3 flex items-center gap-2 text-lg font-bold text-yellow-400">
          🏆 {{ t('Classement', 'Leaderboard') }}
        </h2>
        <div class="space-y-2 text-sm text-gray-300">
          <p>{{ t(
            'Le classement compare les joueurs sur 7 catégories : Niveau, Richesse, Badges, Pokédex, Shiny, Légendaires et Légendaires Shiny.',
            'The leaderboard compares players across 7 categories: Level, Wealth, Badges, Pokédex, Shiny, Legendaries and Shiny Legendaries.'
          ) }}</p>
          <p>{{ t(
            'Le Classement Général calcule la moyenne de tes positions dans chaque catégorie (les catégories où tu es à 0 ne comptent pas). Plus ta moyenne est basse, meilleur est ton rang.',
            'The Overall Ranking averages your position in each category (categories where you have 0 don\'t count). The lower your average, the better your rank.'
          ) }}</p>
          <p>{{ t(
            'Il faut au moins 2 badges pour apparaître dans le classement. Les données se mettent à jour automatiquement toutes les 5 minutes.',
            'You need at least 2 badges to appear in the leaderboard. Data refreshes automatically every 5 minutes.'
          ) }}</p>
          <p class="text-yellow-400 font-medium">{{ t(
            '🏅 Chaque semaine, le top 3 du classement général sera récompensé par le comité de la Ligue Pokémon !',
            '🏅 Every week, the top 3 of the overall ranking will be rewarded by the Pokémon League committee!'
          ) }}</p>
        </div>
      </section>

      <!-- ── PvP Arena ── -->
      <section class="rounded-xl border border-gray-700/50 bg-gray-800/40 p-5">
        <h2 class="mb-3 flex items-center gap-2 text-lg font-bold text-red-400">
          <Swords class="h-5 w-5" /> {{ t('Arène PvP (Multijoueur)', 'PvP Arena (Multiplayer)') }}
        </h2>
        <div class="space-y-2 text-sm text-gray-300">
          <p class="text-amber-400 font-medium">{{ t(
            '🔒 Prérequis : avoir complété Kanto (13 badges) pour débloquer le PvP.',
            '🔒 Requirement: complete Kanto (13 badges) to unlock PvP.'
          ) }}</p>
          <p>{{ t(
            'Le PvP te permet d\'affronter d\'autres joueurs dans un duel 1v1 avec paris de PokéDollars ! Le principe : les deux joueurs combattent simultanément un Boss aléatoire invincible, et celui qui inflige le plus de dégâts remporte la mise.',
            'PvP lets you face other players in a 1v1 duel with PokéDollar bets! The concept: both players simultaneously fight a random invincible Boss, and whoever deals the most damage wins the pot.'
          ) }}</p>
        </div>

        <h3 class="mt-4 mb-1 text-xs font-semibold text-gray-400 uppercase">{{ t('Comment ça marche ?', 'How does it work?') }}</h3>
        <div class="space-y-2 text-sm text-gray-300">
          <p>{{ t(
            '1. Envoyer un défi : choisis un adversaire en ligne, fixe ta mise (min 100, max 50% de ton or) et sélectionne 6 Pokémon.',
            '1. Send a challenge: pick an online opponent, set your bet (min 100, max 50% of your gold) and select 6 Pokémon.'
          ) }}</p>
          <p>{{ t(
            '2. Accepter un défi : ton adversaire reçoit ta demande et choisit ses 6 Pokémon pour accepter. Il a 10 minutes avant expiration.',
            '2. Accept a challenge: your opponent receives the request and picks their 6 Pokémon to accept. They have 10 minutes before it expires.'
          ) }}</p>
          <p>{{ t(
            '3. Combat : un Boss aléatoire (légendaire ou épique) est choisi parmi les générations débloquées par les DEUX joueurs. Les DPS de chaque équipe sont calculés pendant 60 secondes contre les types du boss.',
            '3. Combat: a random Boss (legendary or epic) is picked from generations unlocked by BOTH players. Each team\'s DPS is calculated over 60 seconds against the boss\'s types.'
          ) }}</p>
          <p>{{ t(
            '4. Résultat : le joueur avec le plus de dégâts totaux gagne la mise de l\'adversaire ! En cas d\'égalité, personne ne perd d\'or.',
            '4. Result: the player with the most total damage wins the opponent\'s bet! In case of a draw, nobody loses gold.'
          ) }}</p>
        </div>

        <h3 class="mt-4 mb-1 text-xs font-semibold text-gray-400 uppercase">{{ t('Calcul des dégâts', 'Damage calculation') }}</h3>
        <div class="space-y-2 text-sm text-gray-300">
          <p>{{ t(
            'Chaque Pokémon inflige des DPS basés sur : Niveau × Rareté × Shiny (×4) × Étoiles × Efficacité de type. Le meilleur type offensif est utilisé automatiquement contre le Boss.',
            'Each Pokémon deals DPS based on: Level × Rarity × Shiny (×4) × Stars × Type effectiveness. The best offensive type is automatically used against the Boss.'
          ) }}</p>
          <p class="text-amber-400 font-medium">{{ t(
            '💡 Astuce : compose une équipe polyvalente avec des types variés pour couvrir un maximum de Boss possibles !',
            '💡 Tip: build a versatile team with diverse types to cover as many possible Bosses as you can!'
          ) }}</p>
        </div>

        <h3 class="mt-4 mb-1 text-xs font-semibold text-gray-400 uppercase">{{ t('Classement PvP', 'PvP Leaderboard') }}</h3>
        <div class="text-sm text-gray-300">
          <p>{{ t(
            'Un classement PvP dédié montre les meilleurs joueurs avec leur ratio victoires/défaites et le total de PokéDollars gagnés. Accessible depuis l\'onglet Classement de la page PvP.',
            'A dedicated PvP leaderboard shows the best players with their win/loss ratio and total PokéDollars won. Accessible from the Leaderboard tab on the PvP page.'
          ) }}</p>
        </div>
      </section>

      <!-- ── Badges ── -->
      <section class="rounded-xl border border-gray-700/50 bg-gray-800/40 p-5">
        <h2 class="mb-3 flex items-center gap-2 text-lg font-bold text-indigo-400">
          <Award class="h-5 w-5" /> {{ t('Badges', 'Badges') }}
        </h2>
        <div class="space-y-2 text-sm text-gray-300">
          <p>{{ t(
            'Chaque boss vaincu te donne un badge. Collectionne-les tous pour prouver ta maîtrise !',
            'Every boss defeated gives you a badge. Collect them all to prove your mastery!'
          ) }}</p>
          <p>{{ t(
            'Les badges contribuent aussi à tes dégâts de clic (+3 par badge) et sont nécessaires pour apparaître dans le classement (minimum 2).',
            'Badges also contribute to your click damage (+3 per badge) and are required to appear in the leaderboard (minimum 2).'
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
                    <PokemonSprite :slug="poke.slug" :alt="t(poke.nameFr, poke.nameEn)" class="h-5 w-5" />
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

      <!-- v2.0.0 -->
      <article class="rounded-xl border-2 border-red-500/60 bg-gradient-to-br from-red-900/30 to-amber-900/20 p-5">
        <div class="mb-1 flex items-center gap-2">
          <span class="rounded bg-red-500 px-2 py-0.5 text-xs font-black text-white">MAJEURE</span>
          <span class="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-400">BETA</span>
        </div>
        <h3 class="mb-3 text-xl font-black text-red-300">v2.0.0 — Générations 5-9, PvP Multijoueur & Avatars — 10 Mars 2026</h3>

        <p class="mb-4 text-sm text-gray-300 italic">
          {{ t('Mise à jour massive ! 5 nouvelles régions (Unys → Paldea), mode PvP 1v1 avec paris, photos de profil, récompense Maître Pokédex et bien plus !', 'Massive update! 5 new regions (Unova → Paldea), PvP 1v1 mode with betting, profile avatars, Pokédex Master reward and much more!') }}
        </p>

        <div class="space-y-4">
          <div>
            <h4 class="mb-2 text-sm font-semibold text-red-400">⚔️ {{ t('PvP Multijoueur (Beta)', 'Multiplayer PvP (Beta)') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Nouveau mode 1v1 : affronte d\'autres joueurs avec des paris de PokéDollars !', 'New 1v1 mode: fight other players with PokéDollar bets!') }}</li>
              <li>{{ t('Sélectionne 6 Pokémon et combat un Boss légendaire aléatoire — le meilleur DPS gagne', 'Select 6 Pokémon and fight a random legendary Boss — best DPS wins') }}</li>
              <li>{{ t('Boss choisi parmi les générations débloquées par les deux joueurs', 'Boss picked from generations unlocked by both players') }}</li>
              <li>{{ t('Mise : min 100, max 50% de ton or — le gagnant remporte la mise adverse', 'Bet: min 100, max 50% of your gold — winner takes opponent\'s bet') }}</li>
              <li>{{ t('Animation de combat hybride : résolution serveur + barres de dégâts animées', 'Hybrid combat animation: server resolution + animated damage bars') }}</li>
              <li>{{ t('Classement PvP dédié avec ratio victoires/défaites', 'Dedicated PvP leaderboard with win/loss ratio') }}</li>
              <li>{{ t('Historique complet de tous tes matchs', 'Full history of all your matches') }}</li>
              <li>{{ t('Notification de défis reçus dans la sidebar', 'Challenge notifications in the sidebar') }}</li>
              <li>{{ t('🔒 Requiert 13 badges (Kanto complet) pour débloquer', '🔒 Requires 13 badges (Kanto complete) to unlock') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-red-400">🌍 {{ t('5 Nouvelles Régions', '5 New Regions') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Génération 5 — Unys (Unova) : 13 zones, 156 Pokémon, champions + Ligue', 'Generation 5 — Unova: 13 zones, 156 Pokémon, gym leaders + League') }}</li>
              <li>{{ t('Génération 6 — Kalos : 13 zones, 72 Pokémon, champions + Ligue', 'Generation 6 — Kalos: 13 zones, 72 Pokémon, gym leaders + League') }}</li>
              <li>{{ t('Génération 7 — Alola : 13 zones, 86 Pokémon, capitaines + Ligue', 'Generation 7 — Alola: 13 zones, 86 Pokémon, captains + League') }}</li>
              <li>{{ t('Génération 8 — Galar : 13 zones, 89 Pokémon, champions + Ligue', 'Generation 8 — Galar: 13 zones, 89 Pokémon, gym leaders + League') }}</li>
              <li>{{ t('Génération 9 — Paldea : 13 zones, 103 Pokémon, champions + Ligue', 'Generation 9 — Paldea: 13 zones, 103 Pokémon, gym leaders + League') }}</li>
              <li>{{ t('Chaque région a ses bannières gacha, items d\'évolution, boss thématiques et légendaires exclusifs', 'Each region has its gacha banners, evolution items, themed bosses and exclusive legendaries') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-red-400">📸 {{ t('Avatars de profil', 'Profile Avatars') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Upload ta photo de profil depuis la page Profil', 'Upload your profile picture from the Profile page') }}</li>
              <li>{{ t('Visible partout : sidebar, classements, PvP, admin', 'Visible everywhere: sidebar, leaderboards, PvP, admin') }}</li>
              <li>{{ t('Suppression et réinitialisation possibles (admin aussi)', 'Deletion and reset available (admin too)') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-red-400">🏆 {{ t('Maître Pokédex', 'Pokédex Master') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Complète le Pokédex de TOUTES les régions pour devenir Maître Pokédex', 'Complete the Pokédex of ALL regions to become Pokédex Master') }}</li>
              <li>{{ t('Récompense : multiplicateur shiny ×3 permanent + 50M PokéDollars + titre Crown', 'Reward: permanent ×3 shiny multiplier + 50M PokéDollars + Crown title') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-red-400">⚙️ {{ t('Autres ajouts', 'Other additions') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Malus admin : pénalités DPS ou or applicables aux joueurs (anti-triche)', 'Admin penalties: DPS or gold penalties for players (anti-cheat)') }}</li>
              <li>{{ t('Prix des items d\'évolution adaptés par génération (5k Gen 1 → 1M Gen 9)', 'Evolution item prices scaled by generation (5k Gen 1 → 1M Gen 9)') }}</li>
              <li>{{ t('Click boosts étendus aux 9 régions (27 paliers)', 'Click boosts extended to all 9 regions (27 tiers)') }}</li>
              <li>{{ t('Mode invité supprimé — compte requis pour jouer', 'Guest mode removed — account required to play') }}</li>
              <li>{{ t('Sprites équipe agrandis dans l\'inventaire', 'Enlarged team sprites in inventory') }}</li>
              <li>{{ t('Migration automatique des noms FR/EN pour Pokémon existants', 'Automatic FR/EN name migration for existing Pokémon') }}</li>
            </ul>
          </div>
        </div>
      </article>

      <!-- v1.7.0 -->
      <article class="rounded-xl border border-amber-500/50 bg-amber-900/20 p-5">
        <h3 class="mb-3 text-lg font-bold text-amber-300">v1.7.0 — Équilibrage Difficulté & Économie — 10 Mars 2026</h3>
        
        <p class="mb-4 text-sm text-gray-300 italic">
          {{ t('Refonte complète du scaling de difficulté et de l\'économie d\'or pour un gameplay plus équilibré à travers les générations !', 'Complete overhaul of difficulty scaling and gold economy for more balanced gameplay across generations!') }}
        </p>

        <div class="space-y-4">
          <div>
            <h4 class="mb-2 text-sm font-semibold text-amber-400">⚔️ {{ t('Difficulté', 'Difficulty') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Chaque génération a désormais une progression de niveau 1 → 100 indépendante', 'Each generation now has an independent level 1 → 100 progression') }}</li>
              <li>{{ t('Difficulté locale : les HP et la puissance des ennemis se réinitialisent à chaque nouvelle région', 'Local difficulty: enemy HP and power reset at each new region') }}</li>
              <li>{{ t('Multiplicateur de génération doux : Gen 1 ×1.0, Gen 2 ×1.2, Gen 3 ×1.3, Gen 4 ×1.4, Gen 5 ×1.5', 'Gentle generation multiplier: Gen 1 ×1.0, Gen 2 ×1.2, Gen 3 ×1.3, Gen 4 ×1.4, Gen 5 ×1.5') }}</li>
              <li>{{ t('Niveaux des boss Gen 4-5 corrigés : suivent désormais le même pattern que Gen 1-3', 'Gen 4-5 boss levels fixed: now follow the same pattern as Gen 1-3') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-amber-400">💰 {{ t('Économie', 'Economy') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Nouvelle formule d\'or : les gains s\'adaptent automatiquement au coût des bannières de chaque génération', 'New gold formula: earnings automatically scale with each generation\'s banner costs') }}</li>
              <li>{{ t('Fin de génération : ~10 invocations pour 100 kills', 'End of generation: ~10 pulls per 100 kills') }}</li>
              <li>{{ t('Début de génération : ~5 invocations pour 100 kills', 'Start of generation: ~5 pulls per 100 kills') }}</li>
              <li>{{ t('Récompenses de boss augmentées (~10× les sauvages)', 'Boss rewards increased (~10× wilds)') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-amber-400">🐛 {{ t('Corrections', 'Bug Fixes') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('CORRIGÉ : La notification de Pokédex complété ne s\'affiche plus à chaque rechargement de page', 'FIXED: Pokédex completion notification no longer shows on every page reload') }}</li>
            </ul>
          </div>
        </div>
      </article>

      <!-- v1.6.0 -->
      <article class="rounded-xl border border-amber-500/50 bg-amber-900/20 p-5">
        <h3 class="mb-3 text-lg font-bold text-amber-300">v1.6.0 — Corrections & Équilibrage — 10 Mars 2026</h3>
        
        <p class="mb-4 text-sm text-gray-300 italic">
          {{ t('Corrections majeures de gameplay, équilibrage des taux de drop et améliorations de l\'interface !', 'Major gameplay fixes, drop rate balancing and UI improvements!') }}
        </p>

        <div class="space-y-4">
          <div>
            <h4 class="mb-2 text-sm font-semibold text-amber-400">⚔️ {{ t('Équilibrage', 'Balancing') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Taux de drop ajustés : Légendaire 0.2%, Épique 4.8%, Rare 25%, Commun 70%', 'Drop rates adjusted: Legendary 0.2%, Epic 4.8%, Rare 25%, Common 70%') }}</li>
              <li>{{ t('Améliorations de dégâts clics verrouillées par génération (Johto requis pour boosts Johto, etc.)', 'Click damage upgrades locked by generation (Johto required for Johto boosts, etc.)') }}</li>
              <li>{{ t('Les admins sont exclus des classements', 'Admins are excluded from leaderboards') }}</li>
              <li>{{ t('Classement général : les catégories à 0 ne pénalisent plus le score moyen', 'Overall ranking: categories with 0 no longer penalize average score') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-amber-400">🐛 {{ t('Corrections', 'Bug Fixes') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('CORRIGÉ : Multi-évolution — Ramoloss peut désormais évoluer en Flagadoss ET Roigada depuis le même exemplaire', 'FIXED: Multi-evolution — Slowpoke can now evolve into both Slowbro AND Slowking from the same copy') }}</li>
              <li>{{ t('CORRIGÉ : Même correction pour Kirlia (Gardevoir/Gallame), Stalgamin (Oniglali/Momartik), etc.', 'FIXED: Same fix for Kirlia (Gardevoir/Gallade), Snorunt (Glalie/Froslass), etc.') }}</li>
              <li>{{ t('CORRIGÉ : Filtre par type dans l\'inventaire prend en compte les deux types du Pokémon', 'FIXED: Type filter in inventory now considers both of the Pokémon\'s types') }}</li>
              <li>{{ t('CORRIGÉ : Dashboard admin — colonnes Région et Dernière connexion fonctionnelles', 'FIXED: Admin dashboard — Region and Last login columns now working') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-amber-400">🎨 {{ t('Interface', 'UI') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Doubles types ajoutés pour toutes les Méga-Évolutions (Dracaufeu Méga X = Feu/Dragon, etc.)', 'Dual types added for all Mega Evolutions (Mega Charizard X = Fire/Dragon, etc.)') }}</li>
              <li>{{ t('Boutique : affichage du verrou par génération ou par niveau sur les boosts de clics', 'Shop: generation or level lock display on click boosts') }}</li>
            </ul>
          </div>
        </div>
      </article>

      <!-- v1.5.0 -->
      <article class="rounded-xl border border-amber-500/50 bg-amber-900/20 p-5">
        <h3 class="mb-3 text-lg font-bold text-amber-300">v1.5.0 — Classement & Admin — 9 Mars 2026</h3>
        
        <p class="mb-4 text-sm text-gray-300 italic">
          {{ t('Nouveau classement compétitif, interface admin améliorée, équilibrage régional et corrections !', 'New competitive leaderboard, improved admin interface, regional balancing and fixes!') }}
        </p>

        <div class="space-y-4">
          <div>
            <h4 class="mb-2 text-sm font-semibold text-amber-400">🏆 {{ t('Classement', 'Leaderboard') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Nouvelle page Classement accessible depuis le menu', 'New Leaderboard page accessible from the menu') }}</li>
              <li>{{ t('Classement Général basé sur la moyenne des positions dans toutes les catégories', 'Overall Ranking based on average position across all categories') }}</li>
              <li>{{ t('8 catégories : Niveau, Richesse, Badges, Pokédex, Invocations, Shiny, Légendaires, Légendaires Shiny', '8 categories: Level, Wealth, Badges, Pokédex, Summons, Shiny, Legendaries, Shiny Legendaries') }}</li>
              <li>{{ t('Podium top 3 avec couronnes et médailles pour chaque classement', 'Top 3 podium with crowns and medals for each ranking') }}</li>
              <li>{{ t('Minimum 2 badges pour apparaître dans le classement', 'Minimum 2 badges to appear in the ranking') }}</li>
              <li>{{ t('Mise à jour automatique toutes les 5 minutes', 'Automatic refresh every 5 minutes') }}</li>
              <li>{{ t('Chaque semaine, le top 3 sera récompensé par le comité de la Ligue Pokémon !', 'Every week, the top 3 will be rewarded by the Pokémon League committee!') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-amber-400">⚙️ {{ t('Administration', 'Administration') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Dashboard enrichi : 8 cartes de statistiques (utilisateurs, actifs 24h, pokémon, shiny, légendaires, niveaux, badges, gold)', 'Enhanced dashboard: 8 stat cards (users, active 24h, pokémon, shiny, legendaries, levels, badges, gold)') }}</li>
              <li>{{ t('Table utilisateurs : colonnes Région et Dernière connexion ajoutées', 'Users table: Region and Last login columns added') }}</li>
              <li>{{ t('Filtre par rôle (Tous / Users / Admins)', 'Role filter (All / Users / Admins)') }}</li>
              <li>{{ t('Icônes Lucide propres remplacent les anciens emojis', 'Clean Lucide icons replace old emojis') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-amber-400">⚔️ {{ t('Équilibrage', 'Balancing') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Malus hors région augmenté de 50% à 90% — combattre avec des Pokémon de la bonne région est désormais crucial', 'Out-of-region penalty increased from 50% to 90% — fighting with region-matching Pokémon is now crucial') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-amber-400">🐛 {{ t('Corrections', 'Bug Fixes') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('CORRIGÉ : Évolutions par pierre d\'Évoli — plusieurs évolutions possibles grâce au reset du flag hasEvolved', 'FIXED: Eevee stone evolutions — multiple evolutions now possible thanks to hasEvolved flag reset') }}</li>
              <li>{{ t('CORRIGÉ : Pages admin et classement intégrées dans le layout principal (sidebar et navigation)', 'FIXED: Admin and leaderboard pages integrated into main layout (sidebar and navigation)') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-amber-400">🎨 {{ t('Interface', 'UI') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Barre de progression XP ajoutée dans le détail Pokémon (inventaire)', 'XP progress bar added in Pokémon detail (inventory)') }}</li>
              <li>{{ t('Achat de bonbons en lot (×1, ×5, ×10, ×50) dans la boutique', 'Bulk candy purchase (×1, ×5, ×10, ×50) in the shop') }}</li>
              <li>{{ t('Icônes Lucide pour les boutons Vider/Sauvegarder/Charger d\'équipe dans l\'inventaire', 'Lucide icons for Clear/Save/Load team buttons in inventory') }}</li>
              <li>{{ t('Menu contextuel désactivé sur la page de combat', 'Context menu disabled on combat page') }}</li>
            </ul>
          </div>
        </div>
      </article>

      <!-- v1.4.0 -->
      <article class="rounded-xl border border-amber-500/50 bg-amber-900/20 p-5">
        <h3 class="mb-3 text-lg font-bold text-amber-300">v1.4.0 — Shinys & Récompenses — 9 Mars 2026</h3>
        
        <p class="mb-4 text-sm text-gray-300 italic">
          {{ t('Taux de shiny réalistes, Pokémon sauvages shinys, récompenses de complétion Pokédex et améliorations UX !', 'Realistic shiny rates, wild shiny encounters, Pokédex completion rewards and UX improvements!') }}
        </p>

        <div class="space-y-4">
          <div>
            <h4 class="mb-2 text-sm font-semibold text-amber-400">✨ {{ t('Shinys', 'Shinies') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Taux de shiny au gacha passé de 1/1000 à 1/8192 (comme les vrais jeux)', 'Gacha shiny rate changed from 1/1000 to 1/8192 (like the real games)') }}</li>
              <li>{{ t('Charme Chroma : obtenu en complétant le Pokédex d\'une région, augmente les chances de shiny', 'Shiny Charm: obtained by completing a region\'s Pokédex, increases shiny odds') }}</li>
              <li>{{ t('Chaque Charme Chroma ajoute +1/8192 aux chances (2 charmes = 3/8192 ≈ 1/2731)', 'Each Shiny Charm adds +1/8192 to odds (2 charms = 3/8192 ≈ 1/2731)') }}</li>
              <li>{{ t('Pokémon sauvages shinys en combat ! (×5 or, ×3 XP) avec notification toast', 'Wild shiny Pokémon in combat! (×5 gold, ×3 XP) with toast notification') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-amber-400">🏆 {{ t('Complétion Pokédex', 'Pokédex Completion') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Récompenses pour complétion du Pokédex d\'une génération : or + Charme Chroma', 'Rewards for completing a generation\'s Pokédex: gold + Shiny Charm') }}</li>
              <li>{{ t('Kanto : 50 000 or | Johto : 100 000 or | Hoenn : 200 000 or | Sinnoh : 400 000 or', 'Kanto: 50,000 gold | Johto: 100,000 gold | Hoenn: 200,000 gold | Sinnoh: 400,000 gold') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-amber-400">🎨 {{ t('Interface', 'UI') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Drag & drop amélioré : opacité sur la source, glow sur la cible, bordure pointillée sur les slots vides', 'Improved drag & drop: opacity on source, glow on target, dashed border on empty slots') }}</li>
              <li>{{ t('Types des Pokémon affichés dans les slots d\'équipe (inventaire)', 'Pokémon types displayed in team slots (inventory)') }}</li>
              <li>{{ t('Système de toasts : notifications pour œufs prêts, évolutions, shinys sauvages, complétion Pokédex', 'Toast system: notifications for ready eggs, evolutions, wild shinies, Pokédex completion') }}</li>
            </ul>
          </div>
        </div>
      </article>

      <!-- v1.3.0 -->
      <article class="rounded-xl border border-red-500/50 bg-red-900/20 p-5">
        <h3 class="mb-3 text-lg font-bold text-red-300">v1.3.0 — Stabilité & Corrections — 9 Mars 2026</h3>
        
        <p class="mb-4 text-sm text-gray-300 italic">
          {{ t('Grosse refonte du système de sauvegarde et correction de nombreux bugs critiques !', 'Major save system overhaul and many critical bug fixes!') }}
        </p>

        <div class="space-y-4">
          <div>
            <h4 class="mb-2 text-sm font-semibold text-red-400">💾 {{ t('Sauvegarde', 'Save System') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('CORRIGÉ: Perte de données après F5 (bonbons, achats, or) — sauvegarde immédiate après chaque action', 'FIXED: Data loss after F5 (candies, purchases, gold) — immediate save after every action') }}</li>
              <li>{{ t('CORRIGÉ: Duplication de Pokémon lors de sauvegardes concurrentes — verrou client + transaction DB', 'FIXED: Pokémon duplication on concurrent saves — client lock + DB transaction') }}</li>
              <li>{{ t('CORRIGÉ: Deadlock de sauvegarde après override admin — try/finally garantit la libération du verrou', 'FIXED: Save deadlock after admin override — try/finally guarantees lock release') }}</li>
              <li>{{ t('NOUVEAU: Sauvegarde automatique quand l\'onglet perd le focus (visibilitychange)', 'NEW: Auto-save when tab loses focus (visibilitychange)') }}</li>
              <li>{{ t('NOUVEAU: Sauvegarde réactive 2s après tout changement d\'état important', 'NEW: Reactive save 2s after any important state change') }}</li>
              <li>{{ t('CORRIGÉ: Boss vaincus (defeatedBosses) maintenant persistés côté serveur', 'FIXED: Defeated bosses now persisted server-side') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-red-400">⚔️ {{ t('Combat', 'Combat') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('CORRIGÉ: Timer de boss infini quand on change d\'onglet — le temps s\'écoule correctement en arrière-plan', 'FIXED: Infinite boss timer on tab switch — time now elapses correctly in background') }}</li>
              <li>{{ t('CORRIGÉ: Multiplicateur DPS shiny corrigé de ×1.5 à ×4', 'FIXED: Shiny DPS multiplier corrected from ×1.5 to ×4') }}</li>
              <li>{{ t('CORRIGÉ: Scaling HP des boss lissé entre les régions (plus de saut brutal)', 'FIXED: Boss HP scaling smoothed across regions (no more abrupt jumps)') }}</li>
              <li>{{ t('Compteur "Kills" renommé en "Mis KOs" et persisté entre les sessions', '"Kills" counter renamed to "KOs" and persisted across sessions') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-red-400">🧬 {{ t('Pokémon & Évolutions', 'Pokémon & Evolutions') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('CORRIGÉ: Rareté des évolutions — les formes évoluées héritent correctement de la rareté du parent', 'FIXED: Evolution rarity — evolved forms correctly inherit parent rarity') }}</li>
              <li>{{ t('CORRIGÉ: Méga-Évolutions assignées à la bonne génération (celle de la forme de base)', 'FIXED: Mega Evolutions assigned to correct generation (base form\'s gen)') }}</li>
              <li>{{ t('CORRIGÉ: Items d\'évolution vérifient maintenant par variante (normal/shiny séparément)', 'FIXED: Evolution items now check per variant (normal/shiny separately)') }}</li>
              <li>{{ t('CORRIGÉ: Pension — un shiny n\'est plus bloqué si la version normale est déjà déposée', 'FIXED: Daycare — shiny no longer blocked if normal version is already deposited') }}</li>
              <li>{{ t('Migration automatique des raretés pour tous les Pokémon existants', 'Automatic rarity migration for all existing Pokémon') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-red-400">🗑️ {{ t('Retraits', 'Removals') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('RETIRÉ: Récompenses AFK complètement supprimées (serveur + client)', 'REMOVED: AFK rewards completely removed (server + client)') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-red-400">⚖️ {{ t('Équilibrage', 'Balancing') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Dégâts clics: scaling √(niveau) — plus forts en early, plafonnés en late game', 'Click damage: √(level) scaling — stronger early, capped late game') }}</li>
              <li>{{ t('DPS Pokémon de base doublé (niveau × 2) — les Pokémon sont le cœur du jeu', 'Base Pokémon DPS doubled (level × 2) — Pokémon are the core of the game') }}</li>
              <li>{{ t('Boosts clics boutique réduits (total max: 183 au lieu de 1740)', 'Shop click boosts reduced (max total: 183 instead of 1740)') }}</li>
              <li>{{ t('Récompenses boss de zone doublées (or et XP ×2)', 'Zone boss rewards doubled (gold and XP ×2)') }}</li>
              <li>{{ t('Le jeu est désormais centré sur les Pokémon (~85% DPS) avec les clics en bonus (~15%)', 'Game is now Pokémon-centric (~85% DPS) with clicks as a bonus (~15%)') }}</li>
            </ul>
          </div>

          <div>
            <h4 class="mb-2 text-sm font-semibold text-red-400">✨ {{ t('Nouveautés', 'New Features') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Clic sur un Pokémon de l\'équipe → résumé détaillé, bonbons XP, retrait d\'équipe', 'Click on a team Pokémon → detailed summary, XP candies, team removal') }}</li>
              <li>{{ t('Image ennemie non déplaçable en combat (plus de drag accidentel)', 'Enemy image no longer draggable in combat (no more accidental drag)') }}</li>
            </ul>
          </div>
        </div>
      </article>

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
              <li>{{ t('Malus régional : un Pokémon qui combat hors de sa région native inflige 90% de dégâts en moins', 'Region penalty: a Pokémon fighting outside its native region deals 90% less damage') }}</li>
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
            <h4 class="mb-2 text-sm font-semibold text-emerald-400">{{ t('Sauvegarde', 'Saves') }}</h4>
            <ul class="space-y-1 text-sm text-gray-300 list-disc list-inside pl-2">
              <li>{{ t('Compte requis pour jouer — sauvegarde cloud automatique', 'Account required to play — automatic cloud save') }}</li>
              <li>{{ t('Sauvegarde automatique toutes les 10 secondes', 'Auto-save every 10 seconds') }}</li>
              <li>{{ t('Guide, Pokédex et Classement accessibles sans compte', 'Guide, Pokédex and Leaderboard accessible without account') }}</li>
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

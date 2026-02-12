<script setup lang="ts">
import { Clock, Coins, Skull } from 'lucide-vue-next'
import { useLocale } from '~/composables/useLocale'

const props = defineProps<{
  show: boolean
  hoursAway: number
  goldEarned: number
  enemiesDefeated: number
}>()

const emit = defineEmits<{
  dismiss: []
}>()

const { t } = useLocale()

function formatDuration(hours: number): string {
  if (hours < 1) {
    const mins = Math.round(hours * 60)
    return `${mins} ${t('min', 'min')}`
  }
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h${m}`
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="emit('dismiss')"
      >
        <div class="mx-4 w-full max-w-sm animate-in zoom-in-95 rounded-2xl border border-gray-700 bg-gray-800 p-8 shadow-2xl">
          <div class="flex flex-col items-center gap-4 text-center">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20">
              <Clock class="h-8 w-8 text-indigo-400" />
            </div>

            <h3 class="text-lg font-bold text-white">
              {{ t('Pension Pokémon', 'Pokémon Daycare') }}
            </h3>

            <p class="text-sm text-gray-400">
              {{ t(
                `Pendant ton absence (${formatDuration(hoursAway)}), tes Pokémon ont combattu pour toi !`,
                `While you were away (${formatDuration(hoursAway)}), your Pokémon fought for you!`
              ) }}
            </p>

            <div class="flex w-full gap-4">
              <div class="flex flex-1 flex-col items-center gap-1 rounded-xl bg-gray-700/50 p-3">
                <Skull class="h-5 w-5 text-red-400" />
                <span class="text-lg font-bold text-white">{{ enemiesDefeated.toLocaleString() }}</span>
                <span class="text-[10px] text-gray-400">{{ t('ennemis vaincus', 'enemies defeated') }}</span>
              </div>
              <div class="flex flex-1 flex-col items-center gap-1 rounded-xl bg-gray-700/50 p-3">
                <Coins class="h-5 w-5 text-yellow-400" />
                <span class="text-lg font-bold text-yellow-400">+{{ goldEarned.toLocaleString() }}</span>
                <span class="text-[10px] text-gray-400">{{ t('or gagné', 'gold earned') }}</span>
              </div>
            </div>

            <button
              class="mt-2 w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-500 active:scale-[0.98]"
              @click="emit('dismiss')"
            >
              {{ t('Récupérer', 'Collect') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

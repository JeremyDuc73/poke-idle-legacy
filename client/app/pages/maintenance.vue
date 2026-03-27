<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLocale } from '~/composables/useLocale'
import { useApi } from '~/composables/useApi'

const { t } = useLocale()
const maintenanceMessage = ref('')

onMounted(async () => {
  try {
    const api = useApi()
    const response = await api.get<{ enabled: boolean; message: string | null }>('/api/maintenance')
    maintenanceMessage.value = response.message || t('Maintenance en cours', 'Maintenance in progress')
  } catch {
    maintenanceMessage.value = t('Maintenance en cours', 'Maintenance in progress')
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-900 p-4">
    <div class="w-full max-w-md text-center">
      <!-- Maintenance Icon -->
      <div class="mb-6 flex justify-center">
        <div class="rounded-full bg-yellow-500/20 p-6">
          <svg
            class="h-16 w-16 animate-pulse text-yellow-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
      </div>

      <!-- Title -->
      <h1 class="mb-4 text-2xl font-bold text-white">
        {{ t('Maintenance en cours', 'Maintenance in progress') }}
      </h1>

      <!-- Custom Message -->
      <p class="mb-8 text-gray-400">
        {{ maintenanceMessage }}
      </p>

      <!-- Info -->
      <div class="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
        <p class="text-sm text-gray-500">
          {{ t(
            'Nous effectuons des mises à jour. Revenez dans quelques minutes.',
            'We are performing updates. Please check back in a few minutes.'
          ) }}
        </p>
      </div>

      <!-- Refresh Button -->
      <button
        class="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-500"
        @click="window.location.reload()"
      >
        {{ t('Réessayer', 'Retry') }}
      </button>
    </div>
  </div>
</template>

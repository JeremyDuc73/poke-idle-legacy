import { useAuthStore } from '~/stores/useAuthStore'
import { useSpeciesCache } from '~/composables/useSpeciesCache'

let initialized = false

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip on server
  if (import.meta.server) return

  const auth = useAuthStore()

  // First load: check session + load species cache
  if (!initialized) {
    const { loadSpecies } = useSpeciesCache()
    await loadSpecies()
    await auth.checkAuth()
    initialized = true
  }

  // Login page is always accessible
  if (to.path === '/login') return

  // All other pages are accessible in guest mode
  // Users can play without authentication
})

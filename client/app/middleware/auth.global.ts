import { useAuthStore } from '~/stores/useAuthStore'
import { useSpeciesCache } from '~/composables/useSpeciesCache'

const PUBLIC_ROUTES = ['/login', '/pokedex', '/guide']

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

  // Allow public routes
  if (PUBLIC_ROUTES.includes(to.path)) return

  // Redirect unauthenticated users to login
  if (!auth.isAuthenticated) {
    return navigateTo('/login')
  }
})

import { useAuthStore } from '~/stores/useAuthStore'
import { useSpeciesCache } from '~/composables/useSpeciesCache'

let initialized = false

// Pages accessible without authentication
const PUBLIC_PAGES = ['/login', '/guide', '/pokedex', '/leaderboard', '/maintenance', '/players']

// Pages restricted to admin role only
const ADMIN_PAGES = ['/admin', '/debug']

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

  // Maintenance mode detected by checkAuth — redirect to /maintenance synchronously
  if (auth.maintenanceActive && to.path !== '/maintenance') {
    return navigateTo('/maintenance')
  }

  // Public pages are always accessible
  if (PUBLIC_PAGES.includes(to.path)) return

  // Gameplay pages require authentication — redirect to guide
  if (!auth.isAuthenticated) {
    return navigateTo('/guide')
  }

  // Admin-only pages — redirect non-admins to home
  if (ADMIN_PAGES.includes(to.path) && auth.user?.role !== 'admin') {
    return navigateTo('/')
  }
})

/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')
const GoogleAuthController = () => import('#controllers/google_auth_controller')
const GameController = () => import('#controllers/game_controller')
const AdminController = () => import('#controllers/admin_controller')
const LeaderboardController = () => import('#controllers/leaderboard_controller')

router.get('/', async () => {
  return { status: 'ok', name: 'Poke-Idle Legacy API' }
})

// All API routes under /api prefix
router
  .group(() => {
    router
      .group(() => {
        router.post('/register', [AuthController, 'register']).use(middleware.guest())
        router.post('/login', [AuthController, 'login']).use(middleware.guest())
        router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
        router.get('/me', [AuthController, 'me']).use(middleware.auth())
        // Google OAuth routes
        router.get('/google/redirect', [GoogleAuthController, 'redirect'])
        router.get('/google/callback', [GoogleAuthController, 'callback'])
      })
      .prefix('/auth')

    router
      .group(() => {
        router.get('/load', [GameController, 'loadState'])
        router.post('/save', [GameController, 'saveState'])
        router.post('/save-pokemons', [GameController, 'savePokemons'])
        router.post('/avatar', [GameController, 'uploadAvatar'])
        router.delete('/avatar', [GameController, 'deleteAvatar'])
      })
      .prefix('/game')
      .use(middleware.auth())

    router.get('/avatars/:filename', [GameController, 'serveAvatar'])

    router.get('/pokedex', [GameController, 'pokedex'])
    router.get('/leaderboard', [LeaderboardController, 'index'])

    router
      .group(() => {
        router.get('/dashboard', [AdminController, 'dashboard'])
        router.get('/users', [AdminController, 'listUsers'])
        router.get('/users/:id/details', [AdminController, 'getUserDetails'])
        router.put('/users/:id', [AdminController, 'updateUser'])
        router.delete('/users/:id', [AdminController, 'deleteUser'])
        router.post('/users/:id/give-items', [AdminController, 'giveItems'])
        router.post('/users/:id/reset', [AdminController, 'resetUser'])
        router.post('/users/:id/penalty', [AdminController, 'setPenalty'])
        router.delete('/users/:id/penalty', [AdminController, 'removePenalty'])
        router.delete('/users/:id/avatar', [AdminController, 'resetAvatar'])
        router.get('/users/:id/pokemons', [AdminController, 'listUserPokemons'])
      })
      .prefix('/admin')
      .use(middleware.auth())
      .use(middleware.admin())
  })
  .prefix('/api')

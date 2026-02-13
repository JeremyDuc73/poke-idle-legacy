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

router.get('/', async () => {
  return { status: 'ok', name: 'Poke-Idle Legacy API' }
})

router
  .group(() => {
    router.post('/register', [AuthController, 'register']).use(middleware.guest())
    router.post('/login', [AuthController, 'login']).use(middleware.guest())
    router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
    router.get('/me', [AuthController, 'me']).use(middleware.auth())
  })
  .prefix('/auth')

router.get('/auth/google/redirect', [GoogleAuthController, 'redirect'])
router.get('/auth/google/callback', [GoogleAuthController, 'callback'])

router
  .group(() => {
    router.get('/load', [GameController, 'loadState'])
    router.post('/save', [GameController, 'saveState'])
    router.post('/save-pokemons', [GameController, 'savePokemons'])
  })
  .prefix('/game')
  .use(middleware.auth())

router.get('/pokedex', [GameController, 'pokedex'])

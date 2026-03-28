import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { randomBytes } from 'node:crypto'
import User from '#models/user'
import { registerValidator, loginValidator } from '#validators/auth'

const MAX_USERS = 600

function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

export default class AuthController {
  async register({ request, response, auth, session }: HttpContext) {
    const totalUsers = await User.query().count('* as total')
    const count = Number(totalUsers[0].$extras.total)
    if (count >= MAX_USERS) {
      return response.forbidden({
        message: `Le serveur est limité à ${MAX_USERS} joueurs. Réessayez plus tard !`,
      })
    }

    const data = await request.validateUsing(registerValidator)
    const sessionToken = generateSessionToken()
    const user = await User.create({ ...data, role: 'user', sessionToken })
    await auth.use('web').login(user)
    // Store session token in session for single active session enforcement
    session.put('session_token', sessionToken)
    return response.created({ ...user.toJSON(), sessionToken })
  }

  async login({ request, response, auth, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(email, password)

    // Generate new session token - invalidates any other active session
    user.sessionToken = generateSessionToken()
    user.lastLoginAt = DateTime.now()
    await user.save()

    await auth.use('web').login(user)
    // Store session token in session for single active session enforcement
    session.put('session_token', user.sessionToken)
    return response.ok({ ...user.toJSON(), sessionToken: user.sessionToken })
  }

  async logout({ response, auth }: HttpContext) {
    await auth.use('web').logout()
    return response.ok({ message: 'Logged out' })
  }

  async me({ response, auth }: HttpContext) {
    const user = auth.use('web').user
    if (!user) {
      return response.unauthorized({ message: 'Not authenticated' })
    }
    return response.ok(user)
  }
}

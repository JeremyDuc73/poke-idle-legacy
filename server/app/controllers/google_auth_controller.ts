import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { DateTime } from 'luxon'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

export default class GoogleAuthController {
  /**
   * Redirect user to Google's OAuth consent screen
   */
  async redirect({ response }: HttpContext) {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL

    if (!clientId || !callbackUrl) {
      return response.internalServerError({ message: 'Google OAuth not configured' })
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
    })

    return response.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`)
  }

  /**
   * Handle Google's OAuth callback
   */
  async callback({ request, response, auth }: HttpContext) {
    const code = request.input('code')
    const error = request.input('error')

    if (error || !code) {
      return response.redirect('http://localhost:3000/login?error=google_denied')
    }

    const clientId = process.env.GOOGLE_CLIENT_ID!
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL!

    // Exchange code for tokens
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      return response.redirect('http://localhost:3000/login?error=google_token')
    }

    const tokenData = (await tokenRes.json()) as { access_token: string }
    const accessToken = tokenData.access_token

    // Get user info from Google
    const userRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!userRes.ok) {
      return response.redirect('http://localhost:3000/login?error=google_userinfo')
    }

    const googleUser = (await userRes.json()) as {
      id: string
      email: string
      name: string
    }

    // Find or create user
    let user = await User.query().where('google_id', googleUser.id).first()

    if (!user) {
      // Check if a user with same email exists (link accounts)
      user = await User.query().where('email', googleUser.email).first()
      if (user) {
        user.googleId = googleUser.id
        await user.save()
      } else {
        // Create new user with a random password (they'll use Google to login)
        const randomPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
        // Generate a unique username from Google name
        let username = googleUser.name.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 40)
        const existing = await User.query().where('username', username).first()
        if (existing) {
          username = `${username}${Date.now() % 10000}`
        }
        user = await User.create({
          username,
          email: googleUser.email,
          password: randomPassword,
          googleId: googleUser.id,
        })
      }
    }

    // Log user in
    await auth.use('web').login(user)
    user.lastLoginAt = DateTime.now()
    await user.save()

    // Redirect to the client app
    return response.redirect('http://localhost:3000/')
  }
}

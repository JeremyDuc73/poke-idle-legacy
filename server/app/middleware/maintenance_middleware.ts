import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '#models/user'

/**
 * Maintenance middleware checks if maintenance mode is enabled.
 * Only admins can access the app during maintenance.
 * Returns 503 Service Unavailable with maintenance message for non-admins.
 */
export default class MaintenanceMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    // Load the first user to check global maintenance status
    // In this implementation, we store maintenance status on the user model
    // and check any authenticated user's status
    const authUser = ctx.auth.use('web').user
    
    // If not authenticated, check global maintenance status from any user with maintenance enabled
    if (!authUser) {
      const maintenanceUser = await User.query()
        .where('maintenanceMode', true)
        .first()
      
      if (maintenanceUser) {
        return ctx.response.serviceUnavailable({
          maintenance: true,
          message: maintenanceUser.maintenanceMessage || 'Maintenance en cours',
        })
      }
      
      return next()
    }
    
    // Reload fresh user to get latest maintenance status
    const user = await User.find(authUser.id)
    if (!user) {
      return ctx.response.unauthorized({ message: 'User not found' })
    }
    
    // Check if maintenance mode is enabled
    if (user.maintenanceMode && user.role !== 'admin') {
      return ctx.response.serviceUnavailable({
        maintenance: true,
        message: user.maintenanceMessage || 'Maintenance en cours',
      })
    }
    
    return next()
  }
}

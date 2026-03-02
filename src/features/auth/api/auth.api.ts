import { config } from '@/config'
import { LoginCredentials, LoginResponse, User } from '../types'

/**
 * Auth API - aligned with framely backend
 * POST /api/auth/login returns { success, token, user }
 * Token payload: { userId, email } - same JWT as framely
 */

const API_URL = config.apiUrl.replace(/\/$/, '')

export const DEMO_CREDENTIALS = {
  email: 'demo@example.com',
  password: 'demo123',
} as const

export const authApi = {
  /**
   * Login via framely backend - same API as framely
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: credentials.email, password: credentials.password }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new Error(data.msg || 'Invalid email or password')
    }

    if (!data.success || !data.token) {
      throw new Error(data.msg || 'Login failed')
    }

    const user: User = {
      id: data.user?.id ?? '',
      email: data.user?.email ?? credentials.email,
      name: data.user?.name ?? 'User',
      role: 'user',
    }

    return {
      user,
      token: data.token,
      refreshToken: data.token, // framely uses single token
    }
  },

  /**
   * Get current user from framely backend
   */
  getMe: async (): Promise<User> => {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token')
    if (!token) throw new Error('Not authenticated')

    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new Error(data.msg || 'Session expired')
    }

    if (!data.user) throw new Error('User not found')

    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name ?? 'User',
      role: 'user',
    }
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('token')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    localStorage.removeItem('keycloak_token')
    localStorage.removeItem('access_token')
  },

  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    // Framely uses single token, no refresh - re-login required
    throw new Error('Session expired. Please log in again.')
  },
}

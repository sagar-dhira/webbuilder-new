import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/auth.api'
import type { LoginCredentials, LoginResponse } from '../types'
import { STORAGE_KEYS } from '@/shared/constants'

/**
 * Hook for user login - aligned with framely (stores token for /api/superset/charts)
 */
export function useLogin() {
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Store in both keys - framely uses "token", webbuilder uses "auth_token"
      localStorage.setItem('token', data.token)
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))

      // Redirect to page builder (home)
      window.location.href = '/'
    },
    onError: (error) => {
      console.error('Login failed:', error)
    },
  })
}


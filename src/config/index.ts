/**
 * Application configuration
 */

export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  mockApiUrl: import.meta.env.VITE_MOCK_API_URL || 'https://jsonplaceholder.typicode.com',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  appName: 'React Template',
  version: '1.0.0',
  /** Superset instance base URL - charts use this when block baseUrl is empty */
  supersetBaseUrl: import.meta.env.VITE_SUPERSET_BASE_URL || '',
} as const

/**
 * Feature flags
 */
export const featureFlags = {
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableDevTools: import.meta.env.DEV,
  enableMockApi: import.meta.env.VITE_ENABLE_MOCK_API === 'true',
} as const


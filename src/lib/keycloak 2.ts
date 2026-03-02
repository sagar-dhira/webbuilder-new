/**
 * Keycloak config - same as framely
 * When configured, ETL uses access_token (Keycloak) for api-dev.akashic.dhira.io
 */

import Keycloak from 'keycloak-js'

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || '',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'development',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || '',
}

export const keycloak = new Keycloak(keycloakConfig)

export function isKeycloakConfigured(): boolean {
  return Boolean(keycloakConfig.url && keycloakConfig.realm && keycloakConfig.clientId)
}

export const ACCESS_TOKEN_KEY = 'access_token'

export function syncKeycloakTokenToStorage(token: string | undefined) {
  if (token) {
    localStorage.setItem('access_token', token)
  } else {
    localStorage.removeItem('access_token')
  }
}

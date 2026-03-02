/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_MOCK_API_URL: string
  readonly VITE_APP_ENV: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_MOCK_API: string
  readonly VITE_KEYCLOAK_URL: string
  readonly VITE_KEYCLOAK_REALM: string
  readonly VITE_KEYCLOAK_CLIENT_ID: string
  readonly VITE_ETL_API_URL: string
  readonly VITE_ETL_TENANT_NAME: string
  readonly VITE_ETL_DEFAULT_BODY: string
  readonly VITE_ETL_API_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

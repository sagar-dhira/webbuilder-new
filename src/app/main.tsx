import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { AppProviders } from './providers'
import '@/styles/main.scss'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>Loading...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </AppProviders>
  </StrictMode>,
)


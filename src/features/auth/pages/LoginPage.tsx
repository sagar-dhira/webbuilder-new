import { LoginForm } from '../components/LoginForm'
import { DemoCredentials } from '../components/DemoCredentials'
import { useAuth } from '@/contexts/AuthContext'
import styles from './LoginPage.module.scss'

export function LoginPage() {
  const { isKeycloak } = useAuth()

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>
          {isKeycloak
            ? 'Sign in with your organization account'
            : 'Sign in with your framely account'}
        </p>
        <LoginForm />
        {!isKeycloak && <DemoCredentials />}
        <a href="/" style={{ display: 'block', marginTop: 16, color: '#94a3b8', fontSize: 14 }}>← Back to page builder</a>
      </div>
    </div>
  )
}

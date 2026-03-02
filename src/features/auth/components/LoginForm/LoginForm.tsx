import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/ui/button'
import { FormField } from '@/shared/components/FormField'
import { useAuth } from '@/contexts/AuthContext'
import { loginSchema, type LoginFormData } from '../../schemas/login.schema'
import styles from './LoginForm.module.scss'

export function LoginForm() {
  const { login, isKeycloak } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleKeycloakLogin = () => {
    login('', '')
  }

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null)
    const res = await login(data.email, data.password)
    if (!res.success) {
      setSubmitError(res.msg || 'Login failed')
      return
    }
    window.location.href = '/'
  }

  if (isKeycloak) {
    return (
      <div className={styles.loginForm}>
        <Button
          type="button"
          onClick={handleKeycloakLogin}
          className={styles.submitButton}
        >
          <ShieldCheck className="w-4 h-4 mr-2" />
          Sign in with Keycloak
        </Button>
        <p className={styles.footer}>
          You will be redirected to the secure login page.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.loginForm}>
      <FormField
        {...register('email')}
        type="email"
        label="Email"
        placeholder="Enter your email"
        error={errors.email?.message}
      />

      <FormField
        {...register('password')}
        type="password"
        label="Password"
        placeholder="Enter your password"
        error={errors.password?.message}
      />

      {submitError && (
        <div className={styles.error}>{submitError}</div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className={styles.submitButton}
      >
        {isSubmitting ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  )
}

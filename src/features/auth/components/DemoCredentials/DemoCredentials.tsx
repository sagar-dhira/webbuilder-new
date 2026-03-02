import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import styles from './DemoCredentials.module.scss'

/**
 * Login hint - uses framely backend (same auth as framely)
 */
export function DemoCredentials() {
  return (
    <Card className={styles.demoCard}>
      <CardHeader>
        <CardTitle className={styles.title}>Framely Auth</CardTitle>
        <CardDescription>
          Use your framely account. Register first if needed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>
          Same backend as framely — token works for Superset charts.
        </p>
      </CardContent>
    </Card>
  )
}


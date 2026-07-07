import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Lock, Mail, type LucideIcon } from 'lucide-react'
import { isAuthenticated, login } from '../auth/session'
import { PAGE_X_PADDING, PAGE_Y_PADDING } from '../components/PageContainer'

interface LoginFieldRowProps {
  icon: LucideIcon
  children: ReactNode
}

function LoginFieldRow({ icon: Icon, children }: LoginFieldRowProps) {
  return (
    <div className="flex items-center gap-4 px-6 py-5 transition-colors hover:bg-bg-elevated/40 sm:px-8 sm:py-6">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15">
        <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/herramienta', { replace: true })
    }
  }, [navigate])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    login()
    navigate('/herramienta', { replace: true })
  }

  const inputClassName =
    'w-full rounded-xl border border-border bg-bg-elevated px-4 py-3.5 text-base text-white placeholder:text-text-muted/50 focus:border-accent focus:outline-none transition-colors'

  return (
    <div
      className={`bg-glow flex min-h-[calc(100svh-5rem)] items-center justify-center ${PAGE_X_PADDING} ${PAGE_Y_PADDING}`}
    >
      <div className="w-full max-w-3xl">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-white">Conversor </span>
            <span className="text-accent">PDF</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">
            Herramienta de conversor de documentos para profesionales del derecho.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-14 max-w-xl sm:mt-[4.5rem] lg:mt-20"
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-bg-card transition-colors hover:border-accent/50">
            <LoginFieldRow icon={Mail}>
              <input
                id="email"
                type="text"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                className={inputClassName}
              />
            </LoginFieldRow>

            <div className="border-t border-border" />

            <LoginFieldRow icon={Lock}>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Contraseña"
                className={inputClassName}
              />
            </LoginFieldRow>

            <div className="border-t border-border" />

            <div className="flex justify-center px-6 py-5 sm:px-8 sm:py-6">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-2.5 text-sm font-semibold text-bg-dark transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Ingresar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

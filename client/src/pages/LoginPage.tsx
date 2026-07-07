import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionButton } from '../components/ActionButton'
import { isAuthenticated, login } from '../auth/session'

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

  return (
    <div className="bg-glow flex min-h-svh items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="flex flex-col items-center text-center">
          <img
            src="/logo.png"
            alt="legalHub"
            className="h-40 w-auto select-none sm:h-52"
            draggable={false}
            width={322}
            height={178}
          />

          <h1 className="mt-10 text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-white">Conversor </span>
            <span className="text-accent">PDF</span>
          </h1>

          <p className="mt-4 max-w-sm text-base leading-relaxed text-text-muted sm:text-lg">
            Herramienta de conversor de documentos para profesionales del derecho.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-5 rounded-2xl border border-border bg-bg-card p-6 sm:p-10"
        >
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-white">
              Email
            </label>
            <input
              id="email"
              type="text"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="usuario@empresa.com"
              className="w-full rounded-xl border border-border bg-bg-elevated px-5 py-4 text-base text-white placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-white">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••"
              className="w-full rounded-xl border border-border bg-bg-elevated px-5 py-4 text-base text-white placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
            />
          </div>

          <ActionButton type="submit" loading={loading}>
            Ingresar
          </ActionButton>
        </form>
      </div>
    </div>
  )
}

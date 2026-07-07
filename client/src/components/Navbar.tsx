import { Link, useLocation, useNavigate } from 'react-router-dom'
import { tools } from '../types/tools'
import { Logo } from './Logo'
import { logout } from '../auth/session'

const navLinks = [
  { label: 'Herramienta', href: '/herramienta' },
  { label: 'Historial', href: '/historial' },
  { label: 'Reportar un problema', href: '/reportar-problema' },
]

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const isHerramienta =
    location.pathname === '/herramienta' || tools.some((t) => t.path === location.pathname)
  const isHistorial = location.pathname === '/historial'
  const isReportar = location.pathname === '/reportar-problema'

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg-dark/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="flex items-center gap-6 sm:gap-8">
          {navLinks.map((link) => {
            const isActive =
              (link.label === 'Herramienta' && isHerramienta) ||
              (link.label === 'Historial' && isHistorial) ||
              (link.label === 'Reportar un problema' && isReportar)

            return (
              <Link
                key={link.label}
                to={link.href}
                className={`text-sm transition-colors hover:text-white ${
                  isActive ? 'text-white' : 'text-text-muted'
                } ${link.label === 'Reportar un problema' ? 'hidden sm:inline' : ''}`}
              >
                {link.label}
              </Link>
            )
          })}
          <Link
            to="/reportar-problema"
            className={`text-sm transition-colors hover:text-white sm:hidden ${
              isReportar ? 'text-white' : 'text-text-muted'
            }`}
          >
            Reportar
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-text-muted transition-colors hover:text-white"
          >
            Salir
          </button>
        </div>
      </nav>
    </header>
  )
}

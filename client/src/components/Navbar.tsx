import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PAGE_X_PADDING } from './PageContainer'
import { tools } from '../types/tools'
import { Logo } from './Logo'
import { logout } from '../auth/session'

const navLinks = [
  { label: 'Herramienta', href: '/herramienta' },
  { label: 'Historial', href: '/historial' },
  { label: 'Reportar un problema', href: '/reportar-problema' },
]

interface NavbarProps {
  variant?: 'default' | 'minimal'
}

export function Navbar({ variant = 'default' }: NavbarProps) {
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
    <header className="sticky top-0 z-50 overflow-visible border-b border-border bg-bg-dark/95 backdrop-blur-md">
      <nav
        className={`mx-auto flex w-full max-w-7xl items-center ${PAGE_X_PADDING} ${
          variant === 'minimal' ? 'min-h-20 py-4' : 'h-16 py-3'
        } ${variant === 'minimal' ? 'justify-start' : 'justify-between'}`}
      >
        <Logo to={variant === 'minimal' ? '/' : '/herramienta'} />

        {variant === 'minimal' ? null : (
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
        )}
      </nav>
    </header>
  )
}

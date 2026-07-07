import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  to?: string
  label?: string
}

export function BackButton({ to = '/herramienta', label = 'Volver' }: BackButtonProps) {
  return (
    <Link
      to={to}
      className="mb-6 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-white"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  )
}

import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface ActionButtonProps {
  onClick?: () => void
  type?: 'button' | 'submit'
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
}

export function ActionButton({ onClick, type = 'button', loading, disabled, children }: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-bg-dark transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}

interface StatusMessageProps {
  type: 'success' | 'error'
  message: string
}

export function StatusMessage({ type, message }: StatusMessageProps) {
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle
  const colors =
    type === 'success'
      ? 'border-green-500/30 bg-green-500/10 text-green-400'
      : 'border-red-500/30 bg-red-500/10 text-red-400'

  return (
    <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${colors}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

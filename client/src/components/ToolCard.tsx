import { Link } from 'react-router-dom'
import { FileText, Files, Scissors, ArrowRightLeft, Sparkles, Languages } from 'lucide-react'
import type { ToolId } from '../types/tools'

const iconMap: Record<ToolId, typeof FileText> = {
  'unir-pdf': Files,
  'separar-pdf': Scissors,
  'pdf-a-word': FileText,
  'word-a-pdf': ArrowRightLeft,
  'resumir-pdf': Sparkles,
  'traducir-pdf': Languages,
}

interface ToolCardProps {
  id: ToolId
  path: string
  titleWhite: string
  titleAccent: string
  description: string
}

export function ToolCard({ id, path, titleWhite, titleAccent, description }: ToolCardProps) {
  const Icon = iconMap[id]

  return (
    <Link
      to={path}
      className="group rounded-xl border border-border bg-bg-card p-6 transition-all hover:border-accent/40 hover:bg-bg-elevated"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 transition-colors group-hover:bg-accent/25">
        <Icon className="h-6 w-6 text-accent" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-white">
        {titleWhite} <span className="text-accent">{titleAccent}</span>
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-text-muted line-clamp-2">{description}</p>
      <span className="mt-4 inline-flex items-center text-sm font-medium text-accent transition-colors group-hover:text-accent-hover">
        Usar herramienta →
      </span>
    </Link>
  )
}

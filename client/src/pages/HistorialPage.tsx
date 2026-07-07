import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { BackButton } from '../components/BackButton'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { fetchHistorial, deleteProcessRecord } from '../services/processService'
import type { ProcessRecord } from '../services/processService'
import { Files, Scissors, FileText, ArrowRightLeft, Clock, Loader2, Trash2, Sparkles, Languages } from 'lucide-react'
import type { ToolId } from '../types/tools'

const toolIcons: Record<ToolId, typeof Files> = {
  'unir-pdf': Files,
  'separar-pdf': Scissors,
  'pdf-a-word': FileText,
  'word-a-pdf': ArrowRightLeft,
  'resumir-pdf': Sparkles,
  'traducir-pdf': Languages,
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

interface HistorialCardProps {
  record: ProcessRecord
  onDelete: (record: ProcessRecord) => void
  deleting: boolean
}

function HistorialCard({ record, onDelete, deleting }: HistorialCardProps) {
  const Icon = toolIcons[record.toolId]

  return (
    <div className="rounded-xl border border-border bg-bg-card p-5 transition-colors hover:border-accent/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15">
            <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-white">{record.toolName}</h3>
              {record.simulated && (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
                  Simulado
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
              <Clock className="h-3 w-3" />
              {formatDate(record.createdAt)}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!record.simulated && (
            <button
              type="button"
              onClick={() => onDelete(record)}
              disabled={deleting}
              className="rounded-lg p-2 text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
              aria-label="Eliminar proceso"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <span className="rounded-full bg-green-500/15 px-2.5 py-1 text-xs font-medium text-green-400">
            {record.status}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-text-muted">Archivos de entrada</p>
          <ul className="mt-1.5 space-y-1">
            {record.inputFiles.map((file) => (
              <li key={file} className="truncate text-sm text-white">
                {file}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium text-text-muted">Archivos generados</p>
          <ul className="mt-1.5 space-y-1">
            {record.outputFiles.map((file) => (
              <li key={file} className="truncate text-sm text-accent">
                {file}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {record.outputDir && !record.simulated && (
        <p className="mt-3 text-xs text-text-muted">
          Guardado en <span className="font-mono text-white/70">{record.outputDir}</span>
        </p>
      )}
    </div>
  )
}

export function HistorialPage() {
  const [records, setRecords] = useState<ProcessRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<ProcessRecord | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchHistorial()
      .then(setRecords)
      .catch(() => setError('No se pudo cargar el historial.'))
      .finally(() => setLoading(false))
  }, [])

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return

    setDeletingId(pendingDelete.id)
    setError(null)

    try {
      await deleteProcessRecord(pendingDelete.id)
      setRecords((prev) => prev.filter((record) => record.id !== pendingDelete.id))
      setPendingDelete(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el proceso.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-glow min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        <BackButton />
        <div className="mb-8 flex justify-center">
          <Badge />
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-white">Historial de </span>
            <span className="text-accent">procesos</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-text-muted sm:text-lg">
            Registro de conversiones y operaciones realizadas en el servidor. Los casos simulados
            muestran ejemplos de uso típico.
          </p>
        </div>

        <div className="mt-12">
          {loading && (
            <div className="flex flex-col items-center gap-3 py-16">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <p className="text-sm text-text-muted">Cargando historial...</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && records.length === 0 && (
            <div className="rounded-xl border border-border bg-bg-card px-6 py-12 text-center">
              <p className="text-text-muted">No hay procesos registrados todavía.</p>
              <Link
                to="/herramienta"
                className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-hover"
              >
                Ir a Herramienta →
              </Link>
            </div>
          )}

          {!loading && records.length > 0 && (
            <div className="space-y-4">
              {records.map((record) => (
                <HistorialCard
                  key={record.id}
                  record={record}
                  onDelete={setPendingDelete}
                  deleting={deletingId === record.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="¿Eliminar este proceso?"
        message={
          pendingDelete ? (
            <>
              Se eliminará el registro de <strong className="text-white">{pendingDelete.toolName}</strong>{' '}
              y todos sus archivos en{' '}
              <span className="font-mono text-white/80">{pendingDelete.outputDir ?? 'data/output'}</span>.
              Esta acción no se puede deshacer.
            </>
          ) : null
        }
        confirmLabel="Eliminar"
        loading={deletingId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (deletingId === null) setPendingDelete(null)
        }}
      />
    </div>
  )
}

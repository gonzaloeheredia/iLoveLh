import { useState } from 'react'
import { Badge } from '../components/Badge'
import { BackButton } from '../components/BackButton'
import { ScreenshotUpload } from '../components/ScreenshotUpload'
import { ActionButton, StatusMessage } from '../components/ActionButton'
import { submitReport } from '../services/reportService'
import { MessageSquareWarning } from 'lucide-react'

export function ReportarProblemaPage() {
  const [description, setDescription] = useState('')
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim()) {
      setStatus({ type: 'error', message: 'Por favor describí el problema antes de enviar.' })
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      await submitReport({ description: description.trim(), screenshots })
      setStatus({
        type: 'success',
        message: 'Reporte enviado correctamente. Nuestro equipo lo revisará a la brevedad.',
      })
      setDescription('')
      setScreenshots([])
    } catch {
      setStatus({ type: 'error', message: 'No se pudo enviar el reporte. Intentá de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-glow min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:py-16">
        <BackButton />
        <div className="mb-8 flex justify-center">
          <Badge />
        </div>

        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-white">Reportar un </span>
            <span className="text-accent">problema</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-text-muted sm:text-lg">
            Contanos qué falló o qué no funciona como esperabas. Podés adjuntar capturas de pantalla
            para ayudarnos a entender mejor el problema.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-12 space-y-6">
          <div className="rounded-2xl border border-border bg-bg-card p-6">
            <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-white">
              <MessageSquareWarning className="h-4 w-4 text-accent" />
              Descripción del problema
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describí el problema con el mayor detalle posible: qué herramienta usaste, qué pasos seguiste y qué resultado obtuviste..."
              rows={6}
              className="mt-3 w-full resize-none rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-white placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
            />
          </div>

          <div className="rounded-2xl border border-border bg-bg-card p-6">
            <p className="text-sm font-medium text-white">Capturas de pantalla</p>
            <p className="mt-1 text-xs text-text-muted">
              Adjuntá imágenes que muestren el error o el comportamiento inesperado.
            </p>
            <div className="mt-4">
              <ScreenshotUpload files={screenshots} onChange={setScreenshots} />
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-text-muted">
              Tu reporte será enviado al equipo técnico de Legal Hub.
            </p>
            <ActionButton type="submit" loading={loading} disabled={!description.trim()}>
              Enviar reporte
            </ActionButton>
          </div>

          {status && <StatusMessage type={status.type} message={status.message} />}
        </form>
      </div>
    </div>
  )
}

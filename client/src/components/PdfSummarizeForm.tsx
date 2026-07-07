import { useState } from 'react'
import { FileText, Loader2, Sparkles } from 'lucide-react'
import { DropZone } from './DropZone'
import { ActionButton, StatusMessage } from './ActionButton'
import { summarizePdf, ApiError } from '../services/api'
import { downloadFile } from '../utils/pdf'
import type { ToolConfig } from '../types/tools'

interface PdfSummarizeFormProps {
  config: ToolConfig
}

export function PdfSummarizeForm({ config }: PdfSummarizeFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )

  const handleFile = (files: File[]) => {
    setStatus(null)
    setFile(files[0] ?? null)
  }

  const clearFile = () => {
    setFile(null)
    setStatus(null)
  }

  const handleSummarize = async () => {
    if (!file) return

    setLoading(true)
    setStatus(null)

    try {
      const { blob, filename } = await summarizePdf(file)
      downloadFile(blob, filename)
      setStatus({
        type: 'success',
        message: '¡Resumen generado! El PDF se descargó y quedó guardado en el servidor.',
      })
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 429
          ? 'Límite de tokens alcanzado. Tu plan incluye 10.000 tokens por sesión del servidor. Consultá Estadísticas para ver el consumo o reiniciá el servidor para simular un nuevo ciclo.'
          : err instanceof Error
            ? err.message
            : 'Hubo un error al generar el resumen.'
      setStatus({ type: 'error', message })
    } finally {
      setLoading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const outputName = file
    ? file.name.replace(/\.pdf$/i, '-resumen.pdf')
    : ''

  if (!file) {
    return (
      <div className="space-y-4">
        <DropZone
          onFiles={handleFile}
          accept={config.accept}
          multiple={config.multiple}
          dropTitle={config.dropTitle}
          dropSubtitle={config.dropSubtitle}
          buttonText={config.buttonText}
        />
        {status && <StatusMessage type={status.type} message={status.message} />}
      </div>
    )
  }

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-bg-card p-6">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-elevated px-4 py-3">
        <FileText className="h-5 w-5 text-accent" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{file.name}</p>
          <p className="text-xs text-text-muted">{formatSize(file.size)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={clearFile}
            disabled={loading}
            className="text-sm text-text-muted transition-colors hover:text-red-400 disabled:opacity-50"
          >
            Eliminar
          </button>
          <label className="cursor-pointer text-sm text-text-muted transition-colors hover:text-white">
            Cambiar
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              disabled={loading}
              onChange={(event) => {
                const selected = event.target.files?.[0]
                if (selected) handleFile([selected])
                event.target.value = ''
              }}
            />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-sm text-text-muted">Extrayendo texto y generando resumen con IA...</p>
        </div>
      ) : (
        <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-4">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <p className="text-xs text-text-muted">Archivo de salida</p>
              <p className="mt-1 text-sm font-medium text-white">{outputName}</p>
              <p className="mt-2 text-xs leading-relaxed text-text-muted">
                El resumen se genera con Gemini en el mismo idioma del documento. Máximo 10 MB por archivo.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <ActionButton onClick={handleSummarize} loading={loading}>
          Generar resumen
        </ActionButton>
      </div>

      {status && <StatusMessage type={status.type} message={status.message} />}
    </div>
  )
}

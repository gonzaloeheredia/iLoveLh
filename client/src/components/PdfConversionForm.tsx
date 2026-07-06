import { useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { DropZone } from './DropZone'
import { ActionButton, StatusMessage } from './ActionButton'
import { convertDocument, type ConversionKind } from '../services/api'
import { downloadFile } from '../utils/pdf'
import type { ToolConfig } from '../types/tools'

interface PdfConversionFormProps {
  config: ToolConfig
  kind: ConversionKind
  outputExtension: string
}

export function PdfConversionForm({ config, kind, outputExtension }: PdfConversionFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )

  const handleFile = (files: File[]) => {
    setStatus(null)
    setFile(files[0] ?? null)
  }

  const handleConvert = async () => {
    if (!file) return

    setLoading(true)
    setStatus(null)

    try {
      const { blob, filename } = await convertDocument(kind, file)
      downloadFile(blob, filename)
      setStatus({
        type: 'success',
        message: `¡Conversión completada! El archivo se guardó en el servidor.`,
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Hubo un error al convertir el documento.'
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
    ? file.name.replace(/\.[^.]+$/, `.${outputExtension}`)
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
        <button
          type="button"
          onClick={() => {
            setFile(null)
            setStatus(null)
          }}
          className="text-sm text-text-muted transition-colors hover:text-white"
        >
          Cambiar
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-sm text-text-muted">Convirtiendo a {outputExtension.toUpperCase()}...</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-bg-elevated px-4 py-4">
          <p className="text-xs text-text-muted">Archivo de salida</p>
          <p className="mt-1 text-sm font-medium text-white">{outputName}</p>
        </div>
      )}

      <div className="flex justify-end">
        <ActionButton onClick={handleConvert} loading={loading}>
          Convertir a {outputExtension.toUpperCase()}
        </ActionButton>
      </div>

      {status && <StatusMessage type={status.type} message={status.message} />}
    </div>
  )
}

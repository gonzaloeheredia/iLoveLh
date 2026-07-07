import { useState } from 'react'
import { FileText } from 'lucide-react'
import { DropZone } from './DropZone'
import { ActionButton, StatusMessage } from './ActionButton'
import { splitPdf } from '../services/api'
import { downloadFile, getPdfPageCount } from '../utils/pdf'

export type SplitMode = 'all' | 'range'

export function PdfSplitForm() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [mode, setMode] = useState<SplitMode>('all')
  const [ranges, setRanges] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )

  const handleFile = async (files: File[]) => {
    const selected = files[0]
    if (!selected) return

    setStatus(null)
    setFile(selected)

    try {
      const count = await getPdfPageCount(selected)
      setPageCount(count)
    } catch {
      setStatus({ type: 'error', message: 'No se pudo leer el PDF. Verificá que el archivo sea válido.' })
      setFile(null)
      setPageCount(null)
    }
  }

  const clearFile = () => {
    setFile(null)
    setPageCount(null)
    setStatus(null)
    setRanges('')
    setMode('all')
  }

  const handleSplit = async () => {
    if (!file) return

    setLoading(true)
    setStatus(null)

    try {
      const rangesParam = mode === 'all' ? 'all' : ranges.trim()
      const { blob, filename, splitCount } = await splitPdf(file, rangesParam)
      downloadFile(blob, filename)

      setStatus({
        type: 'success',
        message: `¡Listo! Se generaron ${splitCount} archivo${splitCount !== 1 ? 's' : ''} y se guardaron en el servidor.`,
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Hubo un error al separar el PDF. Intentá de nuevo.'
      setStatus({ type: 'error', message })
    } finally {
      setLoading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (!file) {
    return (
      <div className="space-y-4">
        <DropZone
          onFiles={handleFile}
          accept={{ 'application/pdf': ['.pdf'] }}
          multiple={false}
          dropTitle="Arrastrá tu PDF acá"
          dropSubtitle="o hacé clic para seleccionar un archivo"
          buttonText="Seleccionar PDF"
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
          <p className="text-xs text-text-muted">
            {formatSize(file.size)}
            {pageCount !== null && ` · ${pageCount} página${pageCount !== 1 ? 's' : ''}`}
          </p>
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
                if (selected) void handleFile([selected])
                event.target.value = ''
              }}
            />
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium text-white">Modo de separación</p>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-bg-elevated p-4 transition-colors has-checked:border-accent/50">
          <input
            type="radio"
            name="split-mode"
            checked={mode === 'all'}
            onChange={() => setMode('all')}
            className="mt-1 accent-accent"
          />
          <div>
            <p className="text-sm font-medium text-white">Cada página por separado</p>
            <p className="mt-1 text-xs text-text-muted">
              Genera un PDF por cada página del documento.
            </p>
          </div>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-bg-elevated p-4 transition-colors has-checked:border-accent/50">
          <input
            type="radio"
            name="split-mode"
            checked={mode === 'range'}
            onChange={() => setMode('range')}
            className="mt-1 accent-accent"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Por rangos de páginas</p>
            <p className="mt-1 text-xs text-text-muted">
              Ejemplo: 1-3, 5, 7-10 (separá con comas)
            </p>
            {mode === 'range' && (
              <input
                type="text"
                value={ranges}
                onChange={(event) => setRanges(event.target.value)}
                placeholder="1-3, 5, 7-10"
                className="mt-3 w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-white placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
              />
            )}
          </div>
        </label>
      </div>

      <div className="flex justify-end">
        <ActionButton
          onClick={handleSplit}
          loading={loading}
          disabled={mode === 'range' && !ranges.trim()}
        >
          Separar PDF
        </ActionButton>
      </div>

      {status && <StatusMessage type={status.type} message={status.message} />}
    </div>
  )
}

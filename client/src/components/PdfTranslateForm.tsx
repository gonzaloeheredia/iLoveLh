import { useState } from 'react'
import { FileText, Languages, Loader2 } from 'lucide-react'
import { DropZone } from './DropZone'
import { ActionButton, StatusMessage } from './ActionButton'
import { translatePdf } from '../services/api'
import { downloadFile } from '../utils/pdf'
import type { ToolConfig } from '../types/tools'

const TARGET_LANGUAGES = [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' },
  { label: 'Português', value: 'pt' },
  { label: 'Français', value: 'fr' },
  { label: 'Deutsch', value: 'de' },
  { label: 'Italiano', value: 'it' },
] as const

interface PdfTranslateFormProps {
  config: ToolConfig
}

export function PdfTranslateForm({ config }: PdfTranslateFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [targetLanguage, setTargetLanguage] = useState('')
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
    setTargetLanguage('')
    setStatus(null)
  }

  const handleTranslate = async () => {
    if (!file || !targetLanguage) return

    setLoading(true)
    setStatus(null)

    try {
      const { blob, filename } = await translatePdf(file, targetLanguage)
      downloadFile(blob, filename)
      setStatus({
        type: 'success',
        message: '¡Traducción lista! El PDF se descargó y quedó guardado en el servidor.',
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Hubo un error al traducir el PDF.'
      setStatus({ type: 'error', message })
    } finally {
      setLoading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const outputName =
    file && targetLanguage
      ? file.name.replace(/\.pdf$/i, `_${targetLanguage.toUpperCase()}.pdf`)
      : file
        ? `${file.name.replace(/\.pdf$/i, '')}_[idioma].pdf`
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

      <div className="space-y-2">
        <label htmlFor="target-language" className="text-sm font-medium text-white">
          Idioma destino
        </label>
        <select
          id="target-language"
          value={targetLanguage}
          disabled={loading}
          onChange={(event) => {
            setStatus(null)
            setTargetLanguage(event.target.value)
          }}
          className="w-full rounded-xl border border-border bg-bg-elevated px-4 py-3 text-sm text-white outline-none transition-colors focus:border-accent disabled:opacity-50"
        >
          <option value="" disabled>
            Seleccioná un idioma
          </option>
          {TARGET_LANGUAGES.map((language) => (
            <option key={language.value} value={language.value}>
              {language.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-center text-sm text-text-muted">
            Traduciendo, esto puede tardar unos segundos...
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-4">
          <div className="flex items-start gap-3">
            <Languages className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <div>
              <p className="text-xs text-text-muted">Archivo de salida</p>
              <p className="mt-1 text-sm font-medium text-white">{outputName}</p>
              <p className="mt-2 text-xs leading-relaxed text-text-muted">
                La traducción se genera con Gemini. Documentos largos pueden demorar más. Máximo
                10 MB por archivo.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <ActionButton
          onClick={handleTranslate}
          loading={loading}
          disabled={!targetLanguage}
        >
          Traducir PDF
        </ActionButton>
      </div>

      {status && <StatusMessage type={status.type} message={status.message} />}
    </div>
  )
}

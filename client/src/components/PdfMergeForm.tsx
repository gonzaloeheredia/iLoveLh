import { useState } from 'react'
import { DropZone } from './DropZone'
import { FileList } from './FileList'
import { ActionButton, StatusMessage } from './ActionButton'
import { mergePdfs } from '../services/api'
import { downloadBlob } from '../utils/pdf'

interface FileItem {
  id: string
  file: File
}

const OUTPUT_FILENAME = 'merged.pdf'

export function PdfMergeForm() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )

  const addFiles = (newFiles: File[]) => {
    setStatus(null)
    const items = newFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
    }))
    setFiles((prev) => [...prev, ...items])
  }

  const handleMerge = async () => {
    if (files.length < 2) {
      setStatus({ type: 'error', message: 'Necesitás al menos 2 PDFs para unirlos.' })
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      const blob = await mergePdfs(files.map((item) => item.file))
      const data = new Uint8Array(await blob.arrayBuffer())
      downloadBlob(data, OUTPUT_FILENAME)
      setStatus({ type: 'success', message: '¡PDFs unidos correctamente! Guardado en el servidor.' })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Hubo un error al unir los PDFs. Intentá de nuevo.'
      setStatus({ type: 'error', message })
    } finally {
      setLoading(false)
    }
  }

  if (files.length === 0) {
    return (
      <div className="space-y-4">
        <DropZone
          onFiles={addFiles}
          accept={{ 'application/pdf': ['.pdf'] }}
          multiple
          dropTitle="Arrastrá tus PDFs acá"
          dropSubtitle="o hacé clic para seleccionar varios archivos"
          buttonText="Seleccionar PDFs"
        />
        {status && <StatusMessage type={status.type} message={status.message} />}
      </div>
    )
  }

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-bg-card p-6">
      <FileList
        files={files}
        onRemove={(id) => setFiles((prev) => prev.filter((item) => item.id !== id))}
        onReorder={(from, to) => {
          setFiles((prev) => {
            const next = [...prev]
            const [moved] = next.splice(from, 1)
            next.splice(to, 0, moved)
            return next
          })
        }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="cursor-pointer text-sm text-accent transition-colors hover:text-accent-hover">
          + Agregar más PDFs
          <input
            type="file"
            accept=".pdf,application/pdf"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files) addFiles(Array.from(event.target.files))
              event.target.value = ''
            }}
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => {
              setFiles([])
              setStatus(null)
            }}
            className="text-sm text-text-muted transition-colors hover:text-white"
          >
            Empezar de nuevo
          </button>
          <ActionButton onClick={handleMerge} loading={loading}>
            Unir PDFs
          </ActionButton>
        </div>
      </div>

      {status && <StatusMessage type={status.type} message={status.message} />}
    </div>
  )
}

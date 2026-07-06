import { useState } from 'react'
import { Badge } from '../components/Badge'
import { Hero } from '../components/Hero'
import { DropZone } from '../components/DropZone'
import { FeaturesSection } from '../components/FeatureCard'
import { FileList } from '../components/FileList'
import { ActionButton, StatusMessage } from '../components/ActionButton'
import { mergePdfs, downloadBlob } from '../utils/pdf'
import { saveProcessResult } from '../services/processService'
import type { ToolConfig } from '../types/tools'

interface FileItem {
  id: string
  file: File
}

export function UnirPdfPage({ config }: { config: ToolConfig }) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

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
      const result = await mergePdfs(files.map((f) => f.file))
      const outputName = 'documento-unido.pdf'
      downloadBlob(result, outputName)

      try {
        await saveProcessResult({
          toolId: 'unir-pdf',
          toolName: 'Unir PDF',
          inputFiles: files.map((f) => f.file.name),
          outputs: [{ name: outputName, data: result }],
        })
        setStatus({ type: 'success', message: '¡PDFs unidos correctamente! Guardado en el servidor.' })
      } catch {
        setStatus({ type: 'success', message: '¡PDFs unidos correctamente! No se pudo registrar en el historial.' })
      }
    } catch {
      setStatus({ type: 'error', message: 'Hubo un error al unir los PDFs. Intentá de nuevo.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-glow min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="mb-8 flex justify-center">
          <Badge />
        </div>

        <Hero
          titleWhite={config.titleWhite}
          titleAccent={config.titleAccent}
          description={config.description}
        />

        <div className="mt-12">
          {files.length === 0 ? (
            <DropZone
              onFiles={addFiles}
              accept={config.accept}
              multiple={config.multiple}
              dropTitle={config.dropTitle}
              dropSubtitle={config.dropSubtitle}
              buttonText={config.buttonText}
            />
          ) : (
            <div className="space-y-6 rounded-2xl border border-border bg-bg-card p-6">
              <FileList
                files={files}
                onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
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
                <button
                  type="button"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = '.pdf'
                    input.multiple = true
                    input.onchange = () => {
                      if (input.files) addFiles(Array.from(input.files))
                    }
                    input.click()
                  }}
                  className="text-sm text-accent transition-colors hover:text-accent-hover"
                >
                  + Agregar más PDFs
                </button>

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
          )}
        </div>

        <div className="mt-16">
          <FeaturesSection features={config.features} />
        </div>
      </div>
    </div>
  )
}

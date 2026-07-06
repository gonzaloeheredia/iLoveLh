import { useState } from 'react'
import { Badge } from '../components/Badge'
import { Hero } from '../components/Hero'
import { DropZone } from '../components/DropZone'
import { FeaturesSection } from '../components/FeatureCard'
import { ActionButton, StatusMessage } from '../components/ActionButton'
import type { ToolConfig } from '../types/tools'
import { FileText, Loader2 } from 'lucide-react'

interface ConversionPageProps {
  config: ToolConfig
  outputExtension: string
  processingLabel: string
}

export function ConversionPage({ config, outputExtension, processingLabel }: ConversionPageProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleFile = (files: File[]) => {
    setStatus(null)
    setFile(files[0] ?? null)
  }

  const handleConvert = async () => {
    if (!file) return

    setLoading(true)
    setStatus(null)

    // Simula conversión — requiere backend o librería pesada en el cliente
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setLoading(false)
    setStatus({
      type: 'error',
      message: `La conversión ${processingLabel} requiere conectar un servicio backend. La interfaz está lista para integrarlo.`,
    })
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const outputName = file
    ? file.name.replace(/\.[^.]+$/, `.${outputExtension}`)
    : ''

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
          {!file ? (
            <DropZone
              onFiles={handleFile}
              accept={config.accept}
              multiple={config.multiple}
              dropTitle={config.dropTitle}
              dropSubtitle={config.dropSubtitle}
              buttonText={config.buttonText}
            />
          ) : (
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
          )}
        </div>

        <div className="mt-16">
          <FeaturesSection features={config.features} />
        </div>
      </div>
    </div>
  )
}

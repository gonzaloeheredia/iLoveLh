import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImagePlus, X } from 'lucide-react'

interface ScreenshotUploadProps {
  files: File[]
  onChange: (files: File[]) => void
}

export function ScreenshotUpload({ files, onChange }: ScreenshotUploadProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      onChange([...files, ...accepted])
    },
    [files, onChange],
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] },
    multiple: true,
    noClick: true,
    noKeyboard: true,
  })

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`rounded-xl border border-dashed p-6 transition-all ${
          isDragActive
            ? 'border-accent bg-accent/5'
            : 'border-border bg-bg-elevated hover:border-accent/40'
        }`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15">
            <ImagePlus className="h-6 w-6 text-accent" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-medium text-white">
            {isDragActive ? 'Soltá las capturas aquí' : 'Arrastrá capturas de pantalla'}
          </p>
          <p className="mt-1 text-xs text-text-muted">PNG, JPG o WEBP · opcional</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              open()
            }}
            className="mt-4 rounded-full border border-border px-4 py-2 text-sm text-text-muted transition-colors hover:border-accent/40 hover:text-white"
          >
            Seleccionar imágenes
          </button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="group relative overflow-hidden rounded-xl border border-border bg-bg-elevated"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="aspect-video w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute right-2 top-2 rounded-lg bg-bg-dark/80 p-1 text-text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-white"
                aria-label="Eliminar captura"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="truncate px-2 py-1.5 text-xs text-text-muted">{file.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

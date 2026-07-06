import { useDropzone } from 'react-dropzone'
import { FilePlus2 } from 'lucide-react'

interface DropZoneProps {
  onFiles: (files: File[]) => void
  accept: Record<string, string[]>
  multiple: boolean
  dropTitle: string
  dropSubtitle: string
  buttonText: string
}

export function DropZone({
  onFiles,
  accept,
  multiple,
  dropTitle,
  dropSubtitle,
  buttonText,
}: DropZoneProps) {
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: onFiles,
    accept,
    multiple,
    noClick: true,
    noKeyboard: true,
  })

  return (
    <div
      {...getRootProps()}
      className={`relative rounded-2xl border border-dashed transition-all duration-200 ${
        isDragActive
          ? 'border-accent bg-accent/5'
          : 'border-border bg-bg-card hover:border-accent/40'
      }`}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center px-6 py-16 sm:py-20">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20">
          <FilePlus2 className="h-8 w-8 text-accent" strokeWidth={1.5} />
        </div>

        <p className="text-lg font-semibold text-white">{isDragActive ? 'Soltá los archivos aquí' : dropTitle}</p>
        <p className="mt-2 text-sm text-text-muted">{dropSubtitle}</p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            open()
          }}
          className="mt-8 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-bg-dark transition-colors hover:bg-accent-hover"
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}

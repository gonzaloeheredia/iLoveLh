import { GripVertical, X, FileText } from 'lucide-react'

interface FileItem {
  id: string
  file: File
}

interface FileListProps {
  files: FileItem[]
  onRemove: (id: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
}

export function FileList({ files, onRemove, onReorder }: FileListProps) {
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', String(index))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (!isNaN(fromIndex) && fromIndex !== toIndex) {
      onReorder(fromIndex, toIndex)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-text-muted">
        {files.length} archivo{files.length !== 1 ? 's' : ''} · arrastrá para reordenar
      </p>
      <ul className="space-y-2">
        {files.map((item, index) => (
          <li
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className="flex items-center gap-3 rounded-xl border border-border bg-bg-elevated px-4 py-3 transition-colors hover:border-accent/30"
          >
            <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-text-muted active:cursor-grabbing" />
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-xs font-semibold text-accent">
              {index + 1}
            </span>
            <FileText className="h-4 w-4 shrink-0 text-accent" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{item.file.name}</p>
              <p className="text-xs text-text-muted">{formatSize(item.file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="shrink-0 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Eliminar archivo"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

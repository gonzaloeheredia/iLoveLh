import path from 'node:path'
import { randomUUID } from 'node:crypto'

const KNOWN_EXTENSIONS = ['.pdf', '.docx', '.doc'] as const

const MIME_TO_EXTENSION: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
}

function isKnownExtension(ext: string): ext is (typeof KNOWN_EXTENSIONS)[number] {
  return (KNOWN_EXTENSIONS as readonly string[]).includes(ext)
}

function normalizeExtension(ext: string): string {
  return ext.startsWith('.') ? ext.slice(1).toLowerCase() : ext.toLowerCase()
}

/** Resolve the real source format from upload metadata (mime preferred, then filename). */
export function detectSourceExtension(originalName: string, mimeType?: string): string {
  if (mimeType && MIME_TO_EXTENSION[mimeType]) {
    return MIME_TO_EXTENSION[mimeType]
  }

  const ext = path.extname(originalName).toLowerCase()
  if (isKnownExtension(ext)) {
    return ext.slice(1)
  }

  throw new Error(`No se pudo detectar la extensión de origen para "${originalName}".`)
}

/** Remove stacked document extensions from the end of a filename (e.g. file.docx.pdf → file). */
export function stripKnownExtensions(filename: string): string {
  let base = path.basename(filename)
  let ext = path.extname(base).toLowerCase()

  while (isKnownExtension(ext)) {
    base = base.slice(0, -ext.length)
    ext = path.extname(base).toLowerCase()
  }

  const sanitized = base.replace(/[^\w.-]/g, '_')
  return sanitized || 'document'
}

/** Build the user-facing download name with a single target extension. */
export function buildDownloadFilename(originalName: string, targetExtension: string): string {
  const base = stripKnownExtensions(originalName)
  const ext = targetExtension.startsWith('.') ? targetExtension : `.${targetExtension}`
  return `${base}${ext}`
}

/** Internal basename for LibreOffice staging (decoupled from the uploaded filename). */
export function buildInternalStagingBasename(workDir: string): string {
  const folder = path.basename(workDir)
  const match = folder.match(/^convert-(.+)$/)
  return match?.[1] ?? randomUUID()
}

export function buildInternalStagingPath(workDir: string, sourceExtension: string): string {
  const ext = normalizeExtension(sourceExtension)
  const basename = buildInternalStagingBasename(workDir)
  return path.join(workDir, `${basename}.${ext}`)
}

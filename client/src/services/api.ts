const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

function apiUrl(path: string): string {
  return `${API_URL}${path}`
}

export async function mergePdfs(files: File[]): Promise<Blob> {
  const formData = new FormData()
  for (const file of files) {
    formData.append('files', file)
  }

  const response = await fetch(apiUrl('/api/merge'), {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? 'Hubo un error al unir los PDFs.')
  }

  return response.blob()
}

export interface SplitPdfResult {
  blob: Blob
  filename: string
  splitCount: number
}

export async function splitPdf(file: File, ranges: string): Promise<SplitPdfResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('ranges', ranges)

  const response = await fetch(apiUrl('/api/split'), {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? 'Hubo un error al separar el PDF.')
  }

  const disposition = response.headers.get('Content-Disposition')
  const filename =
    disposition?.match(/filename="([^"]+)"/)?.[1] ?? 'split.zip'
  const splitCount = Number(response.headers.get('X-Split-Count') ?? 0)

  return {
    blob: await response.blob(),
    filename,
    splitCount,
  }
}

export type ConversionKind = 'pdf-to-word' | 'word-to-pdf'

export interface ConversionResult {
  blob: Blob
  filename: string
}

async function convertFile(
  endpoint: string,
  file: File,
  fallbackFilename: string,
  errorMessage: string,
  extraFields?: Record<string, string>,
): Promise<ConversionResult> {
  const formData = new FormData()
  formData.append('file', file)
  if (extraFields) {
    for (const [key, value] of Object.entries(extraFields)) {
      formData.append(key, value)
    }
  }

  const response = await fetch(apiUrl(endpoint), {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? errorMessage)
  }

  const disposition = response.headers.get('Content-Disposition')
  const filename =
    disposition?.match(/filename="([^"]+)"/)?.[1] ?? fallbackFilename

  return {
    blob: await response.blob(),
    filename,
  }
}

export function pdfToWord(file: File): Promise<ConversionResult> {
  const fallback = file.name.replace(/\.pdf$/i, '.docx')
  return convertFile(
    '/api/pdf-to-word',
    file,
    fallback,
    'Hubo un error al convertir el PDF a Word.',
  )
}

export function wordToPdf(file: File): Promise<ConversionResult> {
  const fallback = file.name.replace(/\.docx$/i, '.pdf')
  return convertFile(
    '/api/word-to-pdf',
    file,
    fallback,
    'Hubo un error al convertir el Word a PDF.',
  )
}

export async function summarizePdf(file: File): Promise<ConversionResult> {
  const fallback = file.name.replace(/\.pdf$/i, '-resumen.pdf')
  return convertFile(
    '/api/summarize',
    file,
    fallback,
    'Hubo un error al generar el resumen del PDF.',
  )
}

export async function translatePdf(
  file: File,
  targetLanguage: string,
): Promise<ConversionResult> {
  const languageSuffix = targetLanguage.split('-')[0].toUpperCase()
  const fallback = file.name.replace(/\.pdf$/i, `_${languageSuffix}.pdf`)
  return convertFile(
    '/api/translate',
    file,
    fallback,
    'Hubo un error al traducir el PDF.',
    { targetLanguage },
  )
}

export async function convertDocument(
  kind: ConversionKind,
  file: File,
): Promise<ConversionResult> {
  return kind === 'pdf-to-word' ? pdfToWord(file) : wordToPdf(file)
}

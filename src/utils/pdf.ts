import { PDFDocument } from 'pdf-lib'

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create()

  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const pdf = await PDFDocument.load(bytes)
    const pages = await merged.copyPages(pdf, pdf.getPageIndices())
    pages.forEach((page) => merged.addPage(page))
  }

  return merged.save()
}

export async function getPdfPageCount(file: File): Promise<number> {
  const bytes = await file.arrayBuffer()
  const pdf = await PDFDocument.load(bytes)
  return pdf.getPageCount()
}

export type SplitMode = 'all' | 'range'

export interface SplitOptions {
  mode: SplitMode
  ranges?: string
}

function parseRanges(input: string, maxPage: number): number[][] {
  const groups: number[][] = []
  const parts = input.split(',').map((p) => p.trim()).filter(Boolean)

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-')
      const start = Math.max(1, parseInt(startStr, 10))
      const end = Math.min(maxPage, parseInt(endStr, 10))
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        const pages: number[] = []
        for (let i = start; i <= end; i++) pages.push(i - 1)
        groups.push(pages)
      }
    } else {
      const page = parseInt(part, 10)
      if (!isNaN(page) && page >= 1 && page <= maxPage) {
        groups.push([page - 1])
      }
    }
  }

  return groups
}

export async function splitPdf(
  file: File,
  options: SplitOptions,
): Promise<{ name: string; data: Uint8Array }[]> {
  const bytes = await file.arrayBuffer()
  const source = await PDFDocument.load(bytes)
  const pageCount = source.getPageCount()
  const baseName = file.name.replace(/\.pdf$/i, '')

  const pageGroups =
    options.mode === 'all'
      ? Array.from({ length: pageCount }, (_, i) => [i])
      : parseRanges(options.ranges ?? '', pageCount)

  if (pageGroups.length === 0) {
    throw new Error('No se pudieron interpretar los rangos de páginas.')
  }

  const results: { name: string; data: Uint8Array }[] = []

  for (let i = 0; i < pageGroups.length; i++) {
    const newPdf = await PDFDocument.create()
    const pages = await newPdf.copyPages(source, pageGroups[i])
    pages.forEach((page) => newPdf.addPage(page))
    const data = await newPdf.save()

    const suffix =
      options.mode === 'all'
        ? `_pagina_${pageGroups[i][0] + 1}`
        : pageGroups.length > 1
          ? `_parte_${i + 1}`
          : ''

    results.push({ name: `${baseName}${suffix}.pdf`, data })
  }

  return results
}

export function downloadBlob(data: Uint8Array, filename: string) {
  const copy = new Uint8Array(data)
  const blob = new Blob([copy], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadMultiple(files: { name: string; data: Uint8Array }[]) {
  files.forEach((file, i) => {
    setTimeout(() => downloadBlob(file.data, file.name), i * 300)
  })
}

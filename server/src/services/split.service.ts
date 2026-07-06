import fs from 'node:fs'
import path from 'node:path'
import { PassThrough } from 'node:stream'
import { finished } from 'node:stream/promises'
import { randomUUID } from 'node:crypto'
import { ZipArchive } from 'archiver'
import { PDFDocument } from 'pdf-lib'
import { env } from '../config/env.js'
import { AppError } from '../middleware/error.middleware.js'
import { registerProcess } from './process.service.js'

export interface SplitInput {
  filePath: string
  originalName: string
  ranges: string
}

export interface SplitFile {
  name: string
  buffer: Buffer
}

export interface SplitResult {
  zipBuffer: Buffer
  zipFilename: string
  files: SplitFile[]
  outputDir: string
}

function parseRanges(input: string, maxPage: number): number[][] {
  const groups: number[][] = []
  const parts = input.split(',').map((part) => part.trim()).filter(Boolean)

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-')
      const start = Math.max(1, parseInt(startStr, 10))
      const end = Math.min(maxPage, parseInt(endStr, 10))
      if (!Number.isNaN(start) && !Number.isNaN(end) && start <= end) {
        const pages: number[] = []
        for (let i = start; i <= end; i++) pages.push(i - 1)
        groups.push(pages)
      }
    } else {
      const page = parseInt(part, 10)
      if (!Number.isNaN(page) && page >= 1 && page <= maxPage) {
        groups.push([page - 1])
      }
    }
  }

  return groups
}

function resolvePageGroups(ranges: string, pageCount: number): number[][] {
  const normalized = ranges.trim().toLowerCase()

  if (normalized === 'all') {
    return Array.from({ length: pageCount }, (_, index) => [index])
  }

  const groups = parseRanges(ranges, pageCount)
  if (groups.length === 0) {
    throw new AppError(400, 'No se pudieron interpretar los rangos de páginas.')
  }

  return groups
}

async function createZipBuffer(files: SplitFile[]): Promise<Buffer> {
  const passThrough = new PassThrough()
  const archive = new ZipArchive({ zlib: { level: 9 } })
  archive.pipe(passThrough)

  const chunks: Buffer[] = []
  passThrough.on('data', (chunk: Buffer) => chunks.push(chunk))

  for (const file of files) {
    archive.append(file.buffer, { name: file.name })
  }

  const done = finished(passThrough)
  await archive.finalize()
  await done

  return Buffer.concat(chunks)
}

export async function splitPdfFile(input: SplitInput): Promise<SplitResult> {
  const bytes = fs.readFileSync(input.filePath)

  let source: PDFDocument
  try {
    source = await PDFDocument.load(bytes)
  } catch {
    throw new AppError(400, `El archivo "${input.originalName}" no es un PDF válido.`)
  }

  const pageCount = source.getPageCount()
  const baseName = path.basename(input.originalName, path.extname(input.originalName))
  const pageGroups = resolvePageGroups(input.ranges, pageCount)

  const files: SplitFile[] = []

  for (let i = 0; i < pageGroups.length; i++) {
    const newPdf = await PDFDocument.create()
    const pages = await newPdf.copyPages(source, pageGroups[i])
    pages.forEach((page) => newPdf.addPage(page))
    const pdfBytes = await newPdf.save()

    const suffix =
      input.ranges.trim().toLowerCase() === 'all'
        ? `_pagina_${pageGroups[i][0] + 1}`
        : pageGroups.length > 1
          ? `_parte_${i + 1}`
          : ''

    files.push({
      name: `${baseName}${suffix}.pdf`,
      buffer: Buffer.from(pdfBytes),
    })
  }

  const zipBuffer = await createZipBuffer(files)
  const zipFilename = `${baseName}-split.zip`

  const id = randomUUID()
  const outputDirPath = path.join(env.dataDir, 'output', id)
  fs.mkdirSync(outputDirPath, { recursive: true })

  for (const file of files) {
    fs.writeFileSync(path.join(outputDirPath, file.name), file.buffer)
  }
  fs.writeFileSync(path.join(outputDirPath, zipFilename), zipBuffer)

  const outputDir = `data/output/${id}`

  registerProcess({
    id,
    toolId: 'separar-pdf',
    toolName: 'Separar PDF',
    inputFiles: [input.originalName],
    outputFiles: [...files.map((file) => file.name), zipFilename],
    outputDir,
    createdAt: new Date().toISOString(),
    status: 'completado',
  })

  return {
    zipBuffer,
    zipFilename,
    files,
    outputDir,
  }
}

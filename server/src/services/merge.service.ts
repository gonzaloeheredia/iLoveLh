import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { PDFDocument } from 'pdf-lib'
import { env } from '../config/env.js'
import { AppError } from '../middleware/error.middleware.js'
import { registerProcess } from './process.service.js'

const OUTPUT_FILENAME = 'documento-unido.pdf'

export interface MergeInputFile {
  path: string
  originalName: string
}

export interface MergeResult {
  buffer: Buffer
  savedPath: string
  filename: string
  outputDir: string
}

export async function mergePdfFiles(files: MergeInputFile[]): Promise<MergeResult> {
  const merged = await PDFDocument.create()

  for (const file of files) {
    const bytes = fs.readFileSync(file.path)

    let pdf: PDFDocument
    try {
      pdf = await PDFDocument.load(bytes)
    } catch {
      throw new AppError(400, `El archivo "${file.originalName}" no es un PDF válido.`)
    }

    const pages = await merged.copyPages(pdf, pdf.getPageIndices())
    pages.forEach((page) => merged.addPage(page))
  }

  const pdfBytes = await merged.save()
  const buffer = Buffer.from(pdfBytes)

  const id = randomUUID()
  const outputDirPath = path.join(env.dataDir, 'output', id)
  fs.mkdirSync(outputDirPath, { recursive: true })

  const savedPath = path.join(outputDirPath, OUTPUT_FILENAME)
  fs.writeFileSync(savedPath, buffer)

  const outputDir = `data/output/${id}`

  registerProcess({
    id,
    toolId: 'unir-pdf',
    toolName: 'Unir PDF',
    inputFiles: files.map((file) => file.originalName),
    outputFiles: [OUTPUT_FILENAME],
    outputDir,
    createdAt: new Date().toISOString(),
    status: 'completado',
  })

  return {
    buffer,
    savedPath,
    filename: OUTPUT_FILENAME,
    outputDir,
  }
}

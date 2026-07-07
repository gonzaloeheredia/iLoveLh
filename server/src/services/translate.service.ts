import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { env } from '../config/env.js'
import { registerProcess } from './process.service.js'
import { extractPageTextsFromPdf } from './pdf-text.service.js'
import { translatePagesWithGemini } from './gemini.service.js'
import { buildTranslatedPdf } from './summary-pdf.service.js'
import { buildDownloadFilename } from '../utils/filename.util.js'

export interface TranslateInput {
  inputPath: string
  originalName: string
  targetLanguage: string
}

export interface TranslateResult {
  buffer: Buffer
  filename: string
  outputDir: string
}

export function buildTranslatedFilename(originalName: string, targetLanguage: string): string {
  const baseName = buildDownloadFilename(originalName, 'pdf').replace(/\.pdf$/i, '')
  const languageSuffix = targetLanguage.split('-')[0].toUpperCase()
  return `${baseName}_${languageSuffix}.pdf`
}

export async function translatePdf(input: TranslateInput): Promise<TranslateResult> {
  const pageTexts = await extractPageTextsFromPdf(input.inputPath)
  const translatedText = await translatePagesWithGemini(pageTexts, input.targetLanguage)
  const pdfBytes = await buildTranslatedPdf(
    translatedText,
    input.originalName,
    input.targetLanguage,
  )

  const filename = buildTranslatedFilename(input.originalName, input.targetLanguage)
  const id = randomUUID()
  const outputDirPath = path.join(env.dataDir, 'output', id)
  fs.mkdirSync(outputDirPath, { recursive: true })

  const savedPath = path.join(outputDirPath, filename)
  fs.writeFileSync(savedPath, Buffer.from(pdfBytes))

  const outputDir = `data/output/${id}`

  registerProcess({
    id,
    toolId: 'traducir-pdf',
    toolName: 'Traducir PDF',
    inputFiles: [input.originalName],
    outputFiles: [filename],
    outputDir,
    createdAt: new Date().toISOString(),
    status: 'completado',
  })

  return {
    buffer: Buffer.from(pdfBytes),
    filename,
    outputDir,
  }
}

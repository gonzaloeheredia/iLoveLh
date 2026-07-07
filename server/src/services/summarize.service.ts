import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { env } from '../config/env.js'
import { registerProcess } from './process.service.js'
import { assertTokenBudgetAvailable, recordSuccess } from './stats.service.js'
import { extractTextFromPdf } from './pdf-text.service.js'
import { summarizeTextWithGemini } from './gemini.service.js'
import { buildSummaryPdf } from './summary-pdf.service.js'
import { buildDownloadFilename } from '../utils/filename.util.js'

export interface SummarizeInput {
  inputPath: string
  originalName: string
}

export interface SummarizeResult {
  buffer: Buffer
  filename: string
  outputDir: string
}

export async function summarizePdf(input: SummarizeInput): Promise<SummarizeResult> {
  assertTokenBudgetAvailable()

  const extractedText = await extractTextFromPdf(input.inputPath)
  const { text: summaryText, tokensUsed } = await summarizeTextWithGemini(extractedText)
  const pdfBytes = await buildSummaryPdf(summaryText, input.originalName)

  const baseName = buildDownloadFilename(input.originalName, 'pdf').replace(/\.pdf$/i, '')
  const filename = `${baseName}-resumen.pdf`
  const id = randomUUID()
  const outputDirPath = path.join(env.dataDir, 'output', id)
  fs.mkdirSync(outputDirPath, { recursive: true })

  const savedPath = path.join(outputDirPath, filename)
  fs.writeFileSync(savedPath, Buffer.from(pdfBytes))

  const outputDir = `data/output/${id}`

  registerProcess({
    id,
    toolId: 'resumir-pdf',
    toolName: 'Resumir PDF',
    inputFiles: [input.originalName],
    outputFiles: [filename],
    outputDir,
    createdAt: new Date().toISOString(),
    status: 'completado',
  })

  recordSuccess('resumir-pdf', tokensUsed)

  return {
    buffer: Buffer.from(pdfBytes),
    filename,
    outputDir,
  }
}

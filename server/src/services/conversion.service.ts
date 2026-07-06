import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { env } from '../config/env.js'
import { registerProcess } from './process.service.js'
import { convertWithLibreOffice } from './libreoffice.service.js'

export interface ConversionInput {
  inputPath: string
  originalName: string
  workDir: string
}

export interface ConversionResult {
  buffer: Buffer
  filename: string
  outputDir: string
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w.-]/g, '_')
}

async function runConversion(
  input: ConversionInput,
  targetFormat: string,
  expectedExtension: string,
  toolId: 'pdf-a-word' | 'word-a-pdf',
  toolName: string,
): Promise<ConversionResult> {
  const stagedInputPath = path.join(
    input.workDir,
    sanitizeFilename(path.basename(input.originalName)),
  )
  fs.copyFileSync(input.inputPath, stagedInputPath)

  const outputPath = await convertWithLibreOffice(
    stagedInputPath,
    input.workDir,
    targetFormat,
    expectedExtension,
  )

  const buffer = fs.readFileSync(outputPath)
  const filename = path.basename(input.originalName, path.extname(input.originalName)) +
    `.${expectedExtension}`

  const id = randomUUID()
  const outputDirPath = path.join(env.dataDir, 'output', id)
  fs.mkdirSync(outputDirPath, { recursive: true })

  const savedPath = path.join(outputDirPath, filename)
  fs.writeFileSync(savedPath, buffer)

  const outputDir = `data/output/${id}`

  registerProcess({
    id,
    toolId,
    toolName,
    inputFiles: [input.originalName],
    outputFiles: [filename],
    outputDir,
    createdAt: new Date().toISOString(),
    status: 'completado',
  })

  return { buffer, filename, outputDir }
}

export function createConversionWorkDir(): string {
  const workDir = path.join(env.uploadDir, `convert-${randomUUID()}`)
  fs.mkdirSync(workDir, { recursive: true })
  return workDir
}

export async function convertPdfToWord(input: ConversionInput): Promise<ConversionResult> {
  return runConversion(input, 'docx', 'docx', 'pdf-a-word', 'PDF a Word')
}

export async function convertWordToPdf(input: ConversionInput): Promise<ConversionResult> {
  return runConversion(input, 'pdf', 'pdf', 'word-a-pdf', 'Word a PDF')
}

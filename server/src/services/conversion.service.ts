import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { env } from '../config/env.js'
import { registerProcess } from './process.service.js'
import { convertWithLibreOffice } from './libreoffice.service.js'
import { convertPdfToDocx } from './pdf2docx.service.js'
import { AppError } from '../middleware/error.middleware.js'
import {
  buildDownloadFilename,
  buildInternalStagingBasename,
  buildInternalStagingPath,
  detectSourceExtension,
} from '../utils/filename.util.js'

export interface ConversionInput {
  inputPath: string
  originalName: string
  sourceMimeType: string
  workDir: string
}

export interface ConversionResult {
  buffer: Buffer
  filename: string
  outputDir: string
}

function persistConversionResult(
  input: ConversionInput,
  outputPath: string,
  expectedExtension: string,
  toolId: 'pdf-a-word' | 'word-a-pdf',
  toolName: string,
): ConversionResult {
  const buffer = fs.readFileSync(outputPath)
  const filename = buildDownloadFilename(input.originalName, expectedExtension)

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

function stageInputFile(input: ConversionInput): {
  detectedSourceExtension: string
  stagedInputPath: string
  internalBasename: string
} {
  const detectedSourceExtension = detectSourceExtension(input.originalName, input.sourceMimeType)
  const stagedInputPath = buildInternalStagingPath(input.workDir, detectedSourceExtension)
  const internalBasename = buildInternalStagingBasename(input.workDir)

  fs.copyFileSync(input.inputPath, stagedInputPath)

  return { detectedSourceExtension, stagedInputPath, internalBasename }
}

export function createConversionWorkDir(): string {
  const workDir = path.join(env.uploadDir, `convert-${randomUUID()}`)
  fs.mkdirSync(workDir, { recursive: true })
  return workDir
}

export async function convertPdfToWord(input: ConversionInput): Promise<ConversionResult> {
  const { detectedSourceExtension, stagedInputPath, internalBasename } = stageInputFile(input)
  const expectedExtension = 'docx'
  const outputPath = path.join(input.workDir, `${internalBasename}.${expectedExtension}`)

  console.log(
    `[Conversion] PDF a Word | origin ext=${detectedSourceExtension} | staged input ext=${detectedSourceExtension} | target ext=${expectedExtension}`,
  )
  console.log(`[Conversion] staged input path=${stagedInputPath}`)
  console.log(`[Conversion] output path=${outputPath}`)

  await convertPdfToDocx(stagedInputPath, outputPath)

  if (!fs.existsSync(outputPath)) {
    throw new AppError(500, 'pdf2docx no generó el archivo DOCX esperado.')
  }

  return persistConversionResult(input, outputPath, expectedExtension, 'pdf-a-word', 'PDF a Word')
}

export async function convertWordToPdf(input: ConversionInput): Promise<ConversionResult> {
  const { detectedSourceExtension, stagedInputPath } = stageInputFile(input)
  const targetFormat = 'pdf'
  const expectedExtension = 'pdf'

  console.log(
    `[Conversion] Word a PDF | origin ext=${detectedSourceExtension} | staged input ext=${detectedSourceExtension} | target ext=${expectedExtension}`,
  )
  console.log(`[Conversion] staged input path=${stagedInputPath}`)

  const outputPath = await convertWithLibreOffice(
    stagedInputPath,
    input.workDir,
    targetFormat,
    expectedExtension,
  )

  return persistConversionResult(input, outputPath, expectedExtension, 'word-a-pdf', 'Word a PDF')
}

import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../middleware/error.middleware.js'
import { pdfUpload } from '../middleware/pdf-upload.middleware.js'
import { docxUpload } from '../middleware/docx-upload.middleware.js'
import {
  convertPdfToWord,
  convertWordToPdf,
  createConversionWorkDir,
} from '../services/conversion.service.js'
import { cleanupPaths } from '../services/libreoffice.service.js'

export const pdfToWordUploadMiddleware = pdfUpload.single('file')
export const wordToPdfUploadMiddleware = docxUpload.single('file')

async function handleConversion(
  req: Request,
  res: Response,
  next: NextFunction,
  convert: typeof convertPdfToWord,
  contentType: string,
): Promise<void> {
  const cleanupTargets: string[] = []
  let workDir: string | null = null

  try {
    if (!req.file) {
      throw new AppError(400, 'No se recibió ningún archivo.')
    }

    cleanupTargets.push(req.file.path)
    workDir = createConversionWorkDir()
    cleanupTargets.push(workDir)

    const result = await convert({
      inputPath: req.file.path,
      originalName: req.file.originalname,
      workDir,
    })

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`)
    res.setHeader('X-Output-Dir', result.outputDir)
    res.send(result.buffer)
  } catch (err) {
    next(err)
  } finally {
    cleanupPaths(cleanupTargets)
  }
}

export async function pdfToWord(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  await handleConversion(
    req,
    res,
    next,
    convertPdfToWord,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )
}

export async function wordToPdf(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  await handleConversion(
    req,
    res,
    next,
    convertWordToPdf,
    'application/pdf',
  )
}

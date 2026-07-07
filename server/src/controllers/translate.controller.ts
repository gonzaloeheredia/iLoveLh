import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../middleware/error.middleware.js'
import { cleanupTempFiles } from '../middleware/pdf-upload.middleware.js'
import { geminiPdfUpload } from '../middleware/summarize-upload.middleware.js'
import { assertValidTargetLanguage } from '../services/gemini.service.js'
import { translatePdf } from '../services/translate.service.js'

export const translateUploadMiddleware = geminiPdfUpload.single('file')

export async function translate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const tempPaths = req.file ? [req.file.path] : []

  try {
    if (!req.file) {
      throw new AppError(400, 'No se recibió ningún archivo PDF.')
    }

    const rawTargetLanguage = req.body?.targetLanguage
    if (typeof rawTargetLanguage !== 'string' || !rawTargetLanguage.trim()) {
      throw new AppError(400, 'Falta el parámetro targetLanguage (por ejemplo: "en", "pt", "fr").')
    }

    const targetLanguage = assertValidTargetLanguage(rawTargetLanguage)

    const result = await translatePdf({
      inputPath: req.file.path,
      originalName: req.file.originalname,
      targetLanguage,
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`)
    res.setHeader('X-Output-Dir', result.outputDir)
    res.send(result.buffer)
  } catch (err) {
    next(err)
  } finally {
    cleanupTempFiles(tempPaths)
  }
}

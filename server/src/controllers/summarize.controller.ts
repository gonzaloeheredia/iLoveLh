import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../middleware/error.middleware.js'
import { cleanupTempFiles } from '../middleware/pdf-upload.middleware.js'
import { summarizeUpload } from '../middleware/summarize-upload.middleware.js'
import { summarizePdf } from '../services/summarize.service.js'

export const summarizeUploadMiddleware = summarizeUpload.single('file')

export async function summarize(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const tempPaths = req.file ? [req.file.path] : []

  try {
    if (!req.file) {
      throw new AppError(400, 'No se recibió ningún archivo PDF.')
    }

    const result = await summarizePdf({
      inputPath: req.file.path,
      originalName: req.file.originalname,
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

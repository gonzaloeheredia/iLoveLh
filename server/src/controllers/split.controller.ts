import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../middleware/error.middleware.js'
import { cleanupTempFiles, pdfUpload } from '../middleware/pdf-upload.middleware.js'
import { splitPdfFile } from '../services/split.service.js'

export const splitUploadMiddleware = pdfUpload.single('file')

export async function splitPdf(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const tempPaths: string[] = []

  try {
    if (!req.file) {
      throw new AppError(400, 'No se recibió ningún archivo PDF.')
    }

    tempPaths.push(req.file.path)

    const ranges = typeof req.body.ranges === 'string' ? req.body.ranges.trim() : ''
    if (!ranges) {
      throw new AppError(400, 'El parámetro "ranges" es obligatorio (ej: 1-3,5,7-9).')
    }

    const result = await splitPdfFile({
      filePath: req.file.path,
      originalName: req.file.originalname,
      ranges,
    })

    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="${result.zipFilename}"`)
    res.setHeader('X-Output-Dir', result.outputDir)
    res.setHeader('X-Split-Count', String(result.files.length))
    res.send(result.zipBuffer)
  } catch (err) {
    next(err)
  } finally {
    cleanupTempFiles(tempPaths)
  }
}

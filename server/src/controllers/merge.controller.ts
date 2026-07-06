import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../middleware/error.middleware.js'
import { cleanupTempFiles, pdfUpload } from '../middleware/pdf-upload.middleware.js'
import { mergePdfFiles } from '../services/merge.service.js'

export const mergeUploadMiddleware = pdfUpload.array('files', 50)

export async function mergePdfs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const files = req.files as Express.Multer.File[] | undefined
  const tempPaths = files?.map((file) => file.path) ?? []

  try {
    if (!files || files.length < 2) {
      throw new AppError(400, 'Se requieren al menos 2 archivos PDF.')
    }

    const result = await mergePdfFiles(
      files.map((file) => ({ path: file.path, originalName: file.originalname })),
    )

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

import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import { env } from '../config/env.js'
import { AppError } from './error.middleware.js'

const PDF_MIME = 'application/pdf'
const PDF_EXT = '.pdf'

fs.mkdirSync(env.uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, env.uploadDir)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const base = path.basename(file.originalname, ext).replace(/[^\w.-]/g, '_')
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${base}-${unique}${ext}`)
  },
})

function isPdfFile(file: Express.Multer.File): boolean {
  const ext = path.extname(file.originalname).toLowerCase()
  return ext === PDF_EXT && file.mimetype === PDF_MIME
}

export const pdfUpload = multer({
  storage,
  limits: { fileSize: env.maxFileSize },
  fileFilter: (_req, file, cb) => {
    if (!isPdfFile(file)) {
      cb(new AppError(400, 'Todos los archivos deben ser PDF.'))
      return
    }
    cb(null, true)
  },
})

export function cleanupTempFiles(filePaths: string[]): void {
  for (const filePath of filePaths) {
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    } catch {
      // ignore cleanup errors
    }
  }
}

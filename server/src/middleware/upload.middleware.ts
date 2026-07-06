import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import { env } from '../config/env.js'
import { AppError } from './error.middleware.js'

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx'])

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

function isAllowedFile(file: Express.Multer.File): boolean {
  const ext = path.extname(file.originalname).toLowerCase()
  return ALLOWED_EXTENSIONS.has(ext) && ALLOWED_MIME_TYPES.has(file.mimetype)
}

export const upload = multer({
  storage,
  limits: { fileSize: env.maxFileSize },
  fileFilter: (_req, file, cb) => {
    if (!isAllowedFile(file)) {
      cb(new AppError(400, 'Solo se permiten archivos PDF y DOCX.'))
      return
    }
    cb(null, true)
  },
})

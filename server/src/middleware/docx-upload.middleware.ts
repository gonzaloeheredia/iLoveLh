import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import { env } from '../config/env.js'
import { AppError } from './error.middleware.js'

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const DOCX_EXT = '.docx'

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

function isDocxFile(file: Express.Multer.File): boolean {
  const ext = path.extname(file.originalname).toLowerCase()
  return ext === DOCX_EXT && file.mimetype === DOCX_MIME
}

export const docxUpload = multer({
  storage,
  limits: { fileSize: env.maxFileSize },
  fileFilter: (_req, file, cb) => {
    if (!isDocxFile(file)) {
      cb(new AppError(400, 'Solo se permiten archivos DOCX.'))
      return
    }
    cb(null, true)
  },
})

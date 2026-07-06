import { Router } from 'express'
import {
  pdfToWord,
  pdfToWordUploadMiddleware,
  wordToPdf,
  wordToPdfUploadMiddleware,
} from '../controllers/conversion.controller.js'

export const conversionRouter = Router()

conversionRouter.post('/pdf-to-word', pdfToWordUploadMiddleware, pdfToWord)
conversionRouter.post('/word-to-pdf', wordToPdfUploadMiddleware, wordToPdf)

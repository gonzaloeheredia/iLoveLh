import type { Request, Response } from 'express'
import { isLibreOfficeAvailable, getLibreOfficePath } from '../services/libreoffice.service.js'
import { isPdf2DocxAvailable, getPythonPath } from '../services/pdf2docx.service.js'
import { getGeminiModel, isGeminiAvailable } from '../services/gemini.service.js'

export function getHealth(_req: Request, res: Response): void {
  const libreOfficeAvailable = isLibreOfficeAvailable()
  const pdfToDocxAvailable = isPdf2DocxAvailable()
  const geminiAvailable = isGeminiAvailable()

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      libreOffice: {
        available: libreOfficeAvailable,
        path: getLibreOfficePath(),
        usedFor: ['word-to-pdf'],
      },
      pdfToDocx: {
        available: pdfToDocxAvailable,
        pythonPath: getPythonPath(),
        usedFor: ['pdf-to-word'],
      },
      gemini: {
        available: geminiAvailable,
        model: getGeminiModel(),
        usedFor: ['summarize', 'translate'],
      },
    },
  })
}

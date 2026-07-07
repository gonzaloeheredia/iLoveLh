import fs from 'node:fs'
import { PDFParse } from 'pdf-parse'
import { AppError } from '../middleware/error.middleware.js'

const MIN_TEXT_LENGTH = 100

const SCANNED_PDF_ERROR =
  'No se pudo extraer texto suficiente del PDF. ' +
  'Es probable que sea un documento escaneado (solo imágenes) o que no contenga texto seleccionable. ' +
  'Esta herramienta requiere un PDF con texto digital.'

function normalizeExtractedText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function normalizePageText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function assertExtractableTextLength(text: string): void {
  if (normalizeExtractedText(text).length < MIN_TEXT_LENGTH) {
    throw new AppError(400, SCANNED_PDF_ERROR)
  }
}

export async function extractTextFromPdf(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath)
  const parser = new PDFParse({ data: buffer })

  try {
    const result = await parser.getText()
    const text = normalizeExtractedText(result.text)
    assertExtractableTextLength(text)
    return text
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError(400, 'No se pudo leer el contenido del PDF.')
  } finally {
    await parser.destroy()
  }
}

export async function extractPageTextsFromPdf(filePath: string): Promise<string[]> {
  const buffer = fs.readFileSync(filePath)
  const parser = new PDFParse({ data: buffer })

  try {
    const result = await parser.getText({ lineEnforce: true, pageJoiner: '' })
    const pages = result.pages
      .map((page) => normalizePageText(page.text))
      .filter(Boolean)

    assertExtractableTextLength(pages.join('\n\n'))
    return pages
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AppError(400, 'No se pudo leer el contenido del PDF.')
  } finally {
    await parser.destroy()
  }
}

import fs from 'node:fs'
import path from 'node:path'
import fontkit from '@pdf-lib/fontkit'
import { PDFDocument, type PDFFont } from 'pdf-lib'
import { env } from '../config/env.js'

const FONTS_DIR = path.join(env.serverRoot, 'assets', 'fonts')

export interface EmbeddedPdfFonts {
  regular: PDFFont
  bold: PDFFont
}

function readFontFile(filename: string): Buffer {
  const fontPath = path.join(FONTS_DIR, filename)
  if (!fs.existsSync(fontPath)) {
    throw new Error(`No se encontró la fuente ${filename} en ${FONTS_DIR}`)
  }
  return fs.readFileSync(fontPath)
}

export async function createPdfDocumentWithFonts(): Promise<{
  pdf: PDFDocument
  fonts: EmbeddedPdfFonts
}> {
  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fontkit)

  const regular = await pdf.embedFont(readFontFile('NotoSans-Regular.ttf'))
  const bold = await pdf.embedFont(readFontFile('NotoSans-Bold.ttf'))

  return {
    pdf,
    fonts: { regular, bold },
  }
}

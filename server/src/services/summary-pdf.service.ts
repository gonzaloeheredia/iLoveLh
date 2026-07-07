import { PDFDocument, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { createPdfDocumentWithFonts } from '../utils/pdf-fonts.util.js'
import { sanitizePdfText } from '../utils/pdf-text-sanitize.util.js'

const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842
const MARGIN = 50
const FOOTER_SIZE = 9
const BULLET_INDENT = 14

const COLORS = {
  title: rgb(0.08, 0.05, 0.14),
  heading: rgb(0.42, 0.35, 0.65),
  body: rgb(0.18, 0.18, 0.2),
  muted: rgb(0.45, 0.45, 0.48),
  line: rgb(0.82, 0.8, 0.86),
} as const

const SIZES = {
  title: 20,
  subtitle: 10,
  heading: 13,
  body: 11,
  bullet: 11,
} as const

const SPACING = {
  afterTitle: 28,
  afterSubtitle: 18,
  beforeHeading: 18,
  afterHeading: 8,
  paragraph: 14,
  bullet: 14,
  sectionGap: 10,
} as const

type SummaryBlock =
  | { type: 'heading'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'spacer' }

export function parseSummaryBlocks(text: string): SummaryBlock[] {
  const blocks: SummaryBlock[] = []

  for (const line of text.split('\n')) {
    const trimmed = line.trim()

    if (!trimmed) {
      if (blocks.length > 0 && blocks.at(-1)?.type !== 'spacer') {
        blocks.push({ type: 'spacer' })
      }
      continue
    }

    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'heading', text: stripInlineMarkdown(trimmed.slice(3)) })
      continue
    }

    if (/^[-*•]\s+/.test(trimmed)) {
      blocks.push({ type: 'bullet', text: stripInlineMarkdown(trimmed.replace(/^[-*•]\s+/, '')) })
      continue
    }

    blocks.push({ type: 'paragraph', text: stripInlineMarkdown(trimmed) })
  }

  return blocks
}

function stripInlineMarkdown(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').trim()
}

export function parseStructuredDocumentBlocks(text: string): SummaryBlock[] {
  const blocks: SummaryBlock[] = []
  const sections = text.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean)

  for (const section of sections) {
    const lines = section.split('\n').map((line) => line.trim()).filter(Boolean)

    if (lines.length === 0) continue

    if (lines.length === 1) {
      pushDocumentLine(blocks, lines[0])
      blocks.push({ type: 'spacer' })
      continue
    }

    if (lines[0].startsWith('## ')) {
      blocks.push({ type: 'heading', text: stripInlineMarkdown(lines[0].slice(3)) })
      for (const line of lines.slice(1)) {
        pushDocumentLine(blocks, line)
      }
      blocks.push({ type: 'spacer' })
      continue
    }

    if (lines.every((line) => /^[-*•]\s+/.test(line))) {
      for (const line of lines) {
        pushDocumentLine(blocks, line)
      }
      blocks.push({ type: 'spacer' })
      continue
    }

    blocks.push({
      type: 'paragraph',
      text: stripInlineMarkdown(lines.join(' ')),
    })
    blocks.push({ type: 'spacer' })
  }

  if (blocks.at(-1)?.type === 'spacer') {
    blocks.pop()
  }

  return blocks
}

function pushDocumentLine(blocks: SummaryBlock[], line: string): void {
  if (line.startsWith('## ')) {
    blocks.push({ type: 'heading', text: stripInlineMarkdown(line.slice(3)) })
    return
  }

  if (/^[-*•]\s+/.test(line)) {
    blocks.push({
      type: 'bullet',
      text: stripInlineMarkdown(line.replace(/^[-*•]\s+/, '')),
    })
    return
  }

  blocks.push({ type: 'paragraph', text: stripInlineMarkdown(line) })
}

export function parseParagraphBlocks(text: string): SummaryBlock[] {
  const blocks: SummaryBlock[] = []
  const paragraphs = text.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean)

  for (const paragraph of paragraphs) {
    blocks.push({
      type: 'paragraph',
      text: paragraph.replace(/\n+/g, ' ').trim(),
    })
    blocks.push({ type: 'spacer' })
  }

  if (blocks.at(-1)?.type === 'spacer') {
    blocks.pop()
  }

  return blocks
}

function wrapText(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
  const safeText = sanitizePdfText(text)
  const words = safeText.split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const width = font.widthOfTextAtSize(testLine, fontSize)

    if (width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }

  if (currentLine) lines.push(currentLine)
  return lines
}

function drawFooter(page: PDFPage, font: PDFFont, footerText: string): void {
  page.drawText(sanitizePdfText(footerText), {
    x: MARGIN,
    y: MARGIN - 4,
    size: FOOTER_SIZE,
    font,
    color: COLORS.muted,
  })
}

function ensureSpace(
  pdf: PDFDocument,
  pageRef: { page: PDFPage },
  yRef: { y: number },
  needed: number,
  font: PDFFont,
  footerText: string,
): void {
  if (yRef.y - needed >= MARGIN + 24) return

  drawFooter(pageRef.page, font, footerText)
  pageRef.page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  yRef.y = PAGE_HEIGHT - MARGIN
}

function drawWrappedLines(
  pdf: PDFDocument,
  pageRef: { page: PDFPage },
  yRef: { y: number },
  lines: string[],
  options: {
    font: PDFFont
    fontSize: number
    color: ReturnType<typeof rgb>
    x?: number
    lineHeight?: number
    footerText: string
  },
): void {
  const x = options.x ?? MARGIN
  const lineHeight = options.lineHeight ?? options.fontSize + 4

  for (const line of lines) {
    ensureSpace(pdf, pageRef, yRef, lineHeight, options.font, options.footerText)

    pageRef.page.drawText(line, {
      x,
      y: yRef.y - options.fontSize,
      size: options.fontSize,
      font: options.font,
      color: options.color,
    })

    yRef.y -= lineHeight
  }
}

export async function buildFormattedTextPdf(options: {
  title: string
  subtitle?: string
  body: string
  format: 'markdown' | 'paragraphs' | 'structured'
}): Promise<Uint8Array> {
  const { pdf, fonts } = await createPdfDocumentWithFonts()
  const font = fonts.regular
  const fontBold = fonts.bold
  const maxWidth = PAGE_WIDTH - MARGIN * 2
  const bulletMaxWidth = maxWidth - BULLET_INDENT
  const footerDate = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())
  const footerText = `Generado el ${footerDate} · legalHub`

  const pageRef = { page: pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]) }
  let y = PAGE_HEIGHT - MARGIN
  const yRef = { y }

  pageRef.page.drawText(sanitizePdfText(options.title), {
    x: MARGIN,
    y: y - SIZES.title,
    size: SIZES.title,
    font: fontBold,
    color: COLORS.title,
  })
  y -= SIZES.title + 8
  yRef.y = y

  if (options.subtitle) {
    const subtitleLines = wrapText(options.subtitle, maxWidth, font, SIZES.subtitle)
    drawWrappedLines(pdf, pageRef, yRef, subtitleLines, {
      font,
      fontSize: SIZES.subtitle,
      color: COLORS.muted,
      lineHeight: SIZES.subtitle + 4,
      footerText,
    })
    yRef.y -= 6
  }

  pageRef.page.drawLine({
    start: { x: MARGIN, y: yRef.y },
    end: { x: PAGE_WIDTH - MARGIN, y: yRef.y },
    thickness: 1,
    color: COLORS.line,
  })
  yRef.y -= SPACING.afterTitle

  const blocks =
    options.format === 'markdown'
      ? parseSummaryBlocks(options.body)
      : options.format === 'structured'
        ? parseStructuredDocumentBlocks(options.body)
        : parseParagraphBlocks(options.body)

  for (const block of blocks) {
    switch (block.type) {
      case 'spacer':
        yRef.y -= SPACING.sectionGap
        break

      case 'heading':
        yRef.y -= SPACING.beforeHeading
        drawWrappedLines(
          pdf,
          pageRef,
          yRef,
          wrapText(block.text, maxWidth, fontBold, SIZES.heading),
          {
            font: fontBold,
            fontSize: SIZES.heading,
            color: COLORS.heading,
            lineHeight: SIZES.heading + 5,
            footerText,
          },
        )
        yRef.y -= SPACING.afterHeading
        break

      case 'bullet':
        ensureSpace(pdf, pageRef, yRef, SPACING.bullet, font, footerText)
        pageRef.page.drawText('-', {
          x: MARGIN,
          y: yRef.y - SIZES.bullet,
          size: SIZES.bullet,
          font,
          color: COLORS.heading,
        })
        drawWrappedLines(
          pdf,
          pageRef,
          yRef,
          wrapText(block.text, bulletMaxWidth, font, SIZES.bullet),
          {
            font,
            fontSize: SIZES.bullet,
            color: COLORS.body,
            x: MARGIN + BULLET_INDENT,
            lineHeight: SPACING.bullet,
            footerText,
          },
        )
        break

      case 'paragraph':
        drawWrappedLines(
          pdf,
          pageRef,
          yRef,
          wrapText(block.text, maxWidth, font, SIZES.body),
          {
            font,
            fontSize: SIZES.body,
            color: COLORS.body,
            lineHeight: SPACING.paragraph,
            footerText,
          },
        )
        yRef.y -= 4
        break
    }
  }

  drawFooter(pageRef.page, font, footerText)

  return pdf.save()
}

export async function buildSummaryPdf(summaryText: string, documentName?: string): Promise<Uint8Array> {
  return buildFormattedTextPdf({
    title: 'Resumen del documento',
    subtitle: documentName ? `Documento: ${documentName}` : undefined,
    body: summaryText,
    format: 'markdown',
  })
}

export async function buildTranslatedPdf(
  translatedText: string,
  documentName: string,
  targetLanguage: string,
): Promise<Uint8Array> {
  const languageLabel = getLanguageDisplayName(targetLanguage)

  return buildFormattedTextPdf({
    title: 'Documento traducido',
    subtitle: `Origen: ${documentName} · Idioma: ${languageLabel}`,
    body: translatedText,
    format: 'structured',
  })
}

function getLanguageDisplayName(code: string): string {
  const baseCode = code.split('-')[0]
  try {
    const displayNames = new Intl.DisplayNames(['es'], { type: 'language' })
    const label = displayNames.of(baseCode)
    if (!label) return code.toUpperCase()
    return `${label.charAt(0).toUpperCase()}${label.slice(1)} (${code.toUpperCase()})`
  } catch {
    return code.toUpperCase()
  }
}

import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '../config/env.js'
import { AppError } from '../middleware/error.middleware.js'

let geminiAvailable = false

export async function verifyGeminiOnStartup(): Promise<void> {
  if (!env.geminiApiKey) {
    geminiAvailable = false
    console.warn(
      '⚠️  GEMINI_API_KEY no está configurada. ' +
        'Los endpoints /api/summarize y /api/translate no estarán disponibles. ' +
        'Agregá la clave en server/.env.',
    )
    return
  }

  geminiAvailable = true
  console.log(`Gemini detectado: modelo ${env.geminiModel}`)
}

export function isGeminiAvailable(): boolean {
  return geminiAvailable
}

export function getGeminiModel(): string {
  return env.geminiModel
}

function assertGeminiAvailable(): void {
  if (!geminiAvailable || !env.geminiApiKey) {
    throw new AppError(
      503,
      'Las funciones con IA no están disponibles. Configurá GEMINI_API_KEY en el servidor.',
    )
  }
}

function buildPrompt(text: string, truncated: boolean): string {
  const truncationNote = truncated
    ? '\n\nNota: el documento fue truncado por longitud; resumí solo el fragmento provisto.'
    : ''

  return `Sos un asistente legal. Resumí el siguiente documento para que cualquier persona pueda entenderlo rápido.

Formato obligatorio (markdown):
## Resumen general
1 o 2 párrafos cortos con la idea principal del documento.

## Puntos clave
- Lista con los hechos, decisiones u obligaciones más importantes (máximo 6 ítems).
- Cada ítem en una oración clara y directa.

## Partes involucradas
- Personas, empresas o roles mencionados y su relación con el documento.
(Omití esta sección si no hay partes identificables.)

## Fechas y plazos
- Fechas, vencimientos o plazos relevantes, con contexto breve.
(Omití esta sección si no hay fechas.)

## Qué conviene tener en cuenta
- 1 a 3 observaciones prácticas o riesgos que surjan del texto, sin alarmismo.
(Omití esta sección si no aplica.)

Reglas:
- Escribí en el mismo idioma del documento original.
- Usá lenguaje claro y profesional, evitá jerga innecesaria.
- No inventes información que no esté en el texto.
- No agregues introducciones ni cierres fuera de las secciones indicadas.${truncationNote}

Documento:
"""
${text}
"""`.trim()
}

export async function summarizeTextWithGemini(text: string): Promise<string> {
  assertGeminiAvailable()

  const maxChars = env.summarizeMaxTextChars
  const truncated = text.length > maxChars
  const inputText = truncated ? text.slice(0, maxChars) : text

  const genAI = new GoogleGenerativeAI(env.geminiApiKey!)
  const model = genAI.getGenerativeModel({ model: env.geminiModel })

  try {
    const result = await model.generateContent(buildPrompt(inputText, truncated))
    const summary = result.response.text().trim()

    if (!summary) {
      throw new AppError(500, 'Gemini no devolvió un resumen.')
    }

    return summary
  } catch (error) {
    if (error instanceof AppError) throw error
    const message = error instanceof Error ? error.message : 'Error desconocido'
    throw new AppError(502, `No se pudo generar el resumen con Gemini: ${message}`)
  }
}

const LANGUAGE_CODE_PATTERN = /^[a-z]{2}(-[a-z]{2})?$/i

export function normalizeTargetLanguage(code: string): string {
  return code.trim().toLowerCase()
}

export function assertValidTargetLanguage(code: string): string {
  const normalized = normalizeTargetLanguage(code)

  if (!LANGUAGE_CODE_PATTERN.test(normalized)) {
    throw new AppError(
      400,
      'targetLanguage inválido. Usá un código ISO como "en", "pt" o "fr".',
    )
  }

  return normalized
}

function getLanguageLabel(code: string): string {
  const baseCode = code.split('-')[0]
  try {
    const displayNames = new Intl.DisplayNames(['es'], { type: 'language' })
    return displayNames.of(baseCode) ?? code
  } catch {
    return code
  }
}

function buildTranslationPrompt(text: string, targetLanguage: string): string {
  const languageLabel = getLanguageLabel(targetLanguage)

  return `Traducí el siguiente texto al idioma ${languageLabel} (código ISO: ${targetLanguage}).

Formato de salida (markdown):
- Preservá y reflejá la estructura del documento original.
- Usá ## para títulos o secciones cuando el original las tenga o se distingan claramente.
- Usá viñetas con - para listas, pasos o enumeraciones.
- Separá párrafos con una línea en blanco.
- Escribí párrafos claros y legibles; evitá bloques densos de texto.

Reglas:
- Traducí todo el contenido de forma fiel y natural.
- No agregues introducciones, notas ni comentarios fuera de la traducción.
- No omitas ni resumas partes del texto.
- Mantené nombres propios, cifras y referencias legales cuando corresponda.

Texto:
"""
${text}
"""`.trim()
}

async function generateGeminiText(prompt: string, errorContext: string): Promise<string> {
  assertGeminiAvailable()

  const genAI = new GoogleGenerativeAI(env.geminiApiKey!)
  const model = genAI.getGenerativeModel({ model: env.geminiModel })

  try {
    const result = await model.generateContent(prompt)
    const output = result.response.text().trim()

    if (!output) {
      throw new AppError(500, `Gemini no devolvió ${errorContext}.`)
    }

    return output
  } catch (error) {
    if (error instanceof AppError) throw error
    const message = error instanceof Error ? error.message : 'Error desconocido'
    throw new AppError(502, `No se pudo traducir con Gemini: ${message}`)
  }
}

export async function translateTextWithGemini(
  text: string,
  targetLanguage: string,
): Promise<string> {
  return generateGeminiText(buildTranslationPrompt(text, targetLanguage), 'una traducción')
}

function splitOversizedText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text]

  const paragraphs = text.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean)
  const chunks: string[] = []
  let current = ''

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph

    if (candidate.length <= maxChars) {
      current = candidate
      continue
    }

    if (current) chunks.push(current)

    if (paragraph.length <= maxChars) {
      current = paragraph
      continue
    }

    let remaining = paragraph
    while (remaining.length > maxChars) {
      let splitAt = remaining.lastIndexOf(' ', maxChars)
      if (splitAt <= 0) splitAt = maxChars
      chunks.push(remaining.slice(0, splitAt).trim())
      remaining = remaining.slice(splitAt).trim()
    }
    current = remaining
  }

  if (current) chunks.push(current)
  return chunks
}

function buildPageBatches(pages: string[], maxChars: number): string[] {
  const batches: string[] = []
  let currentBatch = ''

  for (const pageText of pages) {
    const pageChunks = splitOversizedText(pageText, maxChars)

    for (const chunk of pageChunks) {
      const candidate = currentBatch ? `${currentBatch}\n\n${chunk}` : chunk

      if (candidate.length > maxChars && currentBatch) {
        batches.push(currentBatch)
        currentBatch = chunk
      } else {
        currentBatch = candidate
      }
    }
  }

  if (currentBatch) batches.push(currentBatch)
  return batches
}

export async function translatePagesWithGemini(
  pages: string[],
  targetLanguage: string,
): Promise<string> {
  const batchCharLimit = Math.floor(env.summarizeMaxTextChars * 0.85)
  const fullText = pages.join('\n\n')

  if (fullText.length <= batchCharLimit) {
    return translateTextWithGemini(fullText, targetLanguage)
  }

  const batches = buildPageBatches(pages, batchCharLimit)
  const translatedParts: string[] = []

  for (const batch of batches) {
    translatedParts.push(await translateTextWithGemini(batch, targetLanguage))
  }

  return translatedParts.join('\n\n')
}

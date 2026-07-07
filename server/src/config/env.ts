import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const serverRoot = path.resolve(__dirname, '../..')

dotenv.config({ path: path.join(serverRoot, '.env') })

function parseMaxFileSize(value: string | undefined): number {
  const parsed = Number(value ?? '52428800')
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 52_428_800
  }
  return parsed
}

const uploadDirRaw = process.env.UPLOAD_DIR ?? 'uploads'
const clientOriginsRaw = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'
const libreOfficePathRaw = process.env.LIBREOFFICE_PATH?.trim().replace(/^["']|["']$/g, '')
const pythonPathRaw = process.env.PYTHON_PATH?.trim().replace(/^["']|["']$/g, '')
const geminiApiKeyRaw = process.env.GEMINI_API_KEY?.trim()
const geminiModelRaw = process.env.GEMINI_MODEL?.trim()

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value ?? fallback)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }
  return parsed
}

function parseTimeoutMs(value: string | undefined): number {
  const parsed = Number(value ?? '60000')
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 60_000
  }
  return parsed
}

export const env = {
  port: Number(process.env.PORT ?? 3001),
  serverRoot,
  dataDir: path.join(serverRoot, 'data'),
  uploadDir: path.isAbsolute(uploadDirRaw)
    ? uploadDirRaw
    : path.join(serverRoot, uploadDirRaw),
  maxFileSize: parseMaxFileSize(process.env.MAX_FILE_SIZE),
  clientOrigins: clientOriginsRaw.split(',').map((origin) => origin.trim()),
  libreOfficePath: libreOfficePathRaw?.trim() || undefined,
  pythonPath: pythonPathRaw?.trim() || undefined,
  geminiApiKey: geminiApiKeyRaw || undefined,
  geminiModel: geminiModelRaw || 'gemini-2.5-flash-lite',
  summarizeMaxFileSize: parsePositiveInt(process.env.SUMMARIZE_MAX_FILE_SIZE, 10 * 1024 * 1024),
  summarizeMaxTextChars: parsePositiveInt(process.env.SUMMARIZE_MAX_TEXT_CHARS, 80_000),
  conversionTimeoutMs: parseTimeoutMs(process.env.CONVERSION_TIMEOUT_MS),
} as const

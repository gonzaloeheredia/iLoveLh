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

export const env = {
  port: Number(process.env.PORT ?? 3001),
  serverRoot,
  dataDir: path.join(serverRoot, 'data'),
  uploadDir: path.isAbsolute(uploadDirRaw)
    ? uploadDirRaw
    : path.join(serverRoot, uploadDirRaw),
  maxFileSize: parseMaxFileSize(process.env.MAX_FILE_SIZE),
  clientOrigins: clientOriginsRaw.split(',').map((origin) => origin.trim()),
} as const

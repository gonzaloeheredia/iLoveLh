import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { env } from '../config/env.js'
import { AppError } from '../middleware/error.middleware.js'

const PDF_TO_DOCX_SCRIPT = path.join(env.serverRoot, 'scripts', 'pdf_to_docx.py')

let pythonPath: string | null = null
let pdf2DocxAvailable = false

const PYTHON_CANDIDATES =
  process.platform === 'win32'
    ? ['python', 'python3', 'py']
    : ['python3', 'python']

const STARTUP_CHECK_TIMEOUT_MS = 15_000

function getPythonCandidates(): string[] {
  const candidates: string[] = []
  if (env.pythonPath) {
    candidates.push(env.pythonPath)
  }
  candidates.push(...PYTHON_CANDIDATES)
  return [...new Set(candidates)]
}

function formatCommandForLog(binaryPath: string, args: string[]): string {
  const quote = (value: string) => (/\s/.test(value) ? `"${value}"` : value)
  return [quote(binaryPath), ...args.map(quote)].join(' ')
}

function runPythonCheck(
  binaryPath: string,
  args: string[],
): Promise<{ ok: boolean; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const proc = spawn(binaryPath, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString()
    })

    proc.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })

    const timer = setTimeout(() => {
      proc.kill('SIGKILL')
      resolve({ ok: false, stdout, stderr: stderr || 'Timeout al verificar Python.' })
    }, STARTUP_CHECK_TIMEOUT_MS)

    proc.on('error', (error) => {
      clearTimeout(timer)
      resolve({ ok: false, stdout, stderr: error.message })
    })

    proc.on('close', (code) => {
      clearTimeout(timer)
      resolve({ ok: code === 0, stdout, stderr })
    })
  })
}

async function canImportPdf2Docx(binaryPath: string): Promise<boolean> {
  const result = await runPythonCheck(binaryPath, [
    '-c',
    'import pdf2docx; from importlib.metadata import version; print(version("pdf2docx"))',
  ])
  return result.ok
}

export async function verifyPdf2DocxOnStartup(): Promise<void> {
  if (!fs.existsSync(PDF_TO_DOCX_SCRIPT)) {
    pdf2DocxAvailable = false
    console.warn(
      `⚠️  No se encontró el script de conversión: ${PDF_TO_DOCX_SCRIPT}. ` +
        'El endpoint /api/pdf-to-word no estará disponible.',
    )
    return
  }

  for (const candidate of getPythonCandidates()) {
    const versionCheck = await runPythonCheck(candidate, [
      '-c',
      'import sys; print(".".join(map(str, sys.version_info[:3])))',
    ])

    if (!versionCheck.ok) continue

    const hasPdf2Docx = await canImportPdf2Docx(candidate)
    if (!hasPdf2Docx) {
      console.warn(
        `⚠️  Python detectado (${candidate}, v${versionCheck.stdout.trim()}) pero pdf2docx no está instalado. ` +
          'El endpoint /api/pdf-to-word no estará disponible. ' +
          'Instalá dependencias con: pip install -r server/scripts/requirements.txt',
      )
      pythonPath = candidate
      pdf2DocxAvailable = false
      return
    }

    pythonPath = candidate
    pdf2DocxAvailable = true
    console.log(
      `pdf2docx detectado: Python ${versionCheck.stdout.trim()} (${candidate}), script ${PDF_TO_DOCX_SCRIPT}`,
    )
    return
  }

  pdf2DocxAvailable = false
  console.warn(
    '⚠️  Python 3 no está instalado o no se encontró en PATH. ' +
      'El endpoint /api/pdf-to-word no estará disponible. ' +
      'Instalá Python 3 desde https://www.python.org/ (marcá "Add to PATH" en Windows) ' +
      'y luego ejecutá: pip install -r server/scripts/requirements.txt',
  )
}

export function isPdf2DocxAvailable(): boolean {
  return pdf2DocxAvailable
}

export function getPythonPath(): string | null {
  return pythonPath
}

function assertPdf2DocxAvailable(): void {
  if (!pdf2DocxAvailable || !pythonPath) {
    throw new AppError(
      503,
      'La conversión PDF a Word no está disponible en el servidor. ' +
        'Contactá al administrador para instalar Python 3 y pdf2docx.',
    )
  }
}

export function convertPdfToDocx(inputPath: string, outputPath: string): Promise<void> {
  assertPdf2DocxAvailable()

  return new Promise((resolve, reject) => {
    const args = [PDF_TO_DOCX_SCRIPT, inputPath, outputPath]
    console.log(`[pdf2docx] ${formatCommandForLog(pythonPath!, args)}`)

    const proc = spawn(pythonPath!, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    })

    let stderr = ''
    proc.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })

    const timer = setTimeout(() => {
      proc.kill('SIGKILL')
      reject(new AppError(504, 'La conversión PDF a Word superó el tiempo límite.'))
    }, env.conversionTimeoutMs)

    proc.on('error', (error) => {
      clearTimeout(timer)
      reject(new AppError(500, `No se pudo ejecutar Python: ${error.message}`))
    })

    proc.on('close', (code) => {
      clearTimeout(timer)
      if (code === 0) {
        resolve()
        return
      }

      reject(
        new AppError(
          500,
          stderr.trim() || `pdf2docx finalizó con código ${code ?? 'desconocido'}.`,
        ),
      )
    })
  })
}

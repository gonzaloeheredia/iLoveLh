import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { env } from '../config/env.js'
import { AppError } from '../middleware/error.middleware.js'

let libreOfficePath: string | null = null
let libreOfficeAvailable = false

const WINDOWS_CANDIDATES = [
  'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
  'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
]

const UNIX_CANDIDATES = [
  '/usr/bin/soffice',
  '/usr/bin/libreoffice',
  '/Applications/LibreOffice.app/Contents/MacOS/soffice',
]

function getCandidatePaths(): string[] {
  const platformPaths = process.platform === 'win32' ? WINDOWS_CANDIDATES : UNIX_CANDIDATES
  const candidates: string[] = []

  if (env.libreOfficePath) {
    candidates.push(env.libreOfficePath)
  }

  candidates.push(...platformPaths, 'soffice', 'libreoffice')

  return [...new Set(candidates)]
}

function canRunBinary(binaryPath: string): boolean {
  if (binaryPath.includes(path.sep) || binaryPath.includes('/')) {
    return fs.existsSync(binaryPath)
  }
  return true
}

const STARTUP_CHECK_TIMEOUT_MS = 30_000

function runVersionCheck(binaryPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn(binaryPath, ['--version'], {
      stdio: ['ignore', 'ignore', 'ignore'],
      windowsHide: true,
    })

    const timer = setTimeout(() => {
      proc.kill('SIGKILL')
      resolve(false)
    }, STARTUP_CHECK_TIMEOUT_MS)

    proc.on('error', () => {
      clearTimeout(timer)
      resolve(false)
    })

    proc.on('close', (code) => {
      clearTimeout(timer)
      resolve(code === 0)
    })
  })
}

function isAbsoluteBinaryPath(binaryPath: string): boolean {
  return path.isAbsolute(binaryPath) || binaryPath.includes(path.sep) || binaryPath.includes('/')
}

export async function verifyLibreOfficeOnStartup(): Promise<void> {
  for (const candidate of getCandidatePaths()) {
    if (isAbsoluteBinaryPath(candidate)) {
      if (fs.existsSync(candidate)) {
        libreOfficePath = candidate
        libreOfficeAvailable = true
        console.log(`LibreOffice detectado: ${candidate}`)
        return
      }
      continue
    }

    if (!canRunBinary(candidate)) continue

    const ok = await runVersionCheck(candidate)
    if (ok) {
      libreOfficePath = candidate
      libreOfficeAvailable = true
      console.log(`LibreOffice detectado: ${candidate}`)
      return
    }
  }

  libreOfficeAvailable = false
  console.warn(
    '⚠️  LibreOffice no está instalado o no se encontró en PATH. ' +
      'El endpoint /api/word-to-pdf no estará disponible. ' +
      'Instalá LibreOffice o configurá LIBREOFFICE_PATH en .env.',
  )
}

export function isLibreOfficeAvailable(): boolean {
  return libreOfficeAvailable
}

export function getLibreOfficePath(): string | null {
  return libreOfficePath
}

function assertLibreOfficeAvailable(): void {
  if (!libreOfficeAvailable || !libreOfficePath) {
    throw new AppError(
      503,
      'LibreOffice no está disponible en el servidor. Contactá al administrador.',
    )
  }
}

/** Strip system Python vars so LibreOffice uses its bundled interpreter. */
const PYTHON_ENV_VARS = [
  'PYTHONHOME',
  'PYTHONPATH',
  'PYTHONUSERBASE',
  'PYTHONEXECUTABLE',
  'PYTHONNOUSERSITE',
  'PYTHONSTARTUP',
  'VIRTUAL_ENV',
] as const

function buildLibreOfficeEnv(): NodeJS.ProcessEnv {
  const childEnv = { ...process.env }

  for (const key of PYTHON_ENV_VARS) {
    delete childEnv[key]
  }

  childEnv.HOME = childEnv.HOME ?? childEnv.USERPROFILE ?? os.tmpdir()

  return childEnv
}

function formatCommandForLog(binaryPath: string, args: string[]): string {
  const quote = (value: string) => (/\s/.test(value) ? `"${value}"` : value)
  return [quote(binaryPath), ...args.map(quote)].join(' ')
}

function runLibreOfficeConvert(
  inputPath: string,
  outputDir: string,
  targetFormat: string,
): Promise<void> {
  assertLibreOfficeAvailable()

  return new Promise((resolve, reject) => {
    const args = [
      '--headless',
      '--nologo',
      '--nofirststartwizard',
      '--convert-to',
      targetFormat,
      '--outdir',
      outputDir,
      inputPath,
    ]

    console.log(`[LibreOffice] ${formatCommandForLog(libreOfficePath!, args)}`)

    const proc = spawn(libreOfficePath!, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
      env: buildLibreOfficeEnv(),
    })

    let stderr = ''
    proc.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })

    const timer = setTimeout(() => {
      proc.kill('SIGKILL')
      reject(new AppError(504, 'La conversión superó el tiempo límite de 60 segundos.'))
    }, env.conversionTimeoutMs)

    proc.on('error', (error) => {
      clearTimeout(timer)
      reject(new AppError(500, `No se pudo ejecutar LibreOffice: ${error.message}`))
    })

    proc.on('close', (code) => {
      clearTimeout(timer)
      if (code === 0 || code === null) {
        resolve()
        return
      }

      reject(
        new AppError(
          500,
          stderr.trim() || `LibreOffice finalizó con código ${code ?? 'desconocido'}.`,
        ),
      )
    })
  })
}

export async function convertWithLibreOffice(
  inputPath: string,
  outputDir: string,
  targetFormat: string,
  expectedExtension: string,
): Promise<string> {
  await runLibreOfficeConvert(inputPath, outputDir, targetFormat)

  const baseName = path.basename(inputPath, path.extname(inputPath))
  const outputPath = path.join(outputDir, `${baseName}.${expectedExtension}`)

  console.log(
    `[LibreOffice] output expected: ${baseName}.${expectedExtension} (from staged basename "${baseName}")`,
  )

  if (!fs.existsSync(outputPath)) {
    const generated = fs
      .readdirSync(outputDir)
      .find((name) => name.toLowerCase().endsWith(`.${expectedExtension}`))

    if (!generated) {
      throw new AppError(500, 'LibreOffice no generó el archivo de salida esperado.')
    }

    return path.join(outputDir, generated)
  }

  return outputPath
}

export function removePath(targetPath: string): void {
  try {
    if (!fs.existsSync(targetPath)) return
    const stat = fs.statSync(targetPath)
    if (stat.isDirectory()) {
      fs.rmSync(targetPath, { recursive: true, force: true })
      return
    }
    fs.unlinkSync(targetPath)
  } catch {
    // ignore cleanup errors
  }
}

export function cleanupPaths(paths: string[]): void {
  for (const targetPath of paths) {
    removePath(targetPath)
  }
}

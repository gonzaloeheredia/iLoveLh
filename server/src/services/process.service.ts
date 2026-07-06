import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { env } from '../config/env.js'

export interface ProcessRecord {
  id: string
  toolId: string
  toolName: string
  inputFiles: string[]
  outputFiles: string[]
  outputDir: string
  createdAt: string
  status: 'completado' | 'error'
  simulated?: boolean
}

export interface ReportRecord {
  id: string
  description: string
  screenshotFiles: string[]
  createdAt: string
}

interface SaveProcessInput {
  toolId: string
  toolName: string
  inputFiles: string[]
  outputs: { name: string; data: string }[]
}

interface SaveReportInput {
  description: string
  screenshots: { name: string; data: string }[]
}

const outputDir = path.join(env.dataDir, 'output')
const reportsDir = path.join(env.dataDir, 'reports')
const historialFile = path.join(env.dataDir, 'historial.json')
const processesFile = path.join(env.dataDir, 'processes.json')

fs.mkdirSync(outputDir, { recursive: true })
fs.mkdirSync(reportsDir, { recursive: true })

function readJson<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T
  } catch {
    return fallback
  }
}

function writeJson(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

export function getHistorial(): ProcessRecord[] {
  const simulated = readJson<ProcessRecord[]>(historialFile, [])
  const processes = readJson<ProcessRecord[]>(processesFile, [])
  return [...processes, ...simulated].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function saveProcess(body: SaveProcessInput): ProcessRecord {
  const id = randomUUID()
  const processOutputDir = path.join(outputDir, id)
  fs.mkdirSync(processOutputDir, { recursive: true })

  const outputFiles: string[] = []

  for (const output of body.outputs) {
    const filePath = path.join(processOutputDir, output.name)
    fs.writeFileSync(filePath, Buffer.from(output.data, 'base64'))
    outputFiles.push(output.name)
  }

  const record: ProcessRecord = {
    id,
    toolId: body.toolId,
    toolName: body.toolName,
    inputFiles: body.inputFiles,
    outputFiles,
    outputDir: `data/output/${id}`,
    createdAt: new Date().toISOString(),
    status: 'completado',
  }

  const processes = readJson<ProcessRecord[]>(processesFile, [])
  processes.unshift(record)
  writeJson(processesFile, processes)

  return record
}

export function saveReport(body: SaveReportInput): ReportRecord {
  const id = randomUUID()
  const reportDir = path.join(reportsDir, id)
  fs.mkdirSync(reportDir, { recursive: true })

  const screenshotFiles: string[] = []

  for (const screenshot of body.screenshots) {
    const filePath = path.join(reportDir, screenshot.name)
    fs.writeFileSync(filePath, Buffer.from(screenshot.data, 'base64'))
    screenshotFiles.push(screenshot.name)
  }

  const record: ReportRecord = {
    id,
    description: body.description,
    screenshotFiles,
    createdAt: new Date().toISOString(),
  }

  fs.writeFileSync(path.join(reportDir, 'report.json'), JSON.stringify(record, null, 2), 'utf-8')

  return record
}

import type { ToolId } from '../types/tools'

export type ProcessStatus = 'completado' | 'error'

export interface ProcessRecord {
  id: string
  toolId: ToolId
  toolName: string
  inputFiles: string[]
  outputFiles: string[]
  outputDir?: string
  createdAt: string
  status: ProcessStatus
  simulated?: boolean
}

export interface SaveProcessInput {
  toolId: ToolId
  toolName: string
  inputFiles: string[]
  outputs: { name: string; data: Uint8Array }[]
}

export async function saveProcessResult(input: SaveProcessInput): Promise<ProcessRecord> {
  const outputs = input.outputs.map((o) => ({
    name: o.name,
    data: uint8ToBase64(o.data),
  }))

  const response = await fetch('/api/processes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      toolId: input.toolId,
      toolName: input.toolName,
      inputFiles: input.inputFiles,
      outputs,
    }),
  })

  if (!response.ok) {
    throw new Error('No se pudo guardar el resultado en el servidor.')
  }

  return response.json()
}

export async function fetchHistorial(): Promise<ProcessRecord[]> {
  const response = await fetch('/api/historial')
  if (!response.ok) {
    throw new Error('No se pudo cargar el historial.')
  }
  return response.json()
}

function uint8ToBase64(data: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < data.length; i += chunk) {
    binary += String.fromCharCode(...data.subarray(i, i + chunk))
  }
  return btoa(binary)
}

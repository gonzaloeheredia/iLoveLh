import { AppError } from '../middleware/error.middleware.js'

export const TOKEN_LIMIT = 10_000

export type StatsToolId =
  | 'unir-pdf'
  | 'separar-pdf'
  | 'pdf-a-word'
  | 'word-a-pdf'
  | 'resumir-pdf'
  | 'traducir-pdf'

const ALL_TOOL_IDS: StatsToolId[] = [
  'unir-pdf',
  'separar-pdf',
  'pdf-a-word',
  'word-a-pdf',
  'resumir-pdf',
  'traducir-pdf',
]

interface StatsEvent {
  toolId: StatsToolId
  tokensUsed: number | null
  timestamp: string
}

export interface StatsResponse {
  serverStartedAt: string
  tokenLimit: number
  tokensUsed: number
  tokensRemaining: number
  tokenUsagePercent: number
  tokensByTool: Record<'resumir-pdf' | 'traducir-pdf', number>
  operationsByTool: Record<StatsToolId, number>
  totalOperations: number
}

const SERVER_STARTED_AT = new Date().toISOString()
const events: StatsEvent[] = []

function emptyOperationsCount(): Record<StatsToolId, number> {
  return Object.fromEntries(ALL_TOOL_IDS.map((id) => [id, 0])) as Record<StatsToolId, number>
}

function getTotalTokensUsed(): number {
  return events.reduce((sum, event) => sum + (event.tokensUsed ?? 0), 0)
}

export function recordSuccess(toolId: StatsToolId, tokensUsed: number | null = null): void {
  events.push({
    toolId,
    tokensUsed,
    timestamp: new Date().toISOString(),
  })
}

export function assertTokenBudgetAvailable(): void {
  if (getTotalTokensUsed() >= TOKEN_LIMIT) {
    throw new AppError(
      429,
      'Límite de tokens alcanzado. Tu plan incluye 10.000 tokens por sesión del servidor.',
      'TOKEN_LIMIT_EXCEEDED',
    )
  }
}

export function getStats(): StatsResponse {
  const operationsByTool = emptyOperationsCount()
  const tokensByTool = {
    'resumir-pdf': 0,
    'traducir-pdf': 0,
  }

  for (const event of events) {
    operationsByTool[event.toolId]++

    if (event.tokensUsed != null) {
      if (event.toolId === 'resumir-pdf') {
        tokensByTool['resumir-pdf'] += event.tokensUsed
      } else if (event.toolId === 'traducir-pdf') {
        tokensByTool['traducir-pdf'] += event.tokensUsed
      }
    }
  }

  const tokensUsed = tokensByTool['resumir-pdf'] + tokensByTool['traducir-pdf']
  const tokensRemaining = Math.max(0, TOKEN_LIMIT - tokensUsed)
  const tokenUsagePercent =
    TOKEN_LIMIT > 0 ? Math.round((tokensUsed / TOKEN_LIMIT) * 1000) / 10 : 0

  return {
    serverStartedAt: SERVER_STARTED_AT,
    tokenLimit: TOKEN_LIMIT,
    tokensUsed,
    tokensRemaining,
    tokenUsagePercent,
    tokensByTool,
    operationsByTool,
    totalOperations: events.length,
  }
}

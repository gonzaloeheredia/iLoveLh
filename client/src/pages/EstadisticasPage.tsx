import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Activity,
  AlertTriangle,
  ArrowRightLeft,
  FileText,
  Files,
  Languages,
  Loader2,
  RefreshCw,
  Scissors,
  Sparkles,
  Zap,
} from 'lucide-react'
import { BackButton } from '../components/BackButton'
import { PageContainer } from '../components/PageContainer'
import { fetchStats, type UsageStats } from '../services/api'
import type { ToolId } from '../types/tools'

const REFRESH_INTERVAL_MS = 30_000

const TOOL_META: {
  id: ToolId
  label: string
  shortLabel: string
  color: string
  icon: typeof Files
}[] = [
  { id: 'unir-pdf', label: 'Unir PDF', shortLabel: 'Unir', color: '#6366f1', icon: Files },
  { id: 'separar-pdf', label: 'Separar PDF', shortLabel: 'Separar', color: '#a855f7', icon: Scissors },
  { id: 'pdf-a-word', label: 'PDF a Word', shortLabel: 'PDF→Word', color: '#22c55e', icon: FileText },
  { id: 'word-a-pdf', label: 'Word a PDF', shortLabel: 'Word→PDF', color: '#f97316', icon: ArrowRightLeft },
  { id: 'resumir-pdf', label: 'Resumir PDF', shortLabel: 'Resumir', color: '#9b87f5', icon: Sparkles },
  { id: 'traducir-pdf', label: 'Traducir PDF', shortLabel: 'Traducir', color: '#06b6d4', icon: Languages },
]

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-AR').format(value)
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const seconds = Math.floor(diffMs / 1000)
  if (seconds < 10) return 'hace unos segundos'
  if (seconds < 60) return `hace ${seconds} s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes} min`
  return formatDate(iso)
}

function getTokenUsageTone(percent: number): {
  text: string
  bar: string
  ring: string
  label: string
} {
  if (percent >= 90) {
    return {
      text: 'text-red-400',
      bar: 'bg-red-500',
      ring: 'stroke-red-500',
      label: 'Crítico',
    }
  }
  if (percent >= 70) {
    return {
      text: 'text-amber-400',
      bar: 'bg-amber-500',
      ring: 'stroke-amber-500',
      label: 'Alto',
    }
  }
  return {
    text: 'text-green-400',
    bar: 'bg-green-500',
    ring: 'stroke-green-500',
    label: 'Normal',
  }
}

interface KpiCardProps {
  label: string
  value: string
  hint?: string
  accent?: string
}

function KpiCard({ label, value, hint, accent = 'text-white' }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
      <p className={`mt-2 text-3xl font-bold tabular-nums ${accent}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
    </div>
  )
}

function TokenRing({ percent, tone }: { percent: number; tone: ReturnType<typeof getTokenUsageTone> }) {
  const data = [
    { name: 'used', value: percent },
    { name: 'remaining', value: Math.max(0, 100 - percent) },
  ]

  return (
    <div className="relative h-36 w-36 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={48}
            outerRadius={64}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            <Cell fill="currentColor" className={tone.text} />
            <Cell fill="rgba(155, 135, 245, 0.12)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold tabular-nums ${tone.text}`}>{percent.toFixed(1)}%</span>
        <span className="text-xs text-text-muted">usado</span>
      </div>
    </div>
  )
}

export function EstadisticasPage() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null)

  const loadStats = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true)
    else setLoading(true)

    try {
      const data = await fetchStats()
      setStats(data)
      setLastUpdatedAt(new Date().toISOString())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las estadísticas.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void loadStats()
    const interval = window.setInterval(() => {
      void loadStats(true)
    }, REFRESH_INTERVAL_MS)
    return () => window.clearInterval(interval)
  }, [loadStats])

  const operationsChartData = useMemo(() => {
    if (!stats) return []
    return TOOL_META.map((tool) => ({
      ...tool,
      count: stats.operationsByTool[tool.id],
    }))
  }, [stats])

  const tokensChartData = useMemo(() => {
    if (!stats) return []
    return [
      {
        name: 'Resumir PDF',
        value: stats.tokensByTool['resumir-pdf'],
        color: '#9b87f5',
      },
      {
        name: 'Traducir PDF',
        value: stats.tokensByTool['traducir-pdf'],
        color: '#06b6d4',
      },
    ].filter((item) => item.value > 0)
  }, [stats])

  const tone = stats ? getTokenUsageTone(stats.tokenUsagePercent) : getTokenUsageTone(0)

  return (
    <PageContainer width="lg">
      <BackButton to="/herramienta" label="Volver a herramientas" />

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <Activity className="h-3.5 w-3.5" />
            Panel de uso
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-white">Estadísticas </span>
            <span className="text-accent">de uso</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
            Volumen de operaciones y consumo de tokens de IA en la sesión actual del servidor.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadStats(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-bg-card px-5 py-2.5 text-sm font-medium text-white transition-colors hover:border-accent/40 hover:bg-bg-elevated disabled:cursor-not-allowed disabled:opacity-50"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Actualizar
        </button>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-sm text-amber-200">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
        <p>
          Estas estadísticas viven en memoria y se reinician cada vez que el servidor se reinicia.
          El límite de tokens simula un plan contratado de{' '}
          <strong className="font-semibold text-amber-100">10.000 tokens</strong> por sesión.
        </p>
      </div>

      {loading && !stats ? (
        <div className="mt-16 flex flex-col items-center gap-3 py-10">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
          <p className="text-sm text-text-muted">Cargando estadísticas...</p>
        </div>
      ) : error && !stats ? (
        <div className="mt-10 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      ) : stats ? (
        <div className="mt-10 space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Total operaciones" value={formatNumber(stats.totalOperations)} />
            <KpiCard
              label="Tokens consumidos"
              value={formatNumber(stats.tokensUsed)}
              hint={`de ${formatNumber(stats.tokenLimit)} incluidos`}
              accent={tone.text}
            />
            <KpiCard
              label="Tokens restantes"
              value={formatNumber(stats.tokensRemaining)}
              accent="text-accent"
            />
            <KpiCard
              label="Plan utilizado"
              value={`${stats.tokenUsagePercent.toFixed(1)}%`}
              hint={tone.label}
              accent={tone.text}
            />
          </div>

          <div className="rounded-2xl border border-border bg-bg-card p-6 sm:p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <TokenRing percent={stats.tokenUsagePercent} tone={tone} />
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-accent">
                    <Zap className="h-4 w-4" />
                    Plan de tokens IA
                  </div>
                  <p className="mt-2 text-4xl font-bold tabular-nums text-white">
                    {formatNumber(stats.tokensUsed)}
                    <span className="text-lg font-medium text-text-muted">
                      {' '}
                      / {formatNumber(stats.tokenLimit)}
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-text-muted">
                    {formatNumber(stats.tokensRemaining)} tokens disponibles en esta sesión
                  </p>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                <div className="h-3 overflow-hidden rounded-full bg-bg-elevated">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${tone.bar}`}
                    style={{ width: `${Math.min(stats.tokenUsagePercent, 100)}%` }}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
                  <span>Sesión desde: {formatDate(stats.serverStartedAt)}</span>
                  {lastUpdatedAt && <span>Actualizado {formatRelativeTime(lastUpdatedAt)}</span>}
                </div>
                <p className="text-xs text-text-muted">
                  Auto-actualización cada {REFRESH_INTERVAL_MS / 1000} segundos
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-5">
            <div className="rounded-2xl border border-border bg-bg-card p-6 xl:col-span-3">
              <h2 className="text-lg font-semibold text-white">Operaciones por servicio</h2>
              <p className="mt-1 text-sm text-text-muted">
                Cantidad de conversiones completadas en esta sesión
              </p>

              <div className="mt-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={operationsChartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <XAxis
                      dataKey="shortLabel"
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(155, 135, 245, 0.08)' }}
                      contentStyle={{
                        backgroundColor: '#120a1f',
                        border: '1px solid rgba(155, 135, 245, 0.15)',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                      formatter={(value, _name, item) => [
                        formatNumber(Number(value)),
                        item.payload.label,
                      ]}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {operationsChartData.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-bg-card p-6 xl:col-span-2">
              <h2 className="text-lg font-semibold text-white">Tokens por herramienta IA</h2>
              <p className="mt-1 text-sm text-text-muted">Desglose entre resumir y traducir</p>

              {tokensChartData.length === 0 ? (
                <div className="mt-10 flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-bg-elevated/40 px-4 text-center text-sm text-text-muted">
                  Todavía no se consumieron tokens de IA en esta sesión.
                </div>
              ) : (
                <>
                  <div className="mt-4 h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tokensChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={78}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {tokensChartData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#120a1f',
                            border: '1px solid rgba(155, 135, 245, 0.15)',
                            borderRadius: '12px',
                            color: '#fff',
                          }}
                          formatter={(value) => [formatNumber(Number(value)), 'tokens']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-xl border border-border bg-bg-elevated px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-accent" />
                        <span className="text-sm text-white">Resumir PDF</span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-accent">
                        {formatNumber(stats.tokensByTool['resumir-pdf'])}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border bg-bg-elevated px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm text-white">Traducir PDF</span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-cyan-400">
                        {formatNumber(stats.tokensByTool['traducir-pdf'])}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOL_META.map((tool) => {
              const Icon = tool.icon
              return (
                <div
                  key={tool.id}
                  className="rounded-2xl border border-border bg-bg-card p-5 transition-colors hover:border-accent/20"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${tool.color}22` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: tool.color }} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{tool.label}</p>
                      <p className="text-xs text-text-muted">Operaciones completadas</p>
                    </div>
                  </div>
                  <p className="mt-4 text-3xl font-bold tabular-nums text-white">
                    {formatNumber(stats.operationsByTool[tool.id])}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </PageContainer>
  )
}

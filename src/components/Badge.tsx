export function Badge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-4 py-1.5">
      <span className="h-2 w-2 rounded-full bg-accent" />
      <span className="text-sm text-text-muted">Herramienta privada · 100% en tu servidor</span>
    </div>
  )
}

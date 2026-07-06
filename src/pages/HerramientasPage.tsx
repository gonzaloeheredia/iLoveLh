import { Badge } from '../components/Badge'
import { ToolCard } from '../components/ToolCard'
import { tools } from '../types/tools'

export function HerramientasPage() {
  return (
    <div className="bg-glow min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="mb-8 flex justify-center">
          <Badge />
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-white">Herramientas </span>
            <span className="text-accent">PDF</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-text-muted sm:text-lg">
            Herramientas privadas para abogados y profesionales. Todo se procesa en tu servidor,
            con resultados guardados de forma segura.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              id={tool.id}
              path={tool.path}
              titleWhite={tool.titleWhite}
              titleAccent={tool.titleAccent}
              description={tool.description}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

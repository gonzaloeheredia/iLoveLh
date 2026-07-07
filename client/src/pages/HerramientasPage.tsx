import { Badge } from '../components/Badge'
import { ToolCard } from '../components/ToolCard'
import { PageContainer } from '../components/PageContainer'
import { tools } from '../types/tools'

export function HerramientasPage() {
  return (
    <PageContainer width="lg">
      <div className="mb-10 flex justify-center">
        <Badge />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="text-white">Conversor </span>
          <span className="text-accent">PDF</span>
        </h1>
        <p className="mt-5 text-base leading-relaxed text-text-muted sm:text-lg">
          Herramienta de conversor de documentos para profesionales del derecho.
        </p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:gap-6">
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
    </PageContainer>
  )
}

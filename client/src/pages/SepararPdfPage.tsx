import { Badge } from '../components/Badge'
import { Hero } from '../components/Hero'
import { FeaturesSection } from '../components/FeatureCard'
import { PdfSplitForm } from '../components/PdfSplitForm'
import type { ToolConfig } from '../types/tools'

export function SepararPdfPage({ config }: { config: ToolConfig }) {
  return (
    <div className="bg-glow min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="mb-8 flex justify-center">
          <Badge />
        </div>

        <Hero
          titleWhite={config.titleWhite}
          titleAccent={config.titleAccent}
          description={config.description}
        />

        <div className="mt-12">
          <PdfSplitForm />
        </div>

        <div className="mt-16">
          <FeaturesSection features={config.features} />
        </div>
      </div>
    </div>
  )
}

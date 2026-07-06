import { Badge } from '../components/Badge'
import { Hero } from '../components/Hero'
import { FeaturesSection } from '../components/FeatureCard'
import { PdfConversionForm } from '../components/PdfConversionForm'
import type { ConversionKind } from '../services/api'
import type { ToolConfig } from '../types/tools'

interface ConversionPageProps {
  config: ToolConfig
  kind: ConversionKind
  outputExtension: string
}

export function ConversionPage({ config, kind, outputExtension }: ConversionPageProps) {
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
          <PdfConversionForm
            config={config}
            kind={kind}
            outputExtension={outputExtension}
          />
        </div>

        <div className="mt-16">
          <FeaturesSection features={config.features} />
        </div>
      </div>
    </div>
  )
}

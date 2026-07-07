import { Badge } from '../components/Badge'
import { BackButton } from '../components/BackButton'
import { Hero } from '../components/Hero'
import { FeaturesSection } from '../components/FeatureCard'
import { PageContainer } from '../components/PageContainer'
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
    <PageContainer>
      <BackButton />

      <div className="mb-10 flex justify-center">
        <Badge />
      </div>

      <Hero
        titleWhite={config.titleWhite}
        titleAccent={config.titleAccent}
        description={config.description}
      />

      <div className="mt-14">
        <PdfConversionForm
          config={config}
          kind={kind}
          outputExtension={outputExtension}
        />
      </div>

      <div className="mt-20">
        <FeaturesSection features={config.features} />
      </div>
    </PageContainer>
  )
}

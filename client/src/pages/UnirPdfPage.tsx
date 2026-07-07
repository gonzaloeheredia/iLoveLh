import { Badge } from '../components/Badge'
import { BackButton } from '../components/BackButton'
import { Hero } from '../components/Hero'
import { FeaturesSection } from '../components/FeatureCard'
import { PageContainer } from '../components/PageContainer'
import { PdfMergeForm } from '../components/PdfMergeForm'
import type { ToolConfig } from '../types/tools'

export function UnirPdfPage({ config }: { config: ToolConfig }) {
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
        <PdfMergeForm />
      </div>

      <div className="mt-20">
        <FeaturesSection features={config.features} />
      </div>
    </PageContainer>
  )
}

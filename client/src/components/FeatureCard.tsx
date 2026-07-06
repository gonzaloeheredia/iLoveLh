import type { Feature } from '../types/tools'

interface FeatureCardProps {
  feature: Feature
}

export function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-6">
      <div className="mb-4 h-0.5 w-8 rounded-full bg-accent" />
      <h3 className="text-base font-semibold text-white">{feature.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{feature.description}</p>
    </div>
  )
}

interface FeaturesSectionProps {
  features: Feature[]
}

export function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <FeatureCard key={feature.title} feature={feature} />
      ))}
    </div>
  )
}

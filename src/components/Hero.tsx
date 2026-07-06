interface HeroProps {
  titleWhite: string
  titleAccent: string
  description: string
}

export function Hero({ titleWhite, titleAccent, description }: HeroProps) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        <span className="text-white">{titleWhite} </span>
        <span className="text-accent">{titleAccent}</span>
      </h1>
      <p className="mt-5 text-base leading-relaxed text-text-muted sm:text-lg">{description}</p>
    </div>
  )
}

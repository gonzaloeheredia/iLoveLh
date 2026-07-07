import { Link } from 'react-router-dom'

interface LogoProps {
  to?: string
}

export function Logo({ to = '/herramienta' }: LogoProps) {
  return (
    <Link to={to} className="inline-flex shrink-0 items-center" aria-label="legalHub">
      <img
        src="/logo.png"
        alt="legalHub"
        className="block h-14 w-auto object-contain sm:h-16"
        draggable={false}
        width={322}
        height={178}
      />
    </Link>
  )
}

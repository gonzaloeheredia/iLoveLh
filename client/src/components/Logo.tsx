import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link to="/herramienta" className="block shrink-0" aria-label="legalHub">
      <img
        src="/logo.png"
        alt="legalHub"
        className="h-16 w-auto select-none"
        draggable={false}
        width={322}
        height={178}
      />
    </Link>
  )
}

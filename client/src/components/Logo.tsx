import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link to="/herramienta" className="block shrink-0" aria-label="legalHub">
      <div className="h-9 w-9 overflow-hidden">
        <img
          src="/logo.png"
          alt=""
          className="h-9 w-auto max-w-none select-none"
          draggable={false}
        />
      </div>
    </Link>
  )
}

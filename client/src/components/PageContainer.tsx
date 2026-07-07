import type { ReactNode } from 'react'

export const PAGE_X_PADDING = 'px-4 sm:px-6 lg:px-8 xl:px-10'
export const PAGE_Y_PADDING = 'py-14 sm:py-16 lg:py-20'

type PageWidth = 'sm' | '3xl' | 'md' | 'lg'

const WIDTH_CLASS: Record<PageWidth, string> = {
  sm: 'max-w-2xl',
  '3xl': 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
}

interface PageContainerProps {
  children: ReactNode
  width?: PageWidth
}

export function PageContainer({ children, width = 'md' }: PageContainerProps) {
  return (
    <div className="bg-glow min-h-screen">
      <div
        className={`mx-auto w-full ${WIDTH_CLASS[width]} ${PAGE_X_PADDING} ${PAGE_Y_PADDING}`}
      >
        {children}
      </div>
    </div>
  )
}

import type { ReactNode } from 'react'

type ContainerProps = {
  children: ReactNode
  className?: string
}

/** Centered content wrapper — caps at ~1440px and pads the sides. */
export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-screen-2xl px-6 ${className}`}>{children}</div>
  )
}

export default Container

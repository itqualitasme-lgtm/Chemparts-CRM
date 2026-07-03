import type { ReactNode } from 'react'
import { Container } from './Container'

type SectionProps = {
  children: ReactNode
  /** Light grey tint background (#F4F6F8). */
  tint?: boolean
  /** Ink navy background with light text. */
  dark?: boolean
  /** Extra classes on the outer full-bleed element. */
  className?: string
  /** Set to false to render children without the centered Container wrapper. */
  contained?: boolean
  id?: string
}

/**
 * Full-bleed section wrapper: the background spans the viewport while the
 * content stays inside a centered Container. Vertical rhythm ~96-128px.
 */
export function Section({
  children,
  tint = false,
  dark = false,
  className = '',
  contained = true,
  id,
}: SectionProps) {
  const bg = dark
    ? 'bg-[#0A2540] text-white'
    : tint
      ? 'bg-[#F4F6F8] text-[#0A2540]'
      : 'bg-white text-[#0A2540]'

  return (
    <section id={id} className={`w-full py-24 md:py-32 ${bg} ${className}`}>
      {contained ? <Container>{children}</Container> : children}
    </section>
  )
}

export default Section

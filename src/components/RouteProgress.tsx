'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

// Thin top progress bar shown during client navigations (e.g. portal → website
// via the logo). Starts on internal link clicks, completes when the pathname
// changes. Inline styles only, so it also works in the (site) group (no Tailwind).
export default function RouteProgress() {
  const pathname = usePathname()
  const [width, setWidth] = useState(0)
  const [active, setActive] = useState(false)
  const trickle = useRef<ReturnType<typeof setInterval> | null>(null)
  const first = useRef(true)

  function stopTrickle() {
    if (trickle.current) {
      clearInterval(trickle.current)
      trickle.current = null
    }
  }

  function start() {
    stopTrickle()
    setActive(true)
    setWidth(8)
    trickle.current = setInterval(() => {
      setWidth((w) => (w < 90 ? w + (90 - w) * 0.12 : w))
    }, 240)
  }

  function done() {
    stopTrickle()
    setWidth(100)
    window.setTimeout(() => {
      setActive(false)
      setWidth(0)
    }, 220)
  }

  // Complete when the route has changed.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    done()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Start on an internal same-origin link click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as HTMLElement)?.closest?.('a')
      if (!a) return
      const href = a.getAttribute('href')
      if (!href || a.target === '_blank' || a.hasAttribute('download')) return
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return
      let url: URL
      try {
        url = new URL(href, location.href)
      } catch {
        return
      }
      if (url.origin !== location.origin || url.pathname === location.pathname) return
      start()
    }
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      stopTrickle()
    }
  }, [])

  if (!active) return null
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 9999, pointerEvents: 'none' }}>
      <div
        style={{
          height: '100%',
          width: `${width}%`,
          background: '#0E7490',
          boxShadow: '0 0 8px rgba(14,116,144,0.7)',
          transition: 'width 200ms ease',
        }}
      />
    </div>
  )
}

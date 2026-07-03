'use client'

import { useEffect } from 'react'

// Syncs hover state between the map pins and the office cards on the About page.
// Runs on mount (and re-runs after client-side navigation back to /about), so it
// works both on first load and after instant nav — no full page reload needed.
export default function AboutMapSync() {
  useEffect(() => {
    const pins = document.querySelectorAll<HTMLElement>('[data-city]')
    const cards = document.querySelectorAll<HTMLElement>('[data-city-card]')

    function setActive(city: string | undefined, on: boolean) {
      pins.forEach((p) => p.classList.toggle('is-active', on && p.dataset.city === city))
      cards.forEach((c) => c.classList.toggle('is-active', on && c.dataset.cityCard === city))
    }

    const handlers: Array<{ el: HTMLElement; type: string; fn: EventListener }> = []
    const bind = (el: HTMLElement, type: string, fn: EventListener) => {
      el.addEventListener(type, fn)
      handlers.push({ el, type, fn })
    }

    pins.forEach((p) => {
      bind(p, 'mouseenter', () => setActive(p.dataset.city, true))
      bind(p, 'mouseleave', () => setActive(p.dataset.city, false))
    })
    cards.forEach((c) => {
      bind(c, 'mouseenter', () => setActive(c.dataset.cityCard, true))
      bind(c, 'mouseleave', () => setActive(c.dataset.cityCard, false))
    })

    return () => {
      handlers.forEach(({ el, type, fn }) => el.removeEventListener(type, fn))
    }
  }, [])

  return null
}

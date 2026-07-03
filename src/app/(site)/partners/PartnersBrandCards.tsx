'use client'

import { useEffect } from 'react'

type Meta = { logo: string | null; country: string; focus: string }

const META: Record<string, Meta> = {
  'Hitachi': { logo: 'hitachi.jpg', country: 'Japan', focus: 'XRF, EDX, elemental analysis' },
  'Tanaka': { logo: 'tanaka.jpg', country: 'Japan', focus: 'Petroleum testing — flash point, distillation, pour point' },
  'Oxford Instruments': { logo: 'oxford.jpg', country: 'UK', focus: 'Benchtop NMR, mercury analyzers, XRF' },
  'Tamson': { logo: 'pt-tamson-logo.jpg', country: 'Netherlands', focus: 'Temperature baths and viscosity instruments' },
  'Nabertherm': { logo: 'nabertherm.webp', country: 'Germany', focus: 'Industrial furnaces and ashing ovens' },
  'Normalab': { logo: 'normalab.svg', country: 'France', focus: 'Petroleum and lubricant testing apparatus' },
  'Biolab': { logo: 'biolab.png', country: 'USA', focus: 'Mercury and chlorine analyzers' },
  'Linetronics': { logo: 'linetronics.jpg', country: 'Germany', focus: 'Process and laboratory electronics' },
  'PG Instruments': { logo: 'pg-instruments.webp', country: 'UK', focus: 'UV-Vis spectroscopy and AAS' },
  'Peak Instruments': { logo: 'peak-instrument.jpg', country: 'USA', focus: 'Gas generators for chromatography labs' },
  'Chromos': { logo: 'chromos.jpg', country: 'Russia', focus: 'Gas chromatography systems' },
  'Mitsubishi': { logo: null, country: 'Japan', focus: 'Moisture analyzers, halogen and TOX' },
  'Lumex': { logo: null, country: 'Russia', focus: 'Mercury and elemental analyzers' },
  'Pruler': { logo: null, country: 'Germany', focus: 'Specialty laboratory instruments' },
  'Scavini': { logo: null, country: 'Italy', focus: 'Bench-top petroleum testing' },
  'Chemparts': { logo: null, country: 'UAE', focus: 'Chemparts in-house instruments and accessories' },
}

const SINCE: Record<string, string> = {
  'Hitachi': 'SINCE 2008', 'Tanaka': 'SINCE 2010', 'Oxford Instruments': 'SINCE 2012', 'Tamson': 'SINCE 2013',
  'Nabertherm': 'SINCE 2014', 'Normalab': 'SINCE 2014', 'Biolab': 'SINCE 2015', 'Linetronics': 'SINCE 2016',
  'PG Instruments': 'SINCE 2016', 'Peak Instruments': 'SINCE 2017', 'Chromos': 'SINCE 2018', 'Mitsubishi': 'SINCE 2018',
  'Lumex': 'SINCE 2019', 'Pruler': 'SINCE 2020', 'Scavini': 'SINCE 2021', 'Chemparts': 'IN-HOUSE',
}

function escapeHtml(s: unknown): string {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Builds the partners brand wall and cards from the global catalog (window.PRODUCTS
// / window.BRANDS set by /assets/js/products.js). Runs on mount and re-runs after
// client-side navigation back to /partners. Polls briefly because the catalog
// script loads with strategy="afterInteractive" and may not be ready on first paint.
export default function PartnersBrandCards() {
  useEffect(() => {
    let cancelled = false
    let tries = 0

    const render = () => {
      if (cancelled) return
      const w = window as unknown as { PRODUCTS?: Array<{ brand: string }>; BRANDS?: string[] }
      const host = document.querySelector('[data-brand-cards]')
      if (!w.PRODUCTS || !w.BRANDS || !host) {
        if (tries++ < 60) setTimeout(render, 50)
        return
      }
      const PRODUCTS = w.PRODUCTS
      const BRANDS = w.BRANDS

      const ANCHOR = ['Hitachi', 'Tanaka', 'Oxford Instruments']
      const sorted = [
        ...ANCHOR.filter((b) => BRANDS.includes(b)),
        ...BRANDS.filter((b) => !ANCHOR.includes(b)).sort(),
      ]

      const wall = document.querySelector('[data-partners-wall]')
      if (wall) {
        wall.innerHTML = sorted
          .map((b) => {
            const filterHash = encodeURIComponent(JSON.stringify({ b: [b] }))
            return '<a class="partners-wall__cell" href="/products#' + filterHash + '" data-since="' + (SINCE[b] || '') + '">' + escapeHtml(b) + '</a>'
          })
          .join('')
      }

      host.innerHTML = sorted
        .map((b) => {
          const m = META[b] || ({} as Meta)
          const count = PRODUCTS.filter((p) => p.brand === b).length
          const filterHash = encodeURIComponent(JSON.stringify({ b: [b] }))
          const logoHtml = m.logo
            ? '<img src="/assets/images/partners/' + m.logo + '" alt="' + escapeHtml(b) + ' logo" loading="lazy">'
            : '<span class="brand-card__wordmark">' + escapeHtml(b) + '</span>'
          return (
            '<a class="brand-card" href="/products#' + filterHash + '">' +
            '<div class="brand-card__logo">' + logoHtml + '</div>' +
            '<div class="brand-card__body">' +
            '<div class="brand-card__head">' +
            '<h3>' + escapeHtml(b) + '</h3>' +
            '<span class="brand-card__country mono">' + escapeHtml(m.country || '') + '</span>' +
            '</div>' +
            '<p class="brand-card__focus">' + escapeHtml(m.focus || 'Specialist analytical and laboratory instrumentation.') + '</p>' +
            '<div class="brand-card__foot">' +
            '<span class="mono"><strong>[' + String(count).padStart(2, '0') + ']</strong> instruments in catalog</span>' +
            '<svg class="brand-card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" stroke-width="1.25"/></svg>' +
            '</div>' +
            '</div>' +
            '</a>'
          )
        })
        .join('')

      const total = document.querySelector('[data-brand-total]')
      if (total) total.textContent = BRANDS.length + ' BRANDS'
    }

    render()
    return () => {
      cancelled = true
    }
  }, [])

  return null
}

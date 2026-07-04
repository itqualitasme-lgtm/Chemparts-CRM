'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

// PDP image gallery: main image + thumbnail strip, plus a click-to-zoom
// lightbox so customers can view the equipment at large scale. Reuses the
// ported site's .pdp-gallery classes; the lightbox is inline-styled (the (site)
// group is excluded from Tailwind).
export default function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [mounted, setMounted] = useState(false)
  const list = images.length > 0 ? images : []
  const current = list[active] ?? list[0]

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!zoom) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoom(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [zoom])

  return (
    <div className="pdp-gallery">
      <div className="pdp-gallery__main">
        {current ? (
          <img
            src={current}
            alt={name}
            style={{ cursor: 'zoom-in' }}
            onClick={() => setZoom(true)}
          />
        ) : null}
        {current ? (
          <button
            type="button"
            onClick={() => setZoom(true)}
            aria-label="View larger"
            style={{
              position: 'absolute',
              right: 12,
              bottom: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em',
              color: 'var(--navy)',
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid var(--rule-c)',
              borderRadius: 2,
              cursor: 'zoom-in',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" strokeLinecap="round" />
            </svg>
            View larger
          </button>
        ) : null}
      </div>

      {list.length > 1 ? (
        <div className="pdp-gallery__thumbs">
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              aria-label={`View image ${i + 1}`}
              aria-pressed={i === active ? 'true' : 'false'}
              onClick={() => setActive(i)}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      ) : null}

      {/* Portal to <body> so the fixed overlay escapes the ported site's
          transformed (data-reveal) ancestors and covers the whole viewport. */}
      {mounted && zoom && current
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`${name} — enlarged`}
              onClick={() => setZoom(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                background: 'rgba(8,18,30,0.92)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4vh 4vw',
                cursor: 'zoom-out',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current}
                alt={name}
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '92vw', maxHeight: '92vh', objectFit: 'contain', background: '#fff', padding: 12, borderRadius: 2 }}
              />
              <button
                type="button"
                onClick={() => setZoom(false)}
                aria-label="Close"
                style={{
                  position: 'fixed',
                  top: 20,
                  right: 24,
                  width: 40,
                  height: 40,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: 20,
                }}
              >
                ✕
              </button>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

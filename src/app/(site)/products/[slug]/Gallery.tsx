'use client'

import { useState } from 'react'

// Small client island: the PDP image gallery with clickable thumbnails.
// Reuses the ported site's .pdp-gallery classes so it looks identical to the
// original product.html gallery (main image + thumbnail strip).
export default function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0)
  const list = images.length > 0 ? images : []
  const current = list[active] ?? list[0]

  return (
    <div className="pdp-gallery">
      <div className="pdp-gallery__main">{current ? <img src={current} alt={name} /> : null}</div>
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
    </div>
  )
}

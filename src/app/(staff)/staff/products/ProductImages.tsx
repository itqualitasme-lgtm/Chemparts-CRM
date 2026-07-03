'use client'

import Image from 'next/image'
import { useActionState } from 'react'
import {
  removeProductImage,
  setPrimaryImage,
  uploadProductImage,
  type ImageState,
} from './image-actions'
import { productImageUrl } from '@/lib/product-image'

export default function ProductImages({
  productId,
  image,
  images,
}: {
  productId: string
  image: string | null
  images: string[]
}) {
  const upload = uploadProductImage.bind(null, productId)
  const [state, formAction, pending] = useActionState<ImageState, FormData>(upload, {})

  return (
    <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="mb-3 font-medium text-slate-800">Images</h2>

      {images.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-3">
          {images.map((url) => {
            const src = productImageUrl(url)
            const isPrimary = url === image
            return (
              <div
                key={url}
                className={`relative rounded-lg border p-1 ${isPrimary ? 'border-[#0A2540] ring-2 ring-[#0A2540]/20' : 'border-slate-200'}`}
              >
                <div className="relative h-24 w-24 overflow-hidden rounded bg-slate-50">
                  {src && <Image src={src} alt="" fill sizes="96px" className="object-contain" />}
                </div>
                <div className="mt-1 flex justify-between gap-1 text-[11px]">
                  {isPrimary ? (
                    <span className="text-[#0A2540]">Primary</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(productId, url)}
                      className="text-slate-500 underline hover:text-[#0A2540]"
                    >
                      Set primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeProductImage(productId, url)}
                    className="text-red-500 underline hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="mb-4 text-sm text-slate-500">No images yet.</p>
      )}

      <form action={formAction} className="flex items-center gap-3">
        <input
          type="file"
          name="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          required
          className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:text-slate-700"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60"
        >
          {pending ? 'Uploading…' : 'Upload'}
        </button>
      </form>
      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
      <p className="mt-2 text-xs text-slate-400">PNG, JPEG, WEBP or SVG · up to 5MB.</p>
    </div>
  )
}

'use client'

import Image from 'next/image'
import { useActionState, useEffect, useState } from 'react'
import {
  removeProductImage,
  setPrimaryImage,
  uploadProductImage,
  type ImageState,
} from './image-actions'
import { productImageUrl } from '@/lib/product-image'
import ImageCropUpload from './ImageCropUpload'

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
  const [clientError, setClientError] = useState<string | null>(null)

  // Clear the client error once a server round-trip succeeds.
  useEffect(() => {
    if (state.ok) setClientError(null)
  }, [state.ok])

  function handleReady(file: File) {
    setClientError(null)
    const fd = new FormData()
    fd.append('file', file)
    formAction(fd)
  }

  const error = clientError ?? state.error

  return (
    <div className="mb-8 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="mb-1 font-medium text-slate-800">Images</h2>
      <p className="mb-3 text-xs text-slate-400">
        Every product should have at least one image. Images are cropped to 4:3 and compressed on upload.
      </p>

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
                <div className="relative h-[72px] w-24 overflow-hidden rounded bg-slate-50">
                  {src && <Image src={src} alt="" fill sizes="96px" className="object-cover" />}
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
        <p className="mb-4 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          No image yet — add one so this product shows properly in the store.
        </p>
      )}

      <ImageCropUpload pending={pending} onReady={handleReady} onError={setClientError} />

      {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {state.ok && <p className="mt-2 text-sm text-green-700">Image uploaded.</p>}
    </div>
  )
}

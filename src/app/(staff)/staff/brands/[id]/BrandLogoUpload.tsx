'use client'

import { useActionState, useState, useTransition } from 'react'
import { uploadBrandLogo, removeBrandLogo, type LogoState } from '../actions'

// Light checkerboard so white/transparent logos are visible while managing them.
const CHECKER_STYLE: React.CSSProperties = {
  backgroundColor: '#fff',
  backgroundImage:
    'linear-gradient(45deg,#e2e8f0 25%,transparent 25%),linear-gradient(-45deg,#e2e8f0 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e2e8f0 75%),linear-gradient(-45deg,transparent 75%,#e2e8f0 75%)',
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0,0 8px,8px -8px,-8px 0',
}

export default function BrandLogoUpload({
  brandId,
  currentLogo,
}: {
  brandId: string
  currentLogo: string | null
}) {
  const [state, formAction, pending] = useActionState<LogoState, FormData>(
    uploadBrandLogo.bind(null, brandId),
    {},
  )
  const [removing, startRemove] = useTransition()
  const [fileName, setFileName] = useState<string | null>(null)

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="font-medium text-slate-800">Logo</h2>

      <div
        className="flex h-32 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300"
        style={CHECKER_STYLE}
      >
        {currentLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentLogo} alt="Brand logo" className="max-h-24 max-w-full object-contain p-3" />
        ) : (
          <span className="text-sm text-slate-500">No logo yet</span>
        )}
      </div>
      <p className="text-xs text-slate-400">
        On a checkerboard so white/transparent logos are visible. If a logo shows as white text here, it won’t display on the
        website — upload a version with a background, or remove it to fall back to the brand name.
      </p>

      <form action={formAction} className="space-y-2">
        <input
          type="file"
          name="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          required
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#0A2540] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#123a63]"
        />
        <p className="text-xs text-slate-400">PNG, JPEG, WEBP or SVG · up to 5MB. Transparent PNG/SVG looks best.</p>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.ok && <p className="text-sm text-green-700">Logo updated.</p>}

        <button
          type="submit"
          disabled={pending || !fileName}
          className="w-full rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60"
        >
          {pending ? 'Uploading…' : currentLogo ? 'Replace logo' : 'Upload logo'}
        </button>
      </form>

      {currentLogo && (
        <button
          type="button"
          disabled={removing}
          onClick={() => startRemove(() => removeBrandLogo(brandId))}
          className="w-full text-center text-sm text-slate-500 underline disabled:opacity-60"
        >
          {removing ? 'Removing…' : 'Remove logo'}
        </button>
      )}
    </div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { uploadBlogImage } from './actions'

// Checkerboard so transparent/white images stay visible in the preview.
const CHECKER: React.CSSProperties = {
  backgroundColor: '#fff',
  backgroundImage:
    'linear-gradient(45deg,#e2e8f0 25%,transparent 25%),linear-gradient(-45deg,#e2e8f0 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e2e8f0 75%),linear-gradient(-45deg,transparent 75%,#e2e8f0 75%)',
  backgroundSize: '14px 14px',
  backgroundPosition: '0 0,0 7px,7px -7px,-7px 0',
}

export default function CoverImageUpload({ initial = '' }: { initial?: string }) {
  const [url, setUrl] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    const fd = new FormData()
    fd.set('file', file)
    start(async () => {
      const res = await uploadBlogImage(fd)
      if (res.error) setError(res.error)
      else if (res.url) setUrl(res.url)
    })
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-slate-700">Cover image (optional)</span>
      {/* Persisted value the post form submits */}
      <input type="hidden" name="coverImage" value={url} />

      <div className="flex h-40 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300" style={CHECKER}>
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Cover" className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-sm text-slate-400">No cover image</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={onFile}
          disabled={pending}
          className="block text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#0A2540] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#123a63] disabled:opacity-60"
        />
        {pending ? <span className="text-xs text-slate-400">Uploading…</span> : null}
        {url ? (
          <button type="button" onClick={() => setUrl('')} className="text-sm text-slate-500 underline">Remove</button>
        ) : null}
      </div>
      <p className="text-xs text-slate-400">PNG, JPEG, WEBP or SVG · up to 5MB. Stored in Supabase Storage.</p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}

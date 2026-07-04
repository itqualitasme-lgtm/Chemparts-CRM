'use client'

import { useCallback, useRef, useState } from 'react'

// Interactive 4:3 crop + client-side compression. The user picks a file; we show
// it inside a fixed 4:3 frame with zoom + drag, then export the framed region to
// a 1200x900 JPEG (quality ~0.85) and hand the resulting File to onReady. This
// keeps uploads well under the server-action body limit AND enforces a uniform
// 4:3 catalog image.

const OUT_W = 1200
const OUT_H = 900 // 4:3
const FRAME_W = 360
const FRAME_H = 270 // 4:3 preview
const MAX_INPUT_BYTES = 15 * 1024 * 1024
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp']

type Props = {
  pending: boolean
  onReady: (file: File) => void
  onError: (msg: string | null) => void
}

export default function ImageCropUpload({ pending, onReady, onError }: Props) {
  const [src, setSrc] = useState<string | null>(null)
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [fileName, setFileName] = useState('image')
  const dragging = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Base "cover" scale so the image fills the frame at zoom = 1.
  const coverScale = nat ? Math.max(FRAME_W / nat.w, FRAME_H / nat.h) : 1
  const scale = coverScale * zoom
  const drawnW = nat ? nat.w * scale : 0
  const drawnH = nat ? nat.h * scale : 0

  const clamp = useCallback(
    (x: number, y: number) => ({
      x: Math.min(0, Math.max(FRAME_W - drawnW, x)),
      y: Math.min(0, Math.max(FRAME_H - drawnH, y)),
    }),
    [drawnW, drawnH],
  )

  function reset() {
    setSrc(null)
    setNat(null)
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    onError(null)
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED.includes(file.type)) {
      onError('Use a PNG, JPEG or WEBP image.')
      reset()
      return
    }
    if (file.size > MAX_INPUT_BYTES) {
      onError('That image is very large (over 15MB). Pick a smaller file.')
      reset()
      return
    }
    setFileName(file.name.replace(/\.[^.]+$/, '') || 'image')
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setNat({ w: img.naturalWidth, h: img.naturalHeight })
      setZoom(1)
      setOffset({ x: 0, y: 0 })
      setSrc(url)
    }
    img.onerror = () => {
      onError('Could not read that image. Try a different file.')
      reset()
    }
    img.src = url
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!src) return
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    dragging.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return
    const dx = e.clientX - dragging.current.x
    const dy = e.clientY - dragging.current.y
    setOffset(clamp(dragging.current.ox + dx, dragging.current.oy + dy))
  }
  function onPointerUp() {
    dragging.current = null
  }

  function onZoom(z: number) {
    setZoom(z)
    // Re-clamp offset for the new scale on next tick via functional update.
    const newScale = coverScale * z
    const nW = nat ? nat.w * newScale : 0
    const nH = nat ? nat.h * newScale : 0
    setOffset((o) => ({
      x: Math.min(0, Math.max(FRAME_W - nW, o.x)),
      y: Math.min(0, Math.max(FRAME_H - nH, o.y)),
    }))
  }

  async function apply() {
    if (!src || !nat) return
    onError(null)
    const k = OUT_W / FRAME_W // frame → output scale factor
    const canvas = document.createElement('canvas')
    canvas.width = OUT_W
    canvas.height = OUT_H
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      onError('Your browser could not process the image.')
      return
    }
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, OUT_W, OUT_H)

    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, offset.x * k, offset.y * k, drawnW * k, drawnH * k)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            onError('Could not export the cropped image.')
            return
          }
          const out = new File([blob], `${fileName}-4x3.jpg`, { type: 'image/jpeg' })
          onReady(out)
          reset()
        },
        'image/jpeg',
        0.85,
      )
    }
    img.onerror = () => onError('Could not process the image.')
    img.src = src
  }

  if (!src) {
    return (
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={onPick}
          className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:text-slate-700"
        />
        <p className="mt-2 text-xs text-slate-400">
          PNG, JPEG or WEBP. It will be cropped to a 4:3 landscape and compressed automatically.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div
        className="relative mx-auto touch-none overflow-hidden rounded-lg border border-slate-300 bg-slate-100 select-none"
        style={{ width: FRAME_W, height: FRAME_H, cursor: 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Crop preview"
          draggable={false}
          style={{
            position: 'absolute',
            left: offset.x,
            top: offset.y,
            width: drawnW,
            height: drawnH,
            maxWidth: 'none',
          }}
        />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/60" />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500">Zoom</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => onZoom(Number(e.target.value))}
          className="flex-1"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={apply}
          disabled={pending}
          className="rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60"
        >
          {pending ? 'Uploading…' : 'Crop & upload'}
        </button>
        <button type="button" onClick={reset} disabled={pending} className="text-sm text-slate-500 underline">
          Cancel
        </button>
      </div>
      <p className="text-xs text-slate-400">Drag to reposition · zoom to fill the frame.</p>
    </div>
  )
}

'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import type { PostState } from './actions'
import CoverImageUpload from './CoverImageUpload'

type Initial = {
  title?: string
  slug?: string
  excerpt?: string
  body?: string
  coverImage?: string
  published?: boolean
}

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'

export default function PostForm({
  action,
  initial = {},
  submitLabel,
}: {
  action: (prev: PostState, formData: FormData) => Promise<PostState>
  initial?: Initial
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState<PostState, FormData>(action, {})

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Title</span>
        <input name="title" required defaultValue={initial.title} className={inputCls} />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Slug (optional)</span>
        <input name="slug" defaultValue={initial.slug} placeholder="auto-generated from title" className={inputCls} />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Excerpt (optional)</span>
        <input name="excerpt" defaultValue={initial.excerpt} placeholder="Short summary shown on the blog list" className={inputCls} />
      </label>

      <CoverImageUpload initial={initial.coverImage} />

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Body (Markdown)</span>
        <textarea name="body" required rows={18} defaultValue={initial.body} className={`${inputCls} font-mono text-[13px]`} placeholder={"# Heading\n\nParagraph text with **bold**, *italic*, [links](https://…).\n\n- bullet\n- points"} />
        <span className="mt-1 block text-xs text-slate-400"># headings · **bold** · *italic* · `code` · - lists · &gt; quotes · [links](url) · ![images](url)</span>
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="published" value="true" defaultChecked={initial.published} />
        Published (visible on the public blog)
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#0A2540] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#123a63] disabled:opacity-60"
        >
          {pending ? 'Saving…' : submitLabel}
        </button>
        <Link href="/staff/blog" className="text-sm text-slate-500 underline">Cancel</Link>
      </div>
    </form>
  )
}

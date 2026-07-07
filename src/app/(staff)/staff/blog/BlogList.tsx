'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { deletePost } from './actions'

type Row = { id: string; title: string; slug: string; published: boolean; date: string }

export default function BlogList({ posts }: { posts: Row[] }) {
  const [busy, start] = useTransition()

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
            <th className="px-4 py-2.5 font-medium">Title</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium">Date</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-2.5 font-medium text-slate-800">
                <Link href={`/staff/blog/${p.id}`} className="hover:underline">{p.title}</Link>
              </td>
              <td className="px-4 py-2.5">
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${p.published ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                  {p.published ? 'Published' : 'Draft'}
                </span>
              </td>
              <td className="px-4 py-2.5 whitespace-nowrap text-slate-500">{p.date}</td>
              <td className="px-4 py-2.5 text-right">
                {p.published ? (
                  <a href={`/blog/${p.slug}`} target="_blank" rel="noopener" className="mr-3 text-sm text-[#0E7490] underline">View</a>
                ) : null}
                <Link href={`/staff/blog/${p.id}`} className="mr-3 text-sm text-slate-500 underline">Edit</Link>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => { if (confirm(`Delete "${p.title}"?`)) start(() => deletePost(p.id)) }}
                  className="text-sm text-slate-500 underline hover:text-red-600 disabled:opacity-60"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {posts.length === 0 && (
            <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No posts yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

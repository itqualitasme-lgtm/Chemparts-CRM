'use client'

import { useState } from 'react'

export type ContactRow = {
  name: string
  designation: string
  email: string
  phone: string
  isPrimary: boolean
}

const empty = (): ContactRow => ({ name: '', designation: '', email: '', phone: '', isPrimary: false })

const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'

export default function ContactPersonsEditor({ initial }: { initial?: ContactRow[] }) {
  const [rows, setRows] = useState<ContactRow[]>(initial && initial.length ? initial : [empty()])

  function update(i: number, patch: Partial<ContactRow>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }
  function setPrimary(i: number) {
    setRows((rs) => rs.map((r, idx) => ({ ...r, isPrimary: idx === i })))
  }
  function add() {
    setRows((rs) => [...rs, empty()])
  }
  function remove(i: number) {
    setRows((rs) => (rs.length === 1 ? [empty()] : rs.filter((_, idx) => idx !== i)))
  }

  // Only rows with a name are submitted.
  const payload = JSON.stringify(rows.filter((r) => r.name.trim()))

  return (
    <div className="space-y-3">
      <input type="hidden" name="contactsJson" value={payload} />
      {rows.map((r, i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              className={inputCls}
              placeholder="Contact name"
              value={r.name}
              onChange={(e) => update(i, { name: e.target.value })}
            />
            <input
              className={inputCls}
              placeholder="Designation (e.g. Lab Manager)"
              value={r.designation}
              onChange={(e) => update(i, { designation: e.target.value })}
            />
            <input
              className={inputCls}
              type="email"
              placeholder="Email"
              value={r.email}
              onChange={(e) => update(i, { email: e.target.value })}
            />
            <input
              className={inputCls}
              placeholder="Phone"
              value={r.phone}
              onChange={(e) => update(i, { phone: e.target.value })}
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="radio"
                name="primaryContact"
                checked={r.isPrimary}
                onChange={() => setPrimary(i)}
                className="h-4 w-4"
              />
              Primary contact
            </label>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-sm text-slate-500 underline hover:text-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        + Add contact person
      </button>
    </div>
  )
}

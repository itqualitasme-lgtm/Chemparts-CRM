'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import Pager, { pageSlice } from '@/components/ui/Pager'
import { setUserStatus, setUserRole } from './actions'

export type UserRow = {
  id: string
  email: string
  fullName: string
  phone: string | null
  role: string
  status: string
  org: string | null
  createdAt: string
}

const ROLES = ['ADMIN', 'STAFF', 'CUSTOMER', 'VENDOR']

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  ACTIVE: 'bg-green-100 text-green-800',
  DISABLED: 'bg-rose-100 text-rose-700',
}

const selectCls =
  'rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 focus:border-[#0A2540] focus:outline-none focus:ring-2 focus:ring-[#0A2540]/20'
const PAGE_SIZE = 20

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function UsersTable({ rows, selfId }: { rows: UserRow[]; selfId: string }) {
  const [q, setQ] = useState('')
  const [role, setRole] = useState('ALL')
  const [status, setStatus] = useState('ALL')
  const [page, setPage] = useState(1)
  useEffect(() => setPage(1), [q, role, status])

  const filtered = useMemo(() => {
    let r = rows
    if (role !== 'ALL') r = r.filter((x) => x.role === role)
    if (status !== 'ALL') r = r.filter((x) => x.status === status)
    const s = q.trim().toLowerCase()
    if (s) r = r.filter((x) => [x.fullName, x.email, x.org ?? ''].join(' ').toLowerCase().includes(s))
    return r
  }, [rows, q, role, status])

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, company…" className={`${selectCls} min-w-0 flex-1`} />
        <select value={role} onChange={(e) => setRole(e.target.value)} className={selectCls} aria-label="Filter by role">
          <option value="ALL">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls} aria-label="Filter by status">
          <option value="ALL">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="DISABLED">Disabled</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2 font-medium">User</th>
              <th className="px-3 py-2 font-medium">Organisation</th>
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Joined</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-10 text-center text-slate-500">No users match these filters.</td></tr>
            ) : (
              pageSlice(filtered, page, PAGE_SIZE).map((u) => <Row key={u.id} u={u} isSelf={u.id === selfId} />)
            )}
          </tbody>
        </table>
      </div>
      <Pager page={page} pageSize={PAGE_SIZE} total={filtered.length} onPage={setPage} />
    </div>
  )
}

function Row({ u, isSelf }: { u: UserRow; isSelf: boolean }) {
  const [role, setRoleLocal] = useState(u.role)
  const [status, setStatusLocal] = useState(u.status)
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  function changeStatus(next: string) {
    const prev = status
    setStatusLocal(next)
    setMsg(null)
    start(async () => {
      const res = await setUserStatus(u.id, next)
      if (res.error) { setStatusLocal(prev); setMsg(res.error) }
    })
  }

  function changeRole(next: string) {
    const prev = role
    setRoleLocal(next)
    setMsg(null)
    start(async () => {
      const res = await setUserRole(u.id, next)
      if (res.error) { setRoleLocal(prev); setMsg(res.error) }
    })
  }

  return (
    <tr className="border-b border-slate-100 last:border-0 align-middle">
      <td className="px-3 py-3">
        <div className="font-medium text-slate-800">{u.fullName}{isSelf ? <span className="ml-1 text-xs text-slate-400">(you)</span> : null}</div>
        <div className="text-xs text-slate-500">{u.email}</div>
      </td>
      <td className="px-3 py-3 text-slate-600">{u.org ?? <span className="text-slate-300"></span>}</td>
      <td className="px-3 py-3">
        {isSelf ? (
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{role}</span>
        ) : (
          <select value={role} disabled={pending} onChange={(e) => changeRole(e.target.value)} className={selectCls} aria-label={`Role for ${u.fullName}`}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        )}
      </td>
      <td className="px-3 py-3">
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[status] ?? 'bg-slate-100 text-slate-600'}`}>{status}</span>
        {msg ? <div className="mt-1 text-xs text-rose-600">{msg}</div> : null}
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-xs text-slate-500">{fmtDate(u.createdAt)}</td>
      <td className="px-3 py-3 text-right">
        {isSelf ? (
          <span className="text-xs text-slate-300"></span>
        ) : (
          <div className="flex flex-wrap justify-end gap-1.5">
            {status === 'PENDING' && (
              <button type="button" disabled={pending} onClick={() => changeStatus('ACTIVE')} className="rounded-lg bg-green-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-green-700 disabled:opacity-50">
                Approve
              </button>
            )}
            {status === 'ACTIVE' && (
              <button type="button" disabled={pending} onClick={() => changeStatus('DISABLED')} className="rounded-lg border border-rose-300 px-2.5 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-50">
                Disable
              </button>
            )}
            {status === 'DISABLED' && (
              <button type="button" disabled={pending} onClick={() => changeStatus('ACTIVE')} className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50">
                Re-enable
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  )
}

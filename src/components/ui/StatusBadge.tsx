// One canonical status badge for all portal entities (enquiries, quotations,
// orders, price/service requests). Colours by status name.
const MAP: Record<string, string> = {
  // fresh / needs attention
  NEW: 'bg-amber-100 text-amber-800',
  OPEN: 'bg-amber-100 text-amber-800',
  DRAFT: 'bg-slate-100 text-slate-600',
  PENDING: 'bg-amber-100 text-amber-800',
  // in progress
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  SENT: 'bg-indigo-100 text-indigo-800',
  QUOTED: 'bg-indigo-100 text-indigo-800',
  // won / done
  WON: 'bg-green-100 text-green-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-green-100 text-green-800',
  // closed / lost
  LOST: 'bg-slate-200 text-slate-600',
  REJECTED: 'bg-rose-100 text-rose-700',
  EXPIRED: 'bg-slate-200 text-slate-600',
  CLOSED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-rose-100 text-rose-700',
  SPAM: 'bg-rose-100 text-rose-700',
}

export default function StatusBadge({ status, className = '' }: { status: string; className?: string }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${MAP[status] ?? 'bg-slate-100 text-slate-600'} ${className}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

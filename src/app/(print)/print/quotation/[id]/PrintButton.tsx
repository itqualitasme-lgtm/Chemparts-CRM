'use client'

export default function PrintButton() {
  return (
    <div className="mx-auto flex max-w-[820px] items-center justify-between px-4 py-4 print:hidden">
      <a href="javascript:history.back()" className="text-sm text-slate-600 underline">← Back</a>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg bg-[#0A2540] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#123a63]"
      >
        Print / Save as PDF
      </button>
    </div>
  )
}

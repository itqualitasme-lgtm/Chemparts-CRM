'use client'

import Link from 'next/link'

// Portal header logo. Clicking it leaves the portal for the public website, so
// confirm first to avoid accidental exits.
export default function PortalLogoLink({ label }: { label: string }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5"
      aria-label="Chemparts — home"
      onClick={(e) => {
        if (!window.confirm('Leave the portal and open the public website home page?')) {
          e.preventDefault()
        }
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/images/logo.svg" alt="Chemparts" width={40} height={20} className="h-5 w-auto" />
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-bold tracking-[0.2em]">CHEMPARTS</span>
        <span className="text-[10px] uppercase tracking-wide text-slate-300">{label}</span>
      </span>
    </Link>
  )
}

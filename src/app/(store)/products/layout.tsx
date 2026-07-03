import Link from 'next/link'
import { getSessionUser } from '@/lib/auth/session'
import { homePathFor } from '@/lib/auth/rbac'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0A2540] text-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-bold tracking-[0.2em]">
              CHEMPARTS
            </Link>
            <nav className="flex items-center gap-4 text-sm text-slate-200">
              <Link href="/products" className="hover:text-white">
                Products
              </Link>
              <a href="https://chemparts-me.com" className="hidden hover:text-white sm:block">
                Main website
              </a>
            </nav>
          </div>
          {user ? (
            <Link
              href={homePathFor(user.role)}
              className="rounded border border-white/30 px-3 py-1 text-xs text-slate-100 transition hover:bg-white/10"
            >
              My account
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded border border-white/30 px-3 py-1 text-xs text-slate-100 transition hover:bg-white/10"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded bg-white px-3 py-1 text-xs font-medium text-[#0A2540] transition hover:bg-slate-200"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </header>
      {children}
    </div>
  )
}

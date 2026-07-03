'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { logout } from '@/app/(auth)/actions'

export type HeaderUser = {
  firstName: string
  initials: string
  dashboardPath: string
}

type NavItem = { label: string; href: string }

const NAV: NavItem[] = [
  { label: 'Products', href: '/products' },
  { label: 'Services', href: '/services' },
  { label: 'Industries', href: '/industries' },
  { label: 'Resources', href: '/resources' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const teal = 'text-[#0E7490]'

/** Solidify-on-scroll shell + interactive islands (mobile drawer, avatar menu). */
export function HeaderClient({ user }: { user: HeaderUser | null }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!avatarOpen) return
    const onClick = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [avatarOpen])

  return (
    <header
      className={[
        'sticky top-0 z-50 w-full transition-shadow duration-300',
        scrolled ? 'shadow-[0_1px_0_rgba(10,37,64,0.08),0_8px_24px_-16px_rgba(10,37,64,0.35)]' : '',
      ].join(' ')}
    >
      {/* Utility bar */}
      <div className="w-full bg-[#0A2540] text-white">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-6 py-2 text-xs">
          <span className="text-white/70">
            Chemparts Middle East FZC · UAE
          </span>
          <div className="flex items-center gap-4">
            {user ? (
              <div ref={avatarRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAvatarOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full py-0.5 pl-0.5 pr-2 transition hover:bg-white/10"
                  aria-haspopup="menu"
                  aria-expanded={avatarOpen}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0E7490] text-[11px] font-semibold text-white">
                    {user.initials}
                  </span>
                  <span className="hidden sm:inline">{user.firstName}</span>
                </button>
                {avatarOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-lg border border-black/5 bg-white py-1 text-[#0A2540] shadow-lg"
                  >
                    <Link
                      href={user.dashboardPath}
                      role="menuitem"
                      onClick={() => setAvatarOpen(false)}
                      className="block px-4 py-2 text-sm transition hover:bg-[#F4F6F8]"
                    >
                      My account
                    </Link>
                    <form action={logout}>
                      <button
                        type="submit"
                        role="menuitem"
                        className="block w-full px-4 py-2 text-left text-sm transition hover:bg-[#F4F6F8]"
                      >
                        Sign out
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-white/80 transition hover:text-white">
                  Sign in
                </Link>
                <Link href="/register" className="text-white/80 transition hover:text-white">
                  Register
                </Link>
              </>
            )}
            <Link
              href="/products"
              className="rounded-md bg-[#0E7490] px-3 py-1.5 font-medium text-white transition hover:bg-[#0b5e75]"
            >
              Request a Quote
            </Link>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={[
          'w-full border-b transition-colors duration-300',
          scrolled
            ? 'border-black/5 bg-white/95 backdrop-blur'
            : 'border-transparent bg-white',
        ].join(' ')}
      >
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-6 py-4">
          {/* Logo + wordmark */}
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/images/logo.svg" alt="Chemparts" width={40} height={20} className="h-8 w-auto" />
            <span className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-tight text-[#0A2540]">CHEMPARTS</span>
              <span className="text-[10px] font-semibold tracking-[0.28em] text-[#5B6670]">
                MIDDLE EAST
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-[#0A2540] transition hover:text-[#0E7490]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Search"
              className="hidden h-9 w-9 items-center justify-center rounded-md text-[#5B6670] transition hover:bg-[#F4F6F8] hover:text-[#0A2540] lg:flex"
            >
              <SearchIcon />
            </button>
            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label="Menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-[#0A2540] transition hover:bg-[#F4F6F8] lg:hidden"
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={[
            'overflow-hidden border-t border-black/5 bg-white transition-[max-height] duration-300 ease-out lg:hidden',
            menuOpen ? 'max-h-96' : 'max-h-0',
          ].join(' ')}
        >
          <nav className="mx-auto flex w-full max-w-screen-2xl flex-col px-6 py-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-black/5 py-3 text-sm font-medium text-[#0A2540] transition hover:text-[#0E7490] last:border-b-0"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" strokeLinecap="round" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}

export { teal }

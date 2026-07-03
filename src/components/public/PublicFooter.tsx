import Link from 'next/link'

type Col = { title: string; links: { label: string; href: string }[] }

const COLUMNS: Col[] = [
  {
    title: 'Products',
    links: [
      { label: 'Instruments', href: '/products?type=EQUIPMENT' },
      { label: 'Consumables', href: '/products?type=CONSUMABLE' },
      { label: 'Spare Parts', href: '/products?type=SPARE_PART' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Testing', href: '/services' },
      { label: 'AMC', href: '/services' },
      { label: 'Calibration', href: '/services' },
      { label: 'Repair', href: '/services' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Partners', href: '/products' },
      { label: 'Contact', href: '/contact' },
    ],
  },
]

/** Rich multi-column marketing footer (navy). */
export function PublicFooter() {
  return (
    <footer className="w-full bg-[#0A2540] text-white">
      <div className="mx-auto w-full max-w-screen-2xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand block */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <img src="/images/logo.svg" alt="Chemparts" width={44} height={22} className="h-9 w-auto" />
              <span className="flex flex-col leading-none">
                <span className="text-xl font-bold tracking-tight">CHEMPARTS</span>
                <span className="text-[10px] font-semibold tracking-[0.28em] text-white/60">
                  MIDDLE EAST
                </span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              Analytical instruments, laboratory consumables and OEM spare parts — sold, installed
              and serviced across the Gulf since 2003.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition hover:text-[#0E7490]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact block */}
          <div>
            <h3 className="text-sm font-semibold">Contact</h3>
            <address className="mt-4 space-y-2.5 text-sm not-italic text-white/70">
              <p>SAIF Zone, Sharjah, United Arab Emirates</p>
              <p>
                <a href="tel:+97165574047" className="transition hover:text-[#0E7490]">
                  +971-6-5574047
                </a>
              </p>
              <p>
                <a href="mailto:info@chemparts-me.com" className="transition hover:text-[#0E7490]">
                  info@chemparts-me.com
                </a>
              </p>
            </address>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-start justify-between gap-2 px-6 py-6 text-xs text-white/50 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Chemparts Middle East FZC. All rights reserved.</p>
          <p className="font-medium tracking-wide text-white/60">Since 2003</p>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter

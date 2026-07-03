import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#0A2540] text-white">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-sm font-bold tracking-[0.25em]">CHEMPARTS</span>
        <a
          href="https://chemparts-me.com"
          className="text-xs text-slate-300 underline-offset-4 hover:underline"
        >
          chemparts-me.com
        </a>
      </header>

      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 pb-24">
        <p className="mb-3 text-xs font-semibold tracking-[0.3em] text-sky-300">
          STORE &amp; CUSTOMER PORTAL
        </p>
        <h1 className="mb-4 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
          Instruments, spare parts and consumables — quoted, ordered and tracked online.
        </h1>
        <p className="mb-10 max-w-xl text-slate-300">
          Chemparts Middle East FZC · analytical instruments and laboratory supplies across the
          Gulf since 2003.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/products"
            className="rounded-lg bg-sky-400 px-5 py-3 text-sm font-medium text-[#0A2540] transition hover:bg-sky-300"
          >
            Browse products
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-[#0A2540] transition hover:bg-slate-200"
          >
            Customer sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-white/40 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Create account
          </Link>
        </div>

        <div className="mt-16 flex gap-6 text-xs text-slate-400">
          <Link href="/staff/login" className="hover:text-white">
            Staff sign in
          </Link>
          <Link href="/vendor/login" className="hover:text-white">
            Vendor sign in
          </Link>
        </div>
      </section>
    </main>
  )
}

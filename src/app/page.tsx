import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { PublicHeader } from '@/components/public/PublicHeader'
import { PublicFooter } from '@/components/public/PublicFooter'
import { Section } from '@/components/ui/Section'
import { Reveal } from '@/components/ui/Reveal'

export const dynamic = 'force-dynamic'

type Category = {
  title: string
  blurb: string
  href: string
  icon: React.ReactNode
}

const CATEGORIES: Category[] = [
  {
    title: 'Analytical Instruments',
    blurb:
      'Spectrometers, petroleum testers, calorimeters and material analysers from the world’s leading makers.',
    href: '/products?type=EQUIPMENT',
    icon: <InstrumentIcon />,
  },
  {
    title: 'Lab Consumables',
    blurb:
      'Reagents, reference standards, glassware and everyday laboratory supplies kept in regional stock.',
    href: '/products?type=CONSUMABLE',
    icon: <ConsumableIcon />,
  },
  {
    title: 'OEM Spare Parts',
    blurb:
      'Genuine spares and wear parts matched to your instruments, with fast Gulf-wide fulfilment.',
    href: '/products?type=SPARE_PART',
    icon: <SpareIcon />,
  },
]

type Service = { title: string; blurb: string; icon: React.ReactNode }

const SERVICES: Service[] = [
  {
    title: 'Testing',
    blurb: 'Laboratory and on-site analytical testing to recognised international standards.',
    icon: <TestingIcon />,
  },
  {
    title: 'AMC',
    blurb: 'Annual Maintenance Contracts that keep your instruments accurate and uptime high.',
    icon: <AmcIcon />,
  },
  {
    title: 'Installation & Calibration',
    blurb: 'Factory-trained commissioning and traceable calibration at your facility.',
    icon: <CalibrationIcon />,
  },
  {
    title: 'Repair',
    blurb: 'Diagnosis and repair of instruments with genuine OEM parts and regional support.',
    icon: <RepairIcon />,
  },
]

type Industry = { title: string; id: string; icon: React.ReactNode }

const INDUSTRIES: Industry[] = [
  { title: 'Petroleum', id: 'petroleum', icon: <PetroleumIcon /> },
  { title: 'Refineries', id: 'refineries', icon: <RefineryIcon /> },
  { title: 'Environmental', id: 'environmental', icon: <EnvironmentalIcon /> },
  { title: 'Plastics', id: 'plastics', icon: <PlasticsIcon /> },
  { title: 'Materials', id: 'materials', icon: <MaterialsIcon /> },
  { title: 'Food & Water', id: 'food', icon: <FoodIcon /> },
]

export default async function HomePage() {
  const [productCount, brandCount, brands] = await Promise.all([
    db.product.count({ where: { active: true } }),
    db.brand.count(),
    db.brand.findMany({
      where: { logo: { not: null } },
      select: {
        name: true,
        slug: true,
        logo: true,
        countryOfOrigin: true,
        focus: true,
        partnerSince: true,
      },
      orderBy: { featured: 'desc' },
    }),
  ])

  return (
    <>
      <PublicHeader />

      <main className="flex-1">
        {/* a. Hero */}
        <Section dark className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="relative">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/60">
                Chemparts Middle East · Since 2003
              </p>
              <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                Analytical instruments, lab consumables &amp; spare parts — sold, installed and
                serviced across the Gulf.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">
                An authorized partner of the world’s leading instrument makers, delivering supply,
                installation, calibration and service to laboratories across the region since 2003.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="rounded-md bg-[#0E7490] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0b5e75]"
                >
                  Browse products
                </Link>
                <Link
                  href="/products"
                  className="rounded-md border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Request a quote
                </Link>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* b. In-numbers trust bar */}
        <section className="w-full border-b border-black/5 bg-white">
          <div className="mx-auto w-full max-w-screen-2xl px-6 py-10">
            <dl className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <Stat value="Since 2003" label="Serving Gulf laboratories" />
              <Stat value={`${brandCount} brand partners`} label="Authorized representation" />
              <Stat value={`${productCount}+ instruments`} label="Catalogued & supported" />
              <Stat
                value="Authorized partner"
                label="Hitachi · Tanaka · Oxford Instruments"
              />
            </dl>
          </div>
        </section>

        {/* c. Product categories */}
        <Section>
          <Reveal>
            <SectionHeading
              eyebrow="What we supply"
              title="Everything your laboratory runs on"
              subtitle="From capital instruments to the consumables and genuine spares that keep them running."
            />
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {CATEGORIES.map((cat, i) => (
              <Reveal key={cat.title} delay={i * 80}>
                <Link
                  href={cat.href}
                  className="group flex h-full flex-col rounded-2xl border border-black/5 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#0E7490]/30 hover:shadow-xl"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0E7490]/10 text-[#0E7490]">
                    {cat.icon}
                  </span>
                  <h3 className="mt-6 text-xl font-semibold text-[#0A2540]">{cat.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-[#5B6670]">{cat.blurb}</p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0E7490]">
                    Explore
                    <ArrowIcon />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* d. Services */}
        <Section tint>
          <Reveal>
            <SectionHeading
              eyebrow="Services"
              title="Supported for the full instrument lifecycle"
              subtitle="Our Gulf-based engineers back every sale with installation, calibration and ongoing service."
            />
          </Reveal>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((svc, i) => (
              <Reveal key={svc.title} delay={i * 80}>
                <Link
                  href="/services"
                  className="group flex h-full flex-col rounded-2xl border-l-4 border-[#0E7490] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <span className="text-[#0E7490]">{svc.icon}</span>
                  <h3 className="mt-5 text-lg font-semibold text-[#0A2540]">{svc.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5B6670]">{svc.blurb}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* e. Authorized partners wall */}
        <Section>
          <Reveal>
            <SectionHeading
              eyebrow="Authorized partnerships"
              title="Authorized partner of the world’s leading instrument makers"
              subtitle="We represent, install and service the brands trusted by petroleum, materials and environmental laboratories."
            />
          </Reveal>
          {brands.length > 0 ? (
            <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
              {brands.map((brand, i) => (
                <Reveal key={brand.slug || brand.name} delay={Math.min(i, 8) * 40}>
                  <div className="flex h-full flex-col items-center justify-center rounded-xl border border-black/5 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="relative flex h-16 w-full items-center justify-center">
                      <Image
                        src={brand.logo as string}
                        alt={brand.name}
                        fill
                        sizes="(max-width: 640px) 40vw, (max-width: 1536px) 20vw, 220px"
                        className="object-contain p-1"
                      />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-[#0A2540]">{brand.name}</p>
                    {brand.countryOfOrigin && (
                      <p className="mt-1 text-xs text-[#5B6670]">{brand.countryOfOrigin}</p>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="mt-10 text-sm text-[#5B6670]">Partner brands are being added.</p>
          )}
        </Section>

        {/* f. Industries */}
        <Section tint>
          <Reveal>
            <SectionHeading
              eyebrow="Industries"
              title="Trusted where accuracy matters most"
              subtitle="Purpose-built solutions for the sectors that depend on precise measurement."
            />
          </Reveal>
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {INDUSTRIES.map((ind, i) => (
              <Reveal key={ind.id} delay={Math.min(i, 6) * 60}>
                <Link
                  href={`/products?industry=${ind.id}`}
                  className="group flex h-full flex-col items-center gap-4 rounded-2xl border border-black/5 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#0E7490]/30 hover:shadow-xl"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A2540]/5 text-[#0A2540] transition group-hover:bg-[#0E7490]/10 group-hover:text-[#0E7490]">
                    {ind.icon}
                  </span>
                  <span className="text-sm font-semibold text-[#0A2540]">{ind.title}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* g. CTA band */}
        <Section dark>
          <Reveal className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                Need a quote or a service visit? Talk to our Gulf team.
              </h2>
              <p className="mt-4 max-w-xl text-white/70">
                Tell us what your laboratory needs — instruments, consumables, spares or service —
                and we’ll respond fast.
              </p>
            </div>
            <Link
              href="/products"
              className="shrink-0 rounded-md bg-[#0E7490] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#0b5e75]"
            >
              Request a quote
            </Link>
          </Reveal>
        </Section>
      </main>

      <PublicFooter />
    </>
  )
}

/* ---------- Presentational helpers ---------- */

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="text-xl font-bold tracking-tight text-[#0A2540] md:text-2xl">{value}</dt>
      <dd className="mt-1 text-sm text-[#5B6670]">{label}</dd>
    </div>
  )
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#0E7490]">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-[#0A2540] md:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-lg leading-relaxed text-[#5B6670]">{subtitle}</p>}
    </div>
  )
}

/* ---------- Inline icons ---------- */

function iconProps() {
  return {
    className: 'h-6 w-6',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
}

function InstrumentIcon() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps()}>
      <path d="M9 3v6l-4 8a2 2 0 0 0 1.8 2.9h10.4A2 2 0 0 0 19 17l-4-8V3" />
      <path d="M8 3h8M7.5 13h9" />
    </svg>
  )
}

function ConsumableIcon() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps()}>
      <path d="M8 2h8M10 2v5l-3.5 10A2.5 2.5 0 0 0 8.9 21h6.2a2.5 2.5 0 0 0 2.4-3.9L14 7V2" />
      <path d="M7.5 15h9" />
    </svg>
  )
}

function SpareIcon() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps()}>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.2A1.6 1.6 0 0 0 7 19.5l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4.5 14H4a2 2 0 1 1 0-4h.2A1.6 1.6 0 0 0 5.6 7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 11 4.5V4a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8" />
    </svg>
  )
}

function TestingIcon() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps()}>
      <path d="M9 3v7l-5 8a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3l-5-8V3" />
      <path d="M8 3h8" />
      <circle cx="12" cy="16" r="1" />
    </svg>
  )
}

function AmcIcon() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps()}>
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
      <circle cx="12" cy="12" r="4" />
      <path d="m9 12 2 2 3-4" />
    </svg>
  )
}

function CalibrationIcon() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps()}>
      <path d="M12 3a9 9 0 1 0 9 9" />
      <path d="M12 12 16 8" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  )
}

function RepairIcon() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps()}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.2l-6 6a2 2 0 1 0 2.8 2.8l6-6a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.4-.4-2.4 2.8-2.4Z" />
    </svg>
  )
}

function PetroleumIcon() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps()}>
      <path d="M12 3s5 5.5 5 10a5 5 0 0 1-10 0c0-4.5 5-10 5-10Z" />
    </svg>
  )
}

function RefineryIcon() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps()}>
      <path d="M3 21V10l4 3V10l4 3V7l4 3V4l6 4v13H3Z" />
      <path d="M3 21h18" />
    </svg>
  )
}

function EnvironmentalIcon() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps()}>
      <path d="M12 21c5-2 8-6 8-11V5l-8-2-8 2v5c0 5 3 9 8 11Z" />
      <path d="M12 8v6M9 11h6" />
    </svg>
  )
}

function PlasticsIcon() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps()}>
      <path d="M7 3h10l-1 4H8L7 3ZM8 7c-2 3-3 7-3 10a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4c0-3-1-7-3-10" />
    </svg>
  )
}

function MaterialsIcon() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps()}>
      <path d="M12 2 3 7l9 5 9-5-9-5ZM3 12l9 5 9-5M3 17l9 5 9-5" />
    </svg>
  )
}

function FoodIcon() {
  return (
    <svg viewBox="0 0 24 24" {...iconProps()}>
      <path d="M6 3v7a3 3 0 0 0 6 0V3M9 3v18M17 3c-1.5 1-2 3-2 6s.5 4 2 4v8" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

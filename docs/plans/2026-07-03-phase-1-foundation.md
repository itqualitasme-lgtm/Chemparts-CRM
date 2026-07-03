# Phase 1 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Chemparts CRM Next.js app with Supabase auth, role-based portals (store/staff/vendor/admin), customer self-registration, Prisma schema for Phase 1 entities, and a templated noreply email service.

**Architecture:** One Next.js 15 App Router monolith with four route groups — `(store)`, `(staff)`, `(vendor)`, `(admin)` — sharing a Supabase Postgres database accessed via Prisma (pooled, port 6543). Supabase Auth handles credentials + email verification; a `profiles` table carries the role (`ADMIN | STAFF | CUSTOMER | VENDOR`) and each route-group layout enforces RBAC server-side. Nodemailer sends templated mail through `noreply@chemparts-me.com`, logged to `EmailLog`.

**Tech Stack:** Next.js 15 (App Router, TypeScript, Tailwind v4), Supabase (`@supabase/ssr`, `@supabase/supabase-js`), Prisma, Zod, Nodemailer, Vitest.

**Spec:** `docs/specs/2026-07-03-chemparts-crm-design.md`

---

### Task 1: Scaffold Next.js app

**Files:**
- Create: entire app skeleton at repo root (create-next-app writes into existing dir)

- [ ] **Step 1: Scaffold**

```powershell
cd "C:\Projects\CHEMPARTS CRM"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

Expected: `src/app/page.tsx`, `package.json`, `next.config.ts` created. (If it refuses because dir is non-empty, scaffold into a temp dir and move files in, keeping our README/docs/.gitignore.)

- [ ] **Step 2: Verify dev server boots**

Run: `npm run dev` briefly → expect `Ready` on http://localhost:3000. Stop it.

- [ ] **Step 3: Merge .gitignore** (keep our entries: `.env`, `uploads/`, plus Next's defaults) and restore README.md if overwritten.

- [ ] **Step 4: Commit**

```powershell
git add -A; git commit -m "chore: scaffold Next.js 15 app (TS, Tailwind, App Router)"
```

### Task 2: Install dependencies + Vitest setup

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install**

```powershell
npm install @supabase/supabase-js @supabase/ssr prisma @prisma/client zod nodemailer
npm install -D vitest @types/nodemailer tsx dotenv
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: { include: ['src/**/*.test.ts'] },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
})
```

- [ ] **Step 3: Add script** `"test": "vitest run"` to package.json scripts.

- [ ] **Step 4: Commit** — `git add -A; git commit -m "chore: add supabase, prisma, zod, nodemailer, vitest"`

### Task 3: Prisma schema (Phase 1 entities)

**Files:**
- Create: `prisma/schema.prisma`
- Create: `.env.example`
- Create: `src/lib/db.ts`

- [ ] **Step 1: Write `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Supavisor pooled, port 6543, pgbouncer=true
  directUrl = env("DIRECT_URL")        // direct, port 5432, for migrations
}

enum Role {
  ADMIN
  STAFF
  CUSTOMER
  VENDOR
}

enum UserStatus {
  PENDING
  ACTIVE
  DISABLED
}

model Profile {
  id        String     @id @db.Uuid // = auth.users.id
  email     String     @unique
  fullName  String
  phone     String?
  role      Role
  status    UserStatus @default(ACTIVE)
  customer  Customer?  @relation(fields: [customerId], references: [id])
  customerId String?
  vendor    Vendor?    @relation(fields: [vendorId], references: [id])
  vendorId  String?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model Customer {
  id          String    @id @default(cuid())
  companyName String
  country     String // ISO 3166-1 alpha-2
  city        String?
  address     String?
  trn         String? // VAT/TRN number
  industry    String?
  source      String    @default("SELF") // SELF | STAFF
  notes       String?
  profiles    Profile[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Vendor {
  id           String    @id @default(cuid())
  companyName  String
  country      String
  currency     String    @default("USD")
  paymentTerms String?
  bankDetails  String?
  profiles     Profile[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Setting {
  key       String   @id
  value     Json
  updatedAt DateTime @updatedAt
}

model EmailLog {
  id        String   @id @default(cuid())
  to        String
  subject   String
  template  String
  status    String   @default("SENT") // SENT | FAILED
  error     String?
  createdAt DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(cuid())
  actorId   String?
  action    String
  entity    String
  entityId  String?
  detail    Json?
  createdAt DateTime @default(now())
}
```

- [ ] **Step 2: Write `.env.example`**

```bash
# Supabase (Dashboard → Settings → API / Database)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres.YOUR-PROJECT:PASSWORD@aws-0-me-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.YOUR-PROJECT:PASSWORD@aws-0-me-central-1.pooler.supabase.com:5432/postgres

# SMTP (noreply@chemparts-me.com)
SMTP_HOST=mail.chemparts-me.com
SMTP_PORT=465
SMTP_USER=noreply@chemparts-me.com
SMTP_PASS=changeme
MAIL_FROM="Chemparts Middle East <noreply@chemparts-me.com>"

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_SEED_EMAIL=razinahmedv@gmail.com
ADMIN_SEED_PASSWORD=changeme-strong
```

- [ ] **Step 3: Write `src/lib/db.ts`** (singleton Prisma client)

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

- [ ] **Step 4: Validate & generate** — `npx prisma validate; npx prisma generate` → expect "schema valid". (Migration `npx prisma migrate dev --name init` runs once Supabase creds exist in `.env`.)

- [ ] **Step 5: Commit** — `git commit -m "feat: Prisma schema for profiles, customers, vendors, settings, logs"`

### Task 4: RBAC core (pure, tested)

**Files:**
- Create: `src/lib/auth/rbac.ts`
- Test: `src/lib/auth/rbac.test.ts`

- [ ] **Step 1: Write the failing test `src/lib/auth/rbac.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { canAccessPortal, homePathFor, portalFromPath } from './rbac'

describe('portalFromPath', () => {
  it('maps paths to portals', () => {
    expect(portalFromPath('/staff/quotes')).toBe('staff')
    expect(portalFromPath('/admin')).toBe('admin')
    expect(portalFromPath('/vendor/bills')).toBe('vendor')
    expect(portalFromPath('/account/orders')).toBe('store')
    expect(portalFromPath('/products')).toBe(null) // public
  })
})

describe('canAccessPortal', () => {
  it('admin can access every portal', () => {
    for (const p of ['store', 'staff', 'vendor', 'admin'] as const)
      expect(canAccessPortal('ADMIN', p)).toBe(true)
  })
  it('staff can access staff but not admin or vendor', () => {
    expect(canAccessPortal('STAFF', 'staff')).toBe(true)
    expect(canAccessPortal('STAFF', 'admin')).toBe(false)
    expect(canAccessPortal('STAFF', 'vendor')).toBe(false)
  })
  it('customer only store, vendor only vendor', () => {
    expect(canAccessPortal('CUSTOMER', 'store')).toBe(true)
    expect(canAccessPortal('CUSTOMER', 'staff')).toBe(false)
    expect(canAccessPortal('VENDOR', 'vendor')).toBe(true)
    expect(canAccessPortal('VENDOR', 'store')).toBe(false)
  })
})

describe('homePathFor', () => {
  it('routes each role to its dashboard', () => {
    expect(homePathFor('ADMIN')).toBe('/admin')
    expect(homePathFor('STAFF')).toBe('/staff')
    expect(homePathFor('VENDOR')).toBe('/vendor')
    expect(homePathFor('CUSTOMER')).toBe('/account')
  })
})
```

- [ ] **Step 2: Run** `npm test` → expect FAIL (module not found).

- [ ] **Step 3: Implement `src/lib/auth/rbac.ts`**

```ts
export type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER' | 'VENDOR'
export type Portal = 'store' | 'staff' | 'vendor' | 'admin'

/** Protected-path prefixes → portal. Public store pages return null. */
export function portalFromPath(pathname: string): Portal | null {
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return 'admin'
  if (pathname === '/staff' || pathname.startsWith('/staff/')) return 'staff'
  if (pathname === '/vendor' || pathname.startsWith('/vendor/')) return 'vendor'
  if (pathname === '/account' || pathname.startsWith('/account/')) return 'store'
  return null
}

const ACCESS: Record<Role, Portal[]> = {
  ADMIN: ['store', 'staff', 'vendor', 'admin'],
  STAFF: ['store', 'staff'],
  CUSTOMER: ['store'],
  VENDOR: ['vendor'],
}

export function canAccessPortal(role: Role, portal: Portal): boolean {
  return ACCESS[role].includes(portal)
}

export function homePathFor(role: Role): string {
  return { ADMIN: '/admin', STAFF: '/staff', VENDOR: '/vendor', CUSTOMER: '/account' }[role]
}
```

- [ ] **Step 4: Run** `npm test` → PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat: RBAC portal mapping with tests"`

### Task 5: Supabase clients + session middleware

**Files:**
- Create: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/admin.ts`, `src/middleware.ts`

- [ ] **Step 1: `src/lib/supabase/server.ts`**

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // called from a Server Component — middleware refreshes sessions instead
          }
        },
      },
    },
  )
}
```

- [ ] **Step 2: `src/lib/supabase/client.ts`**

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

- [ ] **Step 3: `src/lib/supabase/admin.ts`** (service-role, server-only)

```ts
import 'server-only'
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}
```

(`npm install server-only`.)

- [ ] **Step 4: `src/middleware.ts`** — refresh session; redirect unauthenticated users off protected paths to the right login page.

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { portalFromPath } from '@/lib/auth/rbac'

const LOGIN: Record<string, string> = {
  store: '/login',
  staff: '/staff/login',
  vendor: '/vendor/login',
  admin: '/staff/login',
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const portal = portalFromPath(pathname)
  const isLoginPage = pathname.endsWith('/login')
  if (portal && !user && !isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = LOGIN[portal]
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

- [ ] **Step 5: Commit** — `git commit -m "feat: supabase clients and session middleware"`

### Task 6: Current-user helper with role guard

**Files:**
- Create: `src/lib/auth/session.ts`

- [ ] **Step 1: Implement**

```ts
import 'server-only'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { canAccessPortal, homePathFor, type Portal, type Role } from './rbac'

export type SessionUser = {
  id: string
  email: string
  fullName: string
  role: Role
  customerId: string | null
  vendorId: string | null
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const profile = await db.profile.findUnique({ where: { id: user.id } })
  if (!profile || profile.status !== 'ACTIVE') return null
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    role: profile.role,
    customerId: profile.customerId,
    vendorId: profile.vendorId,
  }
}

/** Call at the top of each protected route-group layout. */
export async function requirePortal(portal: Portal): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) redirect(portal === 'store' ? '/login' : `/${portal === 'admin' ? 'staff' : portal}/login`)
  if (!canAccessPortal(user.role, portal)) redirect(homePathFor(user.role))
  return user
}
```

- [ ] **Step 2: Commit** — `git commit -m "feat: session helper with portal guard"`

### Task 7: Email service (templated, logged, tested)

**Files:**
- Create: `src/lib/mail/templates.ts`, `src/lib/mail/send.ts`
- Test: `src/lib/mail/templates.test.ts`

- [ ] **Step 1: Failing test `src/lib/mail/templates.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { renderEmail } from './templates'

describe('renderEmail', () => {
  it('wraps body in branded layout with subject and footer', () => {
    const { subject, html } = renderEmail('welcome', { name: 'Ali', portalUrl: 'https://x/account' })
    expect(subject).toContain('Welcome')
    expect(html).toContain('Ali')
    expect(html).toContain('Chemparts')
    expect(html).toContain('https://x/account')
    expect(html).toContain('no-reply') // footer notice
  })
  it('escapes HTML in variables', () => {
    const { html } = renderEmail('welcome', { name: '<script>x</script>', portalUrl: 'https://x' })
    expect(html).not.toContain('<script>x</script>')
    expect(html).toContain('&lt;script&gt;')
  })
})
```

- [ ] **Step 2: Run** `npm test` → FAIL.

- [ ] **Step 3: Implement `src/lib/mail/templates.ts`**

```ts
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1a2733">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden">
<tr><td style="background:#0A2540;padding:20px 32px"><span style="color:#fff;font-size:18px;font-weight:bold;letter-spacing:2px">CHEMPARTS</span>
<span style="color:#9fb3c8;font-size:11px;letter-spacing:1px"> MIDDLE EAST</span></td></tr>
<tr><td style="padding:32px"><h2 style="margin:0 0 16px;font-size:18px;color:#0A2540">${title}</h2>${bodyHtml}</td></tr>
<tr><td style="background:#f4f6f8;padding:16px 32px;font-size:11px;color:#66788a">
Chemparts Middle East FZC · SAIF Zone, Sharjah, UAE · chemparts-me.com<br>
This is an automated no-reply message. For assistance email info@chemparts-me.com.</td></tr>
</table></td></tr></table></body></html>`
}

type TemplateVars = Record<string, string>
type Rendered = { subject: string; html: string }

const templates: Record<string, (v: TemplateVars) => Rendered> = {
  welcome: (v) => ({
    subject: 'Welcome to Chemparts — your account is ready',
    html: layout('Welcome to Chemparts', `<p>Dear ${esc(v.name)},</p>
<p>Your Chemparts customer account is active. Browse our store, send enquiries and track your orders online.</p>
<p><a href="${esc(v.portalUrl)}" style="background:#0A2540;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">Open my account</a></p>`),
  }),
  'staff-invite': (v) => ({
    subject: 'Your Chemparts staff account',
    html: layout('Staff account created', `<p>Dear ${esc(v.name)},</p>
<p>An account has been created for you on the Chemparts portal. Set your password to get started:</p>
<p><a href="${esc(v.actionUrl)}" style="background:#0A2540;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">Set password</a></p>`),
  }),
  'vendor-invite': (v) => ({
    subject: 'Chemparts vendor portal invitation',
    html: layout('Vendor portal invitation', `<p>Dear ${esc(v.name)},</p>
<p>${esc(v.company)} has been registered as a vendor of Chemparts Middle East. Use the vendor portal to view purchase orders and submit bills.</p>
<p><a href="${esc(v.actionUrl)}" style="background:#0A2540;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">Activate account</a></p>`),
  }),
}

export function renderEmail(template: string, vars: TemplateVars): Rendered {
  const fn = templates[template]
  if (!fn) throw new Error(`Unknown email template: ${template}`)
  return fn(vars)
}
```

- [ ] **Step 4: Run** `npm test` → PASS.

- [ ] **Step 5: Implement `src/lib/mail/send.ts`**

```ts
import 'server-only'
import nodemailer from 'nodemailer'
import { db } from '@/lib/db'
import { renderEmail } from './templates'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: Number(process.env.SMTP_PORT ?? 465) === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
})

export async function sendMail(to: string, template: string, vars: Record<string, string>) {
  const { subject, html } = renderEmail(template, vars)
  try {
    await transporter.sendMail({ from: process.env.MAIL_FROM, to, subject, html })
    await db.emailLog.create({ data: { to, subject, template, status: 'SENT' } })
  } catch (err) {
    await db.emailLog.create({
      data: { to, subject, template, status: 'FAILED', error: String(err) },
    })
    throw err
  }
}
```

- [ ] **Step 6: Commit** — `git commit -m "feat: templated noreply email service with EmailLog"`

### Task 8: Registration (customer self-signup)

**Files:**
- Create: `src/lib/validation/register.ts`, `src/app/(auth)/register/page.tsx`, `src/app/(auth)/register/actions.ts`, `src/lib/countries.ts`
- Test: `src/lib/validation/register.test.ts`

- [ ] **Step 1: Failing test `src/lib/validation/register.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { registerSchema } from './register'

const valid = {
  fullName: 'Ali Hassan',
  companyName: 'Gulf Labs LLC',
  email: 'ali@gulflabs.com',
  phone: '+97455512345',
  country: 'QA',
  password: 'Str0ng-password',
}

describe('registerSchema', () => {
  it('accepts a valid global registration', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })
  it('rejects bad email, short password, missing country', () => {
    expect(registerSchema.safeParse({ ...valid, email: 'nope' }).success).toBe(false)
    expect(registerSchema.safeParse({ ...valid, password: 'short' }).success).toBe(false)
    expect(registerSchema.safeParse({ ...valid, country: '' }).success).toBe(false)
  })
  it('rejects phone without country code', () => {
    expect(registerSchema.safeParse({ ...valid, phone: '055123456' }).success).toBe(false)
  })
})
```

- [ ] **Step 2: Run** → FAIL. **Step 3: Implement `src/lib/validation/register.ts`**

```ts
import { z } from 'zod'

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your name'),
  companyName: z.string().trim().min(2, 'Enter your company name'),
  email: z.string().trim().email('Enter a valid email'),
  phone: z.string().trim().regex(/^\+[1-9]\d{6,14}$/, 'Include country code, e.g. +971…'),
  country: z.string().length(2, 'Select your country'),
  password: z.string().min(10, 'At least 10 characters'),
})

export type RegisterInput = z.infer<typeof registerSchema>
```

- [ ] **Step 4: Run** → PASS. **Step 5: `src/lib/countries.ts`** — full ISO list: `export const COUNTRIES: { code: string; name: string }[] = [...]` (generate from `Intl.DisplayNames` at build: hardcode the ~250 entries).

- [ ] **Step 6: Server action `src/app/(auth)/register/actions.ts`**

```ts
'use server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { registerSchema } from '@/lib/validation/register'

export type RegisterState = { error?: string; fieldErrors?: Record<string, string[]>; ok?: boolean }

export async function registerCustomer(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors }
  const input = parsed.data

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/account`,
      data: { full_name: input.fullName },
    },
  })
  if (error) return { error: error.message }
  const userId = data.user?.id
  if (!userId) return { error: 'Sign-up failed, please try again.' }

  // Profile + Customer created with service role (RLS-independent)
  createAdminClient() // ensures env present in dev; admin ops via Prisma below
  const customer = await db.customer.create({
    data: {
      companyName: input.companyName,
      country: input.country,
      source: 'SELF',
    },
  })
  await db.profile.upsert({
    where: { id: userId },
    create: {
      id: userId, email: input.email, fullName: input.fullName, phone: input.phone,
      role: 'CUSTOMER', customerId: customer.id,
    },
    update: {},
  })
  return { ok: true }
}
```

- [ ] **Step 7: Page `src/app/(auth)/register/page.tsx`** — client form (`useActionState`) with fields: full name, company, email, phone (with `+` hint), country `<select>` from COUNTRIES, password; success state shows "Check your email to verify your account." Simple centered card, Chemparts navy `#0A2540` accents.

- [ ] **Step 8: Auth callback route `src/app/auth/callback/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/account'
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }
  return NextResponse.redirect(`${origin}/login?error=verification`)
}
```

- [ ] **Step 9: Manual check** — with Supabase creds in `.env`: register → email received → verify → lands on /account. **Step 10: Commit** — `git commit -m "feat: customer self-registration with email verification"`

### Task 9: Login pages (three portals) + logout

**Files:**
- Create: `src/app/(auth)/login/page.tsx` (customer), `src/app/(auth)/staff/login/page.tsx`, `src/app/(auth)/vendor/login/page.tsx`, shared `src/components/auth/LoginForm.tsx`, `src/app/(auth)/actions.ts`

- [ ] **Step 1: Shared server action `src/app/(auth)/actions.ts`**

```ts
'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { canAccessPortal, homePathFor, type Portal } from '@/lib/auth/rbac'

export type LoginState = { error?: string }

export async function login(portal: Portal, _prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  if (!email || !password) return { error: 'Enter your email and password.' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: 'Invalid email or password.' }

  const profile = await db.profile.findUnique({ where: { id: data.user.id } })
  if (!profile || profile.status !== 'ACTIVE') {
    await supabase.auth.signOut()
    return { error: 'Account is not active. Contact info@chemparts-me.com.' }
  }
  if (!canAccessPortal(profile.role, portal)) {
    await supabase.auth.signOut()
    return { error: 'This login page is not for your account type.' }
  }
  redirect(homePathFor(profile.role))
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
```

- [ ] **Step 2: `LoginForm` component** — email + password + submit + error display, `useActionState(login.bind(null, portal))`, link to /register on the customer variant and "Forgot password" (Supabase resetPasswordForEmail flow) on all.
- [ ] **Step 3: Three login pages** rendering `<LoginForm portal="store|staff|vendor" />` with distinct headings: "Customer sign in", "Staff sign in", "Vendor sign in".
- [ ] **Step 4: Manual check** with seeded users (Task 11). **Step 5: Commit** — `git commit -m "feat: portal login pages with role-checked sign-in"`

### Task 10: Portal layouts + placeholder dashboards

**Files:**
- Create: `src/app/(store)/account/layout.tsx` + `page.tsx`, `src/app/(staff)/staff/layout.tsx` + `page.tsx`, `src/app/(vendor)/vendor/layout.tsx` + `page.tsx`, `src/app/(admin)/admin/layout.tsx` + `page.tsx`, `src/components/PortalShell.tsx`
- Modify: `src/app/page.tsx` (landing), `src/app/layout.tsx` (metadata, fonts)

- [ ] **Step 1: `PortalShell`** — top bar (logo text CHEMPARTS, portal name, user name, logout button) + nav slot; **mobile-first bottom-tab nav for the customer account**, sidebar for staff/vendor/admin (collapses on mobile).
- [ ] **Step 2: Each layout calls the guard:**

```tsx
// src/app/(staff)/staff/layout.tsx — same pattern for the other three
import { requirePortal } from '@/lib/auth/session'
import PortalShell from '@/components/PortalShell'

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePortal('staff')
  return <PortalShell portal="staff" user={user}>{children}</PortalShell>
}
```

Guards: account→`requirePortal('store')`, vendor→`'vendor'`, admin→`'admin'`.

- [ ] **Step 3: Placeholder dashboards** — each `page.tsx` greets the user and lists the coming features of that portal (from spec §4) as disabled cards, so every phase review has a visible skeleton.
- [ ] **Step 4: Landing `src/app/page.tsx`** — Chemparts-styled hero: "Chemparts Store & Portal", buttons: Browse products (disabled "Phase 2"), Customer sign in, Staff sign in, Vendor sign in. Root metadata: title "Chemparts Store", `robots: noindex` until launch.
- [ ] **Step 5: `npm run build`** → expect success. **Step 6: Commit** — `git commit -m "feat: portal layouts, guards and placeholder dashboards"`

### Task 11: Seed script (admin + sample staff/vendor/customer)

**Files:**
- Create: `scripts/seed.ts`
- Modify: `package.json` (script `"seed": "tsx scripts/seed.ts"`)

- [ ] **Step 1: Implement `scripts/seed.ts`**

```ts
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { PrismaClient, Role } from '@prisma/client'

const db = new PrismaClient()
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function ensureUser(email: string, password: string, fullName: string, role: Role) {
  const { data: list } = await admin.auth.admin.listUsers()
  let user = list.users.find((u) => u.email === email)
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { full_name: fullName },
    })
    if (error) throw error
    user = data.user
  }
  await db.profile.upsert({
    where: { id: user!.id },
    create: { id: user!.id, email, fullName, role },
    update: { role },
  })
  console.log(`✔ ${role} ${email}`)
}

async function main() {
  await ensureUser(process.env.ADMIN_SEED_EMAIL!, process.env.ADMIN_SEED_PASSWORD!, 'Razin Ahmed', 'ADMIN')
  await ensureUser('staff.demo@chemparts-me.com', 'Demo-staff-123', 'Demo Staff', 'STAFF')
  await db.setting.upsert({
    where: { key: 'company' },
    create: { key: 'company', value: { defaultCurrency: 'AED', currencies: ['AED', 'USD', 'QAR', 'EUR'], vatPercent: 5 } },
    update: {},
  })
  console.log('Seed complete')
}

main().finally(() => db.$disconnect())
```

- [ ] **Step 2: Run** `npm run seed` (needs Supabase creds) → expect `✔ ADMIN …`. **Step 3: Commit** — `git commit -m "feat: seed script for admin/staff users and settings"`

### Task 12: Supabase project wiring (user + agent together)

- [ ] **Step 1 (owner):** Create Supabase project (region `me-central-1` if available), copy URL, anon key, service-role key, DB password into `.env` from `.env.example`. Create `noreply@chemparts-me.com` mailbox and note SMTP host/port/password.
- [ ] **Step 2:** In Supabase Dashboard → Auth → SMTP settings: point auth emails at the noreply SMTP. Auth → URL configuration: site URL `http://localhost:3000` (later `https://store.chemparts-me.com`), redirect URL `/auth/callback`.
- [ ] **Step 3:** `npx prisma migrate dev --name init` → tables created. `npm run seed`.
- [ ] **Step 4:** Full manual pass: register customer → verify email → /account; staff login → /staff; wrong-portal login rejected; logout works.
- [ ] **Step 5:** Commit any fixes; push. Vercel import (owner grants access or runs `vercel link`), set env vars, add domain `store.chemparts-me.com` → CNAME instructions.

---

## Self-review notes

- Spec coverage (Phase 1 scope only): repo ✔ (exists), app scaffold T1, schema T3, auth+RBAC T4–T6, registration/login all roles T8–T9 (+vendor/staff creation via seed now, invite flows land in Phase 5/6 admin UI), settings seed T11, email service T7. Reports, catalog, quotes etc. are later phases by design.
- Types consistent: `Role`/`Portal` defined once in `rbac.ts`; Prisma `Role` enum mirrors it (string-compatible).
- No placeholders except deliberate owner actions in T12 and the COUNTRIES list generation instruction (T8 S5) which specifies exact content source.

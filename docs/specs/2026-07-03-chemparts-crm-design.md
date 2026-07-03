# Chemparts CRM — Design & Master Plan

**Date:** 2026-07-03
**Status:** Draft — awaiting owner approval before implementation
**Company:** Chemparts Middle East FZC / Chemparts Medical & Laboratory Supplies LLC
**Public website:** https://chemparts-me.com (static site, stays as-is)
**New app domain:** `store.chemparts-me.com` (CNAME to the app server)

---

## 1. What we are building

A single web application that acts as Chemparts' commercial backbone, with four interconnected portals on one domain:

| Portal | Who | What they do |
|---|---|---|
| **Store (public + customer)** | Anyone browsing; registered customers | Browse equipment, spare parts and consumables; send enquiries; request/accept quotations; track order status; view invoices; (future) pay online |
| **Staff portal** | Sales & operations staff | Manage products/brands/categories, file detailed enquiries, build quotations, convert to orders, update order status (customs, lead time…), register customers on their behalf, manage stock |
| **Vendor portal** | Suppliers | See purchase orders sent to them, confirm lead times, submit bills/invoices against POs, track payment status |
| **Admin** | Owner/managers | Everything staff can do + user management, approvals, pricing controls, reports, settings (email, letterhead, currencies, taxes) |

The existing website keeps its marketing role; its "Get a quote" / product CTAs will deep-link into the store subdomain.

## 2. Tech stack (recommended)

- **Next.js 15 (App Router) + TypeScript** — same stack as your LIMS-QUALITAS project, so patterns, hosting and maintenance carry over.
- **PostgreSQL + Prisma ORM** — relational data (quotes, orders, stock) needs a real RDBMS.
- **Auth:** credentials-based sessions (email + password) with role-based access control (RBAC). One `User` table with roles: `ADMIN`, `STAFF`, `CUSTOMER`, `VENDOR`. Email verification on self-registration.
- **Email:** Nodemailer over SMTP using `noreply@chemparts-me.com` (you create the mailbox in your hosting panel; we configure host/port/credentials in `.env`). All transactional mail (registration, quote sent, status change, vendor bill received) goes through one templated mail service.
- **PDF generation:** server-side HTML→PDF (Playwright/Chromium) so the quotation PDF is pixel-identical to the on-screen preview. Letterhead designed once (logo, ISO/ICV badges, addresses, bank details, signature block) and reused for Quotation, Proforma Invoice, and later Invoice/Delivery Note.
- **File storage:** local disk on the VPS under `/uploads` (product images, datasheets, vendor bills, customer POs), served through an authenticated route.
- **Deployment:** your VPS (same pattern as LIMS), Nginx reverse proxy, `store.chemparts-me.com` CNAME → server; SSL via Let's Encrypt.

### Alternatives considered
1. **Separate apps per portal** (store app + CRM app) — cleaner isolation but duplicated auth/models and two deployments. Rejected: you're a small team; one codebase is easier.
2. **Off-the-shelf (ERPNext/Odoo) + custom store** — fast start but the quotation tool and store UX you want (branded, image-rich, Gulf-specific workflow) would fight the framework. Rejected.
3. **Chosen: one Next.js monolith, route-grouped portals** — `/(store)`, `/(staff)`, `/(vendor)`, `/(admin)` with shared database and components.

## 3. Data model (core entities)

- **User** (role, email, phone, password hash, status: pending/active/disabled)
- **Customer** (company name, country, city, address, TRN/VAT no., industry, contact persons[], assigned staff, source: self-registered | staff-created). Registration form is **simple**: name, company, email, phone with country code, country (full ISO list — global audience), password. Everything else staff can enrich later.
- **Vendor** (company, country, currency, payment terms, contacts[], bank details)
- **Brand** (name, logo, description) — staff-creatable
- **Category** — tree: Equipment / Spare Parts / Consumables (glassware, filters, reagents…), sub-categories
- **Product** (name, slug, brand, category, type: `EQUIPMENT | SPARE_PART | CONSUMABLE`, images[], description, specs JSON, standards[], industries[], model no., HS code, unit, cost price, list price, currency, stock-tracked flag, related products, parent equipment link for spares). Initial data **imported from `products.js`** on the website (~120 instruments, 16 brands) + its images.
- **Enquiry** (customer, source: web form | phone | email | walk-in, line items or free text, detailed customer/context fields — application, industry, standard required, urgency, target budget, competitor info, attachments — status: NEW → UNDER_REVIEW → QUOTED → WON/LOST, assigned staff, notes timeline)
- **Quotation** (number `CPQ-YYYY-####`, revision no., customer, currency, validity date, line items [product, image, qty, unit price, discount, lead time per line], subtotal/VAT %/total, terms: payment/delivery/warranty, prepared-by + signature, status: DRAFT → SENT → ACCEPTED/REJECTED/EXPIRED/REVISED, linked enquiry, PDF snapshot per revision)
- **Order / Purchase (customer side)** (number `CPO-YYYY-####`, from accepted quotation or store cart, line items, status timeline — see §6, linked shipping/customs docs, customer PO upload)
- **PurchaseOrder (to vendor)** (vendor, line items, expected lead time, status, linked customer order)
- **VendorBill** (vendor, linked PO, bill no., amount, currency, file upload, status: SUBMITTED → VERIFIED → APPROVED → PAID)
- **StockItem / StockMovement** (product, location, qty on hand, reorder level, movements: goods-in from vendor PO, goods-out to customer order, adjustment; low-stock alerts)
- **Payment** (future: gateway ref, method, amount, status) — schema included now, gateway wired later
- **Notification / EmailLog**, **AuditLog** (who changed what, when — important for quotes and prices)
- **Settings** (company profiles for both entities — FZC & LLC letterheads, VAT %, currencies & rates, quote terms defaults, SMTP config)

## 4. Portal features

### 4.1 Store (customer-facing, mobile-first)
- Public catalog: equipment showcase (enquiry-driven, no prices shown by default) and **Store section** for consumables & spare parts (prices shown, add-to-cart → order request).
- Simple global registration (country-aware phone/country fields); email verification; staff can also create/approve customers.
- Customer dashboard (limited, mobile-optimized views): my enquiries, my quotations (view PDF, **Accept / Request changes** buttons), my orders with a visual status timeline, my invoices, profile.
- Quotation acceptance online = signature-lite (name + timestamp recorded).
- **Mobile:** responsive throughout; the customer dashboard designed phone-first with a bottom-tab layout.

### 4.2 Staff portal
- Product management: create/edit products, brands, categories; multi-image upload; datasheet upload; spare-parts linking to equipment; consumables with stock & price.
- Enquiry desk: file detailed enquiries (rich customer fields), assign, add notes, attach files, convert to quotation in one click (lines pre-filled).
- **Quotation builder (the centerpiece):**
  - Pick customer (or create on the spot), pick products with live search — images, specs, and last-quoted price auto-fill.
  - Per-line: qty, price, discount, lead time; drag to reorder; optional sections (e.g. "Main unit", "Accessories", "Consumables", "Installation & training").
  - Live A4 preview exactly as the PDF will print: designed letterhead (logo, ISO 9001/14001 + ICV badges, both entity addresses, bank details), product images in lines, standards referenced, terms block, prepared-by signature.
  - Revisions kept forever; send by email (noreply) with PDF attached + customer-portal link; duplicate/clone quotes.
- Order management: convert accepted quote → order; update status stages with notes & dates (each update optionally emails the customer); upload shipping docs.
- Customer management: full CRM record — contacts, notes, files, enquiry/quote/order history.
- Stock: goods-in/out, counts, low-stock alerts, link to vendor POs.

### 4.3 Vendor portal
- Vendor accounts created by staff (invite email).
- View POs issued to them; acknowledge & confirm lead time.
- Submit bills against POs (PDF/image upload + amount + bill no.); see bill status (verified/approved/paid).

### 4.4 Admin
- User & role management (staff accounts, approve customers/vendors, disable users).
- Settings: letterhead entities, VAT, currencies, numbering formats, SMTP test, quote default terms.
- Reports & dashboard: enquiry pipeline, quote win rate, sales by month/brand/country, pending orders by stage, stock value, vendor bills payable.
- Full audit log.

## 5. Registration & login flows

- **Customers:** self-register (simple form) → email verification → active immediately (or admin-approval toggle in settings). Staff can register a customer and the system emails a set-password link.
- **Staff/Admin:** created by admin only. Separate login page `/staff/login`.
- **Vendors:** invited by staff. Separate login page `/vendor/login`.
- Password reset via email everywhere. Rate limiting + lockout on failed attempts. (2FA for admin — Phase 6 nice-to-have.)

## 6. Order status pipeline (customer-visible timeline)

`Order Confirmed → Procurement (with vendor) → In Production → Ready to Ship → Shipped (AWB/BL no.) → Customs Clearance → Cleared / In Local Delivery → Delivered → Installed & Commissioned (equipment only) → Closed`

- Staff can set expected dates ("lead time") per stage, add public notes (customer sees) and internal notes (staff only).
- Every stage change → optional email to customer via noreply + timeline update in their portal.

## 7. Email (noreply) integration

You create `noreply@chemparts-me.com` in the hosting panel; I'll walk you through it and we store SMTP credentials in `.env`. Templated emails (branded header/footer): verify email, welcome, set password, quotation sent, quotation reminder before expiry, quote accepted (to staff), order status updates, vendor invite, bill received/approved, low-stock alert (to staff), password reset. Every send logged in EmailLog with retry on failure.

## 8. Things you didn't mention that I've added

1. **Quotation revisions & PDF snapshots** — a quote once sent is immutable; changes create Rev 2, so disputes are traceable.
2. **Multi-currency + VAT** — AED default, USD/QAR/EUR support with per-quote currency; UAE VAT 5% configurable (and 0% export handling).
3. **Two letterheads** — FZC (Sharjah) and Medical & Laboratory Supplies LLC (Abu Dhabi, ICV) selectable per quotation, since ADNOC work goes through the LLC.
4. **Audit log** on prices, quotes and status changes.
5. **Catalog import** of your existing 120 products/16 brands/images from the website so day one isn't empty.
6. **Customer PO upload** step between quote acceptance and order confirmation.
7. **Low-stock reorder alerts** tied to vendor POs.
8. **Numbering schemes** (CPQ/CPO/PO/BILL with yearly reset) configurable in settings.
9. **Internal vs customer-visible notes** everywhere.
10. **EmailLog + resend** so "did the customer get the quote?" is answerable.
11. **Security basics:** RBAC middleware on every route group, hashed passwords (argon2), rate limiting, uploads virus-size-type checked, daily DB backup script on the VPS.
12. **Future-ready payments:** order/payment schema now; gateway (Telr / Network International / Stripe — whichever your bank supports) wired in a later phase, enabled per-order for consumables/spares first.
13. **Later phases to consider (not in initial scope):** service/AMC module (calibration certificates, service tickets — natural fit for lab instruments), WhatsApp notifications, Arabic localization.

## 9. Build phases

| Phase | Scope | Outcome |
|---|---|---|
| **1. Foundation** | Repo, Next.js app, DB schema, auth + RBAC, registration/login for all roles, settings, email service | All portals log in; emails flow |
| **2. Catalog & Store** | Brands/categories/products CRUD, image uploads, website catalog import, public store + consumables/spares sections, cart → order request | Customers browse & enquire |
| **3. Enquiry → Quotation** | Enquiry desk, quotation builder, letterhead design, PDF engine, send/accept flow | Staff produce professional quotes end-to-end |
| **4. Orders & Tracking** | Quote→order conversion, status pipeline, customer timeline (mobile-first), status emails | Customers self-serve tracking |
| **5. Vendors & Stock** | Vendor portal, POs, bill submission/approval, stock movements & alerts | Procurement loop closed |
| **6. Admin & Polish** | Dashboard/reports, audit views, backups, 2FA, payment-gateway groundwork | Production-ready |

Each phase ends with a working deploy you can review at `store.chemparts-me.com`.

## 10. Open questions (answer before Phase 1)

1. Show prices publicly for consumables/spares, or only after login? (Equipment stays enquiry-only.)
2. New customer self-registration: instantly active, or admin approval required?
3. Default currency AED — correct? Which others must appear on quotes?
4. Hosting: deploy to the same VPS as LIMS-QUALITAS, or a separate server?
5. Payment gateway preference when we get there (Telr, Network International, Stripe, PayTabs)?

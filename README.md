# Chemparts CRM

Commercial platform for **Chemparts Middle East FZC** / **Chemparts Medical & Laboratory Supplies LLC** — customer store, staff CRM, vendor portal and admin, served at `store.chemparts-me.com`.

- Public marketing site: https://chemparts-me.com (separate static site)
- Design & master plan: [docs/specs/2026-07-03-chemparts-crm-design.md](docs/specs/2026-07-03-chemparts-crm-design.md)

## Portals

| Portal | Users | Purpose |
|---|---|---|
| Store | Public / customers | Catalog, consumables & spare-parts store, enquiries, quote acceptance, order tracking |
| Staff | Sales & operations | Products, brands, enquiries, quotation builder, orders, stock, customers |
| Vendor | Suppliers | Purchase orders, bill submission, payment status |
| Admin | Management | Users, settings, letterheads, reports, audit |

## Stack (planned)

Next.js 15 (App Router) · TypeScript · Vercel · Supabase (Postgres, Auth, Storage) · Prisma · Nodemailer (noreply@chemparts-me.com) · serverless Chromium PDF

## Status

Planning — implementation starts after the design doc is approved.

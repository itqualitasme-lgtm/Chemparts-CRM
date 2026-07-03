# Phase 2 — Catalog & Store (part A: website import + public store)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox syntax.

**Goal:** Import the existing website's catalog (~120 instruments, 16 brands, images) and serve a public store: product listing with search/filters and product detail pages, styled after chemparts-me.com.

**Architecture:** The website's `assets/js/products.js` is extracted once into `data/catalog.json` (committed — it is both the store's interim data source and the future DB seed). A single access module `src/lib/catalog.ts` hides the source; when Supabase is live, `scripts/import-catalog.ts` loads the JSON into Prisma and `catalog.ts` switches to DB queries without touching the pages. Product images are copied to `public/images/products/`.

**Part B (blocked on Supabase creds):** run import script, staff product/brand CRUD, consumables & spares store sections with cart. Tracked in this plan but not executable yet.

---

### Task 1: Extract catalog data
- [ ] Node script evaluates `products.js` (sets `window.PRODUCTS`) → writes `data/catalog.json` with slug, name, brand, type: 'EQUIPMENT', images (basename only), desc, industries, testTypes, specs, standards, overview, featured.
- [ ] Derive `data/brands.json` (unique brand names + product counts).
- [ ] Commit.

### Task 2: Copy product images
- [ ] Copy `assets/images/products/*` → `public/images/products/`.
- [ ] Commit (binary-heavy commit, one-off).

### Task 3: Prisma models for catalog
- [ ] Add `Brand`, `Category`, `Product` models + `ProductType` enum (EQUIPMENT | SPARE_PART | CONSUMABLE) to schema; `prisma validate && prisma generate`.
- [ ] Write `scripts/import-catalog.ts` (JSON → DB upserts by slug; brands upserted by name). Runs in Part B.
- [ ] Commit.

### Task 4: Catalog access module (tested)
- [ ] Test: `src/lib/catalog.test.ts` — `getProducts({q, brand, industry})` filters correctly; `getProduct(slug)` returns full record; `getBrands()` sorted with counts.
- [ ] Implement `src/lib/catalog.ts` reading `data/catalog.json` (server-only, cached in module scope).
- [ ] Commit.

### Task 5: Store pages
- [ ] `/products` — responsive grid of cards (image, brand chip, name, desc, standards), search box, brand + industry filters (searchParams-driven, server-rendered), count header. Navy/white styling consistent with website.
- [ ] `/products/[slug]` — image, brand, overview, specs table, standards, industries; CTA block: "Request a quotation" → links to `/account/enquiries/new?product=<slug>` when signed in else `/register`; secondary mailto/WhatsApp like the website.
- [ ] Enable "Browse products" button on landing page; add /products link to customer portal nav.
- [ ] `npm run build` passes; visual check in preview.
- [ ] Commit, push.

### Part B checklist (needs Supabase)
- [ ] `prisma migrate dev` + `npm run seed` + `npx tsx scripts/import-catalog.ts`
- [ ] Switch `catalog.ts` to Prisma queries
- [ ] Staff CRUD: products, brands, image upload to Supabase Storage
- [ ] Consumables/spares sections with login-gated pricing + cart → order request

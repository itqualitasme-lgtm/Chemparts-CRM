# Phase 2 Redesign — Requirements & Expanded Design

**Date:** 2026-07-03
**Trigger:** Owner feedback — the app needs a professional, SGS/GEICP-class store (not the current basic UI), a much richer product/brand model matching the real website, the missing staff modules, and a customizable quotation tool including AMC/service.
**Model policy:** Planning/complex design at Fable 5 tier; routine implementation delegated to Opus 4.8 subagents.

---

## 1. Owner feedback captured (nothing dropped)

### A. Authentication & session
- **"Remember me"** checkbox on login.
- **Persistent session** — once logged in, stay signed in when navigating to home or anywhere (no surprise logouts).
- **Public website must be auth-aware**: show **Login / Register** when signed out, and a **user icon/avatar menu** when signed in (like a real e-commerce/corporate site).

### B. Design & experience (the big one)
- Do **not** reuse the current product page / basic UI.
- Build a store that looks and feels like **https://www.sgs.com/en-ae** and **https://www.geicp.com/** — modern, professional, **highly interactive**, latest technology, strong **SEO**, "best-in-class" portal.
- **Full-width / responsive layout** — current centered `max-w-6xl` wastes the left/right space on wide monitors. Use the screen properly.
- Research international leaders in our category (done in parallel: SGS, GEICP, + Thermo Fisher / Mettler / Metrohm).

### C. Brand model — needs real fields (not just description)
Current brand form only has name + description ("description fool brand"). Brands need:
- Name
- **Website URL**
- **Country of origin**
- **Brand logo upload**
- **Default currency**
- (description optional)

### D. Product model — many missing fields (from the real website)
The real product pages show fields we're missing. Confirmed examples from owner:
- **Authorized / Direct partner** (partnership status)
- **Warranty / Manufacturer** (warranty source)
- **Service / In-region** (service availability)
- **Type** (e.g. "Petroleum Tester")
- **Sample** (e.g. "Liquids, solids (verify per method)")
- **Standards** (ASTM, ISO, IP)
- **Output** (e.g. "Per method specification")
Plus:
- **Multiple images with gallery preview** (one product, many images).
- **Specification / datasheet PDF upload** per product.
- **Price change tracking** — products change price any time; show **"last price changed" timestamp** and provide an **easy inline price-update** feature.
- Robust **image add** on both new and existing products.
- (Full field inventory being extracted from the website source by a research agent — schema will incorporate all of it.)

### E. Missing modules (currently 404 in staff nav)
Build out: **Enquiries, Quotations, Customers, Stock** (nav links exist but pages 404). These were planned for later phases but the owner wants them real, not dead links.

### F. Quotation tool (expanded)
- **AMC / service quotations** — the company provides AMC (annual maintenance contracts) and services; the quotation tool must support service/AMC line items, not just products.
- **Multiple quotation types**, chosen/customized at creation time:
  - **Detailed / project quotation** — image-rich, sectioned, for projects (equipment + accessories + installation + training + AMC).
  - **Normal quotation** — simple line items.
  - Customizable layout while creating (sections, whether images show, terms).

---

## 2. Expanded data model (draft — refined after field research)

### Brand
| Field | Type | Notes |
|---|---|---|
| name | string, unique | |
| slug | string, unique | |
| logo | string (Storage URL) | upload |
| website | string? | URL |
| countryOfOrigin | string? | ISO or name |
| defaultCurrency | string | AED default |
| description | text? | |
| featured | bool | for homepage brand strip |

### Product (superset of website fields)
| Field | Type | Notes |
|---|---|---|
| name, slug | string | |
| brandId | rel | |
| categoryId | rel? | Equipment / Spare Parts / Consumables tree |
| type | enum | EQUIPMENT / SPARE_PART / CONSUMABLE |
| productType | string? | free-text "Petroleum Tester" etc (the website "Type") |
| modelNo, hsCode | string? | |
| shortDesc, overview | text | |
| **sample** | string? | "Liquids, solids…" |
| **output** | string? | "Per method specification" |
| standards | string[] | ASTM, ISO, IP |
| industries | string[] | |
| testTypes | string[] | |
| specs | json | arbitrary spec-table rows (key/value) |
| **partnerStatus** | enum? | AUTHORIZED / DIRECT_PARTNER |
| **warranty** | string? | "Manufacturer" / duration |
| **service** | string? | "In-region" |
| images | string[] | gallery (Storage URLs + imported) |
| image | string? | primary |
| **datasheetUrl** | string? | uploaded spec-sheet PDF (Storage) |
| listPrice, costPrice, currency | money | |
| **priceUpdatedAt** | datetime? | set whenever price changes |
| stockTracked, active, featured | bool | |
| parentEquipmentId | rel? | spare→equipment link |

### PriceHistory (new)
`productId, oldPrice, newPrice, currency, changedBy, changedAt` — powers "last changed" + audit + easy updates.

### Quotation (expanded for types + AMC) — Phase 3 detail
- `type`: PROJECT (detailed/image-rich) | STANDARD | AMC
- `showImages`, `sections[]` (customizable), line items of kind PRODUCT | SERVICE | AMC | CUSTOM.
- Everything from the original spec (revisions, PDF, letterhead) still applies.

---

## 3. Store redesign direction — FINALIZED (research + owner decisions)

**Owner decisions:** Hybrid (SGS-style authoritative homepage/nav + GEICP/instrument-style catalog & detail). Commercial flow: **enquiry/quote-first** with an "Add to Enquiry" basket (no checkout yet).

**Layout width (fixes the wide-monitor complaint):** two-tier system — section *backgrounds* run full-bleed (100vw), *content* sits in a centered `max-w-screen-2xl` (~1440px) wrapper with `px-6`. Responsive grids **add columns** on wide screens (`grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4`) instead of leaving gutters. Section vertical padding 96–128px desktop.

**Color system** (refines the existing Chemparts navy, one accent only):
- Ink navy `#0A2540` — dark hero/footer/CTA bands (existing brand color).
- Accent `#0E7490` (deep analytical teal) — the single CTA/action color.
- Grey `#5B6670` text/borders · section tint `#F4F6F8` · surface `#FFFFFF` · verified green `#2E9E5B` (Authorized Partner / in-stock / AMC-active badges).

**Typography:** one grotesk sans (Inter/Manrope), fixed scale 12/14/16/20/28/40/56, headings 600–700 tight tracking, body 16–18/1.6.

**Homepage order:** full-width hero → "In numbers" trust bar (since 2003, authorized partner of Hitachi/Tanaka/Oxford, N instruments, AMC contracts) → product category grid (Instruments / Consumables / Spare Parts) → services block (Testing / AMC / Calibration / Repair) → **authorized-partners logo wall** (real brand logos now in DB) → industries grid → resources/news → dark CTA band → rich footer.

**Header (two rows, auth-aware):** utility bar (language · region · **Sign in / Register** ↔ **avatar chip + dropdown** when logged in · Request-a-Quote accent button) + main bar (logo · nav: Products/Services/Industries/Resources/About/Contact · search). Avatar dropdown: My Quotes/Enquiries, Devices & AMC, Documents, Settings, Sign out. Mobile: accordion+slide drawer.

**Catalog (GEICP dual-axis):** browse by Category AND by Brand; faceted sticky left-rail filters (brand, category, industry, standard, availability) + active-filter chips + result count; cards with image, brand tag, part no., "Request Quote / Add to Enquiry".

**Product detail:** gallery left (multi-image); right = title, brand + Authorized-Partner badge, part no., quick specs, Request-Quote/Add-to-Enquiry; tabs: Overview · Specifications (full table incl. Type/Sample/Standards/Output) · Downloads (datasheet PDF, manuals, certificates) · Compatible items · Applicable AMC/services. Per-product partner/warranty/service strip.

**Interactivity:** Framer Motion `whileInView` reveals + staggered grids, hero parallax, sticky shrinking header, stat count-up, card hover lift — all respecting `prefers-reduced-motion`. RSC for catalog/detail, `next/image`, minimal client JS.

**SEO:** Metadata API per page, JSON-LD (Organization foundingDate 2003 / Product / Service / BreadcrumbList / WebSite+SearchAction), clean hierarchical URLs (`/products/instruments/[brand]/[slug]`, `/services/amc`, `/industries/[x]`), sitemap/robots, Core Web Vitals.

Full research reports retained in this session's agent outputs.

## 4. Build order (proposed)

1. **Schema expansion** — brand + product fields, PriceHistory, datasheet; migrate + backfill from website data.
2. **Design system** — tokens (color/type/spacing), layout primitives (full-width sections), header/footer, motion helpers.
3. **Public store redesign** — homepage (SGS/GEICP-style), catalog, product detail (all fields, gallery, datasheet, spec table), auth header.
4. **Auth polish** — remember-me, persistent sessions, avatar menu.
5. **Staff modules** — richer brand form, product form (all fields + gallery + datasheet + inline price update), then Customers, Enquiries, Stock pages (kill the 404s).
6. **Quotation tool** (Phase 3) — types (project/standard/AMC), customizable sections, images, AMC/service lines, PDF.

Each ships as its own reviewed increment.

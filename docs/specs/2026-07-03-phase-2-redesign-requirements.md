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

## 3. Store redesign direction (finalized after competitor research)

Placeholder — the SGS/GEICP research agent's findings (layout width strategy, color/typography, homepage sections, mega-menu, catalog UX, product-detail template, auth header) get folded in here, then this becomes the build plan.

Known now:
- **Fluid, full-bleed sections** with inner content max-width per section (not one narrow column) — hero, category grid, brand wall, industries, services/AMC, stats, CTA.
- **Auth-aware sticky header** with mega-menu, search, and Login/Register ↔ avatar menu.
- **Interactive**: scroll reveals, hover states, motion (Framer Motion), fast (RSC + image optimization), strong SEO (metadata, JSON-LD, semantic headings, clean URLs).

## 4. Build order (proposed)

1. **Schema expansion** — brand + product fields, PriceHistory, datasheet; migrate + backfill from website data.
2. **Design system** — tokens (color/type/spacing), layout primitives (full-width sections), header/footer, motion helpers.
3. **Public store redesign** — homepage (SGS/GEICP-style), catalog, product detail (all fields, gallery, datasheet, spec table), auth header.
4. **Auth polish** — remember-me, persistent sessions, avatar menu.
5. **Staff modules** — richer brand form, product form (all fields + gallery + datasheet + inline price update), then Customers, Enquiries, Stock pages (kill the 404s).
6. **Quotation tool** (Phase 3) — types (project/standard/AMC), customizable sections, images, AMC/service lines, PDF.

Each ships as its own reviewed increment.

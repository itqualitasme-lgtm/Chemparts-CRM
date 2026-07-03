# Chemparts CRM — Master Scope v2 (re-plan)

**Date:** 2026-07-03
**Status:** For owner approval before build. Planned at Fable 5 tier; implementation to run on Opus 4.8.
**Supersedes/extends:** the original design + Phase-2 redesign specs. Grounded in research of how Cole-Parmer, Fisher, Hach, PartsSource, Capitol Scientific, Metrohm, Grainger/RS actually operate.

## 0. Headline
The existing `Product.type` (EQUIPMENT / SPARE_PART / CONSUMABLE), the `EquipmentSpare` BOM link, per-product `listPrice`/`stockStatus`, and `PriceHistory` already encode the distinction this whole plan hinges on. The commerce model is **driven off `Product.type`**, not bolted on. Gaps to fill: cart/order/address entities, a company-account layer, the enquiry→quote→order lifecycle, and staff-editable content.

## 1. Catalog — three sections, one product table, nested URLs
```
/products                     landing: Instruments · Consumables · Spare Parts cards + featured brands
/products/instruments         EQUIPMENT — browse by category/brand/industry/test type
/products/consumables         CONSUMABLE — store grid, prices + Add to Cart
/products/spare-parts         SPARE_PART — hub, searchable by brand/model
/products/[slug]              product page (type-aware CTA)
/brands/[slug]                brand page
```
**Spare parts are BOTH** a top-level section AND nested per instrument (the differentiator, using the BOM you already built):
- Equipment page → **"Compatible spare parts & consumables" tab** from `sparesForThis` (shows required/optional, default qty, bundled-free).
- Spare-part page → **"Used in"** from `usedInEquipment` ("Fits: Hitachi X, Tanaka Y").
Category trees stay **scoped per type** (`Category.type` already exists). Add `Category.image` + `sortOrder` for merchandisable, staff-ordered section pages.

## 2. Commerce model per product type
| Type | Mode | CTA |
|---|---|---|
| EQUIPMENT | Enquiry / quote-only | Request a Quote |
| CONSUMABLE | Priced + cart + online order | Add to Cart |
| SPARE_PART | Priced + cart if `listPrice` set, else enquiry | Add to Cart / Request Price |
Add a per-product override so staff can make exceptions: `saleMode SaleMode(CART_ENABLED|QUOTE_ONLY)` + `minOrderQty`. Effective "Add to Cart" = `saleMode=CART_ENABLED && listPrice!=null && stockStatus!=OUT_OF_STOCK`.

**Mixed basket (key B2B detail):** one cart holds priced AND quote-only items and **splits at checkout** — priced → Order (pay/PO); quote-only → Enquiry → Quotation → accept → Order. Clear explainer when mixed ("2 items ready to order · 1 needs a quote").

## 3. New data model (the core gap) — extends existing `Customer`
- **Address** (per Customer, shared across company users): label, type SHIPPING/BILLING/BOTH, contact, phone, line1/2, city, emirate, country, poBox, isDefault.
- **Cart / CartItem** (server-persisted, survives login, shared per company): product, qty, quoteOnly flag, unit-price snapshot.
- **Order / OrderItem**: orderNo (CP-YYYY-####), customer, placedBy, status pipeline (PENDING→CONFIRMED→PROCESSING→SHIPPED→DELIVERED), ship/bill address, **poNumber + poDocumentUrl** (buyer PO — critical), paymentMethod (ONLINE_CARD/BANK_TRANSFER/ON_ACCOUNT/PO), paymentStatus, subtotal/vat(5%)/total, currency, optional quotationId.
- **CompanyRole** on Profile (OWNER/BUYER/APPROVER/VIEWER) — who can order vs only build carts/request quotes. (Profile→Customer many-to-one already gives multi-user companies.)

## 4. Accounts & delivery
- **Browse + build cart + submit enquiry as guest**, but **account required at the order step** (B2B needs company + TRN for VAT + addresses). Captures the lead even if they don't finish.
- **Registration captures company + first delivery address** in one flow (extends current register).
- Saved addresses shared at company level; order/quote/enquiry history rolls up to the Customer with a "my orders" filter; reorder-from-history + saved PO defaults for repeat buyers.

## 5. Dynamic website management — DB content blocks + staff panel (NOT a headless CMS)
You already run Supabase + Prisma + an admin panel + Storage; a headless CMS (Sanity/Payload/Contentful) would duplicate auth/media/hosting and split content from live product data. For merchandising + a few pages, a bespoke panel over your own tables is faster and keeps "featured product" blocks referencing real `Product.id`.
- **ContentBlock**(page, key, type[hero|banner|richText|productList|brandList|cardGrid], data Json, sortOrder, active) rendered by typed React components.
- **Page**(slug, title, body Json via Tiptap/Lexical, published, seo) for standalone editable pages.
- Featured strips reuse existing `Product.featured` / `Brand.featured` — just add `sortOrder` + toggles in the panel. `revalidateTag` on save → live without redeploy.

## 6. Phased roadmap (each phase ships something usable)
1. **Three-section catalog + type-aware CTAs** — section landings, nested URLs, per-type categories, `saleMode`, BOM tab on equipment + "Used in" on spares. *Mostly frontend on existing schema; high visible value.*
2. **Enquiry → Quotation flow for equipment** — Request-a-Quote → Enquiry → staff Quotation → PDF/email; mixed-cart split. *Activates the CRM; revenue path for highest-value products, no payment risk.*
3. **Company accounts + addresses** — register captures company+address, multiple saved addresses, CompanyRole, history roll-up. *Prereq for ordering.*
4. **Priced cart → checkout → order (PO / on-account)** — persisted cart, checkout with ship/bill select + PO capture/upload + 5% VAT, Order/OrderItem, confirmation email. *No gateway yet — B2B works on PO.*
5. **Dynamic content management** — ContentBlock/Page + staff CMS panel + featured/sortOrder. *Independent; run in parallel from Phase 2.*
6. **Online payment (UAE)** — PaymentTransaction + provider interface; integrate **Telr** first (AED, local acquiring, best SMB rate), PayTabs if expanding to KSA/Oman; Network International at scale. *Last — after ordering is proven.*

**Cross-cutting:** wire existing `stockStatus`/`stockTracked` to cart availability (Phase 4); Vendor/purchasing as a separate procurement track; `AuditLog` (exists) for content/order/price changes.

## 7. Also carried from earlier scope (unchanged, still in)
Two letterheads (FZC + LLC/ICV), multi-currency (AED default + USD/QAR/EUR), quotation types (project/standard/AMC) with customizable sections + images + auto-suggested spares, quote revisions with immutable PDF snapshots, order status pipeline with customer-visible timeline + customs/lead-time, vendor portal + bill submission, low-stock alerts, noreply email templates, security (RBAC, rate-limit, backups).

## 8. Decisions — LOCKED (owner, 2026-07-03)
1. **Payment:** PO / on-account first (PO number + bank transfer / on-account). Online card (Telr) added in Phase 6.
2. **Company accounts:** multi-user companies with roles (OWNER/BUYER/APPROVER/VIEWER), shared addresses + history.
3. **Guest cart:** guests may browse, build a cart and submit an enquiry; account required only at the order/checkout step.
4. **Build order:** start with **Phase 1 — three-section catalog + type-aware CTAs + BOM tab.**
5. (Still to gather as data is prepared: which product families have real online prices ready to load.)

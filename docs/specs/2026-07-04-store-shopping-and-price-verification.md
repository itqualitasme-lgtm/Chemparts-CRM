# Store shopping redesign + price verification

**Date:** 2026-07-04 · Planned at Fable 5, build on Opus 4.8. Owner decisions locked below.

## Decisions (locked)
1. Store look: **consistent with the site** (Chemparts navy/teal, same header/shell).
2. Add-to-cart → **submit cart as an enquiry/quote request** (real PO checkout + payment in later phases).
3. Default price for products without a confirmed recent price: **"Price on request."**
4. Listed price is considered stale (needs re-confirmation) **after 30 days.**

## A. Shopping store (enhance the section pages, keep site look)
- **Catalog** (`/products/instruments|consumables|spare-parts` + a combined `/products/all`): card grid with image, name, brand, price-state, stock badge, and quick **Add to cart** (listed) / **Request price** (on-request). Faceted filter sidebar (category, brand, industry, price range, availability, type), search, sort, result count, active-filter chips, pagination.
- **Product detail** (`/products/[slug]`): gallery + zoom, price-state block, **qty selector**, Add to cart / Request quote / Request price, specs, datasheet, compatible spares (BOM), related.
- **Cart** (drawer + `/cart`): adjust qty, remove, subtotal (of listed items), and **Submit as enquiry** → creates an `Enquiry` (+ `EnquiryItem` per line, `priceRequested` flag for on-request lines). Guest carts persist via a cookie `token`; merge into the customer cart on login.

## B. Price state (effective display logic)
Per product: `priceMode` (LISTED | INDICATIVE | ON_REQUEST) + `listPrice` + `priceUpdatedAt`.
- `ON_REQUEST` or `listPrice == null` → **"Price on request"** + Request-price button.
- `LISTED` but `priceUpdatedAt` older than **30 days** → render as **Indicative**: show price with "confirm current price"; Add-to-cart allowed but the enquiry line carries "price to confirm."
- `LISTED` and fresh → show price, Add to cart enabled (also requires `saleMode=CART_ENABLED`, in stock).
A shared `priceState(product)` helper returns `{ mode: 'listed'|'indicative'|'on_request', price?, currency?, stale: boolean }`.

## C. Request → verify → update loop
- Customer clicks **Request current price** (product or cart line) → `PriceRequest` (product, qty, message, customer or guest).
- Staff **Price Requests** queue (`/staff/price-requests`): view open requests; **confirm/update the price** (updates `Product.listPrice` + `priceUpdatedAt`, sets `priceMode=LISTED`, writes `PriceHistory`), set `quotedPrice`/`validUntil`, mark QUOTED, and **notify the customer** (email + portal). Customer can then add to cart / order at the confirmed price.
- Staff tools: a **"prices to review"** view (ON_REQUEST, stale LISTED, open requests) + **bulk mark-needs-review** (e.g., after an FX move) that flips products to ON_REQUEST/INDICATIVE. Inline price edit logs history + stamps `priceUpdatedAt`.
- At enquiry/checkout, indicative/stale/on-request lines are flagged "price to be confirmed" so staff confirm before finalising.

## Schema (added 2026-07-04)
`Product.priceMode PriceMode(default ON_REQUEST)`; `PriceRequest`(product, customer?/guest, qty, message, status OPEN/QUOTED/CLOSED, quotedPrice, validUntil, respondedBy/at); `Cart`/`CartItem`(server-persisted, guest `token`, qty, quoteOnly, unitPriceSnapshot); `Enquiry`/`EnquiryItem`(no CP-…, customer?/guest, status NEW/UNDER_REVIEW/QUOTED/WON/LOST, items with priceRequested). Reuses `PriceHistory`, `saleMode`, `stockStatus`.

## Build slices
1. **Price state + Request-price flow** — `priceState` helper, price-state UI on cards + detail, customer PriceRequest action, staff `/staff/price-requests` queue + respond (+ price update logs history). *(Highest value; the owner's explicit ask.)*
2. **Cart** — cart persistence, add-to-cart, drawer + `/cart`, submit→Enquiry, staff `/staff/enquiries` list.
3. **Catalog/detail shopping polish** — faceted filters, sort, pagination, gallery zoom, qty selector.

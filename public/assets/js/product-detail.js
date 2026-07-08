/* Product detail page — reads ?slug= and hydrates product.html
 *
 * Exposed as window.__cpProductDetailInit so RouteAnimations can re-run it after
 * client-side navigation — both when arriving on /product and when moving
 * between products (?slug= changes without a full reload). Every write is
 * idempotent (innerHTML / textContent / recreated gallery buttons), so re-runs
 * simply re-hydrate against the current slug. */
window.__cpProductDetailInit = function () {
  'use strict';
  if (!window.PRODUCTS) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const product = window.PRODUCTS.find(p => p.slug === slug) || window.PRODUCTS[0];
  if (!product) return;

  const escape = window.__escapeHtml || (s => String(s));

  // Title + meta
  document.title = `${product.name} · ${product.brand} — Chemparts Middle East`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', product.desc);

  // Breadcrumb
  const crumb = document.querySelector('[data-pdp-breadcrumb]');
  if (crumb) crumb.textContent = product.name;

  // Brand / title / desc — show the brand logo when available, else the name.
  document.querySelectorAll('[data-pdp-brand]').forEach((el) => {
    if (product.brandLogo) {
      el.innerHTML = `<img src="${product.brandLogo}" alt="${escape(product.brand)}" class="pdp-info__brandimg" loading="eager" decoding="async">`;
      el.classList.add('pdp-info__brand--logo');
    } else {
      el.textContent = product.brand;
      el.classList.remove('pdp-info__brand--logo');
    }
  });
  setText('[data-pdp-title]', product.name);
  setText('[data-pdp-desc]', product.desc);

  // Spec quick table
  const quickSpec = document.querySelector('[data-pdp-quick-spec]');
  if (quickSpec) {
    const s = product.specs || {};
    const rows = [
      ['Type', s.type],
      ['Sample', s.sample],
      ['Standards', s.standards],
      ['Output', s.output]
    ].filter(r => r[1]);
    quickSpec.innerHTML = rows.map(([k, v]) =>
      `<tr><th>${escape(k)}</th><td>${escape(v)}</td></tr>`
    ).join('');
  }

  // Quote / price button slug binding
  document.querySelectorAll('[data-pdp-quote]').forEach(b => b.dataset.quote = product.slug);
  document.querySelectorAll('[data-pdp-price]').forEach(b => b.dataset.price = product.slug);

  // Add-to-cart button → POST /api/cart/add (quote-only line for equipment)
  document.querySelectorAll('[data-pdp-cart]').forEach((btn) => {
    if (btn.dataset.cartBound === 'true') return;
    btn.dataset.cartBound = 'true';
    const original = btn.innerHTML;
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = 'Adding…';
      try {
        const res = await fetch('/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: product.slug, qty: 1 }),
        });
        const data = await res.json().catch(() => ({}));
        if (data && data.ok) {
          if (typeof window.__cpSetCartCount === 'function') window.__cpSetCartCount(data.count);
          btn.innerHTML = 'Added to cart ✓';
          setTimeout(() => { btn.innerHTML = original; btn.disabled = false; }, 2000);
        } else {
          btn.innerHTML = original; btn.disabled = false;
        }
      } catch (e) {
        btn.innerHTML = original; btn.disabled = false;
      }
    });
  });

  // Spec-sheet button: link straight to the product's datasheet PDF (new tab)
  // when there is one; otherwise fall back to a mailto request.
  const dsBtn = document.querySelector('[data-pdp-datasheet]');
  if (dsBtn) {
    const pdf = (product.docs || []).find(d => /^https?:\/\//i.test(d.href) && /\.pdf(\?|$)/i.test(d.href));
    if (pdf) {
      dsBtn.setAttribute('href', pdf.href);
      dsBtn.setAttribute('target', '_blank');
      dsBtn.setAttribute('rel', 'noopener');
      dsBtn.textContent = 'Download spec sheet';
    } else {
      dsBtn.setAttribute('href', `mailto:info@chemparts-me.com?subject=Datasheet request — ${product.name}`);
      dsBtn.removeAttribute('target');
      dsBtn.removeAttribute('rel');
      dsBtn.textContent = 'Request spec sheet';
    }
  }

  // Gallery
  const main = document.querySelector('[data-pdp-main]');
  const thumbs = document.querySelector('[data-pdp-thumbs]');
  const images = (product.images && product.images.length) ? product.images : [product.image];
  const rawFallback = product.image || images[0];
  // Prioritise + eagerly load the main image; fall back to the raw Storage URL
  // if the optimized variant ever fails.
  const mainImg = (src) =>
    `<img src="${src}" alt="${escape(product.name)}" fetchpriority="high" decoding="async" onerror="this.onerror=null;this.src='${rawFallback}'">`;
  if (main) main.innerHTML = mainImg(images[0]);
  if (thumbs) {
    thumbs.innerHTML = images.map((src, i) =>
      `<button type="button" aria-label="View image ${i + 1}" aria-pressed="${i === 0 ? 'true' : 'false'}"><img src="${src}" alt="" loading="lazy" decoding="async"></button>`
    ).join('');
    thumbs.querySelectorAll('button').forEach((btn, i) => {
      btn.addEventListener('click', () => {
        thumbs.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        if (main) main.innerHTML = mainImg(images[i]);
      });
    });
  }

  // Tab content
  const overview = document.querySelector('[data-pdp-overview]');
  if (overview) overview.innerHTML = `<p class="body-lg">${escape(product.overview || product.desc)}</p>`;

  const specs = document.querySelector('[data-pdp-specs]');
  if (specs) {
    const s = product.specs || {};
    const all = [
      ['Type', s.type],
      ['Sample compatibility', s.sample],
      ['Standards', s.standards],
      ['Output / measurement', s.output],
      ['Brand', product.brand],
      ['Industry application', (product.industries || []).join(', ')]
    ].filter(r => r[1]);
    specs.innerHTML = `<table class="spec-table">${all.map(([k, v]) =>
      `<tr><th>${escape(k)}</th><td>${escape(v)}</td></tr>`
    ).join('')}</table>`;
  }

  const standards = document.querySelector('[data-pdp-standards]');
  if (standards) {
    const list = (product.standards || []).map(st =>
      `<li class="pill" style="margin-right:8px; margin-bottom:8px;">${escape(st)}</li>`
    ).join('');
    standards.innerHTML = `<ul style="list-style:none; padding:0; margin:0; display:flex; flex-wrap:wrap; gap:8px;">${list}</ul>
      <p class="body-lg" style="margin-top:24px;">All listed standards are supported by this instrument's current configuration. For verification of a specific revision or calibration certificate, please <a href="/contact" style="color:var(--crimson); text-decoration:underline;">contact our team</a>.</p>`;
  }

  const docs = document.querySelector('[data-pdp-docs]');
  if (docs) {
    // The catalog payload only carries `docs` when there's a real datasheet PDF;
    // otherwise synthesise the "request by email" link here (keeps the payload lean).
    const docItems = (product.docs && product.docs.length) ? product.docs : [
      { title: 'Request datasheet by email', href: `mailto:info@chemparts-me.com?subject=Datasheet request — ${product.name}` }
    ];
    const items = docItems.map(d => {
      const ext = /^https?:\/\//i.test(d.href) ? ' target="_blank" rel="noopener"' : '';
      return `<li><a href="${d.href}"${ext} class="btn btn--ghost btn--sm">${escape(d.title)} <span class="arrow">→</span></a></li>`;
    }).join('');
    docs.innerHTML = `<ul style="list-style:none; padding:0; margin:0; display:grid; gap:12px;">${items}</ul>`;
  }

  // Related products
  const related = document.querySelector('[data-pdp-related]');
  if (related) {
    const rel = window.PRODUCTS
      .filter(p => p.slug !== product.slug)
      .filter(p => p.brand === product.brand || (p.industries || []).some(i => (product.industries || []).includes(i)))
      .slice(0, 3);
    if (rel.length && window.__productCard) {
      related.innerHTML = rel.map(window.__productCard).join('');
    }
  }

  function setText(sel, val) {
    document.querySelectorAll(sel).forEach(el => el.textContent = val);
  }

  // Inject Schema.org Product JSON-LD
  try {
    const origin = window.location.origin || 'https://chemparts-me.com';
    const url = origin + '/product?slug=' + encodeURIComponent(product.slug);
    const imgUrl = origin + '/' + (product.image || '').replace(/^\/+/, '');
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.overview || product.desc,
      "image": imgUrl,
      "url": url,
      "sku": product.slug,
      "brand": { "@type": "Brand", "name": product.brand },
      "category": (product.industries || []).join(', '),
      "offers": {
        "@type": "Offer",
        "url": url,
        "availability": "https://schema.org/InStock",
        "priceCurrency": "AED",
        "priceSpecification": { "@type": "PriceSpecification", "price": "0", "priceCurrency": "AED", "valueAddedTaxIncluded": false },
        "seller": {
          "@type": "Organization",
          "name": "Chemparts Middle East FZC",
          "url": "https://chemparts-me.com/",
          "telephone": "+971-6-5574047"
        }
      },
      "additionalProperty": Object.entries(product.specs || {}).map(([k, v]) => ({
        "@type": "PropertyValue",
        "name": k.charAt(0).toUpperCase() + k.slice(1),
        "value": v
      }))
    };
    // Reuse a single JSON-LD tag so navigating between products doesn't stack
    // duplicate schema blocks in <head>.
    let tag = document.head.querySelector('script[type="application/ld+json"][data-pdp-schema]');
    if (!tag) {
      tag = document.createElement('script');
      tag.type = 'application/ld+json';
      tag.setAttribute('data-pdp-schema', '');
      document.head.appendChild(tag);
    }
    tag.textContent = JSON.stringify(schema);
  } catch (e) { /* graceful no-op */ }
};

// Self-run on initial load (direct landing on /product before RouteAnimations
// mounts). Harmless if the PDP markup isn't present.
window.__cpProductDetailInit();

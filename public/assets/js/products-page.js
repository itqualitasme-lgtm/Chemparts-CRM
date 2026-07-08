/* Products listing page — search, filter, sort, hash-state
 *
 * Exposed as window.__cpProductsPageInit so it can be re-run after client-side
 * navigation back to /products (RouteAnimations calls it). Guarded per-grid via
 * a data flag: a freshly navigated page renders a new [data-products-grid], so
 * the guard resets naturally and we never double-bind the same element. */
window.__cpProductsPageInit = function () {
  'use strict';
  if (!window.PRODUCTS) return;

  const grid = document.querySelector('[data-products-grid]');
  const countEl = document.querySelector('[data-products-count]');
  const searchInput = document.querySelector('[data-products-search]');
  const sortSelect = document.querySelector('[data-products-sort]');
  const sidebar = document.querySelector('[data-products-sidebar]');
  if (!grid) return;
  if (grid.dataset.cpProductsInit === 'true') return;
  grid.dataset.cpProductsInit = 'true';

  const PAGE_SIZE = 24;
  const state = {
    q: '',
    brands: new Set(),
    industries: new Set(),
    testTypes: new Set(),
    categories: new Set(),
    sort: 'featured',
    page: 1
  };

  // Populate sidebar from data
  function makeCheckboxGroup(name, items, getId, getLabel, getCount) {
    return items.map(item => {
      const id = getId(item);
      const label = getLabel(item);
      const n = getCount(id);
      return `<label>
        <input type="checkbox" name="${name}" value="${id}">
        <span>${escapeHtml(label)}</span>
        <span class="count">[${String(n).padStart(2,'0')}]</span>
      </label>`;
    }).join('');
  }

  if (sidebar) {
    const brandHost = sidebar.querySelector('[data-filter="brands"]');
    const indHost = sidebar.querySelector('[data-filter="industries"]');
    const ttHost = sidebar.querySelector('[data-filter="testTypes"]');
    const catHost = sidebar.querySelector('[data-filter="categories"]');

    if (brandHost) {
      brandHost.innerHTML = makeCheckboxGroup('brand', window.BRANDS,
        b => b, b => b,
        b => window.PRODUCTS.filter(p => p.brand === b).length);
    }
    if (indHost) {
      indHost.innerHTML = makeCheckboxGroup('industry', window.INDUSTRIES,
        i => i.id, i => i.label,
        id => window.PRODUCTS.filter(p => (p.industries || []).includes(id)).length);
    }
    if (ttHost) {
      ttHost.innerHTML = makeCheckboxGroup('testType', window.TEST_TYPES,
        t => t.id, t => t.label,
        id => window.PRODUCTS.filter(p => (p.testTypes || []).includes(id)).length);
    }
    if (catHost && window.CATEGORIES) {
      catHost.innerHTML = makeCheckboxGroup('category', window.CATEGORIES,
        c => c.id, c => c.label,
        id => window.PRODUCTS.filter(p => p.category === id).length);
    }

    sidebar.addEventListener('change', (e) => {
      const t = e.target;
      if (t.name === 'brand') toggleSet(state.brands, t.value, t.checked);
      if (t.name === 'industry') toggleSet(state.industries, t.value, t.checked);
      if (t.name === 'testType') toggleSet(state.testTypes, t.value, t.checked);
      if (t.name === 'category') toggleSet(state.categories, t.value, t.checked);
      state.page = 1;
      render();
      writeHash();
    });
  }

  if (searchInput) {
    let timer = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        state.q = searchInput.value.trim().toLowerCase();
        state.page = 1;
        render();
        writeHash();
      }, 200);
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      state.sort = sortSelect.value;
      state.page = 1;
      render();
      writeHash();
    });
  }

  function toggleSet(set, val, on) {
    if (on) set.add(val); else set.delete(val);
  }

  function applyFilters() {
    return window.PRODUCTS.filter(p => {
      if (state.q) {
        const hay = `${p.name} ${p.brand} ${(p.testTypes || []).join(' ')} ${(p.industries || []).join(' ')} ${(p.standards || []).join(' ')} ${(p.specs && p.specs.standards) || ''}`.toLowerCase();
        if (!hay.includes(state.q)) return false;
      }
      if (state.brands.size && !state.brands.has(p.brand)) return false;
      if (state.industries.size && !(p.industries || []).some(i => state.industries.has(i))) return false;
      if (state.testTypes.size && !(p.testTypes || []).some(t => state.testTypes.has(t))) return false;
      if (state.categories.size && !state.categories.has(p.category)) return false;
      return true;
    });
  }

  function applySort(arr) {
    const a = arr.slice();
    if (state.sort === 'name') a.sort((x, y) => x.name.localeCompare(y.name));
    else if (state.sort === 'brand') a.sort((x, y) => x.brand.localeCompare(y.brand) || x.name.localeCompare(y.name));
    else a.sort((x, y) => (y.featured === true) - (x.featured === true));
    return a;
  }

  // Pager element lives right after the grid; created once, updated per render.
  let pager = grid.parentNode ? grid.parentNode.querySelector('[data-products-pager]') : null;
  if (!pager && grid.parentNode) {
    pager = document.createElement('nav');
    pager.setAttribute('data-products-pager', '');
    pager.className = 'products-pager';
    pager.setAttribute('aria-label', 'Catalog pages');
    grid.parentNode.insertBefore(pager, grid.nextSibling);
    pager.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-page]');
      if (!btn) return;
      const p = Number(btn.dataset.page);
      if (!Number.isFinite(p)) return;
      state.page = p;
      render();
      // Bring the top of the results into view after a page change.
      const top = document.querySelector('.products-toolbar') || grid;
      if (top && top.scrollIntoView) top.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function renderPager(total, pages) {
    if (!pager) return;
    if (pages <= 1) { pager.innerHTML = ''; return; }
    const cur = state.page;
    const nums = [];
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - cur) <= 1) nums.push(i);
      else if (nums[nums.length - 1] !== '…') nums.push('…');
    }
    const btn = (label, page, opts = {}) =>
      opts.disabled
        ? `<span class="products-pager__btn is-disabled">${label}</span>`
        : `<button type="button" class="products-pager__btn${opts.active ? ' is-active' : ''}" data-page="${page}">${label}</button>`;
    let html = btn('‹ Prev', cur - 1, { disabled: cur <= 1 });
    html += nums.map(n => n === '…' ? '<span class="products-pager__gap">…</span>' : btn(n, n, { active: n === cur })).join('');
    html += btn('Next ›', cur + 1, { disabled: cur >= pages });
    pager.innerHTML = html;
  }

  function render() {
    const list = applySort(applyFilters());
    const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (state.page > pages) state.page = pages;
    if (state.page < 1) state.page = 1;
    const start = (state.page - 1) * PAGE_SIZE;
    const pageList = list.slice(start, start + PAGE_SIZE);
    if (countEl) {
      const shownFrom = list.length ? start + 1 : 0;
      const shownTo = start + pageList.length;
      countEl.innerHTML = list.length
        ? `<strong>[${String(list.length).padStart(2, '0')}]</strong> instruments${pages > 1 ? ` · ${shownFrom}–${shownTo}` : ''}`
        : `<strong>[00]</strong> instruments`;
    }
    if (window.__productCard) {
      grid.innerHTML = list.length
        ? pageList.map(window.__productCard).join('')
        : `<div class="empty-state">
            <span class="eyebrow">No matches</span>
            <h3>No instruments match the current filters.</h3>
            <p>Try removing a filter, or <a href="/contact" style="color:var(--crimson); text-decoration:underline;">contact our team</a> — we can also source instruments outside this catalog.</p>
            <button type="button" class="btn btn--primary btn--sm" data-clear-filters>Clear all filters</button>
          </div>`;
      const clear = grid.querySelector('[data-clear-filters]');
      if (clear) clear.addEventListener('click', () => clearAll());
    }
    renderPager(list.length, pages);
  }

  function clearAll() {
    state.q = ''; state.brands.clear(); state.industries.clear(); state.testTypes.clear(); state.categories.clear(); state.page = 1;
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('[data-products-sidebar] input[type="checkbox"]').forEach(c => c.checked = false);
    render();
    writeHash();
  }

  function writeHash() {
    try {
      const compact = {
        q: state.q || undefined,
        b: state.brands.size ? [...state.brands] : undefined,
        i: state.industries.size ? [...state.industries] : undefined,
        t: state.testTypes.size ? [...state.testTypes] : undefined,
        c: state.categories.size ? [...state.categories] : undefined,
        s: state.sort !== 'featured' ? state.sort : undefined
      };
      const empty = !Object.values(compact).some(v => v !== undefined);
      if (empty) {
        history.replaceState(null, '', window.location.pathname);
      } else {
        history.replaceState(null, '', '#' + encodeURIComponent(JSON.stringify(compact)));
      }
    } catch (e) {}
  }

  function readHash() {
    if (!window.location.hash) return;
    try {
      const json = JSON.parse(decodeURIComponent(window.location.hash.slice(1)));
      if (json.q) state.q = json.q;
      if (json.b) json.b.forEach(b => state.brands.add(b));
      if (json.i) json.i.forEach(i => state.industries.add(i));
      if (json.t) json.t.forEach(t => state.testTypes.add(t));
      if (json.c) json.c.forEach(c => state.categories.add(c));
      if (json.s) state.sort = json.s;

      // Sync UI
      if (searchInput && state.q) searchInput.value = state.q;
      if (sortSelect && state.sort) sortSelect.value = state.sort;
      document.querySelectorAll('[data-products-sidebar] input[type="checkbox"]').forEach(c => {
        if (c.name === 'brand' && state.brands.has(c.value)) c.checked = true;
        if (c.name === 'industry' && state.industries.has(c.value)) c.checked = true;
        if (c.name === 'testType' && state.testTypes.has(c.value)) c.checked = true;
        if (c.name === 'category' && state.categories.has(c.value)) c.checked = true;
      });
    } catch (e) {}
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Brand quick-jump strip
  const brandStrip = document.querySelector('[data-brand-strip]');
  if (brandStrip && window.BRANDS) {
    brandStrip.innerHTML = window.BRANDS.map(b =>
      `<button type="button" data-brand-jump="${escapeHtml(b)}" aria-pressed="false">${escapeHtml(b)}</button>`
    ).join('');
    brandStrip.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-brand-jump]');
      if (!btn) return;
      const brand = btn.dataset.brandJump;
      const wasActive = btn.getAttribute('aria-pressed') === 'true';
      // Reset all brand filters and brand-jump pressed states
      brandStrip.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', 'false'));
      state.brands.clear();
      document.querySelectorAll('[data-products-sidebar] input[name="brand"]').forEach(c => c.checked = false);
      if (!wasActive) {
        // Activate this brand
        btn.setAttribute('aria-pressed', 'true');
        state.brands.add(brand);
        const cb = document.querySelector(`[data-products-sidebar] input[name="brand"][value="${CSS.escape(brand)}"]`);
        if (cb) cb.checked = true;
      }
      render();
      writeHash();
      // Scroll catalog into view
      document.querySelector('.products-layout')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Reset filters button (sidebar)
  const resetBtn = document.querySelector('[data-products-reset]');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    clearAll();
    if (brandStrip) brandStrip.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', 'false'));
  });

  // Live catalog count in coord
  const catalogCount = document.querySelector('[data-catalog-count]');
  if (catalogCount) catalogCount.textContent = `${window.PRODUCTS.length} INSTRUMENTS`;

  // Standard quick-filter chips (filter by ASTM/ISO/IP standard via search query)
  document.querySelectorAll('[data-standard]').forEach(chip => {
    chip.addEventListener('click', () => {
      const std = chip.dataset.standard;
      const wasActive = chip.getAttribute('aria-pressed') === 'true';
      // Clear all standard chips
      document.querySelectorAll('[data-standard]').forEach(c => c.setAttribute('aria-pressed', 'false'));
      if (!wasActive) {
        chip.setAttribute('aria-pressed', 'true');
        state.q = std.toLowerCase();
        if (searchInput) searchInput.value = std;
      } else {
        state.q = '';
        if (searchInput) searchInput.value = '';
      }
      render();
      writeHash();
      document.querySelector('.products-layout')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Make filter logic also search standards array (which is on each product)
  // Patch: extend applyFilters to include standards in search hay
  const originalApplyFilters = applyFilters;

  // Re-apply the full filter state from the URL hash. Used on browser
  // back/forward so returning to a filtered view restores it (instead of
  // falling back to the unfiltered list).
  function syncFromHash() {
    state.q = '';
    state.brands.clear();
    state.industries.clear();
    state.testTypes.clear();
    state.categories.clear();
    state.sort = 'featured';
    state.page = 1;
    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'featured';
    document.querySelectorAll('[data-products-sidebar] input[type="checkbox"]').forEach((c) => { c.checked = false; });
    readHash();
    render();
  }
  // Expose the current closure's sync so a single global listener always drives
  // the latest initialised grid (the script re-inits on client navigation).
  window.__cpProductsSync = syncFromHash;
  if (!window.__cpProductsHashBound) {
    window.__cpProductsHashBound = true;
    const onHistoryNav = () => { if (typeof window.__cpProductsSync === 'function') window.__cpProductsSync(); };
    window.addEventListener('popstate', onHistoryNav);
    window.addEventListener('hashchange', onHistoryNav);
  }

  readHash();
  render();
};

// Self-run on initial load (in case the user lands directly on /products before
// RouteAnimations mounts). Harmless if the grid isn't present.
window.__cpProductsPageInit();

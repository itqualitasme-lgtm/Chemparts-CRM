/* Chemparts — global behavior
 *
 * Structured for a persistent Next.js shell with client-side navigation.
 * window.__cpInit() is called once on first load AND after every route change
 * (see RouteAnimations.tsx). It splits into two parts:
 *
 *   1. ONE-TIME GLOBAL BINDINGS — mobile menu, quote modal, header scroll,
 *      scroll-progress bar, mobile bar, footer year. These attach to the
 *      persistent header/footer/chrome that survive navigation, so they must
 *      bind exactly once. Guarded by window.__cpGlobalsBound. Quote triggers use
 *      event delegation so [data-quote] buttons that appear only on some pages
 *      (e.g. /product) still work without re-binding.
 *
 *   2. RE-RUNNABLE CONTENT ANIMATIONS — scroll-reveal, stat counters, stagger,
 *      hero rotator/tilt/kinetic, marquees, industry filters/counts, product
 *      cards, words-reveal. These re-scan the CURRENT page's DOM every call so a
 *      freshly navigated page's [data-reveal] content gets revealed. Fresh
 *      IntersectionObservers per call are fine. Idempotent guards (data-*
 *      flags) keep duplication-style effects from stacking.
 */
(function () {
  'use strict';

  /* ===== Helpers (defined once, exposed globally) ===== */
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  window.__escapeHtml = escapeHtml;

  function productCard(p) {
    const inds = (p.industries || []).join(',');
    const featuredPill = p.featured ? '<span class="pill pill--crimson">Featured</span>' : '';
    return `
      <a class="card" href="/product?slug=${encodeURIComponent(p.slug)}" data-industry="${inds}">
        <div class="card__media">
          ${featuredPill}
          <img src="${p.thumb || p.image}" onerror="this.onerror=null;this.src='${p.image}'" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async">
        </div>
        <div class="card__body">
          <span class="card__brand">${escapeHtml(p.brand)}</span>
          <h3 class="card__title">${escapeHtml(p.name)}</h3>
          <p class="card__desc">${escapeHtml(p.desc)}</p>
          <div class="card__foot">
            <span class="mono text-muted">View instrument</span>
            <svg class="card__arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" stroke-width="1.25"/>
            </svg>
          </div>
        </div>
      </a>
    `;
  }
  window.__productCard = productCard;

  /* ===== Preloader: hide on window load (one-time shim) ===== */
  (function(__run){ if (document.readyState === 'complete') { __run(); } else { window.addEventListener('load', __run); } })(() => {
    const p = document.getElementById('preloader');
    if (p) {
      setTimeout(() => p.classList.add('is-loaded'), 200);
      setTimeout(() => { if (p.parentNode) p.remove(); }, 900);
    }
  });
  // Safety net: hide after 4s even if load event doesn't fire
  setTimeout(() => {
    const p = document.getElementById('preloader');
    if (p && !p.classList.contains('is-loaded')) p.classList.add('is-loaded');
  }, 4000);

  /* ================================================================
   * ONE-TIME GLOBAL BINDINGS
   * ================================================================ */
  function bindGlobalsOnce() {
    if (window.__cpGlobalsBound) return;
    window.__cpGlobalsBound = true;

    const mainEl = () => document.getElementById('main');

    /* ===== Header scrolled state + scroll-progress bar ===== */
    const header = document.querySelector('.site-header');
    let progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress';
      document.body.appendChild(progressBar);
    }
    function onScrollChrome() {
      if (header) header.dataset.scrolled = window.scrollY > 8 ? 'true' : 'false';
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0;
      progressBar.style.setProperty('--progress', pct + '%');
    }
    onScrollChrome();
    window.addEventListener('scroll', onScrollChrome, { passive: true });

    /* ===== Mobile nav toggle (focus trap, return-focus, inert background) ===== */
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    let lastNavFocus = null;
    if (menuToggle && nav) {
      const setOpen = (open) => {
        nav.dataset.open = open ? 'true' : 'false';
        menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        document.documentElement.classList.toggle('nav-locked', open);
        const m = mainEl();
        if (m) {
          if (open) m.setAttribute('inert', '');
          else m.removeAttribute('inert');
        }
        if (open) {
          lastNavFocus = document.activeElement;
          const firstLink = nav.querySelector('a, button');
          if (firstLink) setTimeout(() => firstLink.focus(), 60);
        } else {
          if (lastNavFocus && document.contains(lastNavFocus)) lastNavFocus.focus();
        }
      };
      menuToggle.addEventListener('click', () => {
        setOpen(nav.dataset.open !== 'true');
      });
      // Close the menu whenever a nav link is clicked. Delegated so it also
      // covers links rendered by the client header across navigation.
      nav.addEventListener('click', (e) => {
        if (e.target.closest('a')) setOpen(false);
      });
      document.addEventListener('keydown', (e) => {
        if (nav.dataset.open !== 'true') return;
        if (e.key === 'Escape') { setOpen(false); return; }
        if (e.key === 'Tab') {
          const focusables = nav.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (!focusables.length) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
      window.addEventListener('resize', () => {
        if (window.innerWidth > 920 && nav.dataset.open === 'true') setOpen(false);
      });
    }

    /* ===== Quote modal (open/close/submit) ===== */
    const modal = document.querySelector('[data-quote-modal]');
    const modalBackdrop = document.querySelector('.modal-backdrop');
    let lastFocus = null;
    // Cache the pristine form markup so we can restore it after a successful
    // send (the form body is replaced with a confirmation on submit).
    const quoteFormEl = modal ? modal.querySelector('[data-quote-form]') : null;
    const quoteFormPristine = quoteFormEl ? quoteFormEl.innerHTML : '';

    // Copy for each mode: 'quote' (enquiry) vs 'price' (price request).
    const MODAL_COPY = {
      quote: { eyebrow: 'Request a quote', title: 'Tell us what you need', submit: 'Send request' },
      price: { eyebrow: 'Request a price', title: 'Request the current price', submit: 'Request price' },
    };

    function resetQuoteForm() {
      if (quoteFormEl && quoteFormEl.dataset.sent === 'true') {
        quoteFormEl.innerHTML = quoteFormPristine;
        quoteFormEl.dataset.sent = 'false';
      }
    }

    function applyModalMode(mode) {
      const copy = MODAL_COPY[mode] || MODAL_COPY.quote;
      if (quoteFormEl) quoteFormEl.dataset.mode = mode;
      const eyebrow = modalBackdrop && modalBackdrop.querySelector('.modal__head .eyebrow');
      const title = modal && modal.querySelector('#quote-title');
      const submit = modal && modal.querySelector('button[type="submit"]');
      if (eyebrow) eyebrow.textContent = copy.eyebrow;
      if (title) title.textContent = copy.title;
      if (submit) submit.innerHTML = copy.submit + ' <span class="arrow">→</span>';
    }

    // Live-update the header cart badge after an add-to-cart (vanilla pages).
    window.__cpSetCartCount = function (n) {
      const count = Number(n) || 0;
      document.querySelectorAll('[data-cart-count]').forEach((el) => {
        el.textContent = String(count);
        el.style.display = count > 0 ? 'inline-block' : 'none';
      });
    };

    function openModal(slug, mode) {
      if (!modal || !modalBackdrop) return;
      resetQuoteForm();
      applyModalMode(mode === 'price' ? 'price' : 'quote');
      lastFocus = document.activeElement;
      modalBackdrop.dataset.open = 'true';
      document.documentElement.classList.add('modal-locked');
      const m = mainEl();
      if (m) m.setAttribute('inert', '');
      const inst = modal.querySelector('[name="instrument"]');
      if (inst && slug) inst.value = slug;
      setTimeout(() => {
        const first = modal.querySelector('input:not([readonly]):not([type="hidden"])');
        if (first) first.focus();
      }, 50);
    }
    function closeModal() {
      if (!modalBackdrop) return;
      modalBackdrop.dataset.open = 'false';
      document.documentElement.classList.remove('modal-locked');
      const m = mainEl();
      if (m && document.querySelector('.nav[data-open="true"]') === null) {
        m.removeAttribute('inert');
      }
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    }
    // Expose so re-runnable code / pages could trigger it if needed.
    window.__cpOpenQuote = openModal;
    window.__cpCloseQuote = closeModal;

    // Delegated quote trigger: any [data-quote] element works, including ones
    // that only exist on some pages (e.g. /product) after client navigation.
    document.addEventListener('click', (e) => {
      const priceTrigger = e.target.closest('[data-price]');
      if (priceTrigger) {
        e.preventDefault();
        openModal(priceTrigger.dataset.price || '', 'price');
        return;
      }
      const trigger = e.target.closest('[data-quote]');
      if (trigger) {
        e.preventDefault();
        openModal(trigger.dataset.quote || '', 'quote');
        return;
      }
      const closer = e.target.closest('[data-modal-close]');
      if (closer) {
        closeModal();
        return;
      }
    });

    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalBackdrop.dataset.open === 'true') closeModal();
        if (e.key === 'Tab' && modalBackdrop.dataset.open === 'true') {
          const focusables = modal.querySelectorAll('input, textarea, button, select, a');
          if (!focusables.length) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
    }

    /* ===== Quote form → submit as an enquiry (email to staff + customer) ===== */
    const quoteForm = document.querySelector('[data-quote-form]');
    if (quoteForm) {
      quoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(quoteForm);
        const name = (fd.get('name') || '').toString().trim();
        const company = (fd.get('company') || '').toString().trim();
        const email = (fd.get('email') || '').toString().trim();
        const slug = (fd.get('instrument') || '').toString().trim();
        const message = (fd.get('message') || '').toString().trim();
        const website = (fd.get('website') || '').toString().trim(); // honeypot

        const mode = quoteForm.dataset.mode === 'price' ? 'price' : 'quote';
        const endpoint = mode === 'price' ? '/api/price-request' : '/api/quote-enquiry';
        const payload = mode === 'price'
          ? { name, company, email, slug, qty: 1, message }
          : { name, company, email, instrument: slug, message, website };

        const submitBtn = quoteForm.querySelector('button[type="submit"]');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.dataset.busy = 'true'; }

        let ok = false;
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const data = await res.json().catch(() => ({}));
          ok = !!data.ok;
        } catch (err) { ok = false; }

        if (ok) {
          // Replace the form body with a confirmation, then auto-close. The
          // pristine markup is restored by resetQuoteForm() on next open.
          quoteForm.dataset.sent = 'true';
          const kind = mode === 'price' ? 'Price request sent ✓' : 'Request sent ✓';
          quoteForm.innerHTML =
            '<h3>' + kind + '</h3>' +
            '<p class="lede">Thank you' + (name ? ', ' + escapeHtmlText(name.split(' ')[0]) : '') +
            '. Our team will reply to <strong>' + (escapeHtmlText(email) || 'your email') +
            '</strong> — usually within the working day.</p>' +
            '<div class="actions"><button type="button" class="btn btn--accent" data-modal-close>Done</button></div>';
          setTimeout(() => { closeModal(); }, 4000);
        } else {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.dataset.busy = 'false'; }
          let err = quoteForm.querySelector('[data-quote-error]');
          if (!err) {
            err = document.createElement('p');
            err.setAttribute('data-quote-error', '');
            err.style.color = 'var(--crimson)';
            err.style.marginTop = '8px';
            const actions = quoteForm.querySelector('.actions');
            if (actions) actions.parentNode.insertBefore(err, actions);
          }
          err.textContent = 'Please check your name and a valid email, then try again. Or email info@chemparts-me.com.';
        }
      });
    }

    function escapeHtmlText(s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    /* ===== Sticky mobile bottom bar — show after scrolling past hero (or 400px) ===== */
    const bar = document.querySelector('.mobile-bar');
    if (bar) {
      let visible = false;
      function checkBar() {
        const trigger = document.querySelector('.hero')?.offsetHeight * 0.6 || 400;
        const should = window.scrollY > trigger;
        if (should !== visible) {
          visible = should;
          bar.classList.toggle('is-visible', should);
        }
      }
      checkBar();
      window.addEventListener('scroll', checkBar, { passive: true });
    }

    /* ===== Year in footer (persistent) ===== */
    document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  }

  /* ================================================================
   * RE-RUNNABLE CONTENT ANIMATIONS (run on every __cpInit call)
   * ================================================================ */
  function initContent() {
    /* ===== Scroll reveal — [data-reveal], every .section-head, [data-reveal-section] =====
       Re-scans the current DOM. Already-shown elements are skipped so we only
       observe the freshly navigated page's still-hidden content. */
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.dataset.shown = 'true';
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -10% 0px' });
      document.querySelectorAll('[data-reveal], .section-head, [data-reveal-section]').forEach(el => {
        if (el.dataset.shown === 'true') return;
        io.observe(el);
      });
    } else {
      document.querySelectorAll('[data-reveal], .section-head, [data-reveal-section]').forEach(el => el.dataset.shown = 'true');
    }

    /* ===== Hero kinetic type — capped to hero height (guarded against re-bind) ===== */
    const kt = document.querySelector('.kinetic');
    if (kt && !kt.dataset.cpKinetic && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      kt.dataset.cpKinetic = 'true';
      const hero = document.querySelector('.hero');
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!document.contains(kt)) return; // element gone after navigation
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const cap = hero ? hero.offsetHeight : 800;
          const offset = Math.max(-cap, -window.scrollY * 0.4);
          kt.style.transform = `translateX(${offset}px)`;
          ticking = false;
        });
      }, { passive: true });
    }

    /* ===== Industry filter (homepage cards) ===== */
    (function setupIndustryFilter() {
      const chips = document.querySelectorAll('[data-industry-chip]');
      const grid = document.querySelector('[data-filterable-grid]');
      if (!chips.length || !grid) return;
      const cards = grid.querySelectorAll('[data-industry]');

      function applyFilter(active) {
        cards.forEach(card => {
          const ind = (card.dataset.industry || '').split(',').map(s => s.trim());
          const match = active === 'all' || ind.includes(active);
          if (match) card.removeAttribute('hidden');
          else card.setAttribute('hidden', '');
        });
      }
      chips.forEach(chip => {
        if (chip.dataset.cpChipBound === 'true') return;
        chip.dataset.cpChipBound = 'true';
        chip.addEventListener('click', () => {
          chips.forEach(c => c.setAttribute('aria-pressed', 'false'));
          chip.setAttribute('aria-pressed', 'true');
          applyFilter(chip.dataset.industryChip);
        });
      });
    })();

    /* ===== Tabs (ARIA) ===== */
    document.querySelectorAll('[role="tablist"]').forEach(list => {
      if (list.dataset.cpTabsBound === 'true') return;
      list.dataset.cpTabsBound = 'true';
      const tabs = [...list.querySelectorAll('[role="tab"]')];
      const panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));

      function select(idx) {
        tabs.forEach((t, i) => {
          const sel = i === idx;
          t.setAttribute('aria-selected', sel ? 'true' : 'false');
          t.setAttribute('tabindex', sel ? '0' : '-1');
          if (panels[i]) {
            if (sel) panels[i].removeAttribute('hidden');
            else panels[i].setAttribute('hidden', '');
          }
        });
        tabs[idx].focus();
      }
      tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => select(i));
        tab.addEventListener('keydown', (e) => {
          let next = -1;
          if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
          else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
          else if (e.key === 'Home') next = 0;
          else if (e.key === 'End') next = tabs.length - 1;
          if (next !== -1) { e.preventDefault(); select(next); }
        });
      });
    });

    /* ===== Marquee duplication for seamless loop (idempotent) ===== */
    document.querySelectorAll('.marquee__track').forEach(track => {
      if (track.dataset.duplicated === 'true') return;
      const items = [...track.children];
      items.forEach(item => track.appendChild(item.cloneNode(true)));
      track.dataset.duplicated = 'true';
    });

    /* ===== Hero featured rotator (random start + auto-rotate) ===== */
    (function setupHeroRotator() {
      const wrap = document.querySelector('[data-hero-rotator]');
      if (!wrap || wrap.dataset.cpRotator === 'true' || !window.PRODUCTS) return;
      const img = wrap.querySelector('[data-hero-img]');
      const link = wrap.querySelector('[data-hero-link]');
      const name = wrap.querySelector('[data-hero-name]');
      const specs = wrap.querySelector('[data-hero-specs]');
      const progress = wrap.querySelector('[data-hero-progress]');
      if (!img || !name || !specs) return;

      const featured = window.PRODUCTS.filter(p => p.featured);
      if (featured.length < 2) return;
      wrap.dataset.cpRotator = 'true';

      let idx = Math.floor(Math.random() * featured.length);
      const dwell = 6000;
      const fade = 280;
      let timer = null;
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const esc = window.__escapeHtml || (s => String(s == null ? '' : s));

      function render(animate) {
        const p = featured[idx];
        const apply = () => {
          img.src = p.image;
          img.alt = p.brand + ' ' + p.name;
          name.textContent = p.name;
          if (link) link.href = `/product?slug=${encodeURIComponent(p.slug)}`;
          const s = p.specs || {};
          specs.innerHTML =
            `<tr><th>Make</th><td>${esc(p.brand)}</td></tr>` +
            `<tr><th>Type</th><td>${esc(s.type || '—')}</td></tr>` +
            `<tr><th>Standards</th><td>${esc(s.standards || '—')}</td></tr>`;
          img.style.opacity = '1';
        };
        if (animate) {
          img.style.opacity = '0';
          setTimeout(apply, fade);
        } else {
          apply();
        }
      }
      function tick() {
        idx = (idx + 1) % featured.length;
        render(true);
        restartProgress();
      }
      function start() {
        if (reduced) return;
        stop();
        timer = setInterval(tick, dwell);
        restartProgress();
      }
      function stop() {
        if (timer) clearInterval(timer);
        timer = null;
      }
      function restartProgress() {
        if (!progress || reduced) return;
        progress.style.transition = 'none';
        progress.style.transform = 'scaleX(0)';
        void progress.offsetWidth;
        progress.style.transition = `transform ${dwell}ms linear`;
        progress.style.transform = 'scaleX(1)';
      }
      render(false);
      start();
      wrap.addEventListener('mouseenter', stop);
      wrap.addEventListener('mouseleave', start);
      wrap.addEventListener('focusin', stop);
      wrap.addEventListener('focusout', start);
    })();

    /* ===== Render product cards (homepage) ===== */
    const homeGrid = document.querySelector('[data-home-products]');
    if (homeGrid && window.PRODUCTS) {
      const featured = window.PRODUCTS.filter(p => p.featured).slice(0, 8);
      homeGrid.innerHTML = featured.map(productCard).join('');
    }

    /* ===== Industry tile counts ===== */
    const indTiles = document.querySelectorAll('[data-industry-count]');
    if (indTiles.length && window.PRODUCTS) {
      indTiles.forEach(t => {
        const id = t.dataset.industryCount;
        const n = window.PRODUCTS.filter(p => (p.industries || []).includes(id)).length;
        t.textContent = `[${String(n).padStart(2, '0')}]`;
      });
    }

    /* ===== Industry chip counts on homepage ===== */
    document.querySelectorAll('[data-industry-chip]').forEach(chip => {
      const id = chip.dataset.industryChip;
      const countEl = chip.querySelector('.industry-chip__count');
      if (!countEl || !window.PRODUCTS) return;
      if (id === 'all') {
        countEl.textContent = String(window.PRODUCTS.length).padStart(2, '0');
      } else {
        countEl.textContent = String(window.PRODUCTS.filter(p => (p.industries || []).includes(id)).length).padStart(2, '0');
      }
    });

    /* ===== Stat counter animation ===== */
    (function setupStatCounters() {
      if (!('IntersectionObserver' in window)) return;
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const targets = [];
      document.querySelectorAll('.num-display').forEach(el => {
        if (el.dataset.cpCounter === 'true') return;
        const text = el.textContent.trim();
        const m = text.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
        if (!m) return;
        el.dataset.cpCounter = 'true';
        const prefix = m[1], target = parseFloat(m[2]), suffix = m[3];
        el.dataset.target = target;
        el.dataset.prefix = prefix;
        el.dataset.suffix = suffix;
        if (!reduced) el.textContent = `${prefix}0${suffix}`;
        targets.push(el);
      });
      if (reduced || !targets.length) return;
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const target = parseFloat(el.dataset.target);
          const prefix = el.dataset.prefix || '';
          const suffix = el.dataset.suffix || '';
          const dur = 1400;
          const start = performance.now();
          function step(now) {
            const t = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - t, 3);
            const val = target * eased;
            const display = target >= 100 ? Math.round(val) :
                           target >= 10  ? Math.round(val) :
                           (val % 1 === 0 ? Math.round(val) : val.toFixed(1));
            el.textContent = `${prefix}${display}${suffix}`;
            if (t < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          io.unobserve(el);
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.3 });
      targets.forEach(el => io.observe(el));
    })();

    /* ===== Staggered reveal ===== */
    (function setupStagger() {
      if (!('IntersectionObserver' in window)) return;
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          const items = [...e.target.children];
          items.forEach((item, i) => {
            item.style.setProperty('--stagger-i', i);
          });
          e.target.classList.add('is-staggered');
          io.unobserve(e.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      document.querySelectorAll('[data-stagger]').forEach(el => {
        if (el.classList.contains('is-staggered')) return;
        io.observe(el);
      });
    })();

    /* ===== Hero word-by-word reveal (fires on load / nav) ===== */
    document.querySelectorAll('[data-words-reveal]').forEach(el => {
      if (el.classList.contains('is-revealed')) return;
      requestAnimationFrame(() => {
        setTimeout(() => el.classList.add('is-revealed'), 50);
      });
    });

    /* ===== 3D mouse-tilt on featured product card ===== */
    (function setupHeroTilt() {
      const card = document.querySelector('[data-hero-tilt]');
      if (!card || card.dataset.cpTilt === 'true') return;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (matchMedia('(hover: none)').matches) return;
      card.dataset.cpTilt = 'true';

      const MAX_TILT = 6;
      let raf = null;
      let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

      function onMove(e) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width  - 0.5;
        const py = (e.clientY - r.top)  / r.height - 0.5;
        targetX = -py * MAX_TILT;
        targetY =  px * MAX_TILT;
        card.setAttribute('data-tilt-active', '');
        if (!raf) raf = requestAnimationFrame(animate);
      }
      function onLeave() {
        targetX = 0; targetY = 0;
        card.removeAttribute('data-tilt-active');
        if (!raf) raf = requestAnimationFrame(animate);
      }
      function animate() {
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
        card.style.transform = `perspective(1400px) rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg)`;
        if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
          raf = requestAnimationFrame(animate);
        } else {
          raf = null;
          if (targetX === 0 && targetY === 0) card.style.transform = '';
        }
      }
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    })();

    /* ===== Hero activity ticker — duplicate track for seamless loop (idempotent) ===== */
    document.querySelectorAll('.hero-ticker__track').forEach(track => {
      if (track.dataset.duplicated === 'true') return;
      [...track.children].forEach(item => track.appendChild(item.cloneNode(true)));
      track.dataset.duplicated = 'true';
    });
  }

  /* ================================================================
   * Public entry point — called on first load AND after every route change.
   * ================================================================ */
  window.__cpInit = function () {
    bindGlobalsOnce();
    initContent();
  };

  // Initial run (in case RouteAnimations hasn't mounted yet, or for non-React
  // usage). RouteAnimations also calls __cpInit on mount; the guards make the
  // duplicate call harmless.
  window.__cpInit();
})();

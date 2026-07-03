/* Chemparts — global behavior */
(function () {
  'use strict';

  /* ===== Preloader: hide on window load ===== */
  window.addEventListener('load', () => {
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

  /* ===== Mobile nav toggle (with focus trap, return-focus, inert background) ===== */
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  const mainEl = document.getElementById('main');
  let lastNavFocus = null;
  if (menuToggle && nav) {
    const setOpen = (open) => {
      nav.dataset.open = open ? 'true' : 'false';
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.documentElement.classList.toggle('nav-locked', open);
      // Make background inert when nav is open
      if (mainEl) {
        if (open) mainEl.setAttribute('inert', '');
        else mainEl.removeAttribute('inert');
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
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
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

  /* ===== Scroll reveal — applies to [data-reveal] AND every .section-head AND .section[data-reveal-section] ===== */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.dataset.shown = 'true';
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('[data-reveal], .section-head, [data-reveal-section]').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('[data-reveal], .section-head, [data-reveal-section]').forEach(el => el.dataset.shown = 'true');
  }

  /* ===== Hero kinetic type — capped to hero height to avoid huge offscreen layer ===== */
  const kt = document.querySelector('.kinetic');
  if (kt && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const hero = document.querySelector('.hero');
    let ticking = false;
    window.addEventListener('scroll', () => {
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
  function setupIndustryFilter() {
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
      chip.addEventListener('click', () => {
        chips.forEach(c => c.setAttribute('aria-pressed', 'false'));
        chip.setAttribute('aria-pressed', 'true');
        applyFilter(chip.dataset.industryChip);
      });
    });
  }
  setupIndustryFilter();

  /* ===== Tabs (ARIA) ===== */
  document.querySelectorAll('[role="tablist"]').forEach(list => {
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

  /* ===== Quote modal ===== */
  const modal = document.querySelector('[data-quote-modal]');
  const modalBackdrop = document.querySelector('.modal-backdrop');
  const quoteTriggers = document.querySelectorAll('[data-quote]');
  let lastFocus = null;

  function openModal(slug) {
    if (!modal || !modalBackdrop) return;
    lastFocus = document.activeElement;
    modalBackdrop.dataset.open = 'true';
    document.documentElement.classList.add('modal-locked');
    if (mainEl) mainEl.setAttribute('inert', '');
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
    if (mainEl && document.querySelector('.nav[data-open="true"]') === null) {
      mainEl.removeAttribute('inert');
    }
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  quoteTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(btn.dataset.quote || '');
    });
  });

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
    document.querySelectorAll('[data-modal-close]').forEach(b => b.addEventListener('click', closeModal));
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

  /* ===== Quote form → WhatsApp ===== */
  const quoteForm = document.querySelector('[data-quote-form]');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(quoteForm);
      const name = fd.get('name') || '';
      const company = fd.get('company') || '';
      const email = fd.get('email') || '';
      const slug = fd.get('instrument') || '';
      const message = fd.get('message') || '';
      const text = `Hello Chemparts, I'd like a quote.\n\nName: ${name}\nCompany: ${company}\nEmail: ${email}\nInstrument: ${slug}\n\n${message}`;
      const url = `https://wa.me/971557566123?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
      closeModal();
    });
  }

  /* ===== Marquee duplication for seamless loop ===== */
  document.querySelectorAll('.marquee__track').forEach(track => {
    if (track.dataset.duplicated === 'true') return;
    const items = [...track.children];
    items.forEach(item => track.appendChild(item.cloneNode(true)));
    track.dataset.duplicated = 'true';
  });

  /* ===== Hero featured rotator (random start + auto-rotate) ===== */
  function setupHeroRotator() {
    const wrap = document.querySelector('[data-hero-rotator]');
    if (!wrap || !window.PRODUCTS) return;
    const img = wrap.querySelector('[data-hero-img]');
    const link = wrap.querySelector('[data-hero-link]');
    const name = wrap.querySelector('[data-hero-name]');
    const specs = wrap.querySelector('[data-hero-specs]');
    const progress = wrap.querySelector('[data-hero-progress]');
    if (!img || !name || !specs) return;

    const featured = window.PRODUCTS.filter(p => p.featured);
    if (featured.length < 2) return;

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
        if (link) link.href = `product.html?slug=${encodeURIComponent(p.slug)}`;
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
      // force reflow
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
  }
  setupHeroRotator();

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

  /* ===== Helpers ===== */
  function productCard(p) {
    const inds = (p.industries || []).join(',');
    const featuredPill = p.featured ? '<span class="pill pill--crimson">Featured</span>' : '';
    return `
      <a class="card" href="product.html?slug=${encodeURIComponent(p.slug)}" data-industry="${inds}">
        <div class="card__media">
          ${featuredPill}
          <img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async">
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

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  window.__escapeHtml = escapeHtml;

  /* ===== Stat counter animation =====
     Animates .num-display values from 0 → final number when scrolled into view.
     Preserves any prefix/suffix (e.g. "20+", "<1", "100%", "24/7"). */
  function setupStatCounters() {
    if (!('IntersectionObserver' in window)) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('.num-display').forEach(el => {
      const text = el.textContent.trim();
      const m = text.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
      if (!m) return;
      const prefix = m[1], target = parseFloat(m[2]), suffix = m[3];
      el.dataset.target = target;
      el.dataset.prefix = prefix;
      el.dataset.suffix = suffix;
      if (reduced) return;
      el.textContent = `${prefix}0${suffix}`;
    });
    if (reduced) return;
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
          // easeOutCubic
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
    document.querySelectorAll('.num-display').forEach(el => io.observe(el));
  }
  setupStatCounters();

  /* ===== Staggered reveal — when a [data-stagger] container becomes visible,
     fade in its direct children one-by-one. */
  function setupStagger() {
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
    document.querySelectorAll('[data-stagger]').forEach(el => io.observe(el));
  }
  setupStagger();

  /* ===== Hero word-by-word reveal (fires on load) ===== */
  function setupWordsReveal() {
    document.querySelectorAll('[data-words-reveal]').forEach(el => {
      // Trigger after a short delay so CSS transition runs
      requestAnimationFrame(() => {
        setTimeout(() => el.classList.add('is-revealed'), 50);
      });
    });
  }
  setupWordsReveal();

  /* ===== 3D mouse-tilt on featured product card ===== */
  function setupHeroTilt() {
    const card = document.querySelector('[data-hero-tilt]');
    if (!card) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (matchMedia('(hover: none)').matches) return; // skip on touch

    const MAX_TILT = 6; // degrees
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
  }
  setupHeroTilt();

  /* ===== Hero activity ticker — duplicate track for seamless loop ===== */
  document.querySelectorAll('.hero-ticker__track').forEach(track => {
    if (track.dataset.duplicated === 'true') return;
    [...track.children].forEach(item => track.appendChild(item.cloneNode(true)));
    track.dataset.duplicated = 'true';
  });

  /* ===== Sticky mobile bottom bar — show after scrolling past hero (or 400px) ===== */
  function setupMobileBar() {
    const bar = document.querySelector('.mobile-bar');
    if (!bar) return;
    const trigger = document.querySelector('.hero')?.offsetHeight * 0.6 || 400;
    let visible = false;
    function check() {
      const should = window.scrollY > trigger;
      if (should !== visible) {
        visible = should;
        bar.classList.toggle('is-visible', should);
      }
    }
    check();
    window.addEventListener('scroll', check, { passive: true });
  }
  setupMobileBar();

  /* ===== Year in footer ===== */
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();

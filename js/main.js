(() => {
  'use strict';

  /* ------------------------------------------------------------------
     1. HELPERS
  ------------------------------------------------------------------ */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const html = document.documentElement;
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const EASE = 'cubic-bezier(.22,1,.36,1)';

  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** Inline SVG icon from the sprite in index.html (names: arrow-up-right, play, x ...) */
  const icon = (name, size = 24, extra = '') =>
    `<svg class="icon ${extra}" width="${size}" height="${size}"><use href="#i-${name}"/></svg>`;

  /** Swap the icon inside a button, e.g. setIcon(btn, 'minus') */
  const setIcon = (el, name) => el.querySelector('use')?.setAttribute('href', `#i-${name}`);

  /* ------------------------------------------------------------------
     2. MOTION PREFERENCE
  ------------------------------------------------------------------ */
  const reducedMotionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const motionBtn = $('#motionToggle');
  let userWantsMotion = true;
  try { userWantsMotion = localStorage.getItem('renando-motion') !== 'off'; } catch (_) {}

  const motionOn = () => true;
  function applyMotion() {
    const on = motionOn();
    html.dataset.motion = on ? 'on' : 'on';
    motionBtn.setAttribute('aria-label', on ? 'Animation pause' : 'Animation play');
    motionBtn.setAttribute('aria-pressed', String(!on));
    setIcon(motionBtn, on ? 'pause' : 'play');
    renderCut();
    onScroll();
  }

  motionBtn.addEventListener('click', () => {
    userWantsMotion = !userWantsMotion;
    try { localStorage.setItem('renando-motion', userWantsMotion ? 'on' : 'on'); } catch (_) {}
    applyMotion();
  });
  reducedMotionQuery.addEventListener?.('change', applyMotion);

  /* ------------------------------------------------------------------
     3. IMAGE LOADING STATES
     Markup:  <span class="media-image loading"><img ...></span>
     The wrapper gets .loaded or .error so CSS can fade / show a fallback.
  ------------------------------------------------------------------ */
  function mediaImage(src, alt, { priority = false, cls = '' } = {}) {
    return `<span class="media-image loading ${cls}"><img src="${esc(src)}" alt="${esc(alt)}" loading="${priority ? 'eager' : 'lazy'}" fetchpriority="${priority ? 'high' : 'auto'}" width="960" height="600"></span>`;
  }

  function markError(wrap) {
    wrap.classList.remove('loading', 'loaded');
    wrap.classList.add('error');
    if (!$('.image-fallback', wrap)) {
      wrap.insertAdjacentHTML('afterbegin', '<span class="image-fallback"><span class="display">JKR.</span><span>Preview is not available</span></span>');
    }
  }

  function settleImage(img) {
    const wrap = img.closest('.media-image');
    if (!wrap || !img.complete) return;
    if (img.naturalWidth) { wrap.classList.remove('loading', 'error'); wrap.classList.add('loaded'); }
    else markError(wrap);
  }

  /** Call after inserting new HTML so already-cached images get their state */
  const hydrateImages = (root = document) => $$('.media-image img', root).forEach(settleImage);

  // load / error don't bubble, so listen in the capture phase once for the whole page
  document.addEventListener('load', (e) => { if (e.target.tagName === 'IMG') settleImage(e.target); }, true);
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (img.tagName !== 'IMG') return;
    const wrap = img.closest('.media-image');
    if (!wrap) return;
    if (img.src.includes('maxresdefault.jpg')) img.src = img.src.replace('maxresdefault.jpg', 'hqdefault.jpg');
    else markError(wrap);
  }, true);

  /* ------------------------------------------------------------------
     4. SCROLL EFFECTS
  ------------------------------------------------------------------ */
  // 4a. Reveal-on-scroll: any element with [data-reveal] fades up when it enters the viewport.
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); revealObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -4% 0px' });
  const observeReveal = (el) => revealObserver.observe(el);

  // 4b. Parallax + progress bar (one throttled scroll handler)
  const progressBar = $('#readingProgress');
  const hero = $('#home');
  const heroTitle = $('[data-parallax="title"]');
  const heroPortrait = $('[data-parallax="portrait"]');
  const heroIntro = $('[data-parallax="intro"]');
  const aboutSection = $('#about');
  const processFill = $('#processFill');
  const breakdownSection = $('.breakdown');
  const breakdownTitle = $('[data-parallax="breakdown-title"]');
  const visibleCards = new Set();

  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? visibleCards.add(e.target) : visibleCards.delete(e.target)));
  }, { rootMargin: '100px' });

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScrollEffects);
  }

  function updateScrollEffects() {
    ticking = false;
    const vh = innerHeight;
    const max = html.scrollHeight - vh;
    progressBar.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max, 0, 1) : 0})`;

    const on = motionOn();

    // Hero parallax
    if (on) {
      const r = hero.getBoundingClientRect();
      const p = clamp(-r.top / r.height, 0, 1);
      heroTitle.style.transform = `translate3d(0,${p * 180}px,0)`;
      heroPortrait.style.transform = `translate3d(0,${p * 85}px,0) scale(${1 + p * 0.08})`;
      heroIntro.style.transform = `translate3d(0,${p * -55}px,0)`;
    } else {
      heroTitle.style.transform = heroPortrait.style.transform = heroIntro.style.transform = '';
    }

    // Project thumbnails drift slightly inside their frame
    visibleCards.forEach((card) => {
      const pic = $('.project-picture', card);
      if (!pic) return;
      if (!on) { pic.style.transform = ''; return; }
      const r = card.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh + r.height), 0, 1);
      pic.style.transform = `translate3d(0,${-12 + 24 * p}px,0)`;
    });

    // "From idea to final frame" vertical line fills as you scroll
    {
      const r = aboutSection.getBoundingClientRect();
      const p = clamp((vh * 0.75 - r.top) / r.height, 0, 1);
      processFill.style.transform = `scaleY(${on ? p : 1})`;
    }

    // Breakdown section: heading slides sideways, slider auto-sweeps until the visitor drags it
    {
      const r = breakdownSection.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh + r.height), 0, 1);
      breakdownTitle.style.transform = on ? `translate3d(${30 - 60 * p}px,0,0)` : '';
      if (on && !cut.interacted) { cut.value = Math.round(90 - p * 80); renderCut(); }
    }
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  // 4c. "Magnetic" buttons — gently follow the mouse
  $$('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      if (!motionOn() || e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.12}px, ${(e.clientY - r.top - r.height / 2) * 0.2}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  /* ------------------------------------------------------------------
     5. HEADER — scroll-spy + mobile menu
  ------------------------------------------------------------------ */
  const menuBtn = $('#menuToggle');
  const mobileMenu = $('#mobile-menu');

  function setMenu(open) {
    mobileMenu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    setIcon(menuBtn, open ? 'x' : 'menu');
  }
  menuBtn.addEventListener('click', () => setMenu(mobileMenu.hidden));
  mobileMenu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });

  const navLinks = $$('.desktop-nav a');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-15% 0px -65% 0px' });
  $$('main > section[id]').forEach((s) => spy.observe(s));

  /* ------------------------------------------------------------------
     6. PORTFOLIO — filters, search, grid, load more
  ------------------------------------------------------------------ */
  const featuredList = FEATURED
    .map((key) => PROJECTS.find((p) => p.media === key || p.title === key))
    .filter(Boolean);

  const portfolio = { category: 'All', query: '', expanded: false, limit: PAGE_SIZE };
  let visibleProjects = [];   // what is currently on screen (cards look themselves up by index)

  const filtersEl = $('#filters');
  const gridEl = $('#projectGrid');
  const searchInput = $('#searchInput');
  const allWorksBtn = $('#allWorksToggle');

  function typeLabel(p) {
    if (p.type === 'render') return '3D BREAKDOWN';
    if (p.type === 'youtube' || p.type === 'drive') return 'FILM / VIDEO';
    if (p.type === 'website') return 'WEBSITE';
    return 'STILL / IMAGE';
  }

  function cardHTML(p, i) {
    const isVideo = p.type === 'youtube' || p.type === 'drive';
    return `
      <article class="project-card" data-reveal style="--delay:${(i % 3) * 0.06}s">
        <button class="project-open" type="button" data-index="${i}" aria-label="Lihat ${esc(p.title)}">
          <div class="project-picture">${mediaImage(p.image, p.title)}</div>
          <span class="project-type">${typeLabel(p)}</span>
          <span class="project-hover">${isVideo ? icon('play', 18, 'filled') : icon('arrow-up-right', 22)}</span>
          <span class="project-frame" aria-hidden="true"></span>
        </button>
        <button class="project-caption" type="button" data-index="${i}">
          <span class="project-number display">${String(i + 1).padStart(2, '0')}</span>
          <span><h3>${esc(p.title)}</h3><span class="project-category">${esc(p.category)}${p.year ? ` / ${esc(p.year)}` : ''}</span></span>
          ${icon('arrow-up-right', 20)}
        </button>
      </article>`;
  }

  function renderFilters() {
    filtersEl.innerHTML = CATEGORIES.map((c) => {
      const on = c === portfolio.category;
      return `<button type="button" class="${on ? 'selected' : ''}" aria-pressed="${on}" data-cat="${esc(c)}">${esc(c)}${on ? '<span class="filter-line"></span>' : ''}</button>`;
    }).join('');
  }

  function renderPortfolio() {
    const q = portfolio.query.toLowerCase();
    const filtered = PROJECTS.filter((p) =>
      (portfolio.category === 'All' || p.category === portfolio.category) &&
      `${p.title} ${p.category} ${p.role}`.toLowerCase().includes(q));

    const showAll = portfolio.expanded || portfolio.category !== 'All' || portfolio.query;
    visibleProjects = showAll ? filtered.slice(0, portfolio.limit) : featuredList;

    // grid
    cardObserver.disconnect();
    visibleCards.clear();
    gridEl.innerHTML = visibleProjects.map(cardHTML).join('');
    hydrateImages(gridEl);
    $$('.project-card', gridEl).forEach((card) => { observeReveal(card); cardObserver.observe(card); });

    // header link ("ALL" <-> "SELECTED WORKS")
    $('span', allWorksBtn).textContent = portfolio.expanded ? 'SELECTED WORKS' : 'All';

    // empty state
    const empty = visibleProjects.length === 0;
    $('#emptyState').hidden = !empty;
    $('#emptyQuery').textContent = portfolio.query;

    // load more
    const more = portfolio.expanded && filtered.length > portfolio.limit;
    $('#loadMore').hidden = !more;
    $('#loadMoreCount').textContent = `${visibleProjects.length} Out of ${filtered.length} Works`;

    renderFilters();
    onScroll();
  }

  filtersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    portfolio.category = btn.dataset.cat;
    portfolio.expanded = true;
    portfolio.limit = PAGE_SIZE;
    renderPortfolio();
  });

  searchInput.addEventListener('input', () => {
    portfolio.query = searchInput.value;
    portfolio.expanded = true;
    portfolio.limit = PAGE_SIZE;
    renderPortfolio();
  });

  allWorksBtn.addEventListener('click', () => {
    if (portfolio.expanded) {
      portfolio.expanded = false; portfolio.category = 'All'; portfolio.query = ''; searchInput.value = '';
    } else {
      portfolio.expanded = true; portfolio.limit = PAGE_SIZE;
    }
    renderPortfolio();
  });

  $('#loadMoreBtn').addEventListener('click', () => { portfolio.limit += PAGE_SIZE; renderPortfolio(); });

  $('#resetSearch').addEventListener('click', () => {
    portfolio.query = ''; portfolio.category = 'All'; searchInput.value = '';
    renderPortfolio();
  });

  gridEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-index]');
    if (btn) openProject(visibleProjects[Number(btn.dataset.index)], btn);
  });

  /* ------------------------------------------------------------------
     7. BRAND STRIP — auto-scrolling logo rail
  ------------------------------------------------------------------ */
  const brandViewport = $('#brand-collection');
  const brandAllBtn = $('#brandAll');
  const brandControls = $('#brandControls');
  const brandPauseBtn = $('#brandPause');
  const brand = { showAll: false, paused: false, hovered: false, inView: true, setWidth: 0, pos: 0 };

  const brandImg = (b, alt) =>
    `<img src="assets/img/icon/${esc(b.file)}" alt="${esc(alt)}" title="${esc(b.name)}" width="150" height="60" loading="lazy" draggable="false">`;

  function renderBrands() {
    if (brand.showAll) {
      brandViewport.className = 'brand-full-grid';
      brandViewport.setAttribute('role', 'list');
      brandViewport.removeAttribute('tabindex');
      brandViewport.innerHTML = BRANDS.map((b) =>
        `<div class="brand-logo" role="listitem">${brandImg(b, b.name)}<span>${esc(b.name)}</span></div>`).join('');
    } else {
      brandViewport.className = 'brand-viewport';
      brandViewport.setAttribute('role', 'region');
      brandViewport.tabIndex = 0;
      // two identical sets → seamless infinite loop
      brandViewport.innerHTML = '<div class="brand-rail">' + [0, 1].map((n) =>
        `<div class="brand-set"${n ? ' aria-hidden="true"' : ''}>${BRANDS.map((b) => `<div class="brand-logo">${brandImg(b, n ? '' : b.name)}</div>`).join('')}</div>`
      ).join('') + '</div>';
    }
    $('span', brandAllBtn).textContent = brand.showAll ? 'DISPLAY SEQUENCE' : `SEE ALL (${BRANDS.length})`;
    setIcon(brandAllBtn, brand.showAll ? 'minus' : 'plus');
    brandAllBtn.setAttribute('aria-expanded', String(brand.showAll));
    brandControls.hidden = brand.showAll;
    updateBrandPauseUI();
    measureBrandSet();
  }

  function updateBrandPauseUI() {
    brandPauseBtn.setAttribute('aria-pressed', String(brand.paused));
    brandPauseBtn.setAttribute('aria-label', brand.paused ? 'Play logo animation' : 'Pause logo animation');
    setIcon(brandPauseBtn, brand.paused ? 'play' : 'pause');
  }

  function measureBrandSet() {
    brand.setWidth = $('.brand-set', brandViewport)?.getBoundingClientRect().width || 0;
  }

  function pauseBrand() { brand.paused = true; updateBrandPauseUI(); }

  function scrollBrand(direction) {
    pauseBrand();
    brandViewport.scrollBy({ left: direction * brandViewport.clientWidth * 0.7, behavior: motionOn() ? 'smooth' : 'instant' });
  }

  brandAllBtn.addEventListener('click', () => { brand.showAll = !brand.showAll; renderBrands(); });
  brandPauseBtn.addEventListener('click', () => { brand.paused = !brand.paused; updateBrandPauseUI(); });
  $('#brandPrev').addEventListener('click', () => scrollBrand(-1));
  $('#brandNext').addEventListener('click', () => scrollBrand(1));
  brandViewport.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') brand.hovered = true; });
  brandViewport.addEventListener('pointerleave', () => { brand.hovered = false; });
  brandViewport.addEventListener('pointerdown', pauseBrand);
  brandViewport.addEventListener('focusin', () => { brand.hovered = true; });
  brandViewport.addEventListener('focusout', (e) => { if (!brandViewport.contains(e.relatedTarget)) brand.hovered = false; });
  new ResizeObserver(measureBrandSet).observe(brandViewport);
  new IntersectionObserver(([e]) => { brand.inView = e.isIntersecting; }).observe(brandViewport);

  let lastFrame = performance.now();
  function brandTick(now) {
    const dt = Math.min(now - lastFrame, 40);
    lastFrame = now;
    const canRun = motionOn() && !brand.paused && !brand.hovered && brand.inView && !brand.showAll && brand.setWidth;
    if (canRun) {
      if (Math.abs(brand.pos - brandViewport.scrollLeft) > 2) brand.pos = brandViewport.scrollLeft; // user scrolled manually
      brand.pos += dt * 0.038;
      if (brand.pos >= brand.setWidth) brand.pos -= brand.setWidth;
      brandViewport.scrollLeft = brand.pos;
    }
    requestAnimationFrame(brandTick);
  }



  // 8b. Experience accordion (one row open at a time, click again to close)
  const jobRows = $$('#experienceList .experience-row');

  function setJobPanel(panel, open) {
    panel._anim?.cancel();
    const timing = { duration: 350, easing: EASE };
    if (open) {
      panel.hidden = false;
      if (motionOn()) panel._anim = panel.animate([{ height: '0px', opacity: 0 }, { height: `${panel.scrollHeight}px`, opacity: 1 }], timing);
    } else if (motionOn() && !panel.hidden) {
      const anim = panel._anim = panel.animate([{ height: `${panel.offsetHeight}px`, opacity: 1 }, { height: '0px', opacity: 0 }], timing);
      anim.onfinish = () => { if (!panel.closest('.experience-row').classList.contains('is-open')) panel.hidden = true; };
    } else {
      panel.hidden = true;
    }
  }

  $('#experienceList').addEventListener('click', (e) => {
    const btn = e.target.closest('.experience-row > button');
    if (!btn) return;
    const clicked = btn.closest('.experience-row');
    const willOpen = !clicked.classList.contains('is-open');
    jobRows.forEach((row) => {
      const open = willOpen && row === clicked;
      const b = $(':scope > button', row);
      row.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', String(open));
      setIcon(b, open ? 'minus' : 'plus');
      setJobPanel($(':scope > div', row), open);
    });
  });

  /* ------------------------------------------------------------------
     9. BEFORE / AFTER SLIDER  ("From raw. To real.")
  ------------------------------------------------------------------ */
  const stage = $('#comparisonStage');
  const range = $('#comparisonRange');
  const cut = { value: 65, interacted: false };

  function renderCut() {
    // before the visitor touches it: sweep with scroll (motion on) or rest at 50% (motion off)
    const shown = motionOn() || cut.interacted ? cut.value : 50;
    stage.style.setProperty('--cut', `${shown}%`);
    range.value = cut.value;
    range.setAttribute('aria-valuetext', `${cut.value}% solid, ${100 - cut.value}% final render`);
  }
  range.addEventListener('input', () => { cut.interacted = true; cut.value = Number(range.value); renderCut(); });

  /* ------------------------------------------------------------------
     10. CONTACT FORM → WhatsApp draft
  ------------------------------------------------------------------ */
  const WHATSAPP_NUMBER = '+917397364462';   // ← change the number here
  $('#briefForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const text = `Hello Janakiraman, saya ${f.get('name')}.\n\n${f.get('message')}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    $('#formNote').textContent = 'The message draft is ready in WhatsApp. Press Send there to start the conversation.';
  });

  /* ------------------------------------------------------------------
     11. PROJECT POP-UP
     openProject(project) accepts any object shaped like an entry in data.js
  ------------------------------------------------------------------ */
  const backdrop = $('#dialogBackdrop');
  const dialogEl = $('#projectDialog');
  const dlg = { project: null, shot: 0, stage: 'final', loaded: false, timer: null, opener: null, prevOverflow: '' };

  /** Work out what to show for the current project / shot / render stage */
  function dialogInfo() {
    const p = dlg.project;
    const shot = p.type === 'render' ? p.renders[dlg.shot] : null;
    const kind = shot?.video ? 'youtube' : shot?.drive ? 'drive' : p.type;
    const id = shot?.video || shot?.drive?.match(/\/d\/([^/]+)/)?.[1] || p.media;
    const stages = [['layout', 'Layout'], ['solid', 'Solid'], ['material', 'Material'], ['lighting', 'Lighting'], ['final', 'Final render']]
      .filter(([k]) => shot?.[k] && !(k === 'solid' && shot.hideSolidMode));
    const stageKey = shot?.[dlg.stage] ? dlg.stage : stages[0]?.[0];
    const still = shot?.[stageKey] || shot?.image || p.image;
    const link =
      kind === 'youtube' ? `https://www.youtube.com/watch?v=${id}` :
      kind === 'drive'   ? `https://drive.google.com/file/d/${id}/view` :
      p.type === 'render' ? still : (p.media || p.image);
    return { kind, id, isVideo: kind === 'youtube' || kind === 'drive', stages, stageKey, still, link };
  }

  function renderDialog(focusSelector) {
    const p = dlg.project;
    const i = dialogInfo();
    clearTimeout(dlg.timer);

    const embedSrc = i.kind === 'youtube'
      ? `https://www.youtube-nocookie.com/embed/${i.id}?autoplay=1&rel=0`
      : `https://drive.google.com/file/d/${i.id}/preview`;

    const media = i.isVideo
      ? `<div class="media-loading" role="status"><span class="loading-ring${motionOn() ? '' : ' paused'}"></span><p>Loading Project…</p></div>
         <iframe src="${esc(embedSrc)}" title="${esc(p.title)}" width="1280" height="720"
           allow="autoplay; encrypted-media; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
      : mediaImage(i.still, p.title, { priority: true });

    const showControls = p.type === 'render' && (i.stages.length > 0 || p.renders.length > 1);
    const controls = !showControls ? '' : `
      <div class="render-controls">
        <div role="group" aria-label="Rendering stage">
          ${i.stages.map(([k, label]) => `<button type="button" class="${k === i.stageKey ? 'selected' : ''}" aria-pressed="${k === i.stageKey}" data-stage="${k}">${label}</button>`).join('')}
        </div>
        ${p.renders.length > 1 ? `
          <div class="shot-controls">
            <button class="icon-button" type="button" data-shot="-1" aria-label="Previous Work">${icon('chevron-left')}</button>
            <span>SHOT ${dlg.shot + 1} / ${p.renders.length}</span>
            <button class="icon-button" type="button" data-shot="1" aria-label="Next Work">${icon('chevron-right')}</button>
          </div>` : ''}
      </div>`;

    dialogEl.innerHTML = `
      <div class="dialog-heading">
        <span class="eyebrow">${esc(p.category)}${p.year ? ` / ${esc(p.year)}` : ''}</span>
        <button class="icon-button" type="button" data-close aria-label="Tutup karya">${icon('x')}</button>
      </div>
      <div class="dialog-media ${i.isVideo ? '' : 'still'}">${media}</div>
      ${controls}
      <div class="dialog-description">
        <div>
          <h2 id="dialog-title">${esc(p.title)}</h2>
          ${p.role ? `<span class="accent">${esc(p.role)}</span>` : ''}
          <p>${esc(p.description)}</p>
        </div>
        ${i.link ? `<a class="outline-button" href="${esc(i.link)}" target="_blank" rel="noopener noreferrer">${p.type === 'website' ? 'Visit Website' : 'Open the original source '} ${icon('external-link', 15)}</a>` : ''}
      </div>
      ${i.isVideo ? '<p class="embed-note">If the video is restricted by the owner, use "Open the original source".</p>' : ''}`;

    hydrateImages(dialogEl);

    if (i.isVideo) {
      dlg.loaded = false;
      $('iframe', dialogEl).addEventListener('load', () => {
        dlg.loaded = true;
        clearTimeout(dlg.timer);
        $('.media-loading', dialogEl)?.remove();
      });
      // if the embed hasn't loaded after 14s, offer a retry
      dlg.timer = setTimeout(() => {
        const overlay = $('.media-loading', dialogEl);
        if (dlg.loaded || !overlay) return;
        overlay.innerHTML = '<p>Preview is not available. Open the original source to watch.</p><button class="outline-button" type="button" data-retry>Try again</button>';
      }, 14000);
    }

    if (focusSelector) $(focusSelector, dialogEl)?.focus();
  }

  function openProject(project, opener) {
    if (!project) return;
    dlg.project = project;
    dlg.shot = 0;
    dlg.stage = 'final';
    dlg.opener = opener || document.activeElement;
    dlg.prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    backdrop.hidden = false;
    renderDialog();
    dialogEl.focus();
  }

  function closeProject() {
    if (!dlg.project) return;
    clearTimeout(dlg.timer);
    backdrop.hidden = true;
    dialogEl.innerHTML = '';          // also stops any playing video
    document.body.style.overflow = dlg.prevOverflow;
    dlg.project = null;
    dlg.opener?.focus?.();
  }

  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeProject(); });

  dialogEl.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) return closeProject();
    const stageBtn = e.target.closest('[data-stage]');
    if (stageBtn) { dlg.stage = stageBtn.dataset.stage; return renderDialog(`[data-stage="${dlg.stage}"]`); }
    const shotBtn = e.target.closest('[data-shot]');
    if (shotBtn) {
      const n = dlg.project.renders.length;
      dlg.shot = (dlg.shot + Number(shotBtn.dataset.shot) + n) % n;
      return renderDialog(`[data-shot="${shotBtn.dataset.shot}"]`);
    }
    if (e.target.closest('[data-retry]')) renderDialog();
  });

  // Keyboard: Esc closes, Tab stays inside the dialog
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { setMenu(false); closeProject(); return; }
    if (e.key !== 'Tab' || !dlg.project) return;
    const items = $$('button, a[href], input, select, textarea, iframe', dialogEl).filter((el) => !el.disabled && el.getClientRects().length);
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogEl)) { e.preventDefault(); last?.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
  });

  // Anything in the page can open the pop-up through data attributes:
  //   data-open-reel   → plays the first FEATURED work (the showreel)
  //   data-open-image  → shows an image (certificates) – reads data-image / data-title / data-year ...
  document.addEventListener('click', (e) => {
    const reel = e.target.closest('[data-open-reel]');
    if (reel) return openProject(featuredList[0], reel);

    const img = e.target.closest('[data-open-image]');
    if (img) {
      const d = img.dataset;
      openProject({ type: 'image', title: d.title, year: d.year, image: d.image, media: d.image, category: d.category, description: d.description }, img);
    }
  });



  /* ------------------------------------------------------------------
     12. INIT
  ------------------------------------------------------------------ */
  $('#year').textContent = new Date().getFullYear();
  $$('[data-reveal]').forEach(observeReveal);
  hydrateImages();
  renderPortfolio();
  renderBrands();
  renderCut();
  applyMotion();
  requestAnimationFrame(brandTick);
})();


  // call dino
const gameSelector = document.getElementById("gameSelector");
// console.log(gameSelector)
// const openGameBtn = document.getElementById("openGameBtn");
const closeGameBtn = document.getElementById("closeGameBtn");

const gameModal = document.getElementById("gameModal");
const gameFrameContainer = document.getElementById("gameFrameContainer");


function loadSelectedGame() {

    const selectedGame = gameSelector.value;

    if (!selectedGame) {
        alert("Please select a game.");
        return;
    }

    // Destroy previous iframe completely.
    gameFrameContainer.innerHTML = "";

    // Create new iframe.
    const gameFrame = document.createElement("iframe");

    gameFrame.className = "game-frame";
    gameFrame.src = selectedGame;
    gameFrame.title = "Game";

    gameFrameContainer.appendChild(gameFrame);

    // Activate modal.
    gameModal.classList.add("active");

    // Prevent background scrolling.
    document.body.style.overflow = "hidden";
}


function closeGame() {

    // IMPORTANT:
    // Removing the iframe completely destroys
    // its JavaScript execution and CSS document.
    gameFrameContainer.innerHTML = "";

    // Hide modal.
    gameModal.classList.remove("active");

    // Restore scrolling.
    document.body.style.overflow = "";
    window.location.reload()
}


gameSelector.addEventListener("change", loadSelectedGame);

closeGameBtn.addEventListener("click", closeGame);


// Close when clicking outside the game.
gameModal.addEventListener("click", function (event) {

    if (event.target === gameModal) {
        closeGame();
    }

});


// Close with ESC.
document.addEventListener("keydown", function (event) {

    if (event.key === "Escape" && gameModal.classList.contains("active")) {
        closeGame();
    }

});

const finaliseCount = document.querySelectorAll('[data-finalise="true"]').length;

finaliseCount != 20 ? window.location.href = "https://jkr-26.github.io/portfolio/" : null;

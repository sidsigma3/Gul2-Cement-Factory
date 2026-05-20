/* =========================================================================
   Tarini Enterprises — site.js
   Theme toggle, mobile nav, product filter, scroll reveal, quote form.
   ========================================================================= */
(function () {
  'use strict';

  /* ---------- Theme toggle (dark default, persisted) ------------------- */
  var THEME_KEY = 'mtt:theme';
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (_) {}
  if (saved === 'light' || saved === 'dark') {
    root.setAttribute('data-theme', saved);
  } else {
    root.setAttribute('data-theme', 'dark');
  }

  function bindThemeToggle() {
    var btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      var next = current === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch (_) {}
    });
  }

  /* ---------- Mobile nav toggle --------------------------------------- */
  function bindNavToggle() {
    var btn = document.querySelector('[data-nav-toggle]');
    var menu = document.querySelector('[data-nav-menu]');
    if (!btn || !menu) return;
    btn.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Highlight active nav link ------------------------------- */
  function bindActiveNav() {
    var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!here || here === '') here = 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').toLowerCase();
      if (!href) return;
      if (href === here || (here === 'index.html' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  }

  /* ---------- Scroll reveal ------------------------------------------- */
  function bindReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  }

  /* ---------- Product filter (chips + cards) -------------------------- */
  function bindFilter() {
    var chips = document.querySelectorAll('[data-filter-chip]');
    var cards = document.querySelectorAll('[data-product-cat]');
    if (!chips.length || !cards.length) return;

    function apply(cat) {
      cards.forEach(function (card) {
        var cats = (card.getAttribute('data-product-cat') || '').split(/\s+/);
        var match = cat === 'all' || cats.indexOf(cat) >= 0;
        card.style.display = match ? '' : 'none';
      });
      chips.forEach(function (c) {
        c.classList.toggle('active', c.getAttribute('data-filter-chip') === cat);
      });
    }

    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        apply(c.getAttribute('data-filter-chip') || 'all');
      });
    });

    apply('all');
  }

  /* ---------- Quote form: client-side submit feedback ----------------- */
  function bindForm() {
    var form = document.querySelector('[data-quote-form]');
    if (!form) return;
    var success = form.querySelector('[data-form-success]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (success) {
        success.classList.add('show');
        success.scrollIntoView ? null : 0;
      }
      form.querySelectorAll('input, textarea, select').forEach(function (el) {
        if (el.type === 'submit' || el.type === 'button') return;
        if (el.type === 'checkbox' || el.type === 'radio') { el.checked = false; return; }
        el.value = '';
      });
      setTimeout(function () { if (success) success.classList.remove('show'); }, 6000);
    });
  }

  /* ---------- Scroll-driven frame animation --------------------------- */
  function bindScrollStory() {
    var section = document.querySelector('.scroll-story');
    if (!section) return;
    var canvas = section.querySelector('[data-frame-canvas]');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var loader      = section.querySelector('[data-frame-loader]');
    var loaderFill  = section.querySelector('[data-frame-loader-fill]');
    var loaderPct   = section.querySelector('[data-frame-loader-pct]');
    var progressEl  = section.querySelector('[data-frame-progress]');
    var progressBar = section.querySelector('[data-frame-progress-bar]');
    var captions    = section.querySelectorAll('.scroll-story-caption');

    /* === CONFIGURE TO MATCH YOUR EXPORTED FRAMES ==================== */
    var FRAME_COUNT = 240;
    var FRAME_PATH = function (n) {
      var s = '000' + n;
      return 'frames/ezgif-frame-' + s.slice(-3) + '.jpg';
    };
    /* ================================================================ */

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (loader) loader.classList.add('done');
      captions.forEach(function (c) { c.classList.add('active'); });
      return;
    }

    var images = new Array(FRAME_COUNT);
    var loadedCount = 0;
    var ready = false;
    var currentFrame = -1;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      var rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      canvas.width  = Math.round(rect.width  * dpr);
      canvas.height = Math.round(rect.height * dpr);
      draw(currentFrame >= 0 ? currentFrame : 0, true);
    }

    function draw(index, force) {
      if (!force && index === currentFrame) return;
      var img = images[index];
      if (!img || !img.complete || !img.naturalWidth) return;
      var cw = canvas.width, ch = canvas.height;
      var iw = img.naturalWidth, ih = img.naturalHeight;
      var scale = Math.max(cw / iw, ch / ih);
      var dw = iw * scale, dh = ih * scale;
      var dx = (cw - dw) / 2, dy = (ch - dh) / 2;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
      currentFrame = index;
    }

    function update() {
      var rect = section.getBoundingClientRect();
      var total = section.offsetHeight - window.innerHeight;
      var travelled = Math.min(Math.max(-rect.top, 0), total);
      var progress = total > 0 ? travelled / total : 0;

      var idx = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
      if (ready) draw(idx);

      var pctStr = String(Math.round(progress * 100));
      if (progressEl) progressEl.textContent = (pctStr.length < 2 ? '0' : '') + pctStr;
      if (progressBar) progressBar.style.width = (progress * 100) + '%';

      var stage = Math.min(captions.length - 1, Math.floor(progress * captions.length));
      captions.forEach(function (c, i) { c.classList.toggle('active', i === stage); });
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { update(); ticking = false; });
    }

    function onFrameLoaded(i) {
      loadedCount++;
      var pct = Math.round((loadedCount / FRAME_COUNT) * 100);
      if (loaderFill) loaderFill.style.width = pct + '%';
      if (loaderPct)  loaderPct.textContent  = pct;

      if (i === 0 && !ready) {
        currentFrame = -1;
        draw(0, true);
      }
      if (loadedCount >= FRAME_COUNT) {
        ready = true;
        if (loader) loader.classList.add('done');
        update();
      }
    }

    for (var i = 0; i < FRAME_COUNT; i++) {
      (function (idx) {
        var img = new Image();
        img.decoding = 'async';
        img.onload  = function () { onFrameLoaded(idx); };
        img.onerror = function () { onFrameLoaded(idx); };
        img.src = FRAME_PATH(idx + 1);
        images[idx] = img;
      })(i);
    }

    if (captions.length) captions[0].classList.add('active');
    resize();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);
  }

  /* ---------- Year stamp ---------------------------------------------- */
  function stampYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ---------- Init ---------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    bindThemeToggle();
    bindNavToggle();
    bindActiveNav();
    bindReveal();
    bindFilter();
    bindForm();
    bindScrollStory();
    stampYear();
  });
})();

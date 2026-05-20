/* =========================================================================
   Maa Tara Tarini Industry — site.js
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
    stampYear();
  });
})();

// Shared behaviour: announcement bar, menu drawer, search overlay, and the site settings
// (announcement bar text and header announcement) that staff edit in the admin portal.
(function () {
  'use strict';
  var d = document;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };

  // ---- announcement bar ----
  var promo = $('#promo-banner');
  try { if (promo && sessionStorage.getItem('promo-dismissed') === '1') promo.hidden = true; } catch (e) {}
  $$('[data-dismiss-promo]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (promo) promo.hidden = true;
      try { sessionStorage.setItem('promo-dismissed', '1'); } catch (e) {}
    });
  });

  // ---- header: black (transparent over the hero on the home page) at the top, white once the page has scrolled ----
  var sentinel = $('[data-sentinel]');
  var hdr = $('.site-hdr');
  if (sentinel && hdr && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      hdr.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  // ---- menu drawer ----
  var drawer = $('#menu-drawer');
  var backdrop = $('#menu-backdrop');
  var search = $('#site-search');
  var lastFocus = null;

  function lock(on) { d.body.classList.toggle('is-locked', on); }
  function openMenu() {
    if (!drawer) return;
    lastFocus = d.activeElement;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    backdrop.hidden = false;
    lock(true);
    var first = $('a, button', drawer);
    if (first) first.focus();
  }
  function closeMenu() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.hidden = true;
    lock(false);
    if (lastFocus) lastFocus.focus();
  }
  $$('[data-open-menu]').forEach(function (b) { b.addEventListener('click', openMenu); });
  $$('[data-close-menu]').forEach(function (b) { b.addEventListener('click', closeMenu); });
  if (backdrop) backdrop.addEventListener('click', closeMenu);

  // ---- search overlay (sends the query to the showcase page) ----
  function openSearch() {
    if (!search) return;
    lastFocus = d.activeElement;
    search.hidden = false;
    lock(true);
    var input = $('input', search);
    if (input) input.focus();
  }
  function closeSearch() {
    if (!search) return;
    search.hidden = true;
    lock(false);
    if (lastFocus) lastFocus.focus();
  }
  $$('[data-open-search]').forEach(function (b) { b.addEventListener('click', openSearch); });
  $$('[data-close-search]').forEach(function (b) { b.addEventListener('click', closeSearch); });

  d.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (search && !search.hidden) closeSearch();
    else if (drawer && drawer.classList.contains('is-open')) closeMenu();
  });

  // ---- site settings from Supabase (read only) ----
  // Settings saved by the admin portal are JSON text inside a JSON string, so only strings that
  // parse are used. The plain seed values that ship with db-setup.sql are ignored, as they were
  // before the redesign, so the copy in the page is what shows until staff publish a change.
  function parse(v) {
    if (typeof v !== 'string') return undefined;
    try { return JSON.parse(v); } catch (e) { return undefined; }
  }
  function apply(map) {
    var promoText = $('#promo-text');
    if (promoText && typeof map.promo_banner_text === 'string' && map.promo_banner_text) {
      promoText.textContent = map.promo_banner_text;
    }
    var ann = $('#announce-text');
    var list = map.store_announcements;
    if (ann && Array.isArray(list) && list.length && list[0]) ann.textContent = list[0];
    var title = $('#hero-title');
    if (title && typeof map.hero_title === 'string' && map.hero_title) title.innerHTML = map.hero_title;
    var sub = $('#hero-subtitle');
    if (sub && typeof map.hero_subtitle === 'string' && map.hero_subtitle) sub.textContent = map.hero_subtitle;
    // other scripts (gold.js) read the settings too
    window.ChempakaSettings = map;
    try { d.dispatchEvent(new CustomEvent('chempaka:settings', { detail: map })); } catch (e) {}
  }

  var KEY = 'chempaka-settings';
  var cached = null;
  try { cached = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (cached && Date.now() - cached.at < 5 * 60 * 1000) {
    apply(cached.map);
  } else if (window.ChempakaDB && ChempakaDB.client() && $('#promo-text')) {
    ChempakaDB.client().from('site_settings').select('*').then(function (res) {
      if (res.error || !res.data) return;
      var map = {};
      res.data.forEach(function (row) { map[row.key] = parse(row.value); });
      apply(map);
      try { sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), map: map })); } catch (e) {}
    }, function () {});
  }
})();

// Scroll entrances. IntersectionObserver only (no scroll listeners). Elements stay visible if
// scripts fail or the visitor prefers reduced motion, because the CSS only hides them in the
// no-preference case and only when the page has the "js" class.
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  document.addEventListener('DOMContentLoaded', function () {
    var targets = document.querySelectorAll('.cj-head, .cj-steps, .site-bento__tile, .cj-product, .cj-story, .cj-editorial__copy, .site-quote, .cj-boutique, .site-cols > div, .cj-article > p, .cj-article > h2, .cj-article > blockquote, .cj-karat, .site-chapter .site-showimg, .site-chapter .site-stack');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(targets, function (el) {
      // cards in a horizontal scroller are revealed by swiping, so they are left alone
      var scroller = el.parentElement && getComputedStyle(el.parentElement).overflowX;
      if (scroller === 'auto' || scroller === 'scroll') return;
      var siblings = el.parentElement ? Array.prototype.slice.call(el.parentElement.children) : [];
      el.style.setProperty('--i', Math.min(siblings.indexOf(el), 5));
      el.classList.add('reveal');
      io.observe(el);
    });
  });
})();

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

// Photographs below the first screen. Every photograph is a CSS background, which a browser fetches the moment the page
// is laid out, so a phone used to download all of them (over 2 MB on the home page) before the visitor had scrolled.
// The page head adds "js-lazy" to <html>, and site.css then withholds the photograph from any element that is not
// ".is-near"; this marks an element .is-near when it is within a screen or so of the viewport. Sideways rails
// (products, journal, bento) are released as a whole, since their cards are clipped by the rail until swiped to.
// Elements the scripts add later, or whose class changes (the showcase pieces), are picked up by a MutationObserver.
(function () {
  'use strict';
  var root = document.documentElement;
  if (!root.classList.contains('js-lazy') || !('IntersectionObserver' in window)) return;
  var PHOTO = '[class*="img-"]';
  var RAILS = '.cj-products, .cj-journal, .site-bento, .cj-bento';

  function release(el) {
    el.classList.add('is-near');
    Array.prototype.forEach.call(el.querySelectorAll(PHOTO), function (e) { e.classList.add('is-near'); });
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      release(entry.target);
    });
  }, { rootMargin: '700px 0px' });

  function watch(el) {
    if (el.classList.contains('is-near')) return;
    io.observe(el.closest(RAILS) || el);
  }

  Array.prototype.forEach.call(document.querySelectorAll(PHOTO), watch);

  if ('MutationObserver' in window) {
    new MutationObserver(function (list) {
      list.forEach(function (m) {
        if (m.type === 'attributes') {
          if (m.target.matches(PHOTO)) watch(m.target);
          return;
        }
        Array.prototype.forEach.call(m.addedNodes, function (n) {
          if (n.nodeType !== 1) return;
          if (n.matches(PHOTO)) watch(n);
          Array.prototype.forEach.call(n.querySelectorAll(PHOTO), watch);
        });
      });
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }
})();

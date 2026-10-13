// Gold price shown on the home page and the showcase.
//
// Which price is shown:
//   1. Automatic (the normal case): the live market price for 916 gold from /api/gold (see api/gold.js)
//      plus Chempaka Jewels' markup in RM per gram, rounded to the whole ringgit. The markup is the site setting
//      "gold_markup" (admin > Content management); DEFAULT_MARKUP is used until one is published. Today's market
//      price plus 72.40 comes to RM 574, and the figure then follows the market by itself.
//   2. A fixed rate typed in the admin ("gold_rate_916", with "gold_rate_updated") overrides the automatic price.
//      Leave that box empty to use the automatic price.
//   3. "Ask us" when there is no price at all (the market price could not be read and none is saved).
//
// The market price is kept in localStorage, so a visit shows a figure straight away and a failed request falls back
// to the last known price (up to a day old). The price is written into every [data-gold-916] element and a short
// "updated" line into every [data-gold-note]. Other scripts can read window.ChempakaGold.text() and listen for the
// "chempaka:gold" event.
(function () {
  'use strict';

  // RM per gram added to the market price until the admin publishes a markup
  var DEFAULT_MARKUP = 72.4;

  var KEY = 'chempaka-gold';
  var FRESH = 15 * 60 * 1000;
  var STALE = 24 * 60 * 60 * 1000;
  var market = null;

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
  }
  function money(n) {
    return 'RM ' + Number(n).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function when(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleString('en-MY', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  }
  function num(v, max) {
    var n = parseFloat(String(v).replace(/,/g, ''));
    return n >= 0 && n < max ? n : null;
  }
  function each(sel, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), fn);
  }

  // the price to show right now
  function effective() {
    var s = window.ChempakaSettings && typeof window.ChempakaSettings === 'object' ? window.ChempakaSettings : {};
    var fixed = num(s.gold_rate_916, 100000);
    if (fixed > 0) return { g916: fixed, updatedAt: s.gold_rate_updated || '' };
    if (!market) return null;
    var markup = num(s.gold_markup, 10000);
    if (markup === null) markup = DEFAULT_MARKUP;
    return { g916: Math.round(market.g916 + markup), updatedAt: market.updatedAt };
  }

  function render() {
    var p = effective();
    if (p) {
      each('[data-gold-916]', function (el) { el.textContent = money(p.g916); });
      each('[data-gold-unit]', function (el) { el.hidden = false; });
      each('[data-gold-note]', function (el) {
        var t = when(p.updatedAt);
        el.textContent = 'Chempaka Jewels rate' + (t ? ', updated ' + t : '') + '. The boutique confirms the final price.';
      });
    } else {
      each('[data-gold-916]', function (el) { el.textContent = 'Ask us'; });
      each('[data-gold-unit]', function (el) { el.hidden = true; });
      each('[data-gold-note]', function (el) { el.textContent = 'Today’s rate is available at the boutique or on WhatsApp.'; });
    }
  }

  function publish() {
    render();
    try { document.dispatchEvent(new CustomEvent('chempaka:gold', { detail: effective() })); } catch (e) {}
  }

  window.ChempakaGold = {
    get: effective,
    text: function () { var p = effective(); return p ? money(p.g916) + ' per gram (916)' : ''; },
  };

  // the site settings (from site.js) can arrive after this script runs
  document.addEventListener('chempaka:settings', publish);

  var cached = read();
  if (cached && cached.g916 && Date.now() - cached.fetchedAt < STALE) market = cached;
  publish();

  var needsRefresh = !cached || !cached.g916 || Date.now() - cached.fetchedAt > FRESH;
  if (!needsRefresh || !window.fetch) return;
  fetch('/api/gold', { headers: { accept: 'application/json' } })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (d) {
      if (!d || !(d.g916 > 0)) throw new Error('bad data');
      market = { g916: d.g916, g999: d.g999, updatedAt: d.updatedAt, fetchedAt: Date.now() };
      write(market);
      publish();
    })
    .catch(function () {});
})();

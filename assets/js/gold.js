// Gold price shown on the home page and the showcase.
//
// Which price is shown:
//   1. Automatic (the normal case): Bank Negara Malaysia's Kijang Emas selling price per gram from /api/gold
//      (see api/gold.js) plus Chempaka Jewels' adjustment in RM per gram, rounded to the whole ringgit. The
//      adjustment is the site setting "gold_adjust" (admin > Content management); DEFAULT_ADJUST, minus RM 15,
//      is used until one is published. The figure then follows Bank Negara's price by itself.
//   2. A fixed rate typed in the admin ("gold_rate_916", with "gold_rate_updated") overrides the automatic price.
//      Leave that box empty to use the automatic price.
//   3. "Ask us" when there is no price at all (Bank Negara's price could not be read and none is saved).
//
// Bank Negara's price is kept in localStorage, so a visit shows a figure straight away and a failed request falls
// back to the last known price (up to a day old). The price is written into every [data-gold-916] element and a
// short "updated" line into every [data-gold-note]. Other scripts can read window.ChempakaGold.text() and listen
// for the "chempaka:gold" event.
(function () {
  'use strict';

  // RM per gram added to Bank Negara's price until the admin publishes an adjustment (negative takes it off)
  var DEFAULT_ADJUST = -15;

  var KEY = 'chempaka-gold-bnm';
  var FRESH = 30 * 60 * 1000;
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
  function when(iso, withTime, zone) {
    var d = new Date(iso);
    if (!iso || isNaN(d)) return '';
    var opts = { day: 'numeric', month: 'short' };
    if (zone) opts.timeZone = zone;
    if (withTime) { opts.hour = 'numeric'; opts.minute = '2-digit'; }
    return d.toLocaleString('en-MY', opts);
  }
  // a plain number; the adjustment may be negative
  function num(v, max, allowNegative) {
    var n = parseFloat(String(v).replace(/,/g, ''));
    if (!isFinite(n)) return null;
    return (allowNegative ? Math.abs(n) < max : n >= 0 && n < max) ? n : null;
  }
  function each(sel, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), fn);
  }

  // the price to show right now
  function effective() {
    var s = window.ChempakaSettings && typeof window.ChempakaSettings === 'object' ? window.ChempakaSettings : {};
    var fixed = num(s.gold_rate_916, 100000);
    if (fixed > 0) return { g916: fixed, label: when(s.gold_rate_updated, true) };
    if (!market) return null;
    var adjust = num(s.gold_adjust, 10000, true);
    if (adjust === null) adjust = DEFAULT_ADJUST;
    return { g916: Math.round(market.perGram + adjust), label: market.effectiveDate ? when(market.effectiveDate + 'T00:00:00Z', false, 'UTC') : when(market.updatedAt, false) };
  }

  function render() {
    var p = effective();
    if (p) {
      each('[data-gold-916]', function (el) { el.textContent = money(p.g916); });
      each('[data-gold-unit]', function (el) { el.hidden = false; });
      each('[data-gold-note]', function (el) {
        el.textContent = 'Chempaka Jewels rate' + (p.label ? ', updated ' + p.label : '') + '. The boutique confirms the final price.';
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
  if (cached && cached.perGram > 0 && Date.now() - cached.fetchedAt < STALE) market = cached;
  publish();

  var needsRefresh = !market || Date.now() - market.fetchedAt > FRESH;
  if (!needsRefresh || !window.fetch) return;
  fetch('/api/gold', { headers: { accept: 'application/json' } })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (d) {
      if (!d || !(d.perGram > 0)) throw new Error('bad data');
      market = { perGram: d.perGram, effectiveDate: d.effectiveDate, updatedAt: d.updatedAt, fetchedAt: Date.now() };
      write(market);
      publish();
    })
    .catch(function () {});
})();

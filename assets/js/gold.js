// Live gold price. Asks /api/gold (see api/gold.js) and writes the 916 price into every [data-gold-916] element
// and a short "updated" line into every [data-gold-note]. The last good price is kept in localStorage, so a visit
// shows a figure straight away and a failed request falls back to the last known price (up to a day old).
// Other scripts can read window.ChempakaGold.text() and listen for the "chempaka:gold" event.
(function () {
  'use strict';

  var KEY = 'chempaka-gold';
  var FRESH = 15 * 60 * 1000;
  var STALE = 24 * 60 * 60 * 1000;
  var state = null;

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
  function each(sel, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), fn);
  }

  function render() {
    if (state) {
      each('[data-gold-916]', function (el) { el.textContent = money(state.g916); });
      each('[data-gold-unit]', function (el) { el.hidden = false; });
      each('[data-gold-note]', function (el) {
        el.textContent = 'Updated ' + when(state.updatedAt) + ' from the international gold price. The boutique confirms the rate you are quoted.';
      });
    } else {
      each('[data-gold-916]', function (el) { el.textContent = 'Ask us'; });
      each('[data-gold-unit]', function (el) { el.hidden = true; });
      each('[data-gold-note]', function (el) { el.textContent = 'Today’s rate is available at the boutique or on WhatsApp.'; });
    }
  }

  function publish() {
    render();
    try { document.dispatchEvent(new CustomEvent('chempaka:gold', { detail: state })); } catch (e) {}
  }

  window.ChempakaGold = {
    get: function () { return state; },
    text: function () { return state ? money(state.g916) + ' per gram (916)' : ''; },
  };

  var cached = read();
  if (cached && cached.g916 && Date.now() - cached.fetchedAt < STALE) state = cached;
  if (state) publish();

  var needsRefresh = !cached || !cached.g916 || Date.now() - cached.fetchedAt > FRESH;
  if (!needsRefresh) return;

  var done = function () { if (!state) publish(); };
  if (!window.fetch) { done(); return; }
  fetch('/api/gold', { headers: { accept: 'application/json' } })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (d) {
      if (!d || !(d.g916 > 0)) throw new Error('bad data');
      state = { g916: d.g916, g999: d.g999, updatedAt: d.updatedAt, fetchedAt: Date.now() };
      write(state);
      publish();
    })
    .catch(done);
})();

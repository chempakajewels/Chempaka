// Gold price for the website: Bank Negara Malaysia's Kijang Emas price, converted to ringgit per gram.
//
// Source, free and without an API key:
//   https://api.bnm.gov.my/public/kijang-emas   (Bank Negara open API, one price list per working day)
// It gives the buying and selling price of a 1 oz Kijang Emas coin in ringgit. Chempaka Jewels works from the
// selling price, so the figure returned here is that price divided by the grams in an ounce. The shop's own
// adjustment (minus RM 15 a gram) is applied on the website, see assets/js/gold.js.
//
// On Vercel this file is a serverless function at /api/gold. Vercel's edge keeps the answer for 10 minutes, and for up
// to 10 more while it fetches a fresh one, so a new Bank Negara price is on the site within about 20 minutes and Bank
// Negara is called a few times an hour whatever the traffic. Browsers are told not to keep it at all (the page keeps
// its own copy, see assets/js/gold.js). scripts/dev-server.js serves it locally.
// The figure is a reference price, not the boutique's counter rate.

var OUNCE_GRAMS = 31.1034768;
var BNM_URL = 'https://api.bnm.gov.my/public/kijang-emas';

async function getJson(url, headers) {
  var ctl = new AbortController();
  var timer = setTimeout(function () { ctl.abort(); }, 6000);
  try {
    var r = await fetch(url, { signal: ctl.signal, headers: headers });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

function round2(n) { return Math.round(n * 100) / 100; }

// Bank Negara writes "2026-10-13 02:00:05" in Malaysian time
function updatedIso(text) {
  var d = new Date(String(text || '').replace(' ', 'T') + '+08:00');
  return isNaN(d) ? new Date().toISOString() : d.toISOString();
}

module.exports = async function handler(req, res) {
  try {
    var body = await getJson(BNM_URL, { accept: 'application/vnd.BNM.API.v1+json' });
    var day = body && body.data;
    var coin = day && day.one_oz;
    var selling = Number(coin && coin.selling);
    var buying = Number(coin && coin.buying);
    // a 1 oz coin is thousands of ringgit; anything far from that is a bad reading
    if (!(selling > 1000 && selling < 200000) || !(buying > 1000 && buying < selling * 1.5)) throw new Error('implausible price');

    // A long stale window used to let the first visitor of the morning get yesterday's price; keep it short.
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.setHeader('CDN-Cache-Control', 'public, s-maxage=600, stale-while-revalidate=600');
    res.status(200).json({
      currency: 'MYR',
      unit: 'gram',
      perGram: round2(selling / OUNCE_GRAMS),
      perGramBuying: round2(buying / OUNCE_GRAMS),
      oneOzSelling: selling,
      oneOzBuying: buying,
      effectiveDate: String(day.effective_date || ''),
      updatedAt: updatedIso(body.meta && body.meta.last_updated),
      source: 'Bank Negara Malaysia, Kijang Emas selling price',
    });
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: 'unavailable' });
  }
};

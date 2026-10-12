// Gold price for the website: the international gold price (XAU in USD per troy ounce) converted to
// Malaysian ringgit per gram, for 999 (24K) and 916 (22K) gold.
//
// Sources, both free and without an API key:
//   gold price      https://api.gold-api.com/price/XAU
//   USD to MYR      https://api.frankfurter.dev (European Central Bank rates), with https://open.er-api.com as a second source
//
// On Vercel this file is a serverless function at /api/gold. The response is cached at the edge for 15 minutes,
// so the sources are called a few times an hour whatever the traffic. scripts/dev-server.js serves it locally.
// The figure is an indicative price from the international market, not the boutique's counter rate.

var OUNCE_GRAMS = 31.1034768;

async function getJson(url) {
  var ctl = new AbortController();
  var timer = setTimeout(function () { ctl.abort(); }, 6000);
  try {
    var r = await fetch(url, { signal: ctl.signal, headers: { accept: 'application/json' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

function plausibleRate(v) { return v > 2 && v < 8; }

async function usdToMyr() {
  try {
    var a = await getJson('https://api.frankfurter.dev/v1/latest?base=USD&symbols=MYR');
    var va = Number(a && a.rates && a.rates.MYR);
    if (plausibleRate(va)) return va;
  } catch (e) { /* fall through to the second source */ }
  var b = await getJson('https://open.er-api.com/v6/latest/USD');
  var vb = Number(b && b.rates && b.rates.MYR);
  if (plausibleRate(vb)) return vb;
  throw new Error('no exchange rate');
}

function round2(n) { return Math.round(n * 100) / 100; }

module.exports = async function handler(req, res) {
  try {
    var results = await Promise.all([getJson('https://api.gold-api.com/price/XAU'), usdToMyr()]);
    var gold = results[0];
    var myr = results[1];
    var usdPerOunce = Number(gold && gold.price);
    if (!(usdPerOunce > 500 && usdPerOunce < 20000)) throw new Error('implausible gold price');

    var g999 = (usdPerOunce * myr) / OUNCE_GRAMS;
    var updated = gold && gold.updatedAt && !isNaN(new Date(gold.updatedAt)) ? new Date(gold.updatedAt).toISOString() : new Date().toISOString();

    res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600');
    res.status(200).json({
      currency: 'MYR',
      unit: 'gram',
      g999: round2(g999),
      g916: round2(g999 * 0.916),
      usdPerOunce: round2(usdPerOunce),
      usdMyr: Math.round(myr * 10000) / 10000,
      updatedAt: updated,
      source: 'gold-api.com and frankfurter.dev',
    });
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: 'unavailable' });
  }
};

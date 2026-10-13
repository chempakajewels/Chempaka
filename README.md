# Chempaka

Static website for Chempaka (chempakajewel.com): home, showcase, journal, boutiques, Club membership and the staff admin portal.

## Run it locally

```
node scripts/dev-server.js
```

Then open http://localhost:5173. No install step.

## Edit the site

The pages are built from small pieces so the header, menu and footer live in one place.

- `src/partials/` holds the shared announcement bar, header, menu and footer.
- `src/pages/` holds each page. The first line is a JSON comment with the page title, description and options.
- `assets/css/site.css` is the only stylesheet. `assets/js/` holds the page scripts.

After editing anything in `src/`, run `node scripts/build-site.js`. It writes the HTML files in the repo root, which are what gets deployed.

## Live data

The membership form, the card lookup, the admin portal and the announcement text use Supabase (`supabase-config.js`, schema in `db-setup.sql`). Running the site locally talks to the same project, so do not submit test applications.

## Photos

- The Duta Chempaka section on the home page uses `assets/images/hero_model_hijab.jpg`, the same photograph as "The Royal Malay Heritage" in the showcase. That photograph is Ayu Damit.
- Studio photography is in `assets/images/album/`.

## Gold price

The 916 gold price on the home page and the showcase is automatic. `api/gold.js` is a Vercel serverless function (served locally by `scripts/dev-server.js` as `/api/gold`) that takes the international gold price (gold-api.com, USD per ounce) and the USD to MYR rate (frankfurter.dev, with open.er-api.com as a backup) and returns MYR per gram for 999 and 916 gold. Vercel caches the answer for 15 minutes, so the sources are called a few times an hour whatever the traffic. No API key is needed.

`assets/js/gold.js` shows the price: the live 916 market price plus Chempaka Jewels' markup (RM per gram, rounded to the whole ringgit). The markup is set in the admin (Content management) and defaults to RM 72.40, which made today's rate RM 574. A fixed rate typed in the admin overrides the automatic price. The last good market price is kept in the browser, so a failed request falls back to it, or to "Ask us" if there is none.

The boutique's counter rate can differ, and the page says so.

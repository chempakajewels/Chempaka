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

## Phones

The site is built for a phone first (Part 11 at the end of `assets/css/site.css`). Things to keep when adding to it:

- **Touch targets are at least 44 px** (links get an invisible larger area with `::after`), and text in forms is 16 px, because iPhones zoom the page in on anything smaller.
- **Hover effects go inside `@media (hover: hover)`.** On a phone a tap otherwise leaves the hover look stuck on.
- **Photographs load as they come near the screen.** Every photograph is a CSS background (a class named `img-...`), which a browser fetches at once; the page head sets `js-lazy` on `<html>` and `assets/js/site.js` releases each photograph when it is within about a screen of the viewport (sideways rails are released as a whole). Name new photo classes `img-...` and they are covered. Hero photographs (`img-hero-blue`, `img-hero-ring`) are excluded so the first screen is not delayed. Without JavaScript the photographs simply load.
- **Lighter photographs for phones** are in `assets/images/m/`, used up to 700 px wide. To add one, save a smaller copy there (about 800 to 1000 px wide, JPEG quality near 78) and add a rule for the same class in the `@media (max-width: 700px)` block at the end of `site.css`.
- The home hero can be swiped (`assets/js/home.js`).

## Photos

- The Duta Chempaka section on the home page uses `assets/images/hero_model_hijab.jpg`, the same photograph as "The Royal Malay Heritage" in the showcase. That photograph is Ayu Damit.
- Studio photography is in `assets/images/album/`.

## Gold price

The 916 gold price on the home page and the showcase is automatic and follows Bank Negara Malaysia. `api/gold.js` is a Vercel serverless function (served locally by `scripts/dev-server.js` as `/api/gold`) that reads Bank Negara’s Kijang Emas price list (`api.bnm.gov.my/public/kijang-emas`, one list per working day, no API key) and returns the selling price of a 1 oz coin divided by 31.1035 g, in ringgit per gram. Vercel caches the answer for 30 minutes, so Bank Negara is called a few times an hour whatever the traffic.

`assets/js/gold.js` shows the price: Bank Negara’s selling price per gram plus Chempaka Jewels’ adjustment (RM per gram, rounded to the whole ringgit). The adjustment is set in the admin (Content management, key `gold_adjust`) and defaults to -RM 15, so the rate is Bank Negara’s price minus RM 15. A fixed rate typed in the admin overrides the automatic price. The last good price is kept in the browser, so a failed request falls back to it, or to "Ask us" if there is none.

The boutique’s counter rate can differ, and the page says so.

### Gold price post (Instagram and TikTok)

Admin > Gold price post turns today's rate into a picture to post: Instagram 4:5 (1080 × 1350), Instagram 1:1 (1080 × 1080) or TikTok, Reels and Stories 9:16 (1080 × 1920), as a PNG. It shows the same rate as the website (the fixed rate if one is typed, otherwise Bank Negara's price plus the adjustment) and follows the boxes in Content management, so check the rate there first. On a phone a Share button opens the share sheet, which can go straight to Instagram or TikTok.

`assets/js/gold-card.js` draws it in the browser from `assets/images/gold-card-bg.jpg`, the emblem and the site fonts; nothing is uploaded. The name in the footer is `SHOP` at the top of that file, the WhatsApp number and web address sit beside it. The 9:16 size keeps its text out of the strips that TikTok and Stories cover with their own buttons.

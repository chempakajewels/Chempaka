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

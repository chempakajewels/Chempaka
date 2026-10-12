// Builds the static site: src/pages/*.html + src/partials/*.html -> the HTML files in the repo root.
// Usage: node scripts/build-site.js
// Each page starts with a JSON comment holding its title, description and options.
// Edit the pages and partials in src/, run this, and commit both src/ and the generated root pages.

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const SITE = 'https://www.chempakajewel.com';
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const partials = {
  promo: read('src/partials/promo.html'),
  header: read('src/partials/header.html'),
  menu: read('src/partials/menu.html'),
  footer: read('src/partials/footer.html'),
};


function head(meta, file) {
  const url = SITE + (meta.canonical || '/' + file.replace(/\.html$/, ''));
  const img = meta.ogImage ? SITE + meta.ogImage : null;
  const lines = [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}">`,
  ];
  if (meta.noindex) {
    lines.push('<meta name="robots" content="noindex, nofollow">');
  } else {
    lines.push(
      `<link rel="canonical" href="${url}">`,
      '<meta property="og:type" content="website">',
      '<meta property="og:site_name" content="Chempaka">',
      '<meta property="og:locale" content="en_MY">',
      `<meta property="og:title" content="${esc(meta.title)}">`,
      `<meta property="og:description" content="${esc(meta.ogDescription || meta.description)}">`,
      `<meta property="og:url" content="${url}">`,
      '<meta name="twitter:card" content="summary_large_image">',
      `<meta name="twitter:title" content="${esc(meta.title)}">`,
      `<meta name="twitter:description" content="${esc(meta.ogDescription || meta.description)}">`
    );
    if (img) {
      lines.push(
        `<meta property="og:image" content="${img}">`,
        `<meta property="og:image:alt" content="${esc(meta.ogImageAlt || meta.title)}">`,
        `<meta name="twitter:image" content="${img}">`
      );
    }
  }
  lines.push(
    '<script>document.documentElement.className += " js";</script>',
    '<link rel="preload" href="assets/fonts/Jost-normal-300.woff2" as="font" type="font/woff2" crossorigin>',
    '<link rel="preload" href="assets/fonts/BodoniModa-normal-400.woff2" as="font" type="font/woff2" crossorigin>'
  );
  (meta.preload || []).forEach((p) => lines.push('<link rel="preload" href="' + p + '" as="image">'));
  lines.push(
    '<link rel="stylesheet" href="assets/css/fonts.css">',
    '<link rel="stylesheet" href="assets/css/site.css">'
  );
  return lines.join('\n');
}

function scripts(meta, file) {
  const out = [];
  if (meta.supabase !== false) {
    out.push(
      '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>',
      '<script src="supabase-config.js"></script>'
    );
  }
  if (!meta.noSiteJs) out.push('<script src="assets/js/site.js"></script>');
  for (const s of meta.scripts || []) out.push(`<script src="assets/js/${s}.js"></script>`);
  return out.join('\n');
}

const pageDir = path.join(root, 'src/pages');
const written = [];
for (const file of fs.readdirSync(pageDir).filter((f) => f.endsWith('.html')).sort()) {
  let body = fs.readFileSync(path.join(pageDir, file), 'utf8');
  const m = body.match(/^<!--(\{[\s\S]*?\})-->\s*/);
  if (!m) throw new Error(file + ': missing JSON meta comment');
  const meta = JSON.parse(m[1]);
  body = body.slice(m[0].length);

  const layout = meta.layout || 'site';
  const header = partials.header.replace('{{HDR_CLASS}}', '');
  const overlay = partials.header.replace('{{HDR_CLASS}}', ' site-hdr--overlay');
  body = body.replace('{{header_overlay}}', overlay);

  let html;
  if (layout === 'admin') {
    html = [
      '<!doctype html>',
      '<html lang="en">',
      '<head>',
      head(meta, file),
      '</head>',
      '<body class="cj site">',
      body.trim(),
      scripts(meta, file),
      '</body>',
      '</html>',
      '',
    ].join('\n');
  } else {
    html = [
      '<!doctype html>',
      '<html lang="en">',
      '<head>',
      head(meta, file),
      '</head>',
      '<body class="cj site">',
      '<a class="site-skip" href="#main">Skip to content</a>',
      partials.promo.trim(),
      meta.header === 'none' ? '' : header.trim(),
      '<main id="main">',
      body.trim(),
      '</main>',
      partials.footer.trim(),
      partials.menu.trim(),
      scripts(meta, file),
      '</body>',
      '</html>',
      '',
    ]
      .filter((l) => l !== '')
      .join('\n');
  }
  fs.writeFileSync(path.join(root, file), html);
  written.push(file);
}
console.log('built: ' + written.join(', '));

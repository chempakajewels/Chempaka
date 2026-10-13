// Tiny static file server for local preview. No dependencies.
// Usage: node scripts/dev-server.js [port]   then open http://localhost:5173
// Mirrors vercel.json: "/about" serves about.html.

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const port = Number(process.argv[2] || process.env.PORT || 5173);

// The Supabase project from supabase-config.js. "/supabase/..." is forwarded to it, as vercel.json does on the live
// site, so the pages talk to their own origin first (see assets/js/db.js).
const UPSTREAM = (() => {
  try {
    const m = /https:\/\/[a-z0-9]+\.supabase\.co/.exec(fs.readFileSync(path.join(root, 'supabase-config.js'), 'utf8'));
    return m ? new URL(m[0]) : null;
  } catch (e) {
    return null;
  }
})();

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

http
  .createServer((req, res) => {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    // /api/gold runs the same serverless function as on Vercel (see api/gold.js)
    if (pathname === '/api/gold') {
      res.status = (code) => { res.statusCode = code; return res; };
      res.json = (body) => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(body)); };
      return require('../api/gold.js')(req, res);
    }
    if (UPSTREAM && req.url.startsWith('/supabase/')) {
      const target = new URL(req.url.slice('/supabase'.length), UPSTREAM);
      const headers = Object.assign({}, req.headers, { host: UPSTREAM.host });
      delete headers.origin;
      delete headers.referer;
      const upstream = https.request(target, { method: req.method, headers }, (r) => {
        res.writeHead(r.statusCode, r.headers);
        r.pipe(res);
      });
      upstream.on('error', () => {
        res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Bad gateway');
      });
      return req.pipe(upstream);
    }
    if (pathname.endsWith('/')) pathname += 'index.html';
    let file = path.join(root, pathname);
    if (!file.startsWith(root)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }
    if (!fs.existsSync(file) && fs.existsSync(file + '.html')) file += '.html';
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Not found');
      }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(data);
    });
  })
  .listen(port, () => console.log('Chempaka preview on http://localhost:' + port));

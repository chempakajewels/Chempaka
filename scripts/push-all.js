const fs = require('fs');
const https = require('https');

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('Missing GITHUB_TOKEN environment variable.');
  process.exit(1);
}
const owner = 'chempakajewels';
const repo = 'Chempaka';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.github.com',
      path: '/repos/' + owner + '/' + repo + path,
      method: method,
      headers: {
        'Authorization': 'token ' + token,
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(body);
    }
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(d));
        } catch (e) {
          resolve(d);
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function getSha(filePath) {
  const json = await request('GET', '/contents/' + filePath);
  return json.sha || null;
}

async function pushFile(localPath, repoPath, message) {
  try {
    if (!fs.existsSync(localPath)) {
      console.log('Skipping ' + repoPath + ' (file not found locally)');
      return;
    }
    const sha = await getSha(repoPath);
    const content = fs.readFileSync(localPath).toString('base64');
    const body = JSON.stringify({ message, content, sha, branch: 'main' });
    const res = await request('PUT', '/contents/' + repoPath, body);
    if (res.content) {
      console.log('SUCCESS: Pushed ' + repoPath);
    } else {
      console.log('ERROR pushing ' + repoPath + ':', res);
    }
  } catch(e) {
    console.log('EXCEPTION pushing ' + repoPath + ':', e);
  }
}

async function run() {
  const msg = 'security: lock down RLS to real admins, fix admin XSS, harden email webhook, remove hardcoded tokens from scripts';
  await pushFile('c:/tmp/Chempaka/tools/db-setup.sql', 'tools/db-setup.sql', msg);
  await pushFile('c:/tmp/Chempaka/membership.html', 'membership.html', msg);
  await pushFile('c:/tmp/Chempaka/admin.html', 'admin.html', msg);
  await pushFile('c:/tmp/Chempaka/supabase/functions/send-email/index.ts', 'supabase/functions/send-email/index.ts', msg);
  await pushFile('c:/tmp/Chempaka/supabase/config.toml', 'supabase/config.toml', msg);
  await pushFile('c:/tmp/Chempaka/.gitignore', '.gitignore', msg);
  await pushFile('c:/tmp/Chempaka/scripts/push-all.js', 'scripts/push-all.js', msg);
  await pushFile('c:/tmp/Chempaka/scripts/push-membership.js', 'scripts/push-membership.js', msg);
  await pushFile('c:/tmp/Chempaka/scripts/push-images.js', 'scripts/push-images.js', msg);
  await pushFile('c:/tmp/Chempaka/scripts/push-func.js', 'scripts/push-func.js', msg);
  await pushFile('c:/tmp/Chempaka/scripts/recover2.js', 'scripts/recover2.js', msg);
  await pushFile('c:/tmp/Chempaka/scripts/check_logs.js', 'scripts/check_logs.js', msg);
}

run().catch(console.error);

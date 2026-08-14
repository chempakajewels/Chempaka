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
  const sha = await getSha(repoPath);
  const content = fs.readFileSync(localPath).toString('base64');
  const body = JSON.stringify({ message, content, sha, branch: 'main' });
  const res = await request('PUT', '/contents/' + repoPath, body);
  if (res.content) {
    console.log('SUCCESS: Pushed ' + repoPath);
  } else {
    console.log('ERROR pushing ' + repoPath + ':', res);
  }
}

async function run() {
  await pushFile('c:/tmp/Chempaka/membership.html', 'membership.html', 'fix: responsive membership layout grid');
}

run().catch(console.error);

const fs = require('fs');
const path = require('path');
const https = require('https');

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('Missing GITHUB_TOKEN environment variable.');
  process.exit(1);
}
const owner = 'chempakajewels';
const repo = 'Chempaka';

function request(method, reqPath, body = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.github.com',
      path: '/repos/' + owner + '/' + repo + reqPath,
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
      let d = [];
      res.on('data', c => d.push(c));
      res.on('end', () => {
        try {
          const resStr = Buffer.concat(d).toString('utf8');
          resolve(JSON.parse(resStr));
        } catch (e) {
          resolve(Buffer.concat(d).toString('utf8'));
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
    const sha = await getSha(repoPath);
    const content = fs.readFileSync(localPath).toString('base64');
    const body = JSON.stringify({ message, content, sha, branch: 'main' });
    const res = await request('PUT', '/contents/' + repoPath, body);
    if (res.content) {
      console.log('SUCCESS: Pushed ' + repoPath);
    } else {
      console.log('ERROR pushing ' + repoPath + ':', res.message || res);
    }
  } catch(e) {
    console.log('EXCEPTION pushing ' + repoPath + ':', e.message);
  }
}

async function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = await getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
}

async function run() {
  const imagesDir = 'c:/tmp/Chempaka/assets/images';
  const allImages = await getAllFiles(imagesDir);
  const msg = 'fix: upload missing images to github repo';
  
  for (const localPath of allImages) {
    // Replace backslashes with forward slashes and get relative path
    const relativePath = 'assets/images/' + path.relative(imagesDir, localPath).replace(/\\/g, '/');
    console.log(`Pushing ${relativePath}...`);
    await pushFile(localPath, relativePath, msg);
  }
}

run().catch(console.error);

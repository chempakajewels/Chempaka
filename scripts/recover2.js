const https = require('https');
const fs = require('fs');

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('Missing GITHUB_TOKEN environment variable.');
  process.exit(1);
}
const owner = 'chempakajewels';
const repo = 'Chempaka';

const opts = {
  hostname: 'api.github.com',
  path: '/repos/' + owner + '/' + repo + '/contents/index.html',
  method: 'GET',
  headers: {
    'Authorization': 'token ' + token,
    'User-Agent': 'Node.js',
    'Accept': 'application/vnd.github.v3+json'
  }
};

https.get(opts, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    if (json.content) {
      const decoded = Buffer.from(json.content, 'base64').toString('utf8');
      fs.writeFileSync('c:/tmp/Chempaka/index.html', decoded);
      console.log('Successfully recovered index.html');
    } else {
      console.log('Error recovering:', data);
    }
  });
}).on('error', console.error);

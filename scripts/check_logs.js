const https = require('https');

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error('Missing SUPABASE_ACCESS_TOKEN environment variable.');
  process.exit(1);
}
const projectId = 'smgunduuvfwkahqiabrh';
const functionName = 'send-email';

const options = {
  hostname: 'api.supabase.com',
  path: `/v1/projects/${projectId}/functions/${functionName}/logs`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const logs = JSON.parse(data);
      console.log('Logs response:', JSON.stringify(logs, null, 2).slice(0, 1500));
    } catch(e) {
      console.log('Raw response:', data.slice(0, 1500));
    }
  });
});

req.on('error', e => console.error(e));
req.end();

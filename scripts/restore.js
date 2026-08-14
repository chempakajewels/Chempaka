const https = require('https');
const fs = require('fs');

https.get('https://raw.githubusercontent.com/chempakajewels/Chempaka/main/index.html', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('index.html', data);
    console.log('Restored index.html from GitHub');
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});

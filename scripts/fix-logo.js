const fs = require('fs');
let content = fs.readFileSync('c:/tmp/Chempaka/supabase/functions/send-email/index.ts', 'utf8');

const oldLogo = `<div class="logo">
      <span class="logo-text">CHEMPAKA</span>
    </div>`;

const newLogo = `<div class="logo">
      <a href="https://www.chempakajewel.com" style="text-decoration: none;">
        <span class="logo-text">CHEMPAKA</span>
      </a>
    </div>`;

content = content.replaceAll(oldLogo, newLogo);
fs.writeFileSync('c:/tmp/Chempaka/supabase/functions/send-email/index.ts', content);
console.log('SUCCESS: Replaced logo HTML');

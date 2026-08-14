const fs = require('fs');

const baseHtml = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Inter:wght@300;400;500&display=swap');
    body {
      margin: 0;
      padding: 0;
      background-color: #f7f7f7;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #1a1a1a;
    }
    .container {
      max-width: 520px;
      margin: 40px auto;
      background-color: #ffffff;
      padding: 48px 40px;
      border: 1px solid #efefef;
    }
    .logo {
      text-align: center;
      margin-bottom: 40px;
    }
    .logo-text {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 24px;
      letter-spacing: 0.15em;
      color: #000000;
      text-decoration: none;
      text-transform: uppercase;
    }
    .divider {
      height: 1px;
      background-color: #e5e5e5;
      margin: 32px 0;
      width: 100%;
    }
    h1 {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 18px;
      font-weight: 400;
      letter-spacing: 0.05em;
      color: #000000;
      margin-bottom: 24px;
      text-align: center;
      text-transform: uppercase;
    }
    p {
      font-size: 13px;
      line-height: 1.8;
      color: #4a4a4a;
      margin-bottom: 20px;
    }
    .btn {
      display: inline-block;
      background-color: #000000;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 14px 28px;
      margin-top: 10px;
    }
    .footer {
      text-align: center;
      font-size: 10px;
      color: #999999;
      margin-top: 40px;
      letter-spacing: 0.05em;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <span class="logo-text">CHEMPAKA</span>
    </div>
    \${content}
    <div class="footer">
      © \${new Date().getFullYear()} CHEMPAKA JEWELS. ALL RIGHTS RESERVED.<br>
      KUALA LUMPUR, MALAYSIA
    </div>
  </div>
</body>
</html>
`;

const insertHtml = baseHtml(`
    <h1>Registration Received</h1>
    <p>Dear \${name},</p>
    <p>Thank you for expressing your interest in the Chempaka Club. We have successfully received your registration application.</p>
    <p>Membership to the Chempaka Club is highly curated. Our concierge team is currently reviewing your application to ensure all details are in order. You will receive a formal notification once your membership status has been determined.</p>
    <div class="divider"></div>
    <p style="text-align: center; font-style: italic;">We appreciate your patience during this review period.</p>
`);

const updateHtml = baseHtml(`
    <h1>Membership Approved</h1>
    <p>Dear \${name},</p>
    <p>It is with great pleasure that we welcome you to the Chempaka Club. Your membership application has been formally approved.</p>
    <p>As a member, you now have access to our exclusive digital concierge, private collection showcases, and priority valuation services.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://chempakajewels.vercel.app/membership.html" class="btn">Access Your Account</a>
    </div>
    <div class="divider"></div>
    <p style="text-align: center; font-style: italic;">We look forward to serving you.</p>
`);

// Now replace in index.ts
let content = fs.readFileSync('c:/tmp/Chempaka/supabase/functions/send-email/index.ts', 'utf8');

// Replace INSERT logic
content = content.replace(
  /subject = 'Registration Received - Chempaka Club'[\s\S]*?html = `[\s\S]*?`/m,
  `subject = 'Registration Received - Chempaka Club'\n      html = \`${insertHtml.replace(/\\/g, '\\\\').replace(/\`/g, '\\`')}\``
);

// Replace UPDATE logic
content = content.replace(
  /subject = 'Welcome to Chempaka Club - Membership Approved'[\s\S]*?html = `[\s\S]*?`/m,
  `subject = 'Membership Approved - Chempaka Club'\n      html = \`${updateHtml.replace(/\\/g, '\\\\').replace(/\`/g, '\\`')}\``
);

fs.writeFileSync('c:/tmp/Chempaka/supabase/functions/send-email/index.ts', content);
console.log('SUCCESS: Updated email templates');

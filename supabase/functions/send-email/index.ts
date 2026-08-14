import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

serve(async (req) => {
  try {
    // The Authorization header alone only proves possession of the public
    // anon key, which is embedded client-side. Require a second, private
    // secret (set on the DB webhook and as a function secret) so this
    // endpoint can't be driven directly with attacker-chosen record data.
    if (WEBHOOK_SECRET && req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
      return new Response("Unauthorized", { status: 401 })
    }

    const payload = await req.json()
    console.log('Webhook payload received:', payload)

    const record = payload.record
    const oldRecord = payload.old_record
    const type = payload.type // 'INSERT' or 'UPDATE'

    if (!record || !record.email) {
      return new Response("Missing record data", { status: 400 })
    }

    const toEmail = record.email
    const name = escapeHtml(record.full_name ?? '')
    
    // Use the newly verified custom domain sender address
    const fromEmail = 'concierge@chempakajewel.com'

    let subject = ''
    let html = ''

    if (type === 'INSERT') {
      subject = 'Registration Received - Chempaka Club'
      html = `
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
      <a href="https://www.chempakajewel.com" style="text-decoration: none;">
        <span class="logo-text">CHEMPAKA</span>
      </a>
    </div>
    
    <h1>Registration Received</h1>
    <p>Dear ${name},</p>
    <p>Thank you for expressing your interest in the Chempaka Club. We have successfully received your registration application.</p>
    <p>Membership to the Chempaka Club is highly curated. Our concierge team is currently reviewing your application to ensure all details are in order. You will receive a formal notification once your membership status has been determined.</p>
    <div class="divider"></div>
    <p style="text-align: center; font-style: italic;">We appreciate your patience during this review period.</p>

    <div class="footer">
      © 2026 CHEMPAKA JEWELS. ALL RIGHTS RESERVED.<br>
      KUALA LUMPUR, MALAYSIA
    </div>
  </div>
</body>
</html>
`
    } else if (type === 'UPDATE' && record.status === 'approved' && oldRecord?.status === 'pending') {
      subject = 'Membership Approved - Chempaka Club'
      html = `
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
      <a href="https://www.chempakajewel.com" style="text-decoration: none;">
        <span class="logo-text">CHEMPAKA</span>
      </a>
    </div>
    
    <h1>Membership Approved</h1>
    <p>Dear ${name},</p>
    <p>It is with great pleasure that we welcome you to the Chempaka Club. Your membership application has been formally approved.</p>
    <p>As a member, you now have access to our exclusive digital concierge, private collection showcases, and priority valuation services.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://www.chempakajewel.com/membership.html" class="btn">Access Your Account</a>
    </div>
    <div class="divider"></div>
    <p style="text-align: center; font-style: italic;">We look forward to serving you.</p>

    <div class="footer">
      © 2026 CHEMPAKA JEWELS. ALL RIGHTS RESERVED.<br>
      KUALA LUMPUR, MALAYSIA
    </div>
  </div>
</body>
</html>
`
    } else {
      console.log('Event ignored (not an INSERT or approval UPDATE)')
      return new Response("Event ignored", { status: 200 })
    }

    // Send via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: `Chempaka Club <${fromEmail}>`,
        to: [toEmail],
        subject: subject,
        html: html
      })
    })

    const data = await res.json()
    console.log('Resend Response:', data)

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: res.ok ? 200 : 400
    })

  } catch (error) {
    console.error('Error processing webhook:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    })
  }
})

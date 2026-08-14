const fs = require('fs');
let content = fs.readFileSync('c:/tmp/Chempaka/db-setup.sql', 'utf8');

const webhookInstructions = [
'-- ============================================================================',
'-- 4. DATABASE WEBHOOK INSTRUCTIONS (For Email Notifications)',
'-- ============================================================================',
'-- Note: It is highly recommended to configure Webhooks via the Supabase Dashboard',
'-- rather than SQL, so you can securely set your Authorization headers.',
'--',
'-- Steps to configure your Email Webhook in Supabase:',
'-- 1. Go to your Supabase Dashboard -> Database -> Webhooks.',
'-- 2. Click "Create a new Hook".',
'-- 3. Name: "Send Membership Emails"',
'-- 4. Table: "members"',
'-- 5. Events: Check both [x] Insert and [x] Update.',
'-- 6. Type: HTTP Request',
'-- 7. Method: POST',
'-- 8. URL: https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/send-email',
'-- 9. HTTP Headers:',
'--    - Click "Add new header"',
'--    - Name: Authorization',
'--    - Value: Bearer <YOUR_SUPABASE_ANON_KEY>',
'-- 10. Click "Confirm".',
'--',
'-- After this is set up, any insert or approval update to the members table',
'-- will trigger your Edge Function and send an email via Resend!'
].join('\n');

content += '\n\n' + webhookInstructions + '\n';
fs.writeFileSync('c:/tmp/Chempaka/db-setup.sql', content);
console.log('SUCCESS: Appended webhook instructions to db-setup.sql');

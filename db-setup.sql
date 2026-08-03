-- SQL Script to Set Up Your Supabase Database Schema for Membership Approval Flow
-- Run this script inside your Supabase project's SQL Editor.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table if starting fresh, or modify it (safely recreating for a clean setup)
DROP TABLE IF EXISTS public.members;

-- 1. Create the members table with status and nullable member_id
CREATE TABLE public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id VARCHAR(50) UNIQUE DEFAULT NULL, -- Null until approved
    full_name TEXT NOT NULL,
    ic_number TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending' or 'approved'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security on members
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Policies for members:
-- 1. Allow anyone to register/insert
CREATE POLICY "Allow public insert to members" ON public.members 
    FOR INSERT WITH CHECK (true);

-- 2. Allow anyone to query a member (for Phone/IC login check)
CREATE POLICY "Allow public select of members" ON public.members 
    FOR SELECT USING (true);

-- 3. Allow authenticated users (Admins) to edit/delete member records
CREATE POLICY "Allow authenticated admins to write members" ON public.members 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 2. Create the site_settings table (key-value store for website content)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies for site_settings:
-- 1. Allow public reading of settings
CREATE POLICY "Allow public read of settings" ON public.site_settings 
    FOR SELECT USING (true);

-- 2. Allow authenticated users (Admins) to insert/update settings
CREATE POLICY "Allow authenticated admins to write settings" ON public.site_settings 
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 3. Seed Default Content Settings
INSERT INTO public.site_settings (key, value) VALUES
('promo_banner_text', '"Join the Chempaka Club today for exclusive in-store privileges | Visit Our Boutiques"'),
('hero_title', '"The Inner Glow: <br class=\"hidden md:inline\"><span class=\"italic text-[#FFFFFF]\">Chempaka Club</span>"'),
('hero_subtitle', '"Welcome to a curated circle of heritage, craftsmanship, and personal luxury. The Chempaka Club is designed for those who appreciate the fine art of gold and luxury jewelry."'),
('hero_bg_image_url', '"hero_necklace.jpg"'),
('store_announcements', '["Chempaka Gold Exchange & Valuation Available in Boutiques"]')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;


-- ============================================================================
-- 4. DATABASE WEBHOOK INSTRUCTIONS (For Email Notifications)
-- ============================================================================
-- Note: It is highly recommended to configure Webhooks via the Supabase Dashboard
-- rather than SQL, so you can securely set your Authorization headers.
--
-- Steps to configure your Email Webhook in Supabase:
-- 1. Go to your Supabase Dashboard -> Database -> Webhooks.
-- 2. Click "Create a new Hook".
-- 3. Name: "Send Membership Emails"
-- 4. Table: "members"
-- 5. Events: Check both [x] Insert and [x] Update.
-- 6. Type: HTTP Request
-- 7. Method: POST
-- 8. URL: https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/send-email
-- 9. HTTP Headers:
--    - Click "Add new header"
--    - Name: Authorization
--    - Value: Bearer <YOUR_SUPABASE_ANON_KEY>
-- 10. Click "Confirm".
--
-- After this is set up, any insert or approval update to the members table
-- will trigger your Edge Function and send an email via Resend!

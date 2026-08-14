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

-- ============================================================================
-- Admin allow-list
-- ============================================================================
-- Only user_ids listed here are treated as admins. Being "authenticated" alone
-- (i.e. having any Supabase Auth account) is NOT enough -- public signup is
-- enabled by default, so gating admin actions on auth role alone lets any
-- self-registered visitor approve/revoke memberships and edit site content.
CREATE TABLE IF NOT EXISTS public.admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
-- Intentionally no SELECT/INSERT/UPDATE/DELETE policies here: this table is
-- unreachable from the anon/authenticated client entirely. It is only ever
-- read through the SECURITY DEFINER function below, and rows are managed by
-- you directly in the SQL editor (or via the Supabase dashboard) using the
-- service_role key, which bypasses RLS.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  );
$$;

-- Policies for members:
-- 1. Allow anyone to register/insert, but only ever as an unapproved, pending
--    application -- prevents a caller from directly inserting status =
--    'approved' rows to self-grant membership.
DROP POLICY IF EXISTS "Allow public insert to members" ON public.members;
CREATE POLICY "Allow public insert to members" ON public.members
    FOR INSERT WITH CHECK (status = 'pending' AND member_id IS NULL);

-- 2. Only admins can browse the full members list (full_name/ic_number/phone/
--    email are sensitive PII and must not be publicly readable). Member-side
--    lookups go through the member_login() function below instead.
DROP POLICY IF EXISTS "Allow admins to select members" ON public.members;
CREATE POLICY "Allow admins to select members" ON public.members
    FOR SELECT TO authenticated USING (public.is_admin());

-- 3. Only admins can approve/revoke/reject.
DROP POLICY IF EXISTS "Allow admins to update members" ON public.members;
CREATE POLICY "Allow admins to update members" ON public.members
    FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow admins to delete members" ON public.members;
CREATE POLICY "Allow admins to delete members" ON public.members
    FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================================
-- Public member card lookup (replaces direct public SELECT on members)
-- ============================================================================
-- The membership.html "log in with Phone + IC" flow needs to look up a single
-- record without granting blanket read access to the whole table. This
-- SECURITY DEFINER function does the match server-side and returns only the
-- fields the membership card actually displays -- never ic_number or email.
CREATE OR REPLACE FUNCTION public.member_login(p_phone TEXT, p_ic TEXT)
RETURNS TABLE (
    member_id VARCHAR(50),
    full_name TEXT,
    status TEXT,
    joined_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.member_id, m.full_name, m.status, m.joined_at
  FROM public.members m
  WHERE m.phone = p_phone AND m.ic_number = p_ic
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.member_login(TEXT, TEXT) TO anon, authenticated;


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
DROP POLICY IF EXISTS "Allow public read of settings" ON public.site_settings;
CREATE POLICY "Allow public read of settings" ON public.site_settings
    FOR SELECT USING (true);

-- 2. Only admins can write settings (the CMS renders hero_title/promo_banner_text
--    as raw HTML on the public homepage, so write access here is equivalent to
--    unrestricted script injection on the site -- it must never be open to
--    every authenticated user).
DROP POLICY IF EXISTS "Allow admins to write settings" ON public.site_settings;
CREATE POLICY "Allow admins to write settings" ON public.site_settings
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- 3. Seed Default Content Settings
INSERT INTO public.site_settings (key, value) VALUES
('promo_banner_text', '"Join the Chempaka Club today for exclusive in-store privileges | Visit Our Boutiques"'),
('hero_title', '"The Inner Glow: <br class=\"hidden md:inline\"><span class=\"italic text-[#FFFFFF]\">Chempaka Club</span>"'),
('hero_subtitle', '"Welcome to a curated circle of heritage, craftsmanship, and personal luxury. The Chempaka Club is designed for those who appreciate the fine art of gold and luxury jewelry."'),
('hero_bg_image_url', '"hero_necklace.jpg"'),
('store_announcements', '["Chempaka Gold Exchange & Valuation Available in Boutiques"]')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;


-- ============================================================================
-- 4. REGISTER YOUR ADMIN ACCOUNT (required -- do this once)
-- ============================================================================
-- Signing in on admin.html only works for accounts listed in public.admins.
-- 1. Create (or reuse) a Supabase Auth user for yourself, e.g. via
--    Dashboard -> Authentication -> Users -> Add User.
-- 2. Copy that user's UUID and run:
--
--    INSERT INTO public.admins (user_id, email)
--    VALUES ('<paste-user-uuid-here>', 'admin@chempaka.com');
--
-- 3. Strongly recommended: also disable public signups for this project at
--    Dashboard -> Authentication -> Providers/Settings (there is no
--    legitimate site feature that needs open self-signup; the membership
--    "login" flow uses member_login() above and needs no Auth account at
--    all).

-- ============================================================================
-- 5. DATABASE WEBHOOK INSTRUCTIONS (For Email Notifications)
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
--    - Click "Add new header" again
--    - Name: X-Webhook-Secret
--    - Value: <a random string you generate -- also set as the WEBHOOK_SECRET
--      function secret: supabase secrets set WEBHOOK_SECRET=<same-value>>
--      This lets the function reject requests that didn't come from this
--      webhook, since the Authorization header alone only proves possession
--      of the public anon key.
-- 10. Click "Confirm".
--
-- After this is set up, any insert or approval update to the members table
-- will trigger your Edge Function and send an email via Resend!

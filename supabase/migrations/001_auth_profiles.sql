-- ====================================================================
-- 001_auth_profiles.sql
-- The Wisdom Academy School / Klapanya E-Learning
-- Production Profiles Table & Auth Linkage
-- ====================================================================

-- 1. Create enum for user account status
CREATE TYPE user_account_status AS ENUM ('ACTIVE', 'DISABLED', 'EXPIRED');

-- 2. Create User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    user_code TEXT NOT NULL UNIQUE, -- Permanent student/staff code (e.g. G6001, PROF001)
    display_name TEXT NOT NULL,
    organization_id TEXT NOT NULL DEFAULT 'ORG_KLAPANYA',
    classroom_id TEXT, -- e.g. 'P6-1', 'P6-2'
    grade_level TEXT DEFAULT 'G6',
    academic_year TEXT DEFAULT '2569',
    avatar_id TEXT DEFAULT 'BOY_WIZARD',
    hero_class TEXT DEFAULT 'SPEED_CHRONOMANCER',
    status user_account_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_login_at TIMESTAMPTZ
);

-- 3. Create indices for high-speed lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_code ON public.profiles(user_code);
CREATE INDEX IF NOT EXISTS idx_profiles_org_classroom ON public.profiles(organization_id, classroom_id);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON public.profiles(auth_user_id);

-- 4. Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

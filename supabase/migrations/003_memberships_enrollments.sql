-- ====================================================================
-- 003_memberships_enrollments.sql
-- The Wisdom Academy School / Klapanya E-Learning
-- Organizations, Memberships, and Classroom Scope Tables
-- ====================================================================

-- 1. Create Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
    id TEXT PRIMARY KEY, -- e.g. 'ORG_KLAPANYA'
    name TEXT NOT NULL,
    domain TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed default school organization
INSERT INTO public.organizations (id, name, domain) VALUES
('ORG_KLAPANYA', 'โรงเรียนกล้าปัญญา (The Wisdom Academy School)', 'klapanya.ac.th')
ON CONFLICT (id) DO NOTHING;

-- 2. Create Memberships Table (Multi-Org Role Binding)
CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(profile_id, organization_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_profile ON public.memberships(profile_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org_role ON public.memberships(organization_id, role_id);

-- 3. Create Classroom Enrollments Table (Learner -> Classroom Scope)
CREATE TABLE IF NOT EXISTS public.classroom_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    classroom_id TEXT NOT NULL, -- e.g. 'P6-1', 'P6-2', 'P6-VIP'
    learner_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    academic_year TEXT NOT NULL DEFAULT '2569',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(organization_id, classroom_id, learner_profile_id, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_classroom ON public.classroom_enrollments(organization_id, classroom_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_learner ON public.classroom_enrollments(learner_profile_id);

-- 4. Create Professor Classroom Assignments Table (Professor -> Classroom Scope)
CREATE TABLE IF NOT EXISTS public.professor_classroom_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    classroom_id TEXT NOT NULL,
    professor_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    academic_year TEXT NOT NULL DEFAULT '2569',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(organization_id, classroom_id, professor_profile_id, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_prof_assignments ON public.professor_classroom_assignments(professor_profile_id);

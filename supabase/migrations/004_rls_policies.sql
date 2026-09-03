-- ====================================================================
-- 004_rls_policies.sql
-- The Wisdom Academy School / Klapanya E-Learning
-- Row Level Security (RLS) Policies & Organization Scopes
-- ====================================================================

-- 1. Enable RLS on all sensitive tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professor_classroom_assignments ENABLE ROW LEVEL SECURITY;

-- 2. Helper Functions for RLS context
-- Check if current authenticated user is an Admin in the given organization
CREATE OR REPLACE FUNCTION public.is_org_admin(org_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles p
        JOIN public.memberships m ON m.profile_id = p.id
        WHERE p.auth_user_id = auth.uid()
        AND m.organization_id = org_id
        AND m.role_id = 'ADMIN'
        AND p.status = 'ACTIVE'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current authenticated user is a Professor assigned to the classroom
CREATE OR REPLACE FUNCTION public.is_assigned_professor(org_id TEXT, class_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles p
        JOIN public.professor_classroom_assignments pca ON pca.professor_profile_id = p.id
        WHERE p.auth_user_id = auth.uid()
        AND pca.organization_id = org_id
        AND pca.classroom_id = class_id
        AND p.status = 'ACTIVE'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. PROFILES POLICIES
-- Policy A: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth_user_id = auth.uid());

-- Policy B: Professors can view learners enrolled in their assigned classrooms
CREATE POLICY "Professors can view assigned classroom learners"
ON public.profiles FOR SELECT
USING (
    public.is_assigned_professor(organization_id, classroom_id)
);

-- Policy C: Org Admins can view all profiles in their organization
CREATE POLICY "Admins can view org profiles"
ON public.profiles FOR SELECT
USING (
    public.is_org_admin(organization_id)
);

-- Policy D: Users can update their own non-critical profile fields (avatar, displayName)
CREATE POLICY "Users can update own profile display"
ON public.profiles FOR UPDATE
USING (auth_user_id = auth.uid())
WITH CHECK (
    auth_user_id = auth.uid()
    AND status = (SELECT status FROM public.profiles WHERE auth_user_id = auth.uid()) -- Cannot self-unban
);

-- Policy E: Org Admins can insert/update/delete profiles in their organization
CREATE POLICY "Admins can manage org profiles"
ON public.profiles FOR ALL
USING (public.is_org_admin(organization_id));

-- 4. CLASSROOM ENROLLMENTS POLICIES
-- Learners can view their own enrollment
CREATE POLICY "Learners view own enrollment"
ON public.classroom_enrollments FOR SELECT
USING (
    learner_profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
);

-- Professors can view enrollments in their assigned classrooms
CREATE POLICY "Professors view assigned classroom enrollments"
ON public.classroom_enrollments FOR SELECT
USING (
    public.is_assigned_professor(organization_id, classroom_id)
);

-- Admins can manage all enrollments in their organization
CREATE POLICY "Admins manage org enrollments"
ON public.classroom_enrollments FOR ALL
USING (public.is_org_admin(organization_id));

-- 5. MEMBERSHIPS POLICIES
-- Users can view their own memberships
CREATE POLICY "Users view own memberships"
ON public.memberships FOR SELECT
USING (
    profile_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
);

-- Admins can manage memberships in their organization
CREATE POLICY "Admins manage org memberships"
ON public.memberships FOR ALL
USING (public.is_org_admin(organization_id));

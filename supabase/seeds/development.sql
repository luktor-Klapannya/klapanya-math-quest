-- ====================================================================
-- Explicit local/test fixture only. Never run against a hosted project.
-- The Wisdom Academy School / Klapanya E-Learning
-- Development Seed Data (Isolated from Production Credentials)
-- ====================================================================

-- 1. Insert Seed Profiles
DO $$ BEGIN
 IF current_setting('game.allow_development_seed',true) IS DISTINCT FROM 'LOCAL_DISPOSABLE_ONLY'
 THEN RAISE EXCEPTION 'Development seed disabled outside an explicitly opted-in disposable local database'; END IF;
END $$;

INSERT INTO public.profiles (id, user_code, display_name, organization_id, classroom_id, grade_level, academic_year, avatar_id, hero_class, status)
VALUES
('00000000-0000-0000-0000-000000000001', 'PROF001', 'คุณครูปัญญา วิชาการ', 'ORG_KLAPANYA', NULL, 'G6', '2569', 'BOY_WIZARD', 'SPEED_CHRONOMANCER', 'ACTIVE'),
('00000000-0000-0000-0000-000000000002', 'G6001', 'น้องกล้าหาญ (Alex)', 'ORG_KLAPANYA', 'P6-1', 'G6', '2569', 'BOY_WIZARD', 'SPEED_CHRONOMANCER', 'ACTIVE'),
('00000000-0000-0000-0000-000000000003', 'G6002', 'น้องปัญญา (Sarah)', 'ORG_KLAPANYA', 'P6-2', 'G6', '2569', 'GIRL_KNIGHT', 'LOGIC_PALADIN', 'ACTIVE'),
('00000000-0000-0000-0000-000000000004', 'REV001', 'ผู้ตรวจประเมินระบบ (Auditor)', 'ORG_KLAPANYA', 'DEV-AUDIT', 'G6', '2569', 'BOY_WIZARD', 'SPEED_CHRONOMANCER', 'ACTIVE'),
('00000000-0000-0000-0000-000000000005', 'ADM001', 'ผู้ดูแลระบบกลาง (Admin)', 'ORG_KLAPANYA', NULL, 'G6', '2569', 'BOY_WIZARD', 'SPEED_CHRONOMANCER', 'ACTIVE')
ON CONFLICT (user_code) DO NOTHING;

-- 2. Insert Seed Memberships
INSERT INTO public.memberships (profile_id, organization_id, role_id)
VALUES
('00000000-0000-0000-0000-000000000001', 'ORG_KLAPANYA', 'PROFESSOR'),
('00000000-0000-0000-0000-000000000002', 'ORG_KLAPANYA', 'LEARNER'),
('00000000-0000-0000-0000-000000000003', 'ORG_KLAPANYA', 'LEARNER'),
('00000000-0000-0000-0000-000000000004', 'ORG_KLAPANYA', 'REVIEWER_DEV'),
('00000000-0000-0000-0000-000000000005', 'ORG_KLAPANYA', 'ADMIN')
ON CONFLICT (profile_id, organization_id, role_id) DO NOTHING;

-- 3. Insert Classroom Enrollments
INSERT INTO public.classroom_enrollments (organization_id, classroom_id, learner_profile_id, academic_year, status)
VALUES
('ORG_KLAPANYA', 'P6-1', '00000000-0000-0000-0000-000000000002', '2569', 'ACTIVE'),
('ORG_KLAPANYA', 'P6-2', '00000000-0000-0000-0000-000000000003', '2569', 'ACTIVE')
ON CONFLICT (organization_id, classroom_id, learner_profile_id, academic_year) DO NOTHING;

-- 4. Insert Professor Classroom Assignments
INSERT INTO public.professor_classroom_assignments (organization_id, classroom_id, professor_profile_id, academic_year)
VALUES
('ORG_KLAPANYA', 'P6-1', '00000000-0000-0000-0000-000000000001', '2569'),
('ORG_KLAPANYA', 'P6-2', '00000000-0000-0000-0000-000000000001', '2569')
ON CONFLICT (organization_id, classroom_id, professor_profile_id, academic_year) DO NOTHING;

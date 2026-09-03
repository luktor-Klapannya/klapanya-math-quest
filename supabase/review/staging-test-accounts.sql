-- MANUAL HOSTED STAGING TEMPLATE. Never execute on Production.
-- Verify the dashboard project reference against GAME_STAGING_PROJECT_REF first.
-- Create/confirm five dedicated Auth users first. Replace the five UUID placeholders.
-- Rerunning intentionally fails on existing codes/links instead of modifying identities.
BEGIN;
CREATE TEMP TABLE v1_test_accounts(actor text PRIMARY KEY,auth_id uuid NOT NULL,profile_id uuid NOT NULL);
INSERT INTO v1_test_accounts VALUES
 ('STUDENT_A','REPLACE_STUDENT_A_AUTH_UUID'::uuid,gen_random_uuid()),
 ('STUDENT_B','REPLACE_STUDENT_B_AUTH_UUID'::uuid,gen_random_uuid()),
 ('ASSIGNED_TEACHER','REPLACE_ASSIGNED_TEACHER_AUTH_UUID'::uuid,gen_random_uuid()),
 ('UNASSIGNED_TEACHER','REPLACE_UNASSIGNED_TEACHER_AUTH_UUID'::uuid,gen_random_uuid()),
 ('ADMIN','REPLACE_ADMIN_AUTH_UUID'::uuid,gen_random_uuid());
INSERT INTO public.organizations(id,name) VALUES('V1_GAME_STAGING','Dedicated Game V1 Staging') ON CONFLICT(id) DO NOTHING;
INSERT INTO public.profiles(id,auth_user_id,user_code,display_name,organization_id,classroom_id,academic_year,hero_class,status)
 SELECT profile_id,auth_id,'V1_'||actor,'V1 Test '||actor,'V1_GAME_STAGING',
 CASE actor WHEN 'STUDENT_A' THEN 'V1-A' WHEN 'STUDENT_B' THEN 'V1-B' ELSE NULL END,'2569','CHRONOMANCER','ACTIVE' FROM v1_test_accounts;
INSERT INTO public.memberships(profile_id,organization_id,role_id)
 SELECT profile_id,'V1_GAME_STAGING',CASE WHEN actor LIKE 'STUDENT_%' THEN 'LEARNER' WHEN actor='ADMIN' THEN 'ADMIN' ELSE 'PROFESSOR' END FROM v1_test_accounts;
INSERT INTO public.classroom_enrollments(organization_id,classroom_id,learner_profile_id,academic_year,status)
 SELECT 'V1_GAME_STAGING',CASE actor WHEN 'STUDENT_A' THEN 'V1-A' ELSE 'V1-B' END,profile_id,'2569','ACTIVE' FROM v1_test_accounts WHERE actor IN ('STUDENT_A','STUDENT_B');
INSERT INTO public.professor_classroom_assignments(organization_id,classroom_id,professor_profile_id,academic_year)
 SELECT 'V1_GAME_STAGING','V1-A',profile_id,'2569' FROM v1_test_accounts WHERE actor='ASSIGNED_TEACHER';
SELECT actor,auth_id,profile_id FROM v1_test_accounts ORDER BY actor;
COMMIT;

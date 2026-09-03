-- READ ONLY. Run against an approved staging copy first; Production execution requires authorization.
SELECT 'profiles_without_auth_link' AS check_name, count(*) FROM public.profiles WHERE auth_user_id IS NULL
UNION ALL
SELECT 'profiles_without_matching_org_membership', count(*) FROM public.profiles p
 WHERE NOT EXISTS (SELECT 1 FROM public.memberships m WHERE m.profile_id=p.id AND m.organization_id=p.organization_id)
UNION ALL
SELECT 'teacher_assignments_without_teacher_membership', count(*) FROM public.professor_classroom_assignments a
 WHERE NOT EXISTS (SELECT 1 FROM public.memberships m WHERE m.profile_id=a.professor_profile_id AND m.organization_id=a.organization_id
 AND m.role_id IN ('PROFESSOR','EXTERNAL_PROFESSOR','ADMIN'))
UNION ALL
SELECT 'arena_hosts_with_nondefault_year', count(*) FROM public.arena_rooms r JOIN public.profiles p ON p.id=r.professor_id
 WHERE p.academic_year IS DISTINCT FROM '2569'
UNION ALL
SELECT 'legacy_cross_room_answers', count(*) FROM public.arena_answers a JOIN public.arena_rounds r ON r.id=a.round_id
 JOIN public.arena_participants p ON p.id=a.participant_id WHERE p.room_id<>r.room_id;

SELECT schemaname,tablename,policyname,roles,cmd,qual,with_check FROM pg_policies
 WHERE schemaname='public' ORDER BY tablename,policyname;

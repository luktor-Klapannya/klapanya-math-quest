-- Manual staging review required. Additive pilot operation journal and profile metadata.
BEGIN;
ALTER TABLE public.profiles ADD COLUMN game_admin_metadata jsonb NOT NULL DEFAULT '{}' CHECK(jsonb_typeof(game_admin_metadata)='object');
CREATE TABLE public.game_admin_operations (
 id uuid PRIMARY KEY,
 organization_id text NOT NULL REFERENCES public.organizations(id),
 actor_id uuid NOT NULL REFERENCES public.profiles(id),
 action text NOT NULL CHECK(action IN ('provision','password','drive')),
 fingerprint text NOT NULL,
 state text NOT NULL DEFAULT 'PENDING' CHECK(state IN ('PENDING','COMPLETE')),
 file_id text, result jsonb,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.game_admin_operations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.game_admin_operations FROM anon,authenticated;
GRANT SELECT ON public.game_admin_operations TO authenticated;
GRANT ALL ON public.game_admin_operations TO service_role;
CREATE POLICY admin_operation_read ON public.game_admin_operations FOR SELECT TO authenticated USING(public.is_org_admin(organization_id));
CREATE FUNCTION public.game_finish_pilot_user(p_operation uuid,p_auth uuid,p_input jsonb) RETURNS uuid
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE op public.game_admin_operations; pid uuid; role_name text := p_input->>'role'; classroom text;
BEGIN
 SELECT * INTO STRICT op FROM public.game_admin_operations WHERE id=p_operation FOR UPDATE;
 IF op.action<>'provision' THEN RAISE EXCEPTION 'Wrong operation'; END IF;
 IF op.state='COMPLETE' THEN RETURN (op.result->>'profileId')::uuid; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.profiles p JOIN public.memberships m ON m.profile_id=p.id
   AND m.organization_id=p.organization_id WHERE p.id=op.actor_id AND p.status='ACTIVE' AND p.organization_id=op.organization_id AND m.role_id='ADMIN')
 THEN RAISE EXCEPTION 'Active Admin required'; END IF;
 IF role_name NOT IN ('PROFESSOR','LEARNER') OR trim(coalesce(p_input->>'name',''))='' OR trim(coalesce(p_input->>'code',''))='' THEN RAISE EXCEPTION 'Invalid pilot identity'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext(lower(p_input->>'code')));
 IF EXISTS(SELECT 1 FROM public.profiles WHERE lower(user_code)=lower(p_input->>'code') AND id IS DISTINCT FROM (p_input->>'profileId')::uuid) THEN RAISE EXCEPTION 'Duplicate identifier'; END IF;
 IF p_input->>'profileId' IS NOT NULL THEN
  SELECT id INTO STRICT pid FROM public.profiles WHERE id=(p_input->>'profileId')::uuid AND organization_id=op.organization_id AND auth_user_id IS NULL AND lower(user_code)=lower(p_input->>'code') FOR UPDATE;
  IF EXISTS(SELECT 1 FROM public.memberships WHERE profile_id=pid AND role_id<>role_name) OR NOT EXISTS(SELECT 1 FROM public.memberships WHERE profile_id=pid AND role_id=role_name AND organization_id=op.organization_id) THEN RAISE EXCEPTION 'Existing identity role conflict'; END IF;
  UPDATE public.profiles SET auth_user_id=p_auth,game_admin_metadata=jsonb_build_object('email',p_input->>'email','subject',p_input->>'subject','assignedGrades',p_input->'assignedGrades','externalReference',p_input->>'externalReference') WHERE id=pid;
 ELSE
 INSERT INTO public.profiles(auth_user_id,user_code,display_name,organization_id,grade_level,classroom_id,academic_year,game_admin_metadata)
 VALUES(p_auth,p_input->>'code',p_input->>'name',op.organization_id,p_input->>'grade',nullif(p_input->>'classroom',''),p_input->>'academicYear',
 jsonb_build_object('email',p_input->>'email','subject',p_input->>'subject','assignedGrades',p_input->'assignedGrades','externalReference',p_input->>'externalReference')) RETURNING id INTO pid;
 END IF;
 INSERT INTO public.memberships(profile_id,organization_id,role_id) VALUES(pid,op.organization_id,role_name) ON CONFLICT DO NOTHING;
 IF role_name='LEARNER' THEN
  IF trim(coalesce(p_input->>'classroom',''))='' THEN RAISE EXCEPTION 'Student classroom required'; END IF;
  INSERT INTO public.classroom_enrollments(organization_id,classroom_id,learner_profile_id,academic_year)
   VALUES(op.organization_id,p_input->>'classroom',pid,p_input->>'academicYear') ON CONFLICT DO NOTHING;
 ELSE
  FOR classroom IN SELECT jsonb_array_elements_text(p_input->'classrooms') LOOP
   INSERT INTO public.professor_classroom_assignments(organization_id,classroom_id,professor_profile_id,academic_year)
    VALUES(op.organization_id,classroom,pid,p_input->>'academicYear') ON CONFLICT DO NOTHING;
  END LOOP;
 END IF;
 IF coalesce(p_input->>'externalReference','')<>'' THEN
  INSERT INTO public.external_identity_links(profile_id,organization_id,source_system,canonical_person_id,person_type)
   VALUES(pid,op.organization_id,'PILOT_REFERENCE',p_input->>'externalReference',CASE role_name WHEN 'LEARNER' THEN 'STUDENT' ELSE 'TEACHER' END);
 END IF;
 UPDATE public.game_admin_operations SET state='COMPLETE',result=jsonb_build_object('profileId',pid),updated_at=now() WHERE id=p_operation;
 RETURN pid;
END $$;
REVOKE ALL ON FUNCTION public.game_finish_pilot_user(uuid,uuid,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.game_finish_pilot_user(uuid,uuid,jsonb) TO service_role;
-- Account linkage and game source files are not duplicated by these metadata additions.
COMMIT;

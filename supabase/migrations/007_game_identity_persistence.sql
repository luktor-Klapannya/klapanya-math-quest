-- Game foundation. Additive data tables; no campaign content or formulas are changed.
BEGIN;

CREATE OR REPLACE FUNCTION public.game_current_profile_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
 SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() AND status = 'ACTIVE'
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(org_id text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
 SELECT EXISTS (SELECT 1 FROM public.memberships m
 WHERE m.profile_id = public.game_current_profile_id() AND m.organization_id = org_id AND m.role_id = 'ADMIN')
$$;

CREATE OR REPLACE FUNCTION public.game_is_teacher(org_id text, class_id text, year_id text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
 SELECT EXISTS (SELECT 1 FROM public.professor_classroom_assignments a
 JOIN public.profiles p ON p.id = a.professor_profile_id
 JOIN public.memberships m ON m.profile_id = p.id AND m.organization_id = a.organization_id
 WHERE p.id = public.game_current_profile_id() AND m.role_id IN ('PROFESSOR','EXTERNAL_PROFESSOR')
 AND p.academic_year = year_id AND a.organization_id = org_id AND a.classroom_id = class_id AND a.academic_year = year_id)
$$;

CREATE OR REPLACE FUNCTION public.is_assigned_professor(org_id text, class_id text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
 SELECT public.game_is_teacher(org_id, class_id, p.academic_year)
 FROM public.profiles p WHERE p.id = public.game_current_profile_id()
$$;

CREATE OR REPLACE FUNCTION public.game_can_read_player(player_id uuid, org_id text, year_id text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
 SELECT player_id = public.game_current_profile_id() OR public.is_org_admin(org_id) OR EXISTS (
 SELECT 1 FROM public.classroom_enrollments e WHERE e.learner_profile_id = player_id
 AND e.organization_id = org_id AND e.academic_year = year_id AND e.status = 'ACTIVE'
 AND public.game_is_teacher(org_id, e.classroom_id, year_id))
$$;

-- Replace the overly broad profile self-update predicate, preserving display edits.
DROP POLICY "Users can update own profile display" ON public.profiles;
CREATE POLICY "Active users update own profile" ON public.profiles FOR UPDATE TO authenticated
 USING (id = public.game_current_profile_id()) WITH CHECK (id = public.game_current_profile_id());
CREATE FUNCTION public.game_guard_profile_update() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
 IF current_user NOT IN ('postgres','service_role') AND NOT public.is_org_admin(OLD.organization_id) THEN
  IF (to_jsonb(NEW) - ARRAY['display_name','avatar_id','hero_class','updated_at','last_login_at'])
    IS DISTINCT FROM (to_jsonb(OLD) - ARRAY['display_name','avatar_id','hero_class','updated_at','last_login_at']) THEN
   RAISE EXCEPTION 'Identity and scope fields require organization administrator';
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER game_profile_identity_guard BEFORE UPDATE ON public.profiles
 FOR EACH ROW EXECUTE FUNCTION public.game_guard_profile_update();

DROP POLICY "Professors can view assigned classroom learners" ON public.profiles;
CREATE POLICY "Teachers read enrolled game profiles" ON public.profiles FOR SELECT TO authenticated
 USING (public.game_can_read_player(id, organization_id, academic_year));
DROP POLICY "Professors view assigned classroom enrollments" ON public.classroom_enrollments;
CREATE POLICY "Teachers read current assigned enrollments" ON public.classroom_enrollments FOR SELECT TO authenticated
 USING (public.game_is_teacher(organization_id, classroom_id, academic_year));
CREATE POLICY "Teachers read own assignments" ON public.professor_classroom_assignments FOR SELECT TO authenticated
 USING (professor_profile_id = public.game_current_profile_id());
CREATE POLICY "Admins manage teacher game scope" ON public.professor_classroom_assignments FOR ALL TO authenticated
 USING (public.is_org_admin(organization_id)) WITH CHECK (public.is_org_admin(organization_id));

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read organizations" ON public.organizations FOR SELECT TO authenticated
 USING (EXISTS (SELECT 1 FROM public.memberships m WHERE m.organization_id = organizations.id AND m.profile_id = public.game_current_profile_id()));
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated role catalog" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated permission catalog" ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated role permission catalog" ON public.role_permissions FOR SELECT TO authenticated USING (true);
REVOKE INSERT, UPDATE, DELETE ON public.roles, public.permissions, public.role_permissions, public.organizations FROM anon, authenticated;

CREATE TABLE public.external_identity_links (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
 organization_id text NOT NULL REFERENCES public.organizations(id),
 source_system text NOT NULL CHECK (length(source_system) > 0),
 canonical_person_id text NOT NULL CHECK (length(canonical_person_id) > 0),
 person_type text NOT NULL CHECK (person_type IN ('STUDENT','TEACHER')),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (source_system, organization_id, person_type, canonical_person_id),
 UNIQUE (profile_id, source_system, organization_id, person_type)
);

-- Checkpoints preserve the existing game output; they are explicitly NOT graded evidence.
CREATE TABLE public.game_player_progress (
 profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE RESTRICT,
 organization_id text NOT NULL REFERENCES public.organizations(id),
 academic_year text NOT NULL,
 checkpoint jsonb NOT NULL CHECK (jsonb_typeof(checkpoint) = 'object'),
 trust_level text NOT NULL DEFAULT 'CLIENT_CHECKPOINT' CHECK (trust_level = 'CLIENT_CHECKPOINT'),
 version bigint NOT NULL DEFAULT 0,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.game_checkpoint_requests (
 profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
 request_id uuid NOT NULL,
 checkpoint jsonb NOT NULL,
 version bigint NOT NULL,
 PRIMARY KEY (profile_id, request_id)
);

CREATE TABLE public.game_sessions (
 id uuid PRIMARY KEY,
 profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
 organization_id text NOT NULL REFERENCES public.organizations(id),
 academic_year text NOT NULL,
 campaign_id text NOT NULL DEFAULT 'MATH_710Q_V1',
 stage_id text NOT NULL,
 engine_version text NOT NULL,
 status text NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED','VERIFIED','REJECTED')),
 evidence jsonb NOT NULL CHECK (jsonb_typeof(evidence) = 'object'),
 submitted_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(id, profile_id)
);
CREATE TABLE public.game_question_attempts (
 session_id uuid NOT NULL REFERENCES public.game_sessions(id) ON DELETE RESTRICT,
 ordinal integer NOT NULL CHECK (ordinal >= 0),
 question_id text NOT NULL,
 response jsonb NOT NULL,
 PRIMARY KEY(session_id, ordinal)
);
CREATE TABLE public.game_session_results (
 session_id uuid PRIMARY KEY REFERENCES public.game_sessions(id) ON DELETE RESTRICT,
 result jsonb NOT NULL CHECK (jsonb_typeof(result) = 'object'),
 validator_version text NOT NULL,
 verified_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.game_verified_progress (
 profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE RESTRICT,
 state jsonb NOT NULL CHECK (jsonb_typeof(state) = 'object'),
 version bigint NOT NULL DEFAULT 0
);
CREATE TABLE public.game_reward_ledger (
 session_id uuid PRIMARY KEY REFERENCES public.game_sessions(id) ON DELETE RESTRICT,
 rewards jsonb NOT NULL CHECK (jsonb_typeof(rewards) = 'object'),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX game_sessions_player ON public.game_sessions(profile_id, submitted_at);
CREATE INDEX game_sessions_scope ON public.game_sessions(organization_id, academic_year);

ALTER TABLE public.external_identity_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Identity mapping owners and admins read" ON public.external_identity_links FOR SELECT TO authenticated
 USING (profile_id = public.game_current_profile_id() OR public.is_org_admin(organization_id));
-- Mapping writes are server-managed, not self-service identity claims.
ALTER TABLE public.game_player_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scoped checkpoint read" ON public.game_player_progress FOR SELECT TO authenticated
 USING (public.game_can_read_player(profile_id, organization_id, academic_year));
ALTER TABLE public.game_checkpoint_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scoped session read" ON public.game_sessions FOR SELECT TO authenticated
 USING (public.game_can_read_player(profile_id, organization_id, academic_year));
ALTER TABLE public.game_question_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scoped attempt read" ON public.game_question_attempts FOR SELECT TO authenticated
 USING (EXISTS (SELECT 1 FROM public.game_sessions s WHERE s.id = session_id));
ALTER TABLE public.game_session_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scoped result read" ON public.game_session_results FOR SELECT TO authenticated
 USING (EXISTS (SELECT 1 FROM public.game_sessions s WHERE s.id = session_id));
ALTER TABLE public.game_reward_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scoped reward read" ON public.game_reward_ledger FOR SELECT TO authenticated
 USING (EXISTS (SELECT 1 FROM public.game_sessions s WHERE s.id = session_id));
ALTER TABLE public.game_verified_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scoped verified progress read" ON public.game_verified_progress FOR SELECT TO authenticated
 USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id
 AND public.game_can_read_player(p.id, p.organization_id, p.academic_year)));

CREATE FUNCTION public.save_game_checkpoint(p_profile_id uuid, p_expected_version bigint, p_request_id uuid, p_checkpoint jsonb)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE p public.profiles; old_request public.game_checkpoint_requests; v bigint;
BEGIN
 IF p_profile_id IS DISTINCT FROM public.game_current_profile_id() THEN RAISE EXCEPTION 'Not checkpoint owner'; END IF;
 SELECT * INTO STRICT p FROM public.profiles WHERE id = p_profile_id FOR UPDATE;
 IF NOT EXISTS (SELECT 1 FROM public.memberships m WHERE m.profile_id = p.id
  AND m.organization_id = p.organization_id AND m.role_id IN ('LEARNER','EXTERNAL_LEARNER')) THEN RAISE EXCEPTION 'Learner required'; END IF;
 IF jsonb_typeof(p_checkpoint) IS DISTINCT FROM 'object' OR octet_length(p_checkpoint::text) > 262144 THEN RAISE EXCEPTION 'Invalid checkpoint'; END IF;
 SELECT * INTO old_request FROM public.game_checkpoint_requests WHERE profile_id = p.id AND request_id = p_request_id;
 IF FOUND THEN
  IF old_request.checkpoint IS DISTINCT FROM p_checkpoint THEN RAISE EXCEPTION 'Request ID reused with different checkpoint'; END IF;
  RETURN old_request.version;
 END IF;
 SELECT version INTO v FROM public.game_player_progress WHERE profile_id = p.id;
 v := coalesce(v, 0);
 IF p_expected_version IS DISTINCT FROM v THEN RAISE EXCEPTION 'Checkpoint version conflict' USING ERRCODE = '40001'; END IF;
 v := v + 1;
 INSERT INTO public.game_player_progress(profile_id, organization_id, academic_year, checkpoint, version)
 VALUES (p.id, p.organization_id, p.academic_year, p_checkpoint, v)
 ON CONFLICT(profile_id) DO UPDATE SET checkpoint = EXCLUDED.checkpoint, version = EXCLUDED.version,
 organization_id = EXCLUDED.organization_id, academic_year = EXCLUDED.academic_year, updated_at = now();
 INSERT INTO public.game_checkpoint_requests VALUES (p.id, p_request_id, p_checkpoint, v);
 RETURN v;
END $$;

CREATE FUNCTION public.submit_game_evidence(p_profile_id uuid, p_session_id uuid, p_stage_id text, p_engine_version text, p_evidence jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE p public.profiles; existing public.game_sessions; item jsonb; n integer := 0;
BEGIN
 IF p_profile_id IS DISTINCT FROM public.game_current_profile_id() THEN RAISE EXCEPTION 'Not session owner'; END IF;
 SELECT * INTO STRICT p FROM public.profiles WHERE id = p_profile_id FOR UPDATE;
 IF NOT EXISTS (SELECT 1 FROM public.memberships m WHERE m.profile_id = p.id AND m.organization_id = p.organization_id
 AND m.role_id IN ('LEARNER','EXTERNAL_LEARNER')) THEN RAISE EXCEPTION 'Learner required'; END IF;
 IF jsonb_typeof(p_evidence) IS DISTINCT FROM 'object' OR jsonb_typeof(p_evidence->'attempts') IS DISTINCT FROM 'array'
 OR octet_length(p_evidence::text) > 1048576 OR jsonb_array_length(p_evidence->'attempts') > 1000 THEN RAISE EXCEPTION 'Invalid evidence'; END IF;
 SELECT * INTO existing FROM public.game_sessions WHERE id = p_session_id;
 IF FOUND THEN
  IF existing.profile_id <> p.id OR existing.evidence IS DISTINCT FROM p_evidence OR existing.stage_id <> p_stage_id
   OR existing.engine_version <> p_engine_version THEN RAISE EXCEPTION 'Session ID reused'; END IF;
  RETURN existing.id;
 END IF;
 INSERT INTO public.game_sessions(id,profile_id,organization_id,academic_year,stage_id,engine_version,evidence)
 VALUES(p_session_id,p.id,p.organization_id,p.academic_year,p_stage_id,p_engine_version,p_evidence);
 FOR item IN SELECT value FROM jsonb_array_elements(p_evidence->'attempts') LOOP
  IF coalesce(item->>'questionId','') = '' THEN RAISE EXCEPTION 'Question ID required'; END IF;
  INSERT INTO public.game_question_attempts VALUES(p_session_id,n,item->>'questionId',item);
  n := n + 1;
 END LOOP;
 RETURN p_session_id;
END $$;

-- This RPC is callable ONLY by the trusted server validator. No browser total is authoritative.
CREATE FUNCTION public.commit_verified_game_result(p_session_id uuid, p_expected_version bigint,
 p_result jsonb, p_rewards jsonb, p_next_state jsonb, p_validator_version text)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE s public.game_sessions; v bigint; prior public.game_session_results;
BEGIN
 SELECT * INTO STRICT s FROM public.game_sessions WHERE id = p_session_id FOR UPDATE;
 PERFORM 1 FROM public.profiles WHERE id = s.profile_id FOR UPDATE;
 SELECT * INTO prior FROM public.game_session_results WHERE session_id = s.id;
 IF FOUND THEN
  IF prior.result IS DISTINCT FROM p_result OR prior.validator_version <> p_validator_version
   OR (SELECT rewards FROM public.game_reward_ledger WHERE session_id=s.id) IS DISTINCT FROM p_rewards
   THEN RAISE EXCEPTION 'Conflicting verified result'; END IF;
  RETURN (SELECT version FROM public.game_verified_progress WHERE profile_id = s.profile_id);
 END IF;
 IF s.status <> 'SUBMITTED' THEN RAISE EXCEPTION 'Session cannot be verified'; END IF;
 SELECT version INTO v FROM public.game_verified_progress WHERE profile_id = s.profile_id;
 v := coalesce(v,0);
 IF v IS DISTINCT FROM p_expected_version THEN RAISE EXCEPTION 'Verified progress version conflict' USING ERRCODE = '40001'; END IF;
 INSERT INTO public.game_session_results VALUES(s.id,p_result,p_validator_version,now());
 INSERT INTO public.game_reward_ledger VALUES(s.id,p_rewards,now());
 INSERT INTO public.game_verified_progress VALUES(s.profile_id,p_next_state,v+1)
 ON CONFLICT(profile_id) DO UPDATE SET state=EXCLUDED.state,version=EXCLUDED.version;
 UPDATE public.game_sessions SET status='VERIFIED' WHERE id=s.id;
 RETURN v+1;
END $$;

REVOKE ALL ON public.game_player_progress, public.game_checkpoint_requests, public.game_sessions,
 public.game_question_attempts, public.game_session_results, public.game_verified_progress,
 public.game_reward_ledger, public.external_identity_links FROM anon, authenticated;
GRANT SELECT ON public.game_player_progress, public.game_sessions, public.game_question_attempts,
 public.game_session_results, public.game_verified_progress, public.game_reward_ledger, public.external_identity_links TO authenticated;
GRANT ALL ON public.game_player_progress, public.game_checkpoint_requests, public.game_sessions,
 public.game_question_attempts, public.game_session_results, public.game_verified_progress,
 public.game_reward_ledger, public.external_identity_links TO service_role;
REVOKE ALL ON FUNCTION public.save_game_checkpoint(uuid,bigint,uuid,jsonb),
 public.submit_game_evidence(uuid,uuid,text,text,jsonb),
 public.commit_verified_game_result(uuid,bigint,jsonb,jsonb,jsonb,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_game_checkpoint(uuid,bigint,uuid,jsonb), public.submit_game_evidence(uuid,uuid,text,text,jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.commit_verified_game_result(uuid,bigint,jsonb,jsonb,jsonb,text) TO service_role;
-- Read models over verified state avoid a second independently writable progress source.
CREATE VIEW public.game_stage_progress WITH (security_invoker=true) AS
 SELECT v.profile_id, e.key AS stage_id, e.value AS best_accuracy
 FROM public.game_verified_progress v, LATERAL jsonb_each(coalesce(v.state->'stageBestAccuracy','{}'::jsonb)) e;
CREATE VIEW public.game_skill_mastery WITH (security_invoker=true) AS
 SELECT v.profile_id, e.key AS skill_id, e.value AS mastery
 FROM public.game_verified_progress v, LATERAL jsonb_each(coalesce(v.state->'skillMastery','{}'::jsonb)) e;
REVOKE ALL ON public.game_stage_progress,public.game_skill_mastery FROM anon,authenticated;
GRANT SELECT ON public.game_stage_progress,public.game_skill_mastery TO authenticated,service_role;
COMMIT;

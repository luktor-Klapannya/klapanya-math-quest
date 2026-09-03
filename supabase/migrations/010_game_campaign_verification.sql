BEGIN;
CREATE TABLE public.game_campaign_runs (
 id uuid PRIMARY KEY, profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
 organization_id text NOT NULL REFERENCES public.organizations(id),academic_year text NOT NULL,
 stage_id text NOT NULL,definition jsonb NOT NULL CHECK(jsonb_typeof(definition)='object'),
 status text NOT NULL DEFAULT 'STARTED' CHECK(status IN ('STARTED','IN_PROGRESS','COMPLETED')),
 started_at timestamptz NOT NULL DEFAULT now(),last_played_at timestamptz NOT NULL DEFAULT now(),
 completed_at timestamptz,receipt jsonb
);
ALTER TABLE public.game_campaign_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scoped campaign lifecycle read" ON public.game_campaign_runs FOR SELECT TO authenticated
 USING(public.game_can_read_player(profile_id,organization_id,academic_year));
REVOKE ALL ON public.game_campaign_runs FROM anon,authenticated;
GRANT SELECT ON public.game_campaign_runs TO authenticated;

CREATE FUNCTION public.open_game_campaign_run(p_profile_id uuid,p_run_id uuid,p_stage_id text,p_definition jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE p public.profiles;r public.game_campaign_runs;
BEGIN
 SELECT * INTO STRICT p FROM public.profiles WHERE id=p_profile_id FOR UPDATE;
 IF p.status<>'ACTIVE' OR NOT EXISTS(SELECT 1 FROM public.memberships WHERE profile_id=p.id AND organization_id=p.organization_id AND role_id IN ('LEARNER','EXTERNAL_LEARNER')) THEN RAISE EXCEPTION 'Active learner required';END IF;
 SELECT * INTO r FROM public.game_campaign_runs WHERE id=p_run_id;
 IF FOUND THEN
  IF r.profile_id<>p.id OR r.stage_id<>p_stage_id OR r.definition IS DISTINCT FROM p_definition THEN RAISE EXCEPTION 'Run ID conflict';END IF;
  RETURN to_jsonb(r);
 END IF;
 INSERT INTO public.game_campaign_runs(id,profile_id,organization_id,academic_year,stage_id,definition)
 VALUES(p_run_id,p.id,p.organization_id,p.academic_year,p_stage_id,p_definition) RETURNING * INTO r;
 RETURN to_jsonb(r);
END $$;

CREATE FUNCTION public.touch_game_campaign_run(p_run_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 UPDATE public.game_campaign_runs SET status='IN_PROGRESS',last_played_at=now()
 WHERE id=p_run_id AND profile_id=public.game_current_profile_id() AND status<>'COMPLETED';
 IF NOT FOUND THEN RAISE EXCEPTION 'Active owned run required';END IF;
END $$;

CREATE FUNCTION public.finish_game_campaign_run(p_run_id uuid,p_expected_version bigint,p_evidence jsonb,
 p_result jsonb,p_rewards jsonb,p_next_state jsonb,p_validator_version text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE r public.game_campaign_runs;p public.profiles;v bigint;item jsonb;n integer:=0;
BEGIN
 SELECT * INTO STRICT r FROM public.game_campaign_runs WHERE id=p_run_id FOR UPDATE;
 SELECT * INTO STRICT p FROM public.profiles WHERE id=r.profile_id FOR UPDATE;
 IF p.status<>'ACTIVE' OR p.organization_id<>r.organization_id OR p.academic_year<>r.academic_year OR NOT EXISTS
 (SELECT 1 FROM public.memberships WHERE profile_id=p.id AND organization_id=p.organization_id AND role_id IN ('LEARNER','EXTERNAL_LEARNER')) THEN RAISE EXCEPTION 'Active learner scope changed';END IF;
 IF r.status='COMPLETED' THEN
  IF (SELECT evidence FROM public.game_sessions WHERE id=r.id) IS DISTINCT FROM p_evidence THEN RAISE EXCEPTION 'Conflicting run retry';END IF;
  RETURN r.receipt;
 END IF;
 SELECT coalesce((SELECT version FROM public.game_verified_progress WHERE profile_id=p.id),0) INTO v;
 IF v<>p_expected_version THEN RAISE EXCEPTION 'Concurrent verified update' USING ERRCODE='40001';END IF;
 IF jsonb_typeof(p_evidence->'attempts') IS DISTINCT FROM 'array' OR jsonb_array_length(p_evidence->'attempts')>1000 OR octet_length(p_evidence::text)>1048576 THEN RAISE EXCEPTION 'Invalid evidence';END IF;
 INSERT INTO public.game_sessions(id,profile_id,organization_id,academic_year,stage_id,engine_version,evidence)
 VALUES(r.id,p.id,r.organization_id,r.academic_year,r.stage_id,'math-quest-v1.0',p_evidence);
 FOR item IN SELECT value FROM jsonb_array_elements(p_evidence->'attempts') LOOP
  INSERT INTO public.game_question_attempts VALUES(r.id,n,item->>'questionId',item);n:=n+1;
 END LOOP;
 PERFORM public.commit_verified_game_result(r.id,p_expected_version,p_result,p_rewards,p_next_state,p_validator_version);
 UPDATE public.game_campaign_runs SET status='COMPLETED',last_played_at=now(),completed_at=now(),
 receipt=jsonb_build_object('sessionId',r.id,'result',p_result,'verifiedVersion',v+1) WHERE id=r.id RETURNING * INTO r;
 RETURN r.receipt;
END $$;
REVOKE ALL ON FUNCTION public.open_game_campaign_run(uuid,uuid,text,jsonb),public.finish_game_campaign_run(uuid,bigint,jsonb,jsonb,jsonb,jsonb,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.open_game_campaign_run(uuid,uuid,text,jsonb),public.finish_game_campaign_run(uuid,bigint,jsonb,jsonb,jsonb,jsonb,text) TO service_role;
REVOKE ALL ON FUNCTION public.touch_game_campaign_run(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.touch_game_campaign_run(uuid) TO authenticated;
CREATE INDEX game_campaign_runs_owner ON public.game_campaign_runs(profile_id,last_played_at DESC);
COMMIT;

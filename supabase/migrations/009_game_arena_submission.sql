-- Atomic commit for the trusted realtime Arena adapter. No scoring formula lives here.
BEGIN;
ALTER TABLE public.arena_answers ADD COLUMN participant_after jsonb;

CREATE FUNCTION public.commit_game_arena_answer(p_round_id uuid,p_participant_id uuid,p_expected_answered integer,
 p_option_id text,p_is_correct boolean,p_time_sec numeric,p_score integer,p_damage integer,p_next_stats jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE r public.arena_rounds; rm public.arena_rooms; p public.arena_participants; a public.arena_answers;
BEGIN
 SELECT * INTO STRICT r FROM public.arena_rounds WHERE id=p_round_id FOR SHARE;
 SELECT * INTO STRICT rm FROM public.arena_rooms WHERE id=r.room_id FOR SHARE;
 SELECT * INTO STRICT p FROM public.arena_participants WHERE id=p_participant_id FOR UPDATE;
 IF p.room_id<>r.room_id THEN RAISE EXCEPTION 'Round and participant room mismatch'; END IF;
 SELECT * INTO a FROM public.arena_answers WHERE round_id=r.id AND participant_id=p.id;
 IF FOUND THEN
  IF a.selected_option_id IS DISTINCT FROM p_option_id THEN RAISE EXCEPTION 'Answer already committed with different option'; END IF;
  RETURN to_jsonb(a);
 END IF;
 IF rm.status<>'LIVE' OR r.status NOT IN ('LIVE','ACTIVE') OR r.started_at IS NULL THEN RAISE EXCEPTION 'Round not live'; END IF;
 IF r.round_number<>rm.current_round_index+1 THEN RAISE EXCEPTION 'Round is not current'; END IF;
 IF clock_timestamp()<r.started_at OR clock_timestamp()>r.started_at+make_interval(secs=>r.time_limit_sec)
 THEN RAISE EXCEPTION 'Round deadline elapsed'; END IF;
 IF rm.mode NOT IN ('STANDARD_DUEL','SPEED_CHALLENGE') THEN RAISE EXCEPTION 'Unsupported trusted Arena mode'; END IF;
 IF p.total_answered<>p_expected_answered THEN RAISE EXCEPTION 'Concurrent Arena update' USING ERRCODE='40001'; END IF;
 IF p_time_sec IS NULL OR p_time_sec<0 OR p_time_sec>r.time_limit_sec OR p_score IS NULL OR p_damage IS NULL
 OR p_score<0 OR p_damage<0 OR p_is_correct IS NULL OR (NOT p_is_correct AND (p_score<>0 OR p_damage<>0))
 OR jsonb_typeof(p_next_stats) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Invalid trusted result'; END IF;
 -- Service actor must still target a currently active, enrolled learner.
 IF NOT EXISTS (SELECT 1 FROM public.profiles pr JOIN public.memberships m ON m.profile_id=pr.id
 JOIN public.classroom_enrollments e ON e.learner_profile_id=pr.id AND e.organization_id=m.organization_id
 WHERE pr.id=p.learner_id AND pr.status='ACTIVE' AND m.role_id IN ('LEARNER','EXTERNAL_LEARNER')
 AND m.organization_id=rm.organization_id AND e.classroom_id=rm.classroom_id AND e.status='ACTIVE'
 AND e.academic_year=rm.academic_year AND pr.academic_year=rm.academic_year) THEN RAISE EXCEPTION 'Learner no longer enrolled'; END IF;
 IF (p_next_stats->>'totalAnswered')::integer IS DISTINCT FROM p.total_answered+1
 OR (p_next_stats->>'score')::integer IS DISTINCT FROM p.score+p_score
 OR (p_next_stats->>'correctCount')::integer IS DISTINCT FROM (p.correct_count+CASE WHEN p_is_correct THEN 1 ELSE 0 END)
 THEN RAISE EXCEPTION 'Invalid participant transition'; END IF;
 UPDATE public.arena_participants SET score=(p_next_stats->>'score')::integer,
 streak=(p_next_stats->>'streak')::integer,accuracy=(p_next_stats->>'accuracy')::numeric,
 total_answered=(p_next_stats->>'totalAnswered')::integer,correct_count=(p_next_stats->>'correctCount')::integer,
 avg_time_sec=(p_next_stats->>'avgTimeSec')::numeric,last_active_at=now() WHERE id=p.id;
 INSERT INTO public.arena_answers(round_id,participant_id,selected_option_id,is_correct,time_spent_sec,score_gained,damage_dealt,participant_after)
 VALUES(r.id,p.id,p_option_id,p_is_correct,p_time_sec,p_score,p_damage,p_next_stats) RETURNING * INTO a;
 INSERT INTO public.arena_events(room_id,event_type,payload) VALUES(rm.id,'ANSWER_SUBMITTED',jsonb_build_object('participantId',p.id,'roundId',r.id));
 RETURN to_jsonb(a);
END $$;
REVOKE ALL ON FUNCTION public.commit_game_arena_answer(uuid,uuid,integer,text,boolean,numeric,integer,integer,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.commit_game_arena_answer(uuid,uuid,integer,text,boolean,numeric,integer,integer,jsonb) TO service_role;
COMMIT;

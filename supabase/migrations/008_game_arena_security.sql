-- Security boundary only. Arena scoring remains in the unchanged game engine.
BEGIN;
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM public.arena_rooms r JOIN public.profiles p ON p.id=r.professor_id
 WHERE p.academic_year IS DISTINCT FROM '2569') THEN
  RAISE EXCEPTION 'Review legacy arena academic years before applying migration 008';
 END IF;
END $$;
ALTER TABLE public.arena_rooms ADD COLUMN academic_year text NOT NULL DEFAULT '2569';

CREATE FUNCTION public.game_can_read_room(room_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
 SELECT EXISTS (SELECT 1 FROM public.arena_rooms r WHERE r.id = room_id AND (
 public.is_org_admin(r.organization_id) OR public.game_is_teacher(r.organization_id,r.classroom_id,r.academic_year)
 OR EXISTS (SELECT 1 FROM public.classroom_enrollments e
 JOIN public.profiles p ON p.id=e.learner_profile_id
 JOIN public.memberships m ON m.profile_id=p.id AND m.organization_id=e.organization_id
 WHERE e.learner_profile_id=public.game_current_profile_id() AND e.status='ACTIVE'
 AND m.role_id IN ('LEARNER','EXTERNAL_LEARNER') AND p.academic_year=r.academic_year
 AND e.organization_id=r.organization_id AND e.classroom_id=r.classroom_id AND e.academic_year=r.academic_year)))
$$;
CREATE FUNCTION public.game_can_manage_room(room_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $$
 SELECT EXISTS (SELECT 1 FROM public.arena_rooms r WHERE r.id=room_id
 AND (public.is_org_admin(r.organization_id) OR
 (r.professor_id=public.game_current_profile_id() AND public.game_is_teacher(r.organization_id,r.classroom_id,r.academic_year))))
$$;

DROP POLICY "Professors manage own arena rooms" ON public.arena_rooms;
DROP POLICY "Learners view arena rooms" ON public.arena_rooms;
CREATE POLICY "Scoped arena read" ON public.arena_rooms FOR SELECT TO authenticated USING (public.game_can_read_room(id));
CREATE POLICY "Assigned host creates room" ON public.arena_rooms FOR INSERT TO authenticated
 WITH CHECK (public.is_org_admin(organization_id) OR (professor_id=public.game_current_profile_id()
 AND public.game_is_teacher(organization_id,classroom_id,academic_year)));
CREATE POLICY "Assigned host updates room" ON public.arena_rooms FOR UPDATE TO authenticated
 USING (public.game_can_manage_room(id)) WITH CHECK (public.is_org_admin(organization_id) OR
 (professor_id=public.game_current_profile_id() AND public.game_is_teacher(organization_id,classroom_id,academic_year)));

DROP POLICY "Participants viewable in room" ON public.arena_participants;
DROP POLICY "Learners manage own participant slot" ON public.arena_participants;
CREATE POLICY "Scoped participant read" ON public.arena_participants FOR SELECT TO authenticated USING(public.game_can_read_room(room_id));
CREATE POLICY "Own presence only" ON public.arena_participants FOR UPDATE TO authenticated
 USING (learner_id=public.game_current_profile_id() AND public.game_can_read_room(room_id))
 WITH CHECK (learner_id=public.game_current_profile_id() AND public.game_can_read_room(room_id));
REVOKE ALL ON public.arena_participants FROM anon, authenticated;
GRANT SELECT ON public.arena_participants TO authenticated;
GRANT UPDATE(is_connected,last_active_at) ON public.arena_participants TO authenticated;

CREATE FUNCTION public.join_game_arena(p_room_id uuid) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE r public.arena_rooms; p public.profiles; participant uuid;
BEGIN
 SELECT * INTO STRICT r FROM public.arena_rooms WHERE id=p_room_id FOR UPDATE;
 SELECT * INTO STRICT p FROM public.profiles WHERE id=public.game_current_profile_id();
 IF NOT public.game_can_read_room(r.id) OR NOT EXISTS (SELECT 1 FROM public.classroom_enrollments e
 WHERE e.learner_profile_id=p.id AND e.organization_id=r.organization_id AND e.classroom_id=r.classroom_id
 AND e.academic_year=r.academic_year AND e.status='ACTIVE') OR NOT EXISTS (
 SELECT 1 FROM public.memberships m WHERE m.profile_id=p.id AND m.organization_id=r.organization_id
 AND m.role_id IN ('LEARNER','EXTERNAL_LEARNER')) THEN RAISE EXCEPTION 'Not an enrolled learner'; END IF;
 SELECT id INTO participant FROM public.arena_participants WHERE room_id=r.id AND learner_id=p.id;
 IF participant IS NOT NULL THEN RETURN participant; END IF;
 IF r.status NOT IN ('LOBBY','READY') THEN RAISE EXCEPTION 'Room not accepting participants'; END IF;
 IF (SELECT count(*) FROM public.arena_participants WHERE room_id=r.id) >= r.max_players THEN RAISE EXCEPTION 'Room full'; END IF;
 INSERT INTO public.arena_participants(room_id,learner_id,user_code,display_name,avatar_id,hero_class)
 VALUES(r.id,p.id,p.user_code,p.display_name,p.avatar_id,p.hero_class) RETURNING id INTO participant;
 RETURN participant;
END $$;

DROP POLICY "Learners insert own answer" ON public.arena_answers;
DROP POLICY "Learners view own answer" ON public.arena_answers;
DROP POLICY "Professors view classroom answers" ON public.arena_answers;
CREATE POLICY "Private scoped answers" ON public.arena_answers FOR SELECT TO authenticated USING (
 EXISTS (SELECT 1 FROM public.arena_participants p WHERE p.id=participant_id AND p.learner_id=public.game_current_profile_id())
 OR EXISTS (SELECT 1 FROM public.arena_rounds r WHERE r.id=round_id AND public.game_can_manage_room(r.room_id)));
REVOKE ALL ON public.arena_answers FROM anon, authenticated;
GRANT SELECT ON public.arena_answers TO authenticated;

-- Enforce room consistency even for trusted writers; old invalid rows are not silently repaired.
CREATE FUNCTION public.game_guard_arena_answer() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.arena_rounds r JOIN public.arena_participants p ON p.room_id=r.room_id
 WHERE r.id=NEW.round_id AND p.id=NEW.participant_id) THEN RAISE EXCEPTION 'Participant and round must belong to same room'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER game_arena_answer_room_guard BEFORE INSERT OR UPDATE ON public.arena_answers
 FOR EACH ROW EXECUTE FUNCTION public.game_guard_arena_answer();

-- Raw question JSON may contain answer keys; only hosts read it. Students use sanitized RPC.
CREATE POLICY "Hosts read round source" ON public.arena_rounds FOR SELECT TO authenticated USING(public.game_can_manage_room(room_id));
REVOKE ALL ON public.arena_rounds, public.arena_events FROM anon, authenticated;
GRANT SELECT ON public.arena_rounds, public.arena_events TO authenticated;
CREATE POLICY "Hosts read event audit" ON public.arena_events FOR SELECT TO authenticated USING(public.game_can_manage_room(room_id));
CREATE FUNCTION public.read_game_arena_rounds(p_room_id uuid) RETURNS SETOF jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT jsonb_build_object('id',r.id,'round_number',r.round_number,'question_id',r.question_id,
 'status',r.status,'time_limit_sec',r.time_limit_sec,'started_at',r.started_at,'closed_at',r.closed_at,
 'question',jsonb_build_object('questionText',r.question_data->'questionText','mechanicType',r.question_data->'mechanicType',
 'options',(SELECT jsonb_agg(jsonb_build_object('id',o->'id','text',o->'text'))
 FROM jsonb_array_elements(coalesce(r.question_data->'options','[]'::jsonb)) o)))
 FROM public.arena_rounds r WHERE r.room_id=p_room_id AND public.game_can_read_room(p_room_id)
 AND r.status <> 'PREPARING' ORDER BY r.round_number
$$;
CREATE FUNCTION public.read_game_arena_events(p_room_id uuid) RETURNS TABLE(id uuid,event_type text,created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT e.id,e.event_type,e.created_at FROM public.arena_events e WHERE e.room_id=p_room_id AND public.game_can_read_room(p_room_id)
 ORDER BY e.created_at
$$;
REVOKE ALL ON public.arena_rooms FROM anon;
REVOKE DELETE ON public.arena_rooms FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.arena_rooms TO authenticated;
REVOKE ALL ON FUNCTION public.join_game_arena(uuid), public.read_game_arena_rounds(uuid), public.read_game_arena_events(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_game_arena(uuid), public.read_game_arena_rounds(uuid), public.read_game_arena_events(uuid) TO authenticated;
COMMIT;

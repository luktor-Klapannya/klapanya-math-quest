-- ====================================================================
-- 006_arena_realtime.sql
-- The Wisdom Academy School / Klapanya E-Learning
-- Realtime Classroom Arena Tables & Row Level Security
-- ====================================================================

-- 1. Create enum for Arena Room Status
CREATE TYPE arena_room_status AS ENUM ('LOBBY', 'READY', 'LIVE', 'PAUSED', 'FINISHED', 'CLOSED');

-- 2. Create Arena Rooms Table
CREATE TABLE IF NOT EXISTS public.arena_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code TEXT NOT NULL UNIQUE, -- 6-character code (e.g. 'ICE742')
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    classroom_id TEXT NOT NULL, -- e.g. 'P6-1'
    professor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    territory_id TEXT NOT NULL DEFAULT 'FROZEN_ARCTIC',
    question_set_id TEXT NOT NULL,
    title TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'STANDARD_DUEL',
    status arena_room_status NOT NULL DEFAULT 'LOBBY',
    max_players INTEGER NOT NULL DEFAULT 12,
    current_round_index INTEGER NOT NULL DEFAULT 0,
    total_rounds INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_arena_rooms_code ON public.arena_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_arena_rooms_org_class ON public.arena_rooms(organization_id, classroom_id);

-- 3. Create Arena Participants Table (9–12 Learners)
CREATE TABLE IF NOT EXISTS public.arena_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.arena_rooms(id) ON DELETE CASCADE,
    learner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_code TEXT NOT NULL, -- e.g. G6001
    display_name TEXT NOT NULL,
    avatar_id TEXT NOT NULL DEFAULT 'BOY_WIZARD',
    hero_class TEXT NOT NULL DEFAULT 'SPEED_CHRONOMANCER',
    is_connected BOOLEAN NOT NULL DEFAULT true,
    score INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    accuracy NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    total_answered INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    avg_time_sec NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(room_id, learner_id)
);

CREATE INDEX IF NOT EXISTS idx_arena_participants_room ON public.arena_participants(room_id);

-- 4. Create Arena Rounds Table
CREATE TABLE IF NOT EXISTS public.arena_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.arena_rooms(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    question_id TEXT NOT NULL,
    question_data JSONB NOT NULL,
    time_limit_sec INTEGER NOT NULL DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'PREPARING',
    started_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    UNIQUE(room_id, round_number)
);

CREATE INDEX IF NOT EXISTS idx_arena_rounds_room ON public.arena_rounds(room_id);

-- 5. Create Arena Answers Table (Private until round close)
CREATE TABLE IF NOT EXISTS public.arena_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round_id UUID NOT NULL REFERENCES public.arena_rounds(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.arena_participants(id) ON DELETE CASCADE,
    selected_option_id TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_spent_sec NUMERIC(6,2) NOT NULL,
    damage_dealt INTEGER NOT NULL DEFAULT 0,
    score_gained INTEGER NOT NULL DEFAULT 0,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(round_id, participant_id)
);

CREATE INDEX IF NOT EXISTS idx_arena_answers_round ON public.arena_answers(round_id);

-- 6. Create Arena Events Table (Realtime Broadcast Audit Log)
CREATE TABLE IF NOT EXISTS public.arena_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.arena_rooms(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_arena_events_room ON public.arena_events(room_id);

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.arena_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arena_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arena_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arena_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arena_events ENABLE ROW LEVEL SECURITY;

-- Professors: can manage Arena rooms for their assigned classrooms
CREATE POLICY "Professors manage own arena rooms"
ON public.arena_rooms FOR ALL
USING (
    public.is_assigned_professor(organization_id, classroom_id)
);

-- Learners: can view active rooms in their organization
CREATE POLICY "Learners view arena rooms"
ON public.arena_rooms FOR SELECT
USING (
    status IN ('LOBBY', 'READY', 'LIVE', 'PAUSED', 'FINISHED')
);

-- Participants: Learners can view participants in their room
CREATE POLICY "Participants viewable in room"
ON public.arena_participants FOR SELECT
USING (true);

-- Learners: can join and update their own participant record
CREATE POLICY "Learners manage own participant slot"
ON public.arena_participants FOR ALL
USING (
    learner_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
);

-- Answers: Learner can only insert and view their OWN answers
CREATE POLICY "Learners insert own answer"
ON public.arena_answers FOR INSERT
WITH CHECK (
    participant_id IN (
        SELECT id FROM public.arena_participants 
        WHERE learner_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    )
);

CREATE POLICY "Learners view own answer"
ON public.arena_answers FOR SELECT
USING (
    participant_id IN (
        SELECT id FROM public.arena_participants 
        WHERE learner_id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    )
);

-- Professors: can view all answers after submission
CREATE POLICY "Professors view classroom answers"
ON public.arena_answers FOR SELECT
USING (
    round_id IN (
        SELECT r.id FROM public.arena_rounds r
        JOIN public.arena_rooms rm ON rm.id = r.room_id
        WHERE public.is_assigned_professor(rm.organization_id, rm.classroom_id)
    )
);

-- 8. Enable Realtime Replication
-- Add tables to realtime publication for WebSocket events
ALTER PUBLICATION supabase_realtime ADD TABLE public.arena_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.arena_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.arena_rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.arena_events;

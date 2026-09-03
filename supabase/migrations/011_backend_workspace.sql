-- Backend metadata only. Apply manually after 001–010; never changes the frozen engine.
BEGIN;
CREATE TABLE public.game_backend_records (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id text NOT NULL REFERENCES public.organizations(id),
 kind text NOT NULL CHECK (kind IN ('DOCUMENT','ASSESSMENT','QUESTION_SET','EXTERNAL','ANALYSIS','BLUEPRINT','TERRITORY')),
 title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 200),
 subject text NOT NULL CHECK(subject IN ('Math','English','Science','Social','Thai')),
 grade text NOT NULL CHECK(grade IN ('PK','K1','K2','K3','P1','P2','P3','P4','P5','P6')),
 source_id uuid,
 visibility text NOT NULL DEFAULT 'PRIVATE' CHECK(visibility IN ('PRIVATE','INTERNAL','PUBLIC')),
 status text NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','REVIEW','APPROVED','PUBLISHED','ARCHIVED')),
 metadata jsonb NOT NULL DEFAULT '{}' CHECK(jsonb_typeof(metadata)='object'),
 version integer NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(id,organization_id),
 FOREIGN KEY(source_id,organization_id) REFERENCES public.game_backend_records(id,organization_id),
 CHECK(source_id IS DISTINCT FROM id)
);
CREATE FUNCTION public.game_backend_record_guard() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF TG_OP='INSERT' THEN
   IF NEW.status <> 'DRAFT' OR NEW.version <> 1 THEN RAISE EXCEPTION 'New records must be drafts'; END IF;
 ELSE
   IF (NEW.id,NEW.organization_id,NEW.kind,NEW.created_at) IS DISTINCT FROM (OLD.id,OLD.organization_id,OLD.kind,OLD.created_at) THEN
     RAISE EXCEPTION 'Record identity is immutable';
   END IF;
   IF NEW.status <> OLD.status AND NOT (
     NEW.status='ARCHIVED' OR (OLD.status='DRAFT' AND NEW.status='REVIEW') OR
     (OLD.status='REVIEW' AND NEW.status IN ('DRAFT','APPROVED')) OR
     (OLD.status='APPROVED' AND NEW.status IN ('DRAFT','PUBLISHED')) OR
     (OLD.status='PUBLISHED' AND NEW.status='DRAFT')) THEN RAISE EXCEPTION 'Invalid review transition'; END IF;
   IF OLD.status IN ('APPROVED','PUBLISHED','ARCHIVED') AND NEW.status <> 'DRAFT' AND
     (NEW.title,NEW.subject,NEW.grade,NEW.source_id,NEW.metadata) IS DISTINCT FROM
     (OLD.title,OLD.subject,OLD.grade,OLD.source_id,OLD.metadata) THEN RAISE EXCEPTION 'Return to draft before editing approved content'; END IF;
   NEW.version := OLD.version+1;
 END IF;
 NEW.updated_at := now();
 RETURN NEW;
END $$;
CREATE TRIGGER game_backend_record_guard BEFORE INSERT OR UPDATE ON public.game_backend_records
 FOR EACH ROW EXECUTE FUNCTION public.game_backend_record_guard();
ALTER TABLE public.game_backend_records ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.game_backend_records FROM anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON public.game_backend_records TO authenticated;
CREATE POLICY backend_admin_read ON public.game_backend_records FOR SELECT TO authenticated USING(public.is_org_admin(organization_id));
CREATE POLICY backend_admin_insert ON public.game_backend_records FOR INSERT TO authenticated WITH CHECK(public.is_org_admin(organization_id));
CREATE POLICY backend_admin_update ON public.game_backend_records FOR UPDATE TO authenticated USING(public.is_org_admin(organization_id)) WITH CHECK(public.is_org_admin(organization_id));
COMMENT ON TABLE public.game_backend_records IS 'Admin-only metadata. PUBLIC visibility is a label, not public access. No runtime deployment or canonical question storage.';
-- Private immutable uploads. Replacements get a new path; no browser deletes or overwrites.
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 VALUES('game-backend','game-backend',false,10485760,ARRAY['application/pdf','text/plain','text/csv','image/png','image/jpeg','image/webp']);
CREATE POLICY backend_files_read ON storage.objects FOR SELECT TO authenticated
 USING(bucket_id='game-backend' AND public.is_org_admin((string_to_array(name,'/'))[1]));
CREATE POLICY backend_files_insert ON storage.objects FOR INSERT TO authenticated
 WITH CHECK(bucket_id='game-backend' AND public.is_org_admin((string_to_array(name,'/'))[1]));
COMMIT;

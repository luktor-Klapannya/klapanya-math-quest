-- Presentation settings for the EXISTING Arctic only. Depends on 001–012.
-- No game content, lifecycle, scoring, reward or verification changes.
BEGIN;
CREATE TABLE public.game_arctic_configuration (
 organization_id text PRIMARY KEY REFERENCES public.organizations(id),
 title text NOT NULL DEFAULT 'Arctic' CHECK(length(trim(title)) BETWEEN 1 AND 200),
 description text NOT NULL DEFAULT '' CHECK(length(description)<=2000),
 visuals jsonb NOT NULL DEFAULT '{}' CHECK(jsonb_typeof(visuals)='object'),
 version integer NOT NULL DEFAULT 1,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE FUNCTION public.game_arctic_configuration_guard() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE slot text; image_path jsonb;
BEGIN
 IF TG_OP='UPDATE' AND NEW.organization_id<>OLD.organization_id THEN RAISE EXCEPTION 'Organization is immutable'; END IF;
 FOR slot,image_path IN SELECT * FROM jsonb_each(NEW.visuals) LOOP
  IF NOT(slot=ANY(ARRAY['worldMap','dojo','farming','onet','geometry','quest','citadel1','citadel2','citadel3','final','victory','market']))
   OR jsonb_typeof(image_path)<>'string'
   OR left(image_path #>> '{}',length(NEW.organization_id)+1)<>NEW.organization_id||'/'
   OR substring(image_path #>> '{}' FROM length(NEW.organization_id)+2) !~ '^[0-9a-f-]+\.(png|jpg|webp)$'
  THEN RAISE EXCEPTION 'Invalid Arctic visual slot or path'; END IF;
 END LOOP;
 NEW.version:=CASE WHEN TG_OP='INSERT' THEN 1 ELSE OLD.version+1 END;
 NEW.updated_at:=now(); RETURN NEW;
END $$;
CREATE TRIGGER game_arctic_configuration_guard BEFORE INSERT OR UPDATE ON public.game_arctic_configuration
 FOR EACH ROW EXECUTE FUNCTION public.game_arctic_configuration_guard();
ALTER TABLE public.game_arctic_configuration ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.game_arctic_configuration FROM anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON public.game_arctic_configuration TO authenticated;
CREATE POLICY arctic_runtime_read ON public.game_arctic_configuration FOR SELECT TO authenticated USING(
 EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=public.game_current_profile_id() AND p.organization_id=game_arctic_configuration.organization_id));
CREATE POLICY arctic_admin_insert ON public.game_arctic_configuration FOR INSERT TO authenticated WITH CHECK(public.is_org_admin(organization_id));
CREATE POLICY arctic_admin_update ON public.game_arctic_configuration FOR UPDATE TO authenticated USING(public.is_org_admin(organization_id)) WITH CHECK(public.is_org_admin(organization_id));
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 VALUES('game-arctic-visuals','game-arctic-visuals',false,10485760,ARRAY['image/png','image/jpeg','image/webp']);
CREATE POLICY arctic_visual_read ON storage.objects FOR SELECT TO authenticated USING(
 bucket_id='game-arctic-visuals' AND EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=public.game_current_profile_id() AND p.organization_id=(string_to_array(name,'/'))[1]));
CREATE POLICY arctic_visual_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK(
 bucket_id='game-arctic-visuals' AND public.is_org_admin((string_to_array(name,'/'))[1]));
COMMIT;

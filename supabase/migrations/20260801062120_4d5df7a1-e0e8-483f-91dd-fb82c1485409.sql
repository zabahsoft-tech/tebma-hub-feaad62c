CREATE TYPE public.dictionary_media_kind AS ENUM ('image', 'video', 'embed');

CREATE TABLE public.dictionary_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid NOT NULL REFERENCES public.dictionary_entries(id) ON DELETE CASCADE,
  kind public.dictionary_media_kind NOT NULL DEFAULT 'image',
  url text NOT NULL,
  poster_url text,
  caption text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX dictionary_media_entry_idx ON public.dictionary_media (entry_id, sort_order);

GRANT SELECT ON public.dictionary_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dictionary_media TO authenticated;
GRANT ALL ON public.dictionary_media TO service_role;

ALTER TABLE public.dictionary_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY dict_media_public_read ON public.dictionary_media
  FOR SELECT TO anon USING (true);

CREATE POLICY dict_media_auth_read ON public.dictionary_media
  FOR SELECT TO authenticated USING (true);

CREATE POLICY dict_media_admin_write ON public.dictionary_media
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
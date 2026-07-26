
CREATE TABLE public.site_contact_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hq_address text,
  asia_office text,
  americas_office text,
  general_email text,
  media_email text,
  phone text,
  website text,
  facebook text,
  instagram text,
  youtube text,
  twitter text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_contact_info TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_contact_info TO authenticated;
GRANT ALL ON public.site_contact_info TO service_role;

ALTER TABLE public.site_contact_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY contact_info_public_read ON public.site_contact_info
  FOR SELECT TO anon USING (true);
CREATE POLICY contact_info_auth_read ON public.site_contact_info
  FOR SELECT TO authenticated USING (true);
CREATE POLICY contact_info_admin_write ON public.site_contact_info
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER site_contact_info_touch
  BEFORE UPDATE ON public.site_contact_info
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

INSERT INTO public.site_contact_info
  (hq_address, asia_office, americas_office, general_email, media_email)
VALUES
  ('12 Rue de l''Etuve, Brussels', '3-1 Marunouchi, Tokyo', '225 Broadway, New York',
   'office@tebma.org', 'media@tebma.org');

CREATE TABLE public.page_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  visible_in_nav boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.page_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_categories TO authenticated;
GRANT ALL ON public.page_categories TO service_role;

ALTER TABLE public.page_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY page_categories_public_read ON public.page_categories FOR SELECT TO anon USING (true);
CREATE POLICY page_categories_auth_read ON public.page_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY page_categories_admin_write ON public.page_categories FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER page_categories_touch BEFORE UPDATE ON public.page_categories
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category_id uuid REFERENCES public.page_categories(id) ON DELETE SET NULL,
  excerpt text,
  body text NOT NULL DEFAULT '',
  cover_url text,
  seo_title text,
  seo_description text,
  published boolean NOT NULL DEFAULT true,
  published_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pages_category_idx ON public.pages (category_id, sort_order);

GRANT SELECT ON public.pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY pages_public_read ON public.pages FOR SELECT TO anon USING (published = true);
CREATE POLICY pages_auth_read ON public.pages FOR SELECT TO authenticated USING (true);
CREATE POLICY pages_admin_write ON public.pages FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER pages_touch BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

INSERT INTO public.page_categories (slug, name, sort_order, visible_in_nav)
VALUES ('federation', 'Federation', 1, true);

INSERT INTO public.pages (slug, title, category_id, excerpt, body, published, published_at, sort_order, seo_title, seo_description)
VALUES (
  'leadership',
  'Leadership Council',
  (SELECT id FROM public.page_categories WHERE slug = 'federation'),
  'The elected officers and technical directors guiding the World TEBMA Martial Arts Federation.',
  '<p>The Leadership Council of the World TEBMA Martial Arts Federation oversees technical standards, competition governance, and international development across every member nation.</p><h2>Mandate</h2><p>The Council is elected every four years by delegates of affiliated national bodies. It ratifies grading syllabi, approves referee certification, and appoints regional technical directors.</p>',
  true,
  now(),
  1,
  'Leadership Council — World TEBMA Federation',
  'Meet the elected officers and technical directors of the World TEBMA Martial Arts Federation.'
);
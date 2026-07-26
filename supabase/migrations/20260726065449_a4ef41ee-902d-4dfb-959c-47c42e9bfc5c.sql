
-- ========== Roles & profiles ==========
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_self_read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Auto profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name) VALUES (NEW.id, NEW.email);
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Shared updated_at helper
CREATE OR REPLACE FUNCTION public.tg_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ========== News ==========
CREATE TABLE public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT NOT NULL DEFAULT '',
  cover_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.news_articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_articles TO authenticated;
GRANT ALL ON public.news_articles TO service_role;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "news_public_read" ON public.news_articles FOR SELECT TO anon USING (published = true);
CREATE POLICY "news_admin_read_all" ON public.news_articles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "news_admin_write" ON public.news_articles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER news_touch BEFORE UPDATE ON public.news_articles FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ========== Styles ==========
CREATE TABLE public.styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL DEFAULT '',
  cover_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.styles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.styles TO authenticated;
GRANT ALL ON public.styles TO service_role;
ALTER TABLE public.styles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "styles_public_read" ON public.styles FOR SELECT TO anon USING (true);
CREATE POLICY "styles_auth_read" ON public.styles FOR SELECT TO authenticated USING (true);
CREATE POLICY "styles_admin_write" ON public.styles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER styles_touch BEFORE UPDATE ON public.styles FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ========== Rules ==========
CREATE TABLE public.rules_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rules_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rules_sections TO authenticated;
GRANT ALL ON public.rules_sections TO service_role;
ALTER TABLE public.rules_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rules_public_read" ON public.rules_sections FOR SELECT TO anon USING (true);
CREATE POLICY "rules_auth_read" ON public.rules_sections FOR SELECT TO authenticated USING (true);
CREATE POLICY "rules_admin_write" ON public.rules_sections FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER rules_touch BEFORE UPDATE ON public.rules_sections FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ========== Gallery ==========
CREATE TABLE public.gallery_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_albums TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_albums TO authenticated;
GRANT ALL ON public.gallery_albums TO service_role;
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "albums_public_read" ON public.gallery_albums FOR SELECT TO anon USING (true);
CREATE POLICY "albums_auth_read" ON public.gallery_albums FOR SELECT TO authenticated USING (true);
CREATE POLICY "albums_admin_write" ON public.gallery_albums FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID REFERENCES public.gallery_albums(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_photos TO authenticated;
GRANT ALL ON public.gallery_photos TO service_role;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photos_public_read" ON public.gallery_photos FOR SELECT TO anon USING (true);
CREATE POLICY "photos_auth_read" ON public.gallery_photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "photos_admin_write" ON public.gallery_photos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ========== Dictionary ==========
CREATE TABLE public.dictionary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  term TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  style_id UUID REFERENCES public.styles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.dictionary_entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dictionary_entries TO authenticated;
GRANT ALL ON public.dictionary_entries TO service_role;
ALTER TABLE public.dictionary_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dict_public_read" ON public.dictionary_entries FOR SELECT TO anon USING (true);
CREATE POLICY "dict_auth_read" ON public.dictionary_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "dict_admin_write" ON public.dictionary_entries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER dict_touch BEFORE UPDATE ON public.dictionary_entries FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ========== Certificates ==========
CREATE TYPE public.certificate_status AS ENUM ('active','revoked','expired');

CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  holder_name TEXT NOT NULL,
  rank TEXT NOT NULL,
  style_id UUID REFERENCES public.styles(id) ON DELETE SET NULL,
  style_name TEXT,
  country TEXT,
  issued_on DATE NOT NULL DEFAULT CURRENT_DATE,
  expires_on DATE,
  status public.certificate_status NOT NULL DEFAULT 'active',
  qr_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.certificates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cert_public_read" ON public.certificates FOR SELECT TO anon USING (true);
CREATE POLICY "cert_auth_read" ON public.certificates FOR SELECT TO authenticated USING (true);
CREATE POLICY "cert_admin_write" ON public.certificates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER cert_touch BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.tg_touch_updated_at();

-- ========== Membership applications ==========
CREATE TABLE public.membership_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT,
  tier TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.membership_applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.membership_applications TO authenticated;
GRANT ALL ON public.membership_applications TO service_role;
ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "membership_anon_insert" ON public.membership_applications FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "membership_auth_insert" ON public.membership_applications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "membership_admin_all" ON public.membership_applications FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ========== Contact messages ==========
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_anon_insert" ON public.contact_messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "contact_auth_insert" ON public.contact_messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "contact_admin_all" ON public.contact_messages FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ========== Seed content ==========
INSERT INTO public.styles (slug, name, tagline, description, sort_order) VALUES
  ('koshiki-karatedo','Koshiki Karatedo','The way of hard and soft combat','Koshiki Karatedo integrates classical striking with disciplined movement, forming the technical backbone of TEBMA. Practitioners progress through structured kata and controlled kumite.',1),
  ('kobudo','Kobudo','Traditional weaponry curriculum','Kobudo preserves the historical weapons systems of TEBMA. Training covers the bo, sai, tonfa, and nunchaku with an emphasis on posture, timing, and lineage.',2),
  ('goshinjutsu','Goshinjutsu','Modern applications of self-defense','Goshinjutsu adapts classical principles into contemporary self-defense frameworks used in law enforcement and civilian training programs worldwide.',3),
  ('kenjutsu','Kenjutsu','Formal art of the long sword','Kenjutsu focuses on the etiquette, kata, and applied engagements of the traditional Japanese sword within the federation''s formal curriculum.',4);

INSERT INTO public.rules_sections (slug, title, body, sort_order) VALUES
  ('code-of-conduct','Code of Conduct','All members of the World TEBMA Federation are expected to uphold the highest standards of respect, integrity, and technical discipline. Any violation of the code may result in review by the Ethics Committee.',1),
  ('competition-rules','Competition Rules','International competitions follow the TEBMA Technical Rulebook (rev. 2025). Scoring, weight divisions, protective equipment, and referee protocols are standardized across all continental federations.',2),
  ('grading-syllabus','Grading Syllabus','Rank progression through kyu and dan levels is governed by a unified syllabus. Examinations must be conducted by a certified TEBMA examiner and recorded in the official registry.',3),
  ('anti-doping','Anti-Doping Policy','The federation adheres to WADA guidelines. All licensed athletes may be subject to testing at sanctioned events. Violations are handled according to the federation''s disciplinary procedure.',4);

INSERT INTO public.dictionary_entries (slug, term, description, tags) VALUES
  ('mae-geri','Mae Geri','A fundamental front kick executed with the ball of the foot. Delivered from a stable stance, it emphasizes hip alignment and controlled retraction.', ARRAY['kick','fundamental']),
  ('gyaku-zuki','Gyaku Zuki','The reverse punch, delivered with the rear hand while the opposite leg leads. A cornerstone of federation kumite technique.', ARRAY['strike','fundamental']),
  ('shizentai','Shizentai','The natural standing posture used to initiate forms and drills. Balance is centered, feet shoulder-width apart, weight evenly distributed.', ARRAY['stance','fundamental']),
  ('rei','Rei','The formal bow performed at the beginning and end of each training session. Represents mutual respect between practitioners.', ARRAY['etiquette']);

INSERT INTO public.news_articles (slug, title, excerpt, body, published, published_at) VALUES
  ('revised-kumite-protocol-2025','Revised Kumite Protocol for 2025 World Championships','The Technical Committee has finalized updates to the scoring criteria for senior divisions.','The World TEBMA Federation Technical Committee has released the revised kumite scoring protocol effective January 2025. Updates cover point differentials, extended-time rules, and the use of video review for continental championships.',true,now() - interval '3 days'),
  ('archives-1974-founders','Historical Archives: The 1974 Federation Founders','A curated digital gallery of the original manuscripts and photographic records from our inception.','On the fiftieth anniversary of the federation, the archives office has released a curated digital gallery of founding documents and photographs. The collection is available in the members'' area and via the Photo Dictionary interlinks.',true,now() - interval '10 days'),
  ('global-membership-growth','Global Membership Growth Exceeds 4 Million','Federation statistics show record engagement across the Pan-American and European sectors.','The 2024 annual report confirms federation membership has surpassed 4 million registered practitioners across 140 member nations. Growth is strongest in the Pan-American and European continental federations.',true,now() - interval '20 days');

INSERT INTO public.certificates (code, holder_name, rank, style_name, country, issued_on, expires_on, status) VALUES
  ('TBM-2025-8829XK','Hiroshi Tanaka','5th Dan','Koshiki Karatedo','Japan','2025-03-15','2030-03-15','active'),
  ('TBM-2024-4471QC','Marta Costa','3rd Dan','Goshinjutsu','Portugal','2024-09-01','2029-09-01','active'),
  ('TBM-2023-1102ZR','Alex Reeve','2nd Dan','Kenjutsu','United Kingdom','2023-06-10','2028-06-10','revoked');

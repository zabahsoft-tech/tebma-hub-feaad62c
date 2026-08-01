ALTER TABLE public.site_contact_info
  ADD COLUMN IF NOT EXISTS site_title text,
  ADD COLUMN IF NOT EXISTS site_short_title text,
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS contact_intro text,
  ADD COLUMN IF NOT EXISTS map_embed_url text,
  ADD COLUMN IF NOT EXISTS office_hours text;
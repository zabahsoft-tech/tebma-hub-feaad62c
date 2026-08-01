ALTER TABLE public.site_contact_info
  ADD COLUMN IF NOT EXISTS cert_code_prefix text,
  ADD COLUMN IF NOT EXISTS cert_code_include_year boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS cert_code_random_length integer NOT NULL DEFAULT 6;

DROP POLICY IF EXISTS "membership_anon_insert" ON public.membership_applications;
DROP POLICY IF EXISTS "membership_auth_insert" ON public.membership_applications;
CREATE POLICY "membership_anon_insert" ON public.membership_applications FOR INSERT TO anon
  WITH CHECK (length(full_name) BETWEEN 1 AND 200 AND length(email) BETWEEN 3 AND 320 AND length(tier) BETWEEN 1 AND 50);
CREATE POLICY "membership_auth_insert" ON public.membership_applications FOR INSERT TO authenticated
  WITH CHECK (length(full_name) BETWEEN 1 AND 200 AND length(email) BETWEEN 3 AND 320 AND length(tier) BETWEEN 1 AND 50);

DROP POLICY IF EXISTS "contact_anon_insert" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_auth_insert" ON public.contact_messages;
CREATE POLICY "contact_anon_insert" ON public.contact_messages FOR INSERT TO anon
  WITH CHECK (length(name) BETWEEN 1 AND 200 AND length(email) BETWEEN 3 AND 320 AND length(message) BETWEEN 1 AND 5000);
CREATE POLICY "contact_auth_insert" ON public.contact_messages FOR INSERT TO authenticated
  WITH CHECK (length(name) BETWEEN 1 AND 200 AND length(email) BETWEEN 3 AND 320 AND length(message) BETWEEN 1 AND 5000);

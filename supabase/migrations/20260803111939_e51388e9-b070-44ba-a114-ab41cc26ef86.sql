-- 1) Narrow media bucket public read to known public content folders only.
DROP POLICY IF EXISTS media_public_read ON storage.objects;

CREATE POLICY media_public_read ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] IN (
    'branding','covers','dictionary','gallery','news','pages','rules','styles'
  )
);

-- 2) SECURITY DEFINER hardening.
-- handle_new_user is a trigger-only function: no API role should call it.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- verify_certificate_by_code is the ONLY public entry point to certificate data.
-- It is intentionally callable by anon/authenticated (client-side certificate
-- verification, no server tier), stays SECURITY DEFINER so the certificates
-- table itself remains admin-only, and pins its search_path.
ALTER FUNCTION public.verify_certificate_by_code(text) SET search_path = public, pg_temp;
REVOKE ALL ON FUNCTION public.verify_certificate_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate_by_code(text) TO anon, authenticated;
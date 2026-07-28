-- 1. Lock down SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.verify_certificate_by_code(text) FROM PUBLIC, anon, authenticated;
-- Only the public verification page (anon key) may call the narrow, code-scoped lookup.
GRANT EXECUTE ON FUNCTION public.verify_certificate_by_code(text) TO anon;

-- 2. Certificates: remove blanket authenticated read, admin-only full access
DROP POLICY IF EXISTS cert_auth_read ON public.certificates;

CREATE POLICY cert_admin_read ON public.certificates
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

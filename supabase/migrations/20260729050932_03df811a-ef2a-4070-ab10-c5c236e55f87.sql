REVOKE EXECUTE ON FUNCTION public.verify_certificate_by_code(text) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate_by_code(text) TO service_role;
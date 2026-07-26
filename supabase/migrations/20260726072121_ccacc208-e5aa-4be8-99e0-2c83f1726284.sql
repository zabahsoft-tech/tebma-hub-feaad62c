
-- 1) has_role: switch to SECURITY INVOKER. Users can read their own user_roles rows
--    via existing RLS, so has_role(auth.uid(), 'admin') keeps working while no
--    longer bypassing RLS as the function owner.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2) certificates: remove anonymous full-table read; add a lookup-by-code function.
DROP POLICY IF EXISTS cert_public_read ON public.certificates;
REVOKE SELECT ON public.certificates FROM anon;

CREATE OR REPLACE FUNCTION public.verify_certificate_by_code(_code text)
RETURNS TABLE (
  code text,
  holder_name text,
  rank text,
  style_name text,
  country text,
  issued_on date,
  expires_on date,
  status public.certificate_status
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.code, c.holder_name, c.rank, c.style_name, c.country,
         c.issued_on, c.expires_on, c.status
  FROM public.certificates c
  WHERE c.code = upper(trim(_code))
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.verify_certificate_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate_by_code(text) TO anon, authenticated, service_role;

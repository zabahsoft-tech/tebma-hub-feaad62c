
-- Public read for content buckets
CREATE POLICY "public_read_content" ON storage.objects FOR SELECT TO anon USING (
  bucket_id IN ('news-covers','gallery','styles','dictionary','certificates')
);
CREATE POLICY "auth_read_content" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id IN ('news-covers','gallery','styles','dictionary','certificates')
);
CREATE POLICY "admin_write_content" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('news-covers','gallery','styles','dictionary','certificates') AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin_update_content" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('news-covers','gallery','styles','dictionary','certificates') AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin_delete_content" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('news-covers','gallery','styles','dictionary','certificates') AND public.has_role(auth.uid(),'admin'));

-- Fix search_path warning on trigger helper
ALTER FUNCTION public.tg_touch_updated_at() SET search_path = public;

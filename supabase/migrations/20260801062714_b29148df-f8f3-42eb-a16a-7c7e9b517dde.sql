ALTER TABLE public.gallery_photos
  ADD COLUMN kind text NOT NULL DEFAULT 'image',
  ADD COLUMN poster_url text;

ALTER TABLE public.gallery_photos
  ADD CONSTRAINT gallery_photos_kind_check CHECK (kind IN ('image', 'embed'));
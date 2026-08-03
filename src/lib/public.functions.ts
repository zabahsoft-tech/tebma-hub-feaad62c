// Browser-side public data access (no SSR / no server functions).
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// ============ NEWS ============
export async function listPublishedNews(args?: { data?: { limit?: number } }) {
  const limit = Math.min(args?.data?.limit ?? 24, 100);
  const { data, error } = await supabase
    .from("news_articles")
    .select("id,slug,title,excerpt,cover_url,published_at")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getNewsBySlug({ data: input }: { data: { slug: string } }) {
  const { data, error } = await supabase
    .from("news_articles")
    .select("id,slug,title,excerpt,body,cover_url,published_at")
    .eq("slug", input.slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ============ STYLES ============
export async function listStyles() {
  const { data, error } = await supabase
    .from("styles")
    .select("id,slug,name,tagline,description,cover_url,sort_order")
    .order("sort_order")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getStyleBySlug({ data: input }: { data: { slug: string } }) {
  const { data, error } = await supabase
    .from("styles")
    .select("id,slug,name,tagline,description,cover_url")
    .eq("slug", input.slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ============ RULES ============
export async function listRules() {
  const { data, error } = await supabase
    .from("rules_sections")
    .select("id,slug,title,body,excerpt,cover_url,sort_order")
    .order("sort_order")
    .order("title");
  if (error) throw error;
  return data ?? [];
}

export async function getRuleBySlug({ data: input }: { data: { slug: string } }) {
  const list = await listRules();
  const idx = list.findIndex((r) => r.slug === input.slug);
  if (idx === -1) return null;
  return {
    rule: list[idx],
    prev: idx > 0 ? { slug: list[idx - 1].slug, title: list[idx - 1].title } : null,
    next: idx < list.length - 1 ? { slug: list[idx + 1].slug, title: list[idx + 1].title } : null,
  };
}

// ============ GALLERY ============
export async function listGallery() {
  const [{ data: albums }, { data: photos }] = await Promise.all([
    supabase
      .from("gallery_albums")
      .select("id,slug,title,description,cover_url")
      .order("created_at", { ascending: false }),
    supabase
      .from("gallery_photos")
      .select("id,album_id,kind,url,poster_url,caption,sort_order")
      .order("sort_order")
      .order("created_at", { ascending: false }),
  ]);

  return { albums: albums ?? [], photos: photos ?? [] };
}

// ============ DICTIONARY ============
export async function listDictionary() {
  const [{ data, error }, { data: media }] = await Promise.all([
    supabase
      .from("dictionary_entries")
      .select("id,slug,term,description,image_url,image_caption,tags")
      .order("term"),
    supabase.from("dictionary_media").select("entry_id,kind"),
  ]);
  if (error) throw error;
  const withVideo = new Set((media ?? []).filter((m) => m.kind !== "image").map((m) => m.entry_id));
  return (data ?? []).map((e) => ({ ...e, has_video: withVideo.has(e.id) }));
}

export async function getDictionaryBySlug({ data: input }: { data: { slug: string } }) {
  const { data: row, error } = await supabase
    .from("dictionary_entries")
    .select("id,slug,term,description,image_url,image_caption,tags")
    .eq("slug", input.slug)
    .maybeSingle();
  if (error) throw error;
  if (!row) return null;
  const { data: media, error: mErr } = await supabase
    .from("dictionary_media")
    .select("id,kind,url,poster_url,caption,sort_order")
    .eq("entry_id", row.id)
    .order("sort_order");
  if (mErr) throw mErr;
  return { ...row, media: media ?? [] };
}

// ============ CERTIFICATE VERIFY ============
export async function verifyCertificate({ data: input }: { data: { code: string } }) {
  const code = String(input.code).trim().toUpperCase().slice(0, 100);
  if (!code) return { found: false as const };
  const { data, error } = await supabase.rpc("verify_certificate_by_code", { _code: code });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { found: false as const };
  return { found: true as const, certificate: row };
}

// ============ SUBMISSIONS ============
const membershipSchema = z.object({
  full_name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  country: z.string().trim().max(100).optional().nullable(),
  tier: z.string().trim().min(1).max(50),
  message: z.string().trim().max(2000).optional().nullable(),
});

export async function submitMembership({ data: input }: { data: unknown }) {
  const data = membershipSchema.parse(input);
  const { error } = await supabase.from("membership_applications").insert({
    full_name: data.full_name,
    email: data.email,
    country: data.country ?? null,
    tier: data.tier,
    message: data.message ?? null,
  });
  if (error) throw error;
  return { ok: true as const };
}

const contactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  subject: z.string().trim().max(200).optional().nullable(),
  message: z.string().trim().min(1).max(5000),
});

export async function submitContact({ data: input }: { data: unknown }) {
  const data = contactSchema.parse(input);
  const { error } = await supabase.from("contact_messages").insert({
    name: data.name,
    email: data.email,
    subject: data.subject ?? null,
    message: data.message,
  });
  if (error) throw error;
  return { ok: true as const };
}

// ============ CONTACT INFO ============
export async function getContactInfo() {
  const { data, error } = await supabase
    .from("site_contact_info")
    .select(
      "site_title,site_short_title,tagline,contact_intro,map_embed_url,office_hours,hq_address,asia_office,americas_office,general_email,media_email,phone,website,facebook,instagram,youtube,twitter,logo_url",
    )
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ============ PAGES & CATEGORIES ============
export async function listNavCategories() {
  const [{ data: cats, error: catErr }, { data: pages, error: pageErr }] = await Promise.all([
    supabase
      .from("page_categories")
      .select("id,slug,name,sort_order,visible_in_nav")
      .eq("visible_in_nav", true)
      .order("sort_order")
      .order("name"),
    supabase
      .from("pages")
      .select("id,slug,title,category_id,sort_order")
      .eq("published", true)
      .order("sort_order")
      .order("title"),
  ]);
  if (catErr) throw catErr;
  if (pageErr) throw pageErr;
  return (cats ?? []).map((c) => ({
    ...c,
    pages: (pages ?? []).filter((p) => p.category_id === c.id),
  }));
}

export async function getPageBySlug({ data: input }: { data: { slug: string } }) {
  const { data: row, error } = await supabase
    .from("pages")
    .select("id,slug,title,excerpt,body,cover_url,seo_title,seo_description,published_at,updated_at,category_id")
    .eq("slug", input.slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  if (!row) return null;
  let category: { slug: string; name: string } | null = null;
  if (row.category_id) {
    const { data: cat } = await supabase
      .from("page_categories")
      .select("slug,name")
      .eq("id", row.category_id)
      .maybeSingle();
    category = cat ?? null;
  }
  return { ...row, category };
}

export async function getCategoryBySlug({ data: input }: { data: { slug: string } }) {
  const { data: cat, error } = await supabase
    .from("page_categories")
    .select("id,slug,name")
    .eq("slug", input.slug)
    .maybeSingle();
  if (error) throw error;
  if (!cat) return null;
  const { data: pages, error: pageErr } = await supabase
    .from("pages")
    .select("id,slug,title,excerpt,cover_url,sort_order")
    .eq("category_id", cat.id)
    .eq("published", true)
    .order("sort_order")
    .order("title");
  if (pageErr) throw pageErr;
  return { ...cat, pages: pages ?? [] };
}

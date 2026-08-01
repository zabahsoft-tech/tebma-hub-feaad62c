import { createServerFn } from "@tanstack/react-start";
import { createServerPublicClient } from "@/lib/supabase-public.server";

// ============ NEWS ============
export const listPublishedNews = createServerFn({ method: "GET" })
  .inputValidator((d: { limit?: number } | undefined) => ({ limit: Math.min(d?.limit ?? 24, 100) }))
  .handler(async ({ data }) => {
    const s = createServerPublicClient();
    const { data: rows, error } = await s
      .from("news_articles")
      .select("id,slug,title,excerpt,cover_url,published_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(data.limit);
    if (error) throw error;
    return rows ?? [];
  });

export const getNewsBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const s = createServerPublicClient();
    const { data: row, error } = await s
      .from("news_articles")
      .select("id,slug,title,excerpt,body,cover_url,published_at")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw error;
    return row;
  });

// ============ STYLES ============
export const listStyles = createServerFn({ method: "GET" }).handler(async () => {
  const s = createServerPublicClient();
  const { data, error } = await s
    .from("styles")
    .select("id,slug,name,tagline,description,cover_url,sort_order")
    .order("sort_order")
    .order("name");
  if (error) throw error;
  return data ?? [];
});

export const getStyleBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const s = createServerPublicClient();
    const { data: row, error } = await s
      .from("styles")
      .select("id,slug,name,tagline,description,cover_url")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw error;
    return row;
  });

// ============ RULES ============
export const listRules = createServerFn({ method: "GET" }).handler(async () => {
  const s = createServerPublicClient();
  const { data, error } = await s
    .from("rules_sections")
    .select("id,slug,title,body,excerpt,cover_url,sort_order")
    .order("sort_order")
    .order("title");
  if (error) throw error;
  return data ?? [];
});

export const getRuleBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const s = createServerPublicClient();
    const { data: rows, error } = await s
      .from("rules_sections")
      .select("id,slug,title,body,excerpt,cover_url,sort_order")
      .order("sort_order")
      .order("title");
    if (error) throw error;
    const list = rows ?? [];
    const idx = list.findIndex((r) => r.slug === data.slug);
    if (idx === -1) return null;
    return {
      rule: list[idx],
      prev: idx > 0 ? { slug: list[idx - 1].slug, title: list[idx - 1].title } : null,
      next: idx < list.length - 1 ? { slug: list[idx + 1].slug, title: list[idx + 1].title } : null,
    };
  });


// ============ GALLERY ============
export const listGallery = createServerFn({ method: "GET" }).handler(async () => {
  const s = createServerPublicClient();
  const [{ data: albums }, { data: photos }] = await Promise.all([
    s.from("gallery_albums").select("id,slug,title,description,cover_url").order("created_at", { ascending: false }),
    s
      .from("gallery_photos")
      .select("id,album_id,url,caption,sort_order")
      .order("sort_order")
      .order("created_at", { ascending: false }),
  ]);
  return { albums: albums ?? [], photos: photos ?? [] };
});

// ============ DICTIONARY ============
export const listDictionary = createServerFn({ method: "GET" }).handler(async () => {
  const s = createServerPublicClient();
  const [{ data, error }, { data: media }] = await Promise.all([
    s.from("dictionary_entries").select("id,slug,term,description,image_url,tags").order("term"),
    s.from("dictionary_media").select("entry_id,kind"),
  ]);
  if (error) throw error;
  const withVideo = new Set((media ?? []).filter((m) => m.kind !== "image").map((m) => m.entry_id));
  return (data ?? []).map((e) => ({ ...e, has_video: withVideo.has(e.id) }));
});

export const getDictionaryBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const s = createServerPublicClient();
    const { data: row, error } = await s
      .from("dictionary_entries")
      .select("id,slug,term,description,image_url,tags")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw error;
    if (!row) return null;
    const { data: media, error: mErr } = await s
      .from("dictionary_media")
      .select("id,kind,url,poster_url,caption,sort_order")
      .eq("entry_id", row.id)
      .order("sort_order");
    if (mErr) throw mErr;
    return { ...row, media: media ?? [] };
  });


// ============ CERTIFICATE VERIFY ============
export const verifyCertificate = createServerFn({ method: "GET" })
  .inputValidator((d: { code: string }) => ({ code: String(d.code).trim().toUpperCase().slice(0, 100) }))
  .handler(async ({ data }) => {
    if (!data.code) return { found: false as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.rpc("verify_certificate_by_code", { _code: data.code });
    if (error) throw error;
    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row) return { found: false as const };
    return { found: true as const, certificate: row };
  });


// ============ SUBMISSIONS ============
import { z } from "zod";

const membershipSchema = z.object({
  full_name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  country: z.string().trim().max(100).optional().nullable(),
  tier: z.string().trim().min(1).max(50),
  message: z.string().trim().max(2000).optional().nullable(),
});

export const submitMembership = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => membershipSchema.parse(d))
  .handler(async ({ data }) => {
    const s = createServerPublicClient();
    const { error } = await s.from("membership_applications").insert({
      full_name: data.full_name,
      email: data.email,
      country: data.country ?? null,
      tier: data.tier,
      message: data.message ?? null,
    });
    if (error) throw error;
    return { ok: true as const };
  });

const contactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  subject: z.string().trim().max(200).optional().nullable(),
  message: z.string().trim().min(1).max(5000),
});

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => contactSchema.parse(d))
  .handler(async ({ data }) => {
    const s = createServerPublicClient();
    const { error } = await s.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      subject: data.subject ?? null,
      message: data.message,
    });
    if (error) throw error;
    return { ok: true as const };
  });

// ============ CONTACT INFO ============
export const getContactInfo = createServerFn({ method: "GET" }).handler(async () => {
  const s = createServerPublicClient();
  const { data, error } = await s
    .from("site_contact_info")
    .select("hq_address,asia_office,americas_office,general_email,media_email,phone,website,facebook,instagram,youtube,twitter,logo_url")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
});

// ============ PAGES & CATEGORIES ============
export const listNavCategories = createServerFn({ method: "GET" }).handler(async () => {
  const s = createServerPublicClient();
  const [{ data: cats, error: catErr }, { data: pages, error: pageErr }] = await Promise.all([
    s
      .from("page_categories")
      .select("id,slug,name,sort_order,visible_in_nav")
      .eq("visible_in_nav", true)
      .order("sort_order")
      .order("name"),
    s
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
});

export const getPageBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const s = createServerPublicClient();
    const { data: row, error } = await s
      .from("pages")
      .select("id,slug,title,excerpt,body,cover_url,seo_title,seo_description,published_at,updated_at,category_id")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw error;
    if (!row) return null;
    let category: { slug: string; name: string } | null = null;
    if (row.category_id) {
      const { data: cat } = await s
        .from("page_categories")
        .select("slug,name")
        .eq("id", row.category_id)
        .maybeSingle();
      category = cat ?? null;
    }
    return { ...row, category };
  });

export const getCategoryBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const s = createServerPublicClient();
    const { data: cat, error } = await s
      .from("page_categories")
      .select("id,slug,name")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw error;
    if (!cat) return null;
    const { data: pages, error: pageErr } = await s
      .from("pages")
      .select("id,slug,title,excerpt,cover_url,sort_order")
      .eq("category_id", cat.id)
      .eq("published", true)
      .order("sort_order")
      .order("title");
    if (pageErr) throw pageErr;
    return { ...cat, pages: pages ?? [] };
  });



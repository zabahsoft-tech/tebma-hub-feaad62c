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
    .select("id,slug,title,body,sort_order")
    .order("sort_order")
    .order("title");
  if (error) throw error;
  return data ?? [];
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
  const { data, error } = await s
    .from("dictionary_entries")
    .select("id,slug,term,description,image_url,tags")
    .order("term");
  if (error) throw error;
  return data ?? [];
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
    return row;
  });

// ============ CERTIFICATE VERIFY ============
export const verifyCertificate = createServerFn({ method: "GET" })
  .inputValidator((d: { code: string }) => ({ code: String(d.code).trim().toUpperCase().slice(0, 100) }))
  .handler(async ({ data }) => {
    if (!data.code) return { found: false as const };
    const s = createServerPublicClient();
    const { data: row, error } = await s
      .from("certificates")
      .select("code,holder_name,rank,style_name,country,issued_on,expires_on,status")
      .eq("code", data.code)
      .maybeSingle();
    if (error) throw error;
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

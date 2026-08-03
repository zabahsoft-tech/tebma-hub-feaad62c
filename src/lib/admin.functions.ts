// Browser-side admin data access (no SSR / no server functions).
// Access control is enforced by row-level security + admin role policies.
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { toEmbedUrl } from "@/lib/embed";

type Id = { data: { id: string } };

// ---------- News ----------
const newsSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(300),
  excerpt: z.string().trim().max(500).optional().nullable(),
  body: z.string().max(50000).default(""),
  cover_url: z.string().trim().max(2000).optional().nullable().transform((v) => (v ? v : null)),
  published: z.boolean().default(false),
  published_at: z.string().datetime().optional().nullable(),
});

export async function adminListNews() {
  const { data, error } = await supabase
    .from("news_articles")
    .select("id,slug,title,excerpt,published,published_at,updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminGetNews({ data: input }: Id) {
  const { data, error } = await supabase.from("news_articles").select("*").eq("id", input.id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function adminUpsertNews({ data: input }: { data: unknown }) {
  const data = newsSchema.parse(input);
  const payload = {
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt ?? null,
    body: data.body ?? "",
    cover_url: data.cover_url ?? null,
    published: data.published,
    published_at: data.published ? (data.published_at ?? new Date().toISOString()) : null,
  };
  const dupe = await supabase.from("news_articles").select("id").eq("slug", data.slug).maybeSingle();
  if (dupe.data && dupe.data.id !== data.id) {
    throw new Error(`The slug "${data.slug}" is already used by another article. Choose a different slug.`);
  }
  if (data.id) {
    const { error } = await supabase.from("news_articles").update(payload).eq("id", data.id);
    if (error) throw error;
    return { id: data.id };
  }
  const { data: row, error } = await supabase.from("news_articles").insert(payload).select("id").single();
  if (error) throw error;
  return { id: row.id };
}

export async function adminDeleteNews({ data: input }: Id) {
  const { error } = await supabase.from("news_articles").delete().eq("id", input.id);
  if (error) throw error;
  return { ok: true };
}

// ---------- Styles ----------
const styleSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(200),
  tagline: z.string().trim().max(300).optional().nullable(),
  description: z.string().max(20000).default(""),
  cover_url: z.string().url().optional().nullable(),
  sort_order: z.coerce.number().int().default(0),
});

export async function adminListStyles() {
  const { data, error } = await supabase.from("styles").select("*").order("sort_order").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function adminGetStyle({ data: input }: Id) {
  const { data, error } = await supabase.from("styles").select("*").eq("id", input.id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function adminUpsertStyle({ data: input }: { data: unknown }) {
  const data = styleSchema.parse(input);
  const payload = {
    slug: data.slug,
    name: data.name,
    tagline: data.tagline ?? null,
    description: data.description ?? "",
    cover_url: data.cover_url ?? null,
    sort_order: data.sort_order,
  };
  if (data.id) {
    const { error } = await supabase.from("styles").update(payload).eq("id", data.id);
    if (error) throw error;
    return { id: data.id };
  }
  const { data: row, error } = await supabase.from("styles").insert(payload).select("id").single();
  if (error) throw error;
  return { id: row.id };
}

export async function adminDeleteStyle({ data: input }: Id) {
  const { error } = await supabase.from("styles").delete().eq("id", input.id);
  if (error) throw error;
  return { ok: true };
}

// ---------- Rules ----------
const ruleSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().max(500).optional().nullable(),
  cover_url: z.string().trim().max(2000).optional().nullable(),
  body: z.string().max(50000).default(""),
  sort_order: z.coerce.number().int().default(0),
});

export async function adminListRules() {
  const { data, error } = await supabase.from("rules_sections").select("*").order("sort_order").order("title");
  if (error) throw error;
  return data ?? [];
}

export async function adminGetRule({ data: input }: Id) {
  const { data, error } = await supabase.from("rules_sections").select("*").eq("id", input.id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function adminUpsertRule({ data: input }: { data: unknown }) {
  const data = ruleSchema.parse(input);
  const payload = {
    slug: data.slug,
    title: data.title,
    body: data.body ?? "",
    excerpt: data.excerpt || null,
    cover_url: data.cover_url || null,
    sort_order: data.sort_order,
  };
  if (data.id) {
    const { error } = await supabase.from("rules_sections").update(payload).eq("id", data.id);
    if (error) throw error;
    return { id: data.id };
  }
  const { data: row, error } = await supabase.from("rules_sections").insert(payload).select("id").single();
  if (error) throw error;
  return { id: row.id };
}

export async function adminDeleteRule({ data: input }: Id) {
  const { error } = await supabase.from("rules_sections").delete().eq("id", input.id);
  if (error) throw error;
  return { ok: true };
}

// ---------- Dictionary ----------
const dictMediaSchema = z.object({
  kind: z.enum(["image", "video", "embed"]),
  url: z.string().trim().min(1).max(2000),
  poster_url: z.string().trim().max(2000).optional().nullable(),
  caption: z.string().trim().max(300).optional().nullable(),
});

const dictSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(120),
  term: z.string().trim().min(1).max(200),
  description: z.string().max(20000).default(""),
  image_url: z.string().trim().max(2000).optional().nullable(),
  image_caption: z.string().trim().max(300).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(60)).default([]),
  media: z.array(dictMediaSchema).max(60).default([]),
});

export async function adminListDictionary() {
  const { data, error } = await supabase.from("dictionary_entries").select("*").order("term");
  if (error) throw error;
  return data ?? [];
}

export async function adminGetDictionary({ data: input }: Id) {
  const { data: row, error } = await supabase
    .from("dictionary_entries")
    .select("*")
    .eq("id", input.id)
    .maybeSingle();
  if (error) throw error;
  if (!row) return null;
  const { data: media, error: mErr } = await supabase
    .from("dictionary_media")
    .select("id,kind,url,poster_url,caption,sort_order")
    .eq("entry_id", input.id)
    .order("sort_order");
  if (mErr) throw mErr;
  return { ...row, media: media ?? [] };
}

export async function adminUpsertDictionary({ data: input }: { data: unknown }) {
  const data = dictSchema.parse(input);
  const payload = {
    slug: data.slug,
    term: data.term,
    description: data.description ?? "",
    image_url: data.image_url ?? null,
    image_caption: data.image_caption || null,
    tags: data.tags,
  };
  let entryId = data.id;
  if (entryId) {
    const { error } = await supabase.from("dictionary_entries").update(payload).eq("id", entryId);
    if (error) throw error;
  } else {
    const { data: row, error } = await supabase.from("dictionary_entries").insert(payload).select("id").single();
    if (error) throw error;
    entryId = row.id;
  }

  const { error: delErr } = await supabase.from("dictionary_media").delete().eq("entry_id", entryId);
  if (delErr) throw delErr;
  if (data.media.length) {
    const rows = data.media.map((m, i) => ({
      entry_id: entryId as string,
      kind: m.kind,
      url: m.url,
      poster_url: m.poster_url || null,
      caption: m.caption || null,
      sort_order: i,
    }));
    const { error: insErr } = await supabase.from("dictionary_media").insert(rows);
    if (insErr) throw insErr;
  }
  return { id: entryId };
}

export async function adminDeleteDictionary({ data: input }: Id) {
  const { error } = await supabase.from("dictionary_entries").delete().eq("id", input.id);
  if (error) throw error;
  return { ok: true };
}

// ---------- Gallery ----------
const photoSchema = z.object({
  id: z.string().uuid().optional(),
  album_id: z.string().uuid().optional().nullable(),
  kind: z.enum(["image", "embed"]).default("image"),
  url: z.string().trim().min(1).max(2000),
  poster_url: z.string().trim().max(2000).optional().nullable(),
  caption: z.string().trim().max(300).optional().nullable(),
  sort_order: z.coerce.number().int().default(0),
});

export async function adminListPhotos() {
  const { data, error } = await supabase
    .from("gallery_photos")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminUpsertPhoto({ data: input }: { data: unknown }) {
  const data = photoSchema.parse(input);
  let url = data.url;
  if (data.kind === "embed") {
    const embed = toEmbedUrl(url);
    if (!embed) throw new Error("Enter a valid YouTube or Vimeo link");
    url = embed;
  }
  const payload = {
    album_id: data.album_id ?? null,
    kind: data.kind,
    url,
    poster_url: data.poster_url || null,
    caption: data.caption ?? null,
    sort_order: data.sort_order,
  };
  if (data.id) {
    const { error } = await supabase.from("gallery_photos").update(payload).eq("id", data.id);
    if (error) throw error;
    return { id: data.id };
  }
  const { data: row, error } = await supabase.from("gallery_photos").insert(payload).select("id").single();
  if (error) throw error;
  return { id: row.id };
}

export async function adminDeletePhoto({ data: input }: Id) {
  const { error } = await supabase.from("gallery_photos").delete().eq("id", input.id);
  if (error) throw error;
  return { ok: true };
}

// ---------- Certificates ----------
const certSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().trim().min(1).max(100),
  holder_name: z.string().trim().min(1).max(200),
  rank: z.string().trim().min(1).max(100),
  style_name: z.string().trim().max(200).optional().nullable(),
  country: z.string().trim().max(100).optional().nullable(),
  issued_on: z.string(),
  expires_on: z.string().optional().nullable(),
  status: z.enum(["active", "revoked", "expired"]).default("active"),
  notes: z.string().max(2000).optional().nullable(),
});

export async function adminListCerts() {
  const { data, error } = await supabase
    .from("certificates")
    .select("id,code,holder_name,rank,style_name,country,issued_on,expires_on,status,updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminGetCert({ data: input }: Id) {
  const { data, error } = await supabase.from("certificates").select("*").eq("id", input.id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function adminUpsertCert({ data: input }: { data: unknown }) {
  const data = certSchema.parse(input);
  const code = data.code.trim().toUpperCase();
  if (!/^[A-Z0-9-]{4,40}$/.test(code)) {
    throw new Error("Certificate code must be 4-40 characters using letters, numbers and hyphens.");
  }
  {
    const dupQuery = supabase.from("certificates").select("id").eq("code", code).limit(1);
    const { data: dup, error: dupErr } = data.id ? await dupQuery.neq("id", data.id) : await dupQuery;
    if (dupErr) throw dupErr;
    if (dup && dup.length > 0) throw new Error("This code is already used by another certificate.");
  }
  const payload = {
    code,
    holder_name: data.holder_name,
    rank: data.rank,
    style_name: data.style_name ?? null,
    country: data.country ?? null,
    issued_on: data.issued_on,
    expires_on: data.expires_on || null,
    status: data.status,
    notes: data.notes ?? null,
  };
  if (data.id) {
    const { error } = await supabase.from("certificates").update(payload).eq("id", data.id);
    if (error) throw error;
    return { id: data.id };
  }
  const { data: row, error } = await supabase.from("certificates").insert(payload).select("id").single();
  if (error) throw error;
  return { id: row.id };
}

export async function adminDeleteCert({ data: input }: Id) {
  const { error } = await supabase.from("certificates").delete().eq("id", input.id);
  if (error) throw error;
  return { ok: true };
}

// ---------- Submissions (read-only) ----------
export async function adminListMemberships() {
  const { data, error } = await supabase
    .from("membership_applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminListContact() {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ---------- Dashboard stats ----------
export async function adminDashboardStats() {
  const s = supabase;
  const [
    publishedNews,
    totalNews,
    styles,
    dictionary,
    certificates,
    pendingApps,
    totalApps,
    messages,
    recentApps,
    recentMessages,
  ] = await Promise.all([
    s.from("news_articles").select("id", { count: "exact", head: true }).eq("published", true),
    s.from("news_articles").select("id", { count: "exact", head: true }),
    s.from("styles").select("id", { count: "exact", head: true }),
    s.from("dictionary_entries").select("id", { count: "exact", head: true }),
    s.from("certificates").select("id", { count: "exact", head: true }),
    s.from("membership_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    s.from("membership_applications").select("id", { count: "exact", head: true }),
    s.from("contact_messages").select("id", { count: "exact", head: true }),
    s
      .from("membership_applications")
      .select("id,full_name,email,tier,status,created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    s
      .from("contact_messages")
      .select("id,name,email,subject,created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);
  return {
    counts: {
      publishedNews: publishedNews.count ?? 0,
      totalNews: totalNews.count ?? 0,
      styles: styles.count ?? 0,
      dictionary: dictionary.count ?? 0,
      certificates: certificates.count ?? 0,
      pendingApps: pendingApps.count ?? 0,
      totalApps: totalApps.count ?? 0,
      messages: messages.count ?? 0,
    },
    recentApps: recentApps.data ?? [],
    recentMessages: recentMessages.data ?? [],
  };
}

// ---------- Contact Info (singleton) ----------
const contactInfoSchema = z.object({
  site_title: z.string().trim().max(160).optional().nullable(),
  site_short_title: z.string().trim().max(80).optional().nullable(),
  tagline: z.string().trim().max(240).optional().nullable(),
  contact_intro: z.string().trim().max(600).optional().nullable(),
  office_hours: z.string().trim().max(200).optional().nullable(),
  map_embed_url: z.string().trim().max(2000).optional().nullable(),
  hq_address: z.string().trim().max(500).optional().nullable(),
  asia_office: z.string().trim().max(500).optional().nullable(),
  americas_office: z.string().trim().max(500).optional().nullable(),
  general_email: z.string().trim().max(320).optional().nullable(),
  media_email: z.string().trim().max(320).optional().nullable(),
  phone: z.string().trim().max(60).optional().nullable(),
  website: z.string().trim().max(300).optional().nullable(),
  facebook: z.string().trim().max(300).optional().nullable(),
  instagram: z.string().trim().max(300).optional().nullable(),
  youtube: z.string().trim().max(300).optional().nullable(),
  twitter: z.string().trim().max(300).optional().nullable(),
  logo_url: z.string().trim().max(2000).optional().nullable().transform((v) => (v ? v : null)),
  cert_code_prefix: z.string().trim().max(12).optional().nullable(),
  cert_code_include_year: z.boolean().optional(),
  cert_code_random_length: z.coerce.number().int().min(3).max(12).optional(),
});

export async function adminGetContactInfo() {
  const { data, error } = await supabase
    .from("site_contact_info")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function adminUpsertContactInfo({ data: input }: { data: unknown }) {
  const data = contactInfoSchema.parse(input);
  const payload = {
    site_title: data.site_title ?? null,
    site_short_title: data.site_short_title ?? null,
    tagline: data.tagline ?? null,
    contact_intro: data.contact_intro ?? null,
    office_hours: data.office_hours ?? null,
    map_embed_url: data.map_embed_url ?? null,
    hq_address: data.hq_address ?? null,
    asia_office: data.asia_office ?? null,
    americas_office: data.americas_office ?? null,
    general_email: data.general_email ?? null,
    media_email: data.media_email ?? null,
    phone: data.phone ?? null,
    website: data.website ?? null,
    facebook: data.facebook ?? null,
    instagram: data.instagram ?? null,
    youtube: data.youtube ?? null,
    twitter: data.twitter ?? null,
    logo_url: data.logo_url ?? null,
    cert_code_prefix: (data.cert_code_prefix ?? "TBM").toUpperCase() || "TBM",
    cert_code_include_year: data.cert_code_include_year ?? true,
    cert_code_random_length: data.cert_code_random_length ?? 6,
  };
  const { data: existing, error: readErr } = await supabase
    .from("site_contact_info")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (readErr) throw readErr;
  if (existing?.id) {
    const { error } = await supabase.from("site_contact_info").update(payload).eq("id", existing.id);
    if (error) throw error;
    return { id: existing.id };
  }
  const { data: row, error } = await supabase.from("site_contact_info").insert(payload).select("id").single();
  if (error) throw error;
  return { id: row.id };
}

// ---------- Page categories ----------
const categorySchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(200),
  sort_order: z.number().int().default(0),
  visible_in_nav: z.boolean().default(true),
});

export async function adminListCategories() {
  const { data, error } = await supabase
    .from("page_categories")
    .select("id,slug,name,sort_order,visible_in_nav,updated_at")
    .order("sort_order")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function adminGetCategory({ data: input }: Id) {
  const { data, error } = await supabase.from("page_categories").select("*").eq("id", input.id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function adminUpsertCategory({ data: input }: { data: unknown }) {
  const { id, ...rest } = categorySchema.parse(input);
  if (id) {
    const { error } = await supabase.from("page_categories").update(rest).eq("id", id);
    if (error) throw error;
    return { id };
  }
  const { data: row, error } = await supabase.from("page_categories").insert(rest).select("id").single();
  if (error) throw error;
  return { id: row.id };
}

export async function adminDeleteCategory({ data: input }: Id) {
  const { error } = await supabase.from("page_categories").delete().eq("id", input.id);
  if (error) throw error;
  return { ok: true };
}

// ---------- Pages ----------
const pageSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(300),
  category_id: z
    .string()
    .uuid()
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  excerpt: z.string().trim().max(500).optional().nullable(),
  body: z.string().max(200000).default(""),
  cover_url: z.string().trim().max(2000).optional().nullable().transform((v) => (v ? v : null)),
  seo_title: z.string().trim().max(300).optional().nullable().transform((v) => (v ? v : null)),
  seo_description: z.string().trim().max(500).optional().nullable().transform((v) => (v ? v : null)),
  published: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export async function adminListPages() {
  const [{ data, error }, { data: cats }] = await Promise.all([
    supabase
      .from("pages")
      .select("id,slug,title,category_id,published,sort_order,updated_at")
      .order("updated_at", { ascending: false }),
    supabase.from("page_categories").select("id,name"),
  ]);
  if (error) throw error;
  const rows = data ?? [];
  const map = new Map((cats ?? []).map((c) => [c.id, c.name]));
  return rows.map((p) => ({
    ...p,
    category_name: p.category_id ? (map.get(p.category_id) ?? null) : null,
  }));
}

export async function adminGetPage({ data: input }: Id) {
  const { data, error } = await supabase.from("pages").select("*").eq("id", input.id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function adminUpsertPage({ data: input }: { data: unknown }) {
  const { id, ...rest } = pageSchema.parse(input);
  const payload = { ...rest, published_at: rest.published ? new Date().toISOString() : null };
  if (id) {
    const { error } = await supabase.from("pages").update(payload).eq("id", id);
    if (error) throw error;
    return { id };
  }
  const { data: row, error } = await supabase.from("pages").insert(payload).select("id").single();
  if (error) throw error;
  return { id: row.id };
}

export async function adminDeletePage({ data: input }: Id) {
  const { error } = await supabase.from("pages").delete().eq("id", input.id);
  if (error) throw error;
  return { ok: true };
}

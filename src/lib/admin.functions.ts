import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureAdmin(context: any) {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error) throw error;
  if (!data) throw new Error("Forbidden: admin only");
}

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

export const adminListNews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase
      .from("news_articles")
      .select("id,slug,title,excerpt,published,published_at,updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const adminGetNews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { data: row, error } = await context.supabase.from("news_articles").select("*").eq("id", data.id).maybeSingle();
    if (error) throw error;
    return row;
  });

export const adminUpsertNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => newsSchema.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const payload = {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt ?? null,
      body: data.body ?? "",
      cover_url: data.cover_url ?? null,
      published: data.published,
      published_at: data.published ? data.published_at ?? new Date().toISOString() : null,
    };
    if (data.id) {
      const { error } = await context.supabase.from("news_articles").update(payload).eq("id", data.id);
      if (error) throw error;
      return { id: data.id };
    } else {
      const { data: row, error } = await context.supabase.from("news_articles").insert(payload).select("id").single();
      if (error) throw error;
      return { id: row.id };
    }
  });

export const adminDeleteNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("news_articles").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

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

export const adminListStyles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase.from("styles").select("*").order("sort_order").order("name");
    if (error) throw error;
    return data ?? [];
  });

export const adminGetStyle = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { data: row, error } = await context.supabase.from("styles").select("*").eq("id", data.id).maybeSingle();
    if (error) throw error;
    return row;
  });

export const adminUpsertStyle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => styleSchema.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const payload = {
      slug: data.slug,
      name: data.name,
      tagline: data.tagline ?? null,
      description: data.description ?? "",
      cover_url: data.cover_url ?? null,
      sort_order: data.sort_order,
    };
    if (data.id) {
      const { error } = await context.supabase.from("styles").update(payload).eq("id", data.id);
      if (error) throw error;
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase.from("styles").insert(payload).select("id").single();
    if (error) throw error;
    return { id: row.id };
  });

export const adminDeleteStyle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("styles").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ---------- Rules ----------
const ruleSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(200),
  body: z.string().max(50000).default(""),
  sort_order: z.coerce.number().int().default(0),
});

export const adminListRules = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase.from("rules_sections").select("*").order("sort_order").order("title");
    if (error) throw error;
    return data ?? [];
  });

export const adminGetRule = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { data: row, error } = await context.supabase.from("rules_sections").select("*").eq("id", data.id).maybeSingle();
    if (error) throw error;
    return row;
  });

export const adminUpsertRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ruleSchema.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const payload = { slug: data.slug, title: data.title, body: data.body ?? "", sort_order: data.sort_order };
    if (data.id) {
      const { error } = await context.supabase.from("rules_sections").update(payload).eq("id", data.id);
      if (error) throw error;
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase.from("rules_sections").insert(payload).select("id").single();
    if (error) throw error;
    return { id: row.id };
  });

export const adminDeleteRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("rules_sections").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ---------- Dictionary ----------
const dictSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(120),
  term: z.string().trim().min(1).max(200),
  description: z.string().max(20000).default(""),
  image_url: z.string().url().optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(60)).default([]),
});

export const adminListDictionary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase.from("dictionary_entries").select("*").order("term");
    if (error) throw error;
    return data ?? [];
  });

export const adminGetDictionary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { data: row, error } = await context.supabase.from("dictionary_entries").select("*").eq("id", data.id).maybeSingle();
    if (error) throw error;
    return row;
  });

export const adminUpsertDictionary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => dictSchema.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const payload = {
      slug: data.slug,
      term: data.term,
      description: data.description ?? "",
      image_url: data.image_url ?? null,
      tags: data.tags,
    };
    if (data.id) {
      const { error } = await context.supabase.from("dictionary_entries").update(payload).eq("id", data.id);
      if (error) throw error;
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase.from("dictionary_entries").insert(payload).select("id").single();
    if (error) throw error;
    return { id: row.id };
  });

export const adminDeleteDictionary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("dictionary_entries").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ---------- Gallery ----------
const photoSchema = z.object({
  id: z.string().uuid().optional(),
  album_id: z.string().uuid().optional().nullable(),
  url: z.string().url(),
  caption: z.string().trim().max(300).optional().nullable(),
  sort_order: z.coerce.number().int().default(0),
});

export const adminListPhotos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase.from("gallery_photos").select("*").order("sort_order").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const adminUpsertPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => photoSchema.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const payload = {
      album_id: data.album_id ?? null,
      url: data.url,
      caption: data.caption ?? null,
      sort_order: data.sort_order,
    };
    if (data.id) {
      const { error } = await context.supabase.from("gallery_photos").update(payload).eq("id", data.id);
      if (error) throw error;
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase.from("gallery_photos").insert(payload).select("id").single();
    if (error) throw error;
    return { id: row.id };
  });

export const adminDeletePhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("gallery_photos").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

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

export const adminListCerts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase
      .from("certificates")
      .select("id,code,holder_name,rank,style_name,country,issued_on,expires_on,status,updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const adminGetCert = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { data: row, error } = await context.supabase.from("certificates").select("*").eq("id", data.id).maybeSingle();
    if (error) throw error;
    return row;
  });

export const adminUpsertCert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => certSchema.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const payload = {
      code: data.code.toUpperCase(),
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
      const { error } = await context.supabase.from("certificates").update(payload).eq("id", data.id);
      if (error) throw error;
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase.from("certificates").insert(payload).select("id").single();
    if (error) throw error;
    return { id: row.id };
  });

export const adminDeleteCert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("certificates").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ---------- Submissions (read-only) ----------
export const adminListMemberships = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase
      .from("membership_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const adminListContact = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

// ---------- Dashboard stats ----------
export const adminDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const s = context.supabase;
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
      s.from("membership_applications").select("id,full_name,email,tier,status,created_at").order("created_at", { ascending: false }).limit(5),
      s.from("contact_messages").select("id,name,email,subject,created_at").order("created_at", { ascending: false }).limit(5),
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
  });

// ---------- Contact Info (singleton) ----------
const contactInfoSchema = z.object({
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
});

export const adminGetContactInfo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase
      .from("site_contact_info")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  });

export const adminUpsertContactInfo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => contactInfoSchema.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const payload = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v ? v : null]),
    );
    const { data: existing, error: readErr } = await context.supabase
      .from("site_contact_info")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (readErr) throw readErr;
    if (existing?.id) {
      const { error } = await context.supabase
        .from("site_contact_info")
        .update(payload)
        .eq("id", existing.id);
      if (error) throw error;
      return { id: existing.id };
    }
    const { data: row, error } = await context.supabase
      .from("site_contact_info")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw error;
    return { id: row.id };
  });


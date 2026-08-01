import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { toEmbedUrl } from "@/lib/embed";


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
    // Friendly message instead of a raw unique-constraint error.
    const dupe = await context.supabase.from("news_articles").select("id").eq("slug", data.slug).maybeSingle();
    if (dupe.data && dupe.data.id !== data.id) {
      throw new Error(`The slug "${data.slug}" is already used by another article. Choose a different slug.`);
    }
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
  excerpt: z.string().trim().max(500).optional().nullable(),
  cover_url: z.string().trim().max(2000).optional().nullable(),
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
    const payload = {
      slug: data.slug,
      title: data.title,
      body: data.body ?? "",
      excerpt: data.excerpt || null,
      cover_url: data.cover_url || null,
      sort_order: data.sort_order,
    };

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
  tags: z.array(z.string().trim().min(1).max(60)).default([]),
  media: z.array(dictMediaSchema).max(60).default([]),
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
    if (!row) return null;
    const { data: media, error: mErr } = await context.supabase
      .from("dictionary_media")
      .select("id,kind,url,poster_url,caption,sort_order")
      .eq("entry_id", data.id)
      .order("sort_order");
    if (mErr) throw mErr;
    return { ...row, media: media ?? [] };
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
    let entryId = data.id;
    if (entryId) {
      const { error } = await context.supabase.from("dictionary_entries").update(payload).eq("id", entryId);
      if (error) throw error;
    } else {
      const { data: row, error } = await context.supabase.from("dictionary_entries").insert(payload).select("id").single();
      if (error) throw error;
      entryId = row.id;
    }

    const { error: delErr } = await context.supabase.from("dictionary_media").delete().eq("entry_id", entryId);
    if (delErr) throw delErr;
    if (data.media.length) {
      const rows = data.media.map((m, i) => ({
        entry_id: entryId,
        kind: m.kind,
        url: m.url,
        poster_url: m.poster_url || null,
        caption: m.caption || null,
        sort_order: i,
      }));
      const { error: insErr } = await context.supabase.from("dictionary_media").insert(rows);
      if (insErr) throw insErr;
    }
    return { id: entryId };
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
  kind: z.enum(["image", "embed"]).default("image"),
  url: z.string().trim().min(1).max(2000),
  poster_url: z.string().trim().max(2000).optional().nullable(),
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
    const code = data.code.trim().toUpperCase();
    if (!/^[A-Z0-9-]{4,40}$/.test(code)) {
      throw new Error("Certificate code must be 4-40 characters using letters, numbers and hyphens.");
    }
    {
      const dupQuery = context.supabase.from("certificates").select("id").eq("code", code).limit(1);
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


// ---------- Page categories ----------
const categorySchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(200),
  name: z.string().trim().min(1).max(200),
  sort_order: z.number().int().default(0),
  visible_in_nav: z.boolean().default(true),
});

export const adminListCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase
      .from("page_categories")
      .select("id,slug,name,sort_order,visible_in_nav,updated_at")
      .order("sort_order")
      .order("name");
    if (error) throw error;
    return data ?? [];
  });

export const adminGetCategory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { data: row, error } = await context.supabase
      .from("page_categories")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    return row;
  });

export const adminUpsertCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => categorySchema.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { id, ...rest } = data;
    if (id) {
      const { error } = await context.supabase.from("page_categories").update(rest).eq("id", id);
      if (error) throw error;
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("page_categories")
      .insert(rest)
      .select("id")
      .single();
    if (error) throw error;
    return { id: row.id };
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("page_categories").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ---------- Pages ----------
const pageSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(300),
  category_id: z.string().uuid().optional().nullable().or(z.literal("")).transform((v) => (v ? v : null)),
  excerpt: z.string().trim().max(500).optional().nullable(),
  body: z.string().max(200000).default(""),
  cover_url: z.string().trim().max(2000).optional().nullable().transform((v) => (v ? v : null)),
  seo_title: z.string().trim().max(300).optional().nullable().transform((v) => (v ? v : null)),
  seo_description: z.string().trim().max(500).optional().nullable().transform((v) => (v ? v : null)),
  published: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const adminListPages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const [{ data, error }, { data: cats }] = await Promise.all([
      context.supabase
        .from("pages")
        .select("id,slug,title,category_id,published,sort_order,updated_at")
        .order("updated_at", { ascending: false }),
      context.supabase.from("page_categories").select("id,name"),
    ]);
    if (error) throw error;
    const rows = (data ?? []) as {
      id: string;
      slug: string;
      title: string;
      category_id: string | null;
      published: boolean;
      sort_order: number;
      updated_at: string;
    }[];
    const map = new Map(((cats ?? []) as { id: string; name: string }[]).map((c) => [c.id, c.name]));
    return rows.map((p) => ({
      ...p,
      category_name: p.category_id ? (map.get(p.category_id) ?? null) : null,
    }));
  });

export const adminGetPage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { data: row, error } = await context.supabase.from("pages").select("*").eq("id", data.id).maybeSingle();
    if (error) throw error;
    return row;
  });

export const adminUpsertPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => pageSchema.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { id, ...rest } = data;
    const payload = { ...rest, published_at: rest.published ? new Date().toISOString() : null };
    if (id) {
      const { error } = await context.supabase.from("pages").update(payload).eq("id", id);
      if (error) throw error;
      return { id };
    }
    const { data: row, error } = await context.supabase.from("pages").insert(payload).select("id").single();
    if (error) throw error;
    return { id: row.id };
  });

export const adminDeletePage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("pages").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

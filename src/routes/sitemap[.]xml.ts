import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createServerPublicClient } from "@/lib/supabase-public.server";

const BASE_URL = "https://tebma-hub.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const STATIC_ENTRIES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/news", changefreq: "weekly", priority: "0.9" },
  { path: "/styles", changefreq: "monthly", priority: "0.8" },
  { path: "/rules", changefreq: "monthly", priority: "0.7" },
  { path: "/dictionary", changefreq: "weekly", priority: "0.8" },
  { path: "/gallery", changefreq: "weekly", priority: "0.7" },
  { path: "/membership", changefreq: "monthly", priority: "0.7" },
  { path: "/verify", changefreq: "monthly", priority: "0.6" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
  { path: "/auth", changefreq: "yearly", priority: "0.1" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const s = createServerPublicClient();
        const [news, styles, dict, pages, cats] = await Promise.all([
          s.from("news_articles").select("slug").eq("published", true),
          s.from("styles").select("slug"),
          s.from("dictionary_entries").select("slug"),
          s.from("pages").select("slug").eq("published", true),
          s.from("page_categories").select("slug"),
        ]);

        const entries: SitemapEntry[] = [
          ...STATIC_ENTRIES,
          ...(news.data ?? []).map((r) => ({ path: `/news/${r.slug}`, changefreq: "weekly" as const, priority: "0.7" })),
          ...(styles.data ?? []).map((r) => ({ path: `/styles/${r.slug}`, changefreq: "monthly" as const, priority: "0.6" })),
          ...(dict.data ?? []).map((r) => ({ path: `/dictionary/${r.slug}`, changefreq: "monthly" as const, priority: "0.5" })),
          ...(cats.data ?? []).map((r) => ({ path: `/c/${r.slug}`, changefreq: "weekly" as const, priority: "0.6" })),
          ...(pages.data ?? []).map((r) => ({ path: `/p/${r.slug}`, changefreq: "monthly" as const, priority: "0.7" })),
        ];


        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});

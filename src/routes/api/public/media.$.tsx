import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const raw = (params as { _splat?: string })._splat ?? "";
        const path = raw.replace(/^\/+/, "");
        if (!path || path.includes("..")) return new Response("Not found", { status: 404 });

        const url = process.env.SUPABASE_URL!;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const admin = createClient<Database>(url, key, { auth: { persistSession: false } });

        // Video needs range requests for seeking — hand off to a signed URL.
        if (/\.(mp4|webm|mov|m4v|ogv)$/i.test(path)) {
          const { data: signed, error: sErr } = await admin.storage
            .from("media")
            .createSignedUrl(path, 60 * 60);
          if (sErr || !signed) return new Response("Not found", { status: 404 });
          return new Response(null, {
            status: 302,
            headers: { location: signed.signedUrl, "cache-control": "public, max-age=1800" },
          });
        }

        const { data, error } = await admin.storage.from("media").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        const contentType = data.type || "application/octet-stream";
        return new Response(data, {
          status: 200,
          headers: {
            "content-type": contentType,
            "cache-control": "public, max-age=31536000, immutable",
          },
        });


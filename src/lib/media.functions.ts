import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureAdmin(context: any) {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error) throw error;
  if (!data) throw new Error("Forbidden: admin only");
}

const uploadSchema = z.object({
  folder: z.string().regex(/^[a-z0-9-]+$/i).max(40),
  filename: z.string().max(200),
  contentType: z.string().max(100),
  base64: z.string().max(20_000_000), // ~15MB decoded
});

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

export const adminUploadMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => uploadSchema.parse(d))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context);
    if (!ALLOWED.has(data.contentType)) throw new Error("Unsupported file type");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    if (bytes.byteLength > 10 * 1024 * 1024) throw new Error("Max 10MB");
    const ext = (data.filename.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
    const key = `${data.folder}/${crypto.randomUUID()}.${ext || "bin"}`;
    const { error } = await supabaseAdmin.storage.from("media").upload(key, bytes, {
      contentType: data.contentType,
      upsert: false,
    });
    if (error) throw error;
    // Return proxy URL so it survives without signed-URL expiry.
    return { path: key, url: `/api/public/media/${key}` };
  });

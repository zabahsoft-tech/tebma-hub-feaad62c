import { supabase } from "@/integrations/supabase/client";

const PUBLIC_BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/media`;

const ALLOWED_IMAGE = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const ALLOWED_VIDEO = new Set(["video/mp4", "video/webm", "video/quicktime", "video/ogg"]);

function buildKey(folder: string, file: File) {
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "") || "misc";
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${safeFolder}/${crypto.randomUUID()}.${ext || "bin"}`;
}

async function upload(file: File, folder: string): Promise<string> {
  const key = buildKey(folder, file);
  const { error } = await supabase.storage.from("media").upload(key, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw error;
  return `${PUBLIC_BASE}/${key}`;
}

export async function uploadMediaFile(file: File, folder: string): Promise<string> {
  if (file.size > 10 * 1024 * 1024) throw new Error("Max 10MB per file");
  if (!ALLOWED_IMAGE.has(file.type)) throw new Error("Unsupported file type");
  return upload(file, folder);
}

/** Direct-to-storage upload for large files (video). */
export async function uploadLargeMediaFile(file: File, folder: string): Promise<string> {
  if (file.size > 100 * 1024 * 1024) throw new Error("Max 100MB per file");
  if (!ALLOWED_VIDEO.has(file.type) && !ALLOWED_IMAGE.has(file.type)) {
    throw new Error("Unsupported file type");
  }
  return upload(file, folder);
}

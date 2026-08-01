import { adminUploadMedia, adminCreateMediaUploadUrl } from "@/lib/media.functions";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function uploadMediaFile(file: File, folder: string): Promise<string> {
  if (file.size > 10 * 1024 * 1024) throw new Error("Max 10MB per file");
  const base64 = await fileToBase64(file);
  const res = await adminUploadMedia({
    data: { folder, filename: file.name, contentType: file.type, base64 },
  });
  return res.url;
}

/** Direct-to-storage upload via signed URL. Used for video files. */
export async function uploadLargeMediaFile(file: File, folder: string): Promise<string> {
  if (file.size > 100 * 1024 * 1024) throw new Error("Max 100MB per file");
  const res = await adminCreateMediaUploadUrl({
    data: { folder, filename: file.name, contentType: file.type },
  });
  const put = await fetch(res.signedUrl, {
    method: "PUT",
    headers: { "content-type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!put.ok) throw new Error(`Upload failed (${put.status})`);
  return res.url;
}

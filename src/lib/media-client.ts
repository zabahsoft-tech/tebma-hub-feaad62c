import { adminUploadMedia } from "@/lib/media.functions";

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

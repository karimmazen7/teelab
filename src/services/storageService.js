import { supabase } from "../lib/supabase";

export function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);base64/)?.[1] || "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mime });
}

export async function uploadPrivateFile(bucket, path, file, contentType) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    contentType,
    upsert: false,
  });

  if (error) throw error;
  return path;
}

export async function createSignedFileUrl(bucket, path, expiresIn = 300) {
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

export async function downloadPrivateFile(bucket, path, filename) {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) throw error;

  const url = URL.createObjectURL(data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

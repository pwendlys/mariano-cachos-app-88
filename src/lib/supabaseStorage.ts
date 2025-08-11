
import { supabase } from "@/integrations/supabase/client";

function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export async function uploadToBannerBucket(
  fileOrDataUrl: File | string,
  folder: "backgrounds" | "logos",
  idHint = "main-banner"
): Promise<{ path: string; publicUrl: string }> {
  const timestamp = Date.now();
  let file: File;

  if (typeof fileOrDataUrl === "string" && fileOrDataUrl.startsWith("data:")) {
    const ext = fileOrDataUrl.substring(5, fileOrDataUrl.indexOf(";")).split("/")[1] || "png";
    file = dataURLtoFile(fileOrDataUrl, `${idHint}-${timestamp}.${ext}`);
  } else if (fileOrDataUrl instanceof File) {
    const parts = fileOrDataUrl.name.split(".");
    const ext = parts.length > 1 ? parts.pop() : "png";
    file = new File([fileOrDataUrl], `${idHint}-${timestamp}.${ext}`, { type: fileOrDataUrl.type || "image/*" });
  } else {
    throw new Error("Invalid file provided for upload");
  }

  const path = `${folder}/${file.name}`;
  const { error } = await supabase.storage.from("banner").upload(path, file, { upsert: true });
  if (error) {
    console.error("Erro ao enviar arquivo para o bucket banner:", error);
    throw error;
  }

  const { data } = supabase.storage.from("banner").getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

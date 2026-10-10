import { supabase } from "../lib/supabase";

const BUCKET_PRODUCTS = "product-images";
const BUCKET_ASSETS = "store-assets";

export async function uploadProductImage(file) {
  return uploadFile(file, BUCKET_PRODUCTS, "products");
}

export async function uploadStoreAsset(file, folder = "hero") {
  return uploadFile(file, BUCKET_ASSETS, folder);
}

async function uploadFile(file, bucket, folder) {
  if (!file) throw new Error("File tidak ada");
  if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar");
  if (file.size > 5 * 1024 * 1024) throw new Error("Ukuran gambar maksimal 5 MB");

  const ext = file.name.split(".").pop().toLowerCase();
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const path = `${folder}/${timestamp}-${random}.${ext}`;

  const { error: uploadErr } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: "3600", upsert: false });
  if (uploadErr) throw uploadErr;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(publicUrl, bucket = BUCKET_PRODUCTS) {
  if (!publicUrl) return;
  try {
    const url = new URL(publicUrl);
    const parts = url.pathname.split(`/public/${bucket}/`);
    if (parts.length < 2) return;
    const path = parts[1];
    await supabase.storage.from(bucket).remove([path]);
  } catch (err) {
    console.warn("Delete file failed:", err.message);
  }
}

export async function deleteProductImage(publicUrl) {
  return deleteFile(publicUrl, BUCKET_PRODUCTS);
}

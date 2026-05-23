import { supabase } from "@/lib/supabase";
import { getCurrentAppUserId, isSupabaseConfigured } from "@/lib/db";

const BUCKET = "user-photos";
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export async function fetchPrimaryUserPhotoUrl(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  const appUserId = await getCurrentAppUserId();
  if (!appUserId) return null;

  const { data: photos } = await supabase
    .from("user_photo")
    .select("photofront_url, is_primary, created_at")
    .eq("id_user", appUserId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1);

  const url = photos?.[0]?.photofront_url as string | undefined;
  return url?.trim() || null;
}

export async function uploadPrimaryUserPhoto(file: File): Promise<string> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error("Solo JPG, PNG o WebP");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("La imagen no puede superar 5MB");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Debes iniciar sesión");

  const appUserId = await getCurrentAppUserId();
  if (!appUserId) throw new Error("Perfil no sincronizado. Cierra sesión y vuelve a entrar.");

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${user.id}/primary-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type,
  });

  if (uploadError) {
    throw new Error(
      uploadError.message.includes("Bucket not found")
        ? "Bucket user-photos no existe. Ejecuta la migración 20250520110000_user_photos_storage.sql"
        : uploadError.message,
    );
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = urlData.publicUrl;

  await supabase.from("user_photo").update({ is_primary: false }).eq("id_user", appUserId);

  const { error: insertError } = await supabase.from("user_photo").insert({
    id_user: appUserId,
    photofront_url: publicUrl,
    is_primary: true,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  return publicUrl;
}

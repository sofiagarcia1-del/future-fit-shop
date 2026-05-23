import { supabase } from "@/lib/supabase";
import type { StartTryOnRequest, StartTryOnResponse, TryOnResult, TryOnStatusResponse } from "@/types/try-on";

async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error("Debes iniciar sesión para usar Virtual Try-On");
  }
  return data.session.access_token;
}

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function startTryOnApi(payload: StartTryOnRequest): Promise<StartTryOnResponse> {
  const token = await getAccessToken();
  const res = await fetch("/api/try-on", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as StartTryOnResponse & { error?: string; code?: string };
  if (!res.ok) {
    throw new Error(data.error ?? "No se pudo iniciar el try-on");
  }
  return data;
}

export async function pollTryOnStatusApi(tryOnId: number): Promise<TryOnStatusResponse> {
  const token = await getAccessToken();
  const res = await fetch(`/api/try-on/${tryOnId}`, {
    method: "GET",
    headers: authHeaders(token),
  });

  const data = (await res.json()) as TryOnStatusResponse & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? "No se pudo consultar el estado");
  }
  return data;
}

export async function saveTryOnResultApi(tryOnId: number): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch(`/api/try-on/${tryOnId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ saved: true }),
  });

  if (!res.ok) {
    const data = (await res.json()) as { error?: string };
    throw new Error(data.error ?? "No se pudo guardar el resultado");
  }
}

export async function fetchUserTryOnHistory(): Promise<TryOnResult[]> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return [];

  const { data: rows, error } = await supabase
    .from("try_on_result")
    .select(
      "id, id_user, id_product, original_user_image, garment_image, generated_image, error_message, saved, created_at, status:id_status ( name )",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[Tryfit] try-on history:", error.message);
    return [];
  }

  if (!rows?.length) return [];

  const productIds = [...new Set(rows.map((r) => r.id_product as number))];
  const { data: products } = await supabase.from("product_catalog").select("id, name, brand, image_url").in("id", productIds);
  const productById = new Map((products ?? []).map((p) => [p.id as number, p]));

  return rows.map((row) => {
    const statusName = (row.status as { name: string } | null)?.name ?? "processing";
    const product = productById.get(row.id_product as number);
    return {
      id: row.id as number,
      userId: row.id_user as number,
      productId: row.id_product as number,
      productName: product?.name as string | undefined,
      productBrand: product?.brand as string | undefined,
      productImage: product?.image_url as string | undefined,
      originalUserImage: row.original_user_image as string | null,
      garmentImage: row.garment_image as string,
      generatedImage: row.generated_image as string | null,
      status: statusName === "completed" ? "completed" : statusName === "failed" || statusName === "cancelled" ? "failed" : "processing",
      errorMessage: row.error_message as string | null,
      saved: Boolean(row.saved),
      createdAt: (row.created_at as string).slice(0, 10),
    };
  });
}

/** Load remote profile photo as data URL for upload fallback. */
export async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("No se pudo cargar la foto del perfil");
  const blob = await res.blob();
  if (!["image/jpeg", "image/png", "image/webp"].includes(blob.type)) {
    throw new Error("La foto del perfil debe ser JPG, PNG o WebP");
  }
  if (blob.size > 5 * 1024 * 1024) {
    throw new Error("La foto del perfil supera 5MB");
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Error leyendo la imagen"));
    reader.readAsDataURL(blob);
  });
}

export { fetchPrimaryUserPhotoUrl } from "@/services/user-photo.service";

/** Poll client-side until completed, failed, or max attempts. */
export async function waitForTryOnCompletion(
  tryOnId: number,
  options?: { maxAttempts?: number; intervalMs?: number },
): Promise<TryOnStatusResponse> {
  const maxAttempts = options?.maxAttempts ?? 40;
  const intervalMs = options?.intervalMs ?? 3000;

  for (let i = 0; i < maxAttempts; i++) {
    const status = await pollTryOnStatusApi(tryOnId);
    if (status.status === "completed" || status.status === "failed") {
      return status;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  return {
    tryOnId,
    status: "processing",
    generatedImage: null,
    errorMessage: "La generación está tardando más de lo esperado. Revisa Mis Try-On en unos minutos.",
  };
}

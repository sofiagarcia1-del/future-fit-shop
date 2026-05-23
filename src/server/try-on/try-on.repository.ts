import type { SupabaseClient } from "@supabase/supabase-js";
import type { TryOnRecordStatus } from "@/types/try-on";
import { mapDbErrorMessage, TryOnDbError } from "@/server/try-on/try-on.errors";

const STATUS_NAMES: Record<TryOnRecordStatus, string> = {
  processing: "processing",
  completed: "completed",
  failed: "failed",
};

type DbTryOnRow = {
  id: number;
  id_user: number;
  id_product: number;
  original_user_image: string | null;
  garment_image: string;
  generated_image: string | null;
  fashn_prediction_id: string | null;
  id_status: number;
  error_message: string | null;
  saved: boolean;
  created_at: string;
  status?: { name: string } | null;
};

export async function resolveStatusId(
  supabase: SupabaseClient,
  status: TryOnRecordStatus,
): Promise<number> {
  const name = STATUS_NAMES[status];
  const { data, error } = await supabase.from("status").select("id").eq("name", name).maybeSingle();
  if (error || !data) {
    throw new TryOnDbError(
      `Estado "${name}" no encontrado. Ejecuta las migraciones de Supabase (20250519100001 y 20250520100000).`,
      503,
      "MIGRATION",
    );
  }
  return data.id as number;
}

export async function getAppUserId(supabase: SupabaseClient, authUserId: string): Promise<number> {
  const { data, error } = await supabase.from("users").select("id").eq("auth_user_id", authUserId).maybeSingle();
  if (error || !data) {
    throw new TryOnDbError(
      "Perfil de usuario no sincronizado. Cierra sesión, vuelve a entrar con Google o recarga la página.",
      409,
      "USER_SYNC",
    );
  }
  return data.id as number;
}

export async function insertTryOnResult(
  supabase: SupabaseClient,
  row: {
    appUserId: number;
    productId: number;
    originalUserImage: string;
    garmentImage: string;
    predictionId: string | null;
    status: TryOnRecordStatus;
    generatedImage?: string | null;
    errorMessage?: string | null;
  },
): Promise<number> {
  const statusId = await resolveStatusId(supabase, row.status);

  const { data, error } = await supabase
    .from("try_on_result")
    .insert({
      id_user: row.appUserId,
      id_product: row.productId,
      original_user_image: row.originalUserImage,
      garment_image: row.garmentImage,
      generated_image: row.generatedImage ?? null,
      fashn_prediction_id: row.predictionId,
      id_status: statusId,
      error_message: row.errorMessage ?? null,
      saved: row.status === "completed",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw mapDbErrorMessage(error?.message ?? "No se pudo guardar el resultado de try-on");
  }

  return data.id as number;
}

export async function updateTryOnResult(
  supabase: SupabaseClient,
  tryOnId: number,
  appUserId: number,
  patch: {
    status: TryOnRecordStatus;
    generatedImage?: string | null;
    errorMessage?: string | null;
    predictionId?: string | null;
  },
): Promise<void> {
  const statusId = await resolveStatusId(supabase, patch.status);

  const { error } = await supabase
    .from("try_on_result")
    .update({
      id_status: statusId,
      generated_image: patch.generatedImage ?? null,
      error_message: patch.errorMessage ?? null,
      fashn_prediction_id: patch.predictionId,
      saved: patch.status === "completed",
    })
    .eq("id", tryOnId)
    .eq("id_user", appUserId);

  if (error) {
    throw mapDbErrorMessage(error.message);
  }
}

export async function fetchTryOnById(
  supabase: SupabaseClient,
  tryOnId: number,
  appUserId: number,
): Promise<DbTryOnRow | null> {
  const { data, error } = await supabase
    .from("try_on_result")
    .select("*, status:id_status ( name )")
    .eq("id", tryOnId)
    .eq("id_user", appUserId)
    .maybeSingle();

  if (error) {
    throw mapDbErrorMessage(error.message);
  }

  return (data as DbTryOnRow | null) ?? null;
}

export async function markTryOnSaved(
  supabase: SupabaseClient,
  tryOnId: number,
  appUserId: number,
): Promise<void> {
  const { error } = await supabase
    .from("try_on_result")
    .update({ saved: true })
    .eq("id", tryOnId)
    .eq("id_user", appUserId);

  if (error) {
    throw mapDbErrorMessage(error.message);
  }
}

export function mapDbStatus(name: string | undefined): TryOnRecordStatus {
  if (name === "completed") return "completed";
  if (name === "failed" || name === "cancelled") return "failed";
  return "processing";
}

export type { DbTryOnRow };

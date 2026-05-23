import { FashnApiError, pollPrediction, startTryOnPrediction } from "@/server/fashn/fashn-api";

/** Poll breve en POST; el cliente continúa si sigue en processing (evita timeout en edge). */
const START_POLL_MS = 25_000;
import { createUserSupabase } from "@/server/auth/request-auth";
import {
  fetchTryOnById,
  getAppUserId,
  insertTryOnResult,
  mapDbStatus,
  updateTryOnResult,
} from "@/server/try-on/try-on.repository";
import {
  persistOriginalUserImageRef,
  startTryOnBodySchema,
  toFashnImageRef,
  validateGarmentImageUrl,
  validateUserImageUrl,
  ValidationError,
} from "@/server/try-on/try-on.validation";
import type { StartTryOnResponse, TryOnStatusResponse } from "@/types/try-on";
import { isFashnConfigured } from "@/server/env";
import { TryOnDbError } from "@/server/try-on/try-on.errors";

const STATUS_POLL_MS = 90_000;

async function ensureAppUserId(
  supabase: ReturnType<typeof createUserSupabase>,
  authUserId: string,
  email?: string,
  meta?: Record<string, unknown>,
): Promise<number> {
  try {
    return await getAppUserId(supabase, authUserId);
  } catch (err) {
    if (!(err instanceof TryOnDbError) || err.code !== "USER_SYNC") {
      throw err;
    }
  }

  const { error: rpcError } = await supabase.rpc("handle_new_auth_user_manual", {
    p_auth_id: authUserId,
    p_email: email ?? "",
    p_meta: (meta ?? {}) as Record<string, never>,
  });

  if (rpcError) {
    throw new TryOnDbError(
      `No se pudo sincronizar tu perfil: ${rpcError.message}`,
      409,
      "USER_SYNC",
    );
  }

  return getAppUserId(supabase, authUserId);
}

export async function resolveGarmentImage(
  supabase: ReturnType<typeof createUserSupabase>,
  productId: string,
): Promise<string> {
  const numericId = Number(productId);
  if (Number.isNaN(numericId)) {
    throw new ValidationError("ID de producto inválido");
  }

  const { data, error } = await supabase
    .from("product_catalog")
    .select("image_url")
    .eq("id", numericId)
    .maybeSingle();

  if (error || !data?.image_url) {
    throw new ValidationError("No se encontró imagen del producto");
  }

  return validateGarmentImageUrl(data.image_url as string);
}

export async function startTryOnFlow(
  accessToken: string,
  body: unknown,
): Promise<StartTryOnResponse> {
  if (!isFashnConfigured()) {
    throw new FashnApiError("FASHN_API_KEY no configurada en el servidor", "CONFIG", 503);
  }

  const parsed = startTryOnBodySchema.parse(body);
  const modelImage = parsed.userImage
    ? toFashnImageRef(parsed.userImage)
    : validateUserImageUrl(parsed.userImageUrl!);

  const supabase = createUserSupabase(accessToken);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new ValidationError("Sesión inválida");
  }

  const appUserId = await ensureAppUserId(supabase, user.id, user.email, user.user_metadata);
  const garmentImage = await resolveGarmentImage(supabase, parsed.productId);
  const productId = Number(parsed.productId);

  const predictionId = await startTryOnPrediction({
    product_image: garmentImage,
    model_image: modelImage,
  });

  const tryOnId = await insertTryOnResult(supabase, {
    appUserId,
    productId,
    originalUserImage: persistOriginalUserImageRef(parsed),
    garmentImage,
    predictionId,
    status: "processing",
  });

  console.info("[Tryfit] try-on started", {
    tryOnId,
    productId,
    userId: appUserId,
    predictionId,
  });

  const poll = await pollPrediction(predictionId, START_POLL_MS);

  if (poll.status === "completed") {
    await updateTryOnResult(supabase, tryOnId, appUserId, {
      status: "completed",
      generatedImage: poll.outputUrl,
      predictionId,
    });
    console.info("[Tryfit] try-on completed", { tryOnId, predictionId });
    return {
      tryOnId,
      status: "completed",
      generatedImage: poll.outputUrl,
    };
  }

  if (poll.status === "failed") {
    await updateTryOnResult(supabase, tryOnId, appUserId, {
      status: "failed",
      errorMessage: poll.message,
      predictionId,
    });
    return { tryOnId, status: "failed", errorMessage: poll.message };
  }

  return { tryOnId, status: "processing" };
}

export async function getTryOnStatusFlow(
  accessToken: string,
  tryOnId: number,
): Promise<TryOnStatusResponse> {
  const supabase = createUserSupabase(accessToken);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new ValidationError("Sesión inválida");
  }

  const appUserId = await ensureAppUserId(supabase, user.id, user.email, user.user_metadata);
  const row = await fetchTryOnById(supabase, tryOnId, appUserId);

  if (!row) {
    throw new ValidationError("Try-on no encontrado");
  }

  const status = mapDbStatus((row.status as { name: string } | null)?.name);

  if (status === "completed" || status === "failed") {
    return {
      tryOnId,
      status,
      generatedImage: row.generated_image,
      errorMessage: row.error_message,
    };
  }

  if (!row.fashn_prediction_id || !isFashnConfigured()) {
    return {
      tryOnId,
      status: "processing",
      generatedImage: null,
      errorMessage: row.error_message,
    };
  }

  const poll = await pollPrediction(row.fashn_prediction_id, STATUS_POLL_MS);

  if (poll.status === "completed") {
    await updateTryOnResult(supabase, tryOnId, appUserId, {
      status: "completed",
      generatedImage: poll.outputUrl,
      predictionId: row.fashn_prediction_id,
    });
    return {
      tryOnId,
      status: "completed",
      generatedImage: poll.outputUrl,
      errorMessage: null,
    };
  }

  if (poll.status === "failed") {
    await updateTryOnResult(supabase, tryOnId, appUserId, {
      status: "failed",
      errorMessage: poll.message,
      predictionId: row.fashn_prediction_id,
    });
    return {
      tryOnId,
      status: "failed",
      generatedImage: null,
      errorMessage: poll.message,
    };
  }

  return {
    tryOnId,
    status: "processing",
    generatedImage: null,
    errorMessage: null,
  };
}

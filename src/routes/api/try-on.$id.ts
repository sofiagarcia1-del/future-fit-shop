import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  AuthError,
  createUserSupabase,
  jsonError,
  requireRequestAuth,
} from "@/server/auth/request-auth";
import { FashnApiError } from "@/server/fashn/fashn-api";
import { getTryOnStatusFlow } from "@/server/try-on/try-on.service";
import { getAppUserId, markTryOnSaved } from "@/server/try-on/try-on.repository";
import { TryOnDbError } from "@/server/try-on/try-on.errors";
import { ValidationError } from "@/server/try-on/try-on.validation";

export const Route = createFileRoute("/api/try-on/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          const { accessToken } = await requireRequestAuth(request);
          const tryOnId = Number(params.id);
          if (Number.isNaN(tryOnId)) {
            return jsonError("ID inválido", 400, "VALIDATION");
          }
          const result = await getTryOnStatusFlow(accessToken, tryOnId);
          return Response.json(result);
        } catch (err) {
          return handleApiError(err);
        }
      },
      PATCH: async ({ request, params }) => {
        try {
          const { accessToken } = await requireRequestAuth(request);
          const tryOnId = Number(params.id);
          if (Number.isNaN(tryOnId)) {
            return jsonError("ID inválido", 400, "VALIDATION");
          }

          const body = (await request.json()) as { saved?: boolean };
          if (!body.saved) {
            return jsonError("Solo se admite saved: true", 400, "VALIDATION");
          }

          const supabase = createUserSupabase(accessToken);
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) {
            return jsonError("Sesión inválida", 401, "AUTH");
          }

          const appUserId = await getAppUserId(supabase, user.id);
          await markTryOnSaved(supabase, tryOnId, appUserId);
          return Response.json({ ok: true });
        } catch (err) {
          return handleApiError(err);
        }
      },
    },
  },
});

function handleApiError(err: unknown): Response {
  if (err instanceof AuthError) {
    return jsonError(err.message, err.status, "AUTH");
  }
  if (err instanceof ValidationError) {
    return jsonError(err.message, 400, "VALIDATION");
  }
  if (err instanceof TryOnDbError) {
    console.error("[Tryfit] try-on DB error:", err.message, err.code);
    return jsonError(err.message, err.status, err.code);
  }
  if (err instanceof FashnApiError) {
    console.error("[Tryfit] FASHN error:", err.message, err.code);
    return jsonError(err.message, err.statusCode ?? 502, err.code);
  }
  if (err instanceof z.ZodError) {
    return jsonError(err.errors[0]?.message ?? "Datos inválidos", 400, "VALIDATION");
  }
  if (err instanceof Error && err.message) {
    console.error("[Tryfit] try-on status API error:", err);
    return jsonError(err.message, 500, "INTERNAL");
  }
  console.error("[Tryfit] try-on status API error:", err);
  return jsonError("Error interno del servidor", 500, "INTERNAL");
}

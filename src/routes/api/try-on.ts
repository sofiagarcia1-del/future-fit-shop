import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AuthError, jsonError, requireRequestAuth } from "@/server/auth/request-auth";
import { isFashnConfigured, getSupabasePublicKey, getSupabaseUrl } from "@/server/env";
import { FashnApiError } from "@/server/fashn/fashn-api";
import { startTryOnFlow } from "@/server/try-on/try-on.service";
import { TryOnDbError } from "@/server/try-on/try-on.errors";
import { ValidationError } from "@/server/try-on/try-on.validation";

export const Route = createFileRoute("/api/try-on")({
  server: {
    handlers: {
      GET: async () => {
        const url = getSupabaseUrl();
        const key = getSupabasePublicKey();
        return Response.json({
          fashnConfigured: isFashnConfigured(),
          supabaseConfigured: Boolean(url && key),
        });
      },
      POST: async ({ request }) => {
        try {
          const { accessToken } = await requireRequestAuth(request);
          const body = await request.json();
          const result = await startTryOnFlow(accessToken, body);
          return Response.json(result);
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
    console.error("[Tryfit] try-on API error:", err);
    return jsonError(err.message, 500, "INTERNAL");
  }
  console.error("[Tryfit] try-on API error:", err);
  return jsonError("Error interno del servidor", 500, "INTERNAL");
}

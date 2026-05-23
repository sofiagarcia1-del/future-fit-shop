import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/server/env";

export type AuthenticatedRequestUser = {
  authUserId: string;
  email: string | undefined;
  accessToken: string;
};

export async function requireRequestAuth(request: Request): Promise<AuthenticatedRequestUser> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthError("Token de sesión requerido", 401);
  }

  const accessToken = authHeader.slice(7).trim();
  if (!accessToken) {
    throw new AuthError("Token de sesión inválido", 401);
  }

  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    throw new AuthError("Supabase no configurado en el servidor", 503);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    throw new AuthError("Sesión inválida o expirada", 401);
  }

  return { authUserId: user.id, email: user.email, accessToken };
}

export function createUserSupabase(accessToken: string) {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    throw new AuthError("Supabase no configurado en el servidor", 503);
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: number = 401,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export function jsonError(message: string, status: number, code?: string): Response {
  return Response.json({ error: message, code: code ?? "ERROR" }, { status });
}

/** Server-only environment (never prefix with VITE_). */

export function getFashnApiKey(): string | undefined {
  return process.env.FASHN_API_KEY?.trim() || undefined;
}

export function getFashnBaseUrl(): string {
  const base = process.env.FASHN_BASE_URL?.trim();
  return (base || "https://api.fashn.ai/v1").replace(/\/$/, "");
}

export function getSupabaseUrl(): string {
  return process.env.VITE_SUPABASE_URL?.trim() || process.env.SUPABASE_URL?.trim() || "";
}

/** Clave pública Supabase en el servidor (misma prioridad que el cliente). */
export function getSupabasePublicKey(): string {
  return (
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.VITE_SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    ""
  );
}

/** @deprecated Usar getSupabasePublicKey */
export function getSupabaseAnonKey(): string {
  return getSupabasePublicKey();
}

export function isFashnConfigured(): boolean {
  return Boolean(getFashnApiKey());
}

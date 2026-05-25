/** Server-only environment (Cloudflare Workers + Node/Vite dev SSR). */

function getBindings(): Record<string, string | undefined> {
  if (typeof process !== "undefined" && process.env) {
    return process.env as Record<string, string | undefined>;
  }

  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env as unknown as Record<string, string | undefined>;
  }

  return {};
}

function read(key: string): string | undefined {
  const raw = getBindings()[key];
  return typeof raw === "string" ? raw.trim() || undefined : undefined;
}

export function getFashnApiKey(): string | undefined {
  return read("FASHN_API_KEY");
}

export function getFashnBaseUrl(): string {
  return (read("FASHN_BASE_URL") || "https://api.fashn.ai/v1").replace(/\/$/, "");
}

export function getSupabaseUrl(): string {
  return read("VITE_SUPABASE_URL") || read("SUPABASE_URL") || "";
}

/** Clave pública Supabase en el servidor (misma prioridad que el cliente). */
export function getSupabasePublicKey(): string {
  return (
    read("VITE_SUPABASE_PUBLISHABLE_KEY") ||
    read("SUPABASE_PUBLISHABLE_KEY") ||
    read("VITE_SUPABASE_ANON_KEY") ||
    read("SUPABASE_ANON_KEY") ||
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

export function isSupabaseServerConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabasePublicKey());
}

export type TryOnEnvStatus = {
  fashnConfigured: boolean;
  supabaseConfigured: boolean;
  missing: string[];
};

/** Diagnóstico sin exponer valores secretos. */
export function getTryOnEnvStatus(): TryOnEnvStatus {
  const missing: string[] = [];
  if (!getFashnApiKey()) missing.push("FASHN_API_KEY");
  if (!getSupabaseUrl()) missing.push("VITE_SUPABASE_URL (o SUPABASE_URL)");
  if (!getSupabasePublicKey()) {
    missing.push("VITE_SUPABASE_PUBLISHABLE_KEY (o SUPABASE_PUBLISHABLE_KEY)");
  }
  return {
    fashnConfigured: Boolean(getFashnApiKey()),
    supabaseConfigured: isSupabaseServerConfigured(),
    missing,
  };
}

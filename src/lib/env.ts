/**
 * Variables de entorno del cliente (Vite: import.meta.env + prefijo VITE_).
 * Clave pública Supabase: preferir VITE_SUPABASE_PUBLISHABLE_KEY; fallback a VITE_SUPABASE_ANON_KEY.
 */

const PLACEHOLDER_URL = "your-project";
const PLACEHOLDER_KEYS = new Set(["your-anon-key", "your-publishable-key"]);

export function getSupabaseUrl(): string {
  return import.meta.env.VITE_SUPABASE_URL?.trim() ?? "";
}

/** Clave pública para createClient (publishable o anon legacy). */
export function getSupabasePublicKey(): string {
  const publishable = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (publishable) return publishable;
  return import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? "";
}

function isValidSupabaseKey(key: string): boolean {
  if (!key) return false;
  if (PLACEHOLDER_KEYS.has(key)) return false;
  return true;
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabasePublicKey();
  return Boolean(url && key && !url.includes(PLACEHOLDER_URL) && isValidSupabaseKey(key));
}

export function getAppUrlFromEnv(): string | undefined {
  const url = import.meta.env.VITE_APP_URL?.trim();
  return url || undefined;
}

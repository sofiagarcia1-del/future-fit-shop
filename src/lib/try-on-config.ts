import { isSupabaseConfigured } from "@/lib/env";

export type TryOnServerConfig = {
  fashnConfigured: boolean;
  supabaseConfigured: boolean;
};

let cachedConfig: TryOnServerConfig | null = null;

/** Consulta el servidor (sin exponer la API key). */
export async function fetchTryOnServerConfig(): Promise<TryOnServerConfig> {
  if (!isSupabaseConfigured()) {
    return { fashnConfigured: false, supabaseConfigured: false };
  }
  if (cachedConfig) return cachedConfig;

  try {
    const res = await fetch("/api/try-on", { method: "GET" });
    if (!res.ok) {
      return { fashnConfigured: false, supabaseConfigured: true };
    }
    const data = (await res.json()) as TryOnServerConfig;
    cachedConfig = data;
    return data;
  } catch {
    return { fashnConfigured: false, supabaseConfigured: isSupabaseConfigured() };
  }
}

/** Cliente: try-on real requiere Supabase + FASHN_API_KEY en el servidor. */
export function isFashnConfigured(): boolean {
  return cachedConfig?.fashnConfigured === true;
}

export function clearTryOnConfigCache(): void {
  cachedConfig = null;
}

import { isSupabaseConfigured } from "@/lib/env";

export type TryOnServerConfig = {
  fashnConfigured: boolean;
  supabaseConfigured: boolean;
  missing?: string[];
};

let cachedConfig: TryOnServerConfig | null = null;

/** Consulta el servidor (sin exponer la API key). */
export async function fetchTryOnServerConfig(): Promise<TryOnServerConfig> {
  if (!isSupabaseConfigured()) {
    return {
      fashnConfigured: false,
      supabaseConfigured: false,
      missing: ["VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en el build del cliente"],
    };
  }

  try {
    const res = await fetch("/api/try-on", { method: "GET", cache: "no-store" });
    if (!res.ok) {
      return {
        fashnConfigured: false,
        supabaseConfigured: false,
        missing: ["No se pudo consultar /api/try-on en el servidor"],
      };
    }
    const data = (await res.json()) as TryOnServerConfig;
    cachedConfig = data;
    return data;
  } catch {
    return {
      fashnConfigured: false,
      supabaseConfigured: false,
      missing: ["Error de red al consultar configuración del servidor"],
    };
  }
}

export function formatTryOnConfigHint(config: TryOnServerConfig): string {
  if (config.fashnConfigured && config.supabaseConfigured) return "";
  const parts = config.missing?.length
    ? config.missing.join(", ")
    : [
        !config.fashnConfigured && "FASHN_API_KEY en Cloudflare Worker",
        !config.supabaseConfigured && "VITE_SUPABASE_* en Cloudflare Worker",
      ]
        .filter(Boolean)
        .join(", ");
  return `Falta en el servidor (Cloudflare → Settings → Variables): ${parts}`;
}

/** Cliente: try-on real requiere Supabase + FASHN_API_KEY en el servidor. */
export function isFashnConfigured(): boolean {
  return cachedConfig?.fashnConfigured === true;
}

export function clearTryOnConfigCache(): void {
  cachedConfig = null;
}

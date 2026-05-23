import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/env";

const supabaseUrl = getSupabaseUrl();
const supabasePublicKey = getSupabasePublicKey();

if (import.meta.env.DEV && !isSupabaseConfigured()) {
  console.warn(
    "[Tryfit] Faltan VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY (o VITE_SUPABASE_ANON_KEY). Copia .env.example a .env.",
  );
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabasePublicKey || "placeholder",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

import { supabase } from "@/lib/supabase";

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL ?? "";
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";
  return Boolean(url && key && !url.includes("your-project") && key !== "your-anon-key");
}

/** ID de fila en public.users para el usuario autenticado */
export async function getCurrentAppUserId(): Promise<number | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data.id as number;
}

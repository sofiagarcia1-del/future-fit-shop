import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/env";

export { isSupabaseConfigured };

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

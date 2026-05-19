import { supabase } from "@/lib/supabase";
import { getCurrentAppUserId, isSupabaseConfigured } from "@/lib/db";
import type { DbUser, UserProfileUpdate } from "@/types/database";

export async function fetchCurrentUserProfile(): Promise<DbUser | null> {
  if (!isSupabaseConfigured()) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from("users").select("*").eq("auth_user_id", user.id).maybeSingle();

  if (error || !data) return null;
  return data as DbUser;
}

export async function updateCurrentUserProfile(patch: UserProfileUpdate): Promise<DbUser | null> {
  if (!isSupabaseConfigured()) return null;

  const appUserId = await getCurrentAppUserId();
  if (!appUserId) return null;

  const { data, error } = await supabase
    .from("users")
    .update(patch)
    .eq("id", appUserId)
    .select("*")
    .single();

  if (error) {
    console.warn("[Tryfit] update profile:", error.message);
    return null;
  }

  return data as DbUser;
}

export async function ensureUserSynced(): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data } = await supabase.from("users").select("id").eq("auth_user_id", user.id).maybeSingle();

  if (!data) {
    await supabase.rpc("handle_new_auth_user_manual", {
      p_auth_id: user.id,
      p_email: user.email ?? "",
      p_meta: user.user_metadata ?? {},
    });
  }
}

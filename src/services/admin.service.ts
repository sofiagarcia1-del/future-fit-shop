import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/db";

export type AdminStats = {
  products: number;
  orders: number;
  users: number;
};

export async function checkIsAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const { data, error } = await supabase.rpc("is_admin");
  if (error) {
    console.warn("[Tryfit] is_admin:", error.message);
    return false;
  }
  return Boolean(data);
}

export async function fetchAdminStats(productCount: number): Promise<AdminStats> {
  if (!isSupabaseConfigured()) {
    return { products: productCount, orders: 0, users: 0 };
  }

  const [ordersRes, usersRes] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }),
  ]);

  if (ordersRes.error) console.warn("[Tryfit] admin orders count:", ordersRes.error.message);
  if (usersRes.error) console.warn("[Tryfit] admin users count:", usersRes.error.message);

  return {
    products: productCount,
    orders: ordersRes.count ?? 0,
    users: usersRes.count ?? 0,
  };
}

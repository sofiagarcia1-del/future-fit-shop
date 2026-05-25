import { supabase } from "@/lib/supabase";
import { getCurrentAppUserId, isSupabaseConfigured } from "@/lib/db";
import type { AppNotification } from "@/services/types";

const TYPE_MAP: Record<string, AppNotification["type"]> = {
  order_update: "order_update",
  promotion: "promotion",
  system: "system",
};

export async function fetchUserNotifications(): Promise<AppNotification[]> {
  if (!isSupabaseConfigured()) return getDemoNotifications();

  const appUserId = await getCurrentAppUserId();
  if (!appUserId) return [];

  const { data, error } = await supabase
    .from("notification")
    .select(
      "id, message, sent_at, notification_type:id_notification_type ( name ), status:id_status ( name )",
    )
    .eq("id_user", appUserId)
    .order("sent_at", { ascending: false })
    .limit(20);

  if (error) {
    console.warn("[Tryfit] notifications:", error.message);
    return getDemoNotifications();
  }

  return (data ?? []).map((row) => {
    const typeName = (row.notification_type as { name: string } | null)?.name ?? "system";
    const statusName = (row.status as { name: string } | null)?.name ?? "active";
    return {
      id: String(row.id),
      message: row.message as string,
      type: TYPE_MAP[typeName] ?? "system",
      sentAt: (row.sent_at as string).slice(0, 10),
      read: statusName !== "pending",
    };
  });
}

function getDemoNotifications(): AppNotification[] {
  return [
    {
      id: "demo-1",
      message: "Tu pedido está en preparación. Te avisaremos cuando salga del almacén.",
      type: "order_update",
      sentAt: new Date().toISOString().slice(0, 10),
      read: false,
    },
    {
      id: "demo-2",
      message: "Envío gratis en pedidos desde $200 — válido esta semana.",
      type: "promotion",
      sentAt: new Date().toISOString().slice(0, 10),
      read: true,
    },
  ];
}

export async function createOrderNotification(orderId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const appUserId = await getCurrentAppUserId();
  if (!appUserId) return;

  const { data: typeRow } = await supabase
    .from("notification_type")
    .select("id")
    .eq("name", "order_update")
    .maybeSingle();

  const { data: statusRow } = await supabase
    .from("status")
    .select("id")
    .eq("name", "pending")
    .maybeSingle();

  if (!typeRow?.id || !statusRow?.id) return;

  await supabase.from("notification").insert({
    id_user: appUserId,
    id_notification_type: typeRow.id,
    id_status: statusRow.id,
    message: `Pedido ${orderId} registrado correctamente. Te notificaremos cuando se envíe.`,
  });
}

import { supabase } from "@/lib/supabase";
import { getCurrentAppUserId, isSupabaseConfigured } from "@/lib/db";
import type { Product } from "@/lib/products";
import type { Order, OrderStatus } from "@/lib/orders";
import type { DbProductCatalogRow } from "@/types/database";

const STATUS_MAP: Record<string, OrderStatus> = {
  pending: "processing",
  processing: "processing",
  shipped: "shipped",
  delivered: "delivered",
  cancelled: "cancelled",
};

function mapStatus(name: string): OrderStatus {
  return STATUS_MAP[name] ?? "processing";
}

function mapCatalogToProduct(row: DbProductCatalogRow): Product {
  return {
    id: String(row.id),
    name: row.name,
    price: Number(row.unit_price),
    category: row.category,
    brand: row.brand,
    image: row.image_url,
    description: row.description ?? "",
  };
}

export async function fetchOrdersFromDb(): Promise<Order[] | null> {
  if (!isSupabaseConfigured()) return null;

  const appUserId = await getCurrentAppUserId();
  if (!appUserId) return [];

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, total_amount, created_at, status:id_status ( name )")
    .eq("id_user", appUserId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[Tryfit] orders:", error.message);
    return null;
  }

  if (!orders?.length) return [];

  const result: Order[] = [];

  for (const order of orders) {
    const { data: lines } = await supabase
      .from("product_x_order")
      .select("quantity, unit_price, id_product")
      .eq("id_order", order.id);

    const productIds = (lines ?? []).map((l) => l.id_product as number);
    let catalog: DbProductCatalogRow[] = [];

    if (productIds.length > 0) {
      const { data: products } = await supabase.from("product_catalog").select("*").in("id", productIds);
      catalog = (products ?? []) as DbProductCatalogRow[];
    }

    const catalogById = new Map(catalog.map((p) => [p.id, p]));

    result.push({
      id: `TF-${order.id}`,
      createdAt: (order.created_at as string).slice(0, 10),
      status: mapStatus((order.status as { name: string } | null)?.name ?? "pending"),
      total: Number(order.total_amount),
      items: (lines ?? []).map((line) => {
        const cat = catalogById.get(line.id_product as number);
        const product: Product = cat
          ? mapCatalogToProduct(cat)
          : {
              id: String(line.id_product),
              name: "Producto",
              price: Number(line.unit_price),
              category: "",
              brand: "",
              image: "",
              description: "",
            };
        return { product, qty: line.quantity as number };
      }),
    });
  }

  return result;
}

export type CreateOrderInput = {
  address: string;
  items: { productId: string; qty: number; unitPrice: number }[];
  paymentMethod?: string;
};

export async function createOrderInDb(input: CreateOrderInput): Promise<{ orderId: string } | null> {
  if (!isSupabaseConfigured()) return null;

  const appUserId = await getCurrentAppUserId();
  if (!appUserId) return null;

  const total = input.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);

  const { data: statusRow } = await supabase.from("status").select("id").eq("name", "pending").maybeSingle();
  const statusId = (statusRow?.id as number) ?? 3;

  let paymentMethodId: number | null = null;
  if (input.paymentMethod) {
    const { data: pm } = await supabase
      .from("payment_method")
      .select("id")
      .eq("name", input.paymentMethod)
      .maybeSingle();
    paymentMethodId = (pm?.id as number) ?? null;
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      id_user: appUserId,
      id_status: statusId,
      id_payment_method: paymentMethodId,
      total_amount: total,
      address: input.address.slice(0, 100),
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.warn("[Tryfit] create order:", orderError?.message);
    return null;
  }

  const lines = input.items.map((item) => ({
    id_order: order.id,
    id_product: Number(item.productId),
    quantity: item.qty,
    unit_price: item.unitPrice,
    subtotal: item.qty * item.unitPrice,
  }));

  const { error: linesError } = await supabase.from("product_x_order").insert(lines);

  if (linesError) {
    console.warn("[Tryfit] order lines:", linesError.message);
    return null;
  }

  return { orderId: `TF-${order.id}` };
}

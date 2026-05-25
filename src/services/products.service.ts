import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/db";
import type { Product } from "@/lib/products";
import { enrichProductAudience } from "@/lib/product-audience";
import type { DbProductCatalogRow } from "@/types/database";

function mapRow(row: DbProductCatalogRow): Product {
  return enrichProductAudience({
    id: String(row.id),
    name: row.name,
    price: Number(row.unit_price),
    category: row.category,
    brand: row.brand,
    image: row.image_url,
    description: row.description ?? "",
  });
}

export async function fetchProductsFromDb(): Promise<Product[] | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from("product_catalog")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[Tryfit] product_catalog:", error.message);
    return null;
  }

  return (data as DbProductCatalogRow[]).map(mapRow);
}

export async function fetchProductFromDb(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) return null;

  const numericId = Number(id);
  if (Number.isNaN(numericId)) return null;

  const { data, error } = await supabase
    .from("product_catalog")
    .select("*")
    .eq("id", numericId)
    .maybeSingle();

  if (error || !data) return null;
  return mapRow(data as DbProductCatalogRow);
}

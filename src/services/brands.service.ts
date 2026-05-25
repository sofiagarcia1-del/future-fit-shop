import { fetchProducts } from "@/lib/products";
import type { Product } from "@/lib/products";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/db";
import type { BrandSummary } from "@/services/types";

function toSlug(name: string): string {
  return encodeURIComponent(name.trim());
}

export function buildBrandsFromProducts(products: Product[]): BrandSummary[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, productCount]) => ({
      name,
      productCount,
      slug: toSlug(name),
    }))
    .sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name));
}

export async function fetchBrandsFromDb(): Promise<BrandSummary[] | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase.from("brand").select("name").order("name");
  if (error) {
    console.warn("[Tryfit] brand:", error.message);
    return null;
  }

  const products = await fetchProducts();
  const counts = buildBrandsFromProducts(products);
  const countByName = new Map(counts.map((b) => [b.name, b.productCount]));

  return (data ?? []).map((row) => {
    const name = row.name as string;
    return {
      name,
      productCount: countByName.get(name) ?? 0,
      slug: toSlug(name),
    };
  });
}

export async function fetchBrands(): Promise<BrandSummary[]> {
  const fromDb = await fetchBrandsFromDb();
  if (fromDb?.length) return fromDb.filter((b) => b.productCount > 0);

  const products = await fetchProducts();
  return buildBrandsFromProducts(products);
}

export async function fetchProductsByBrand(brandName: string): Promise<Product[]> {
  const products = await fetchProducts();
  const norm = brandName.trim().toLowerCase();
  return products.filter((p) => p.brand.toLowerCase() === norm);
}

export function decodeBrandSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

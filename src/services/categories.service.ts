import { CATEGORIES } from "@/lib/products";
import { fetchProducts } from "@/lib/products";
import type { Product } from "@/lib/products";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/db";
import type { CategorySummary } from "@/services/types";

export function buildCategoriesFromProducts(products: Product[]): CategorySummary[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  }

  const imageByName = new Map(CATEGORIES.map((c) => [c.name, c.image]));

  return [...counts.entries()]
    .map(([name, productCount]) => ({
      name,
      productCount,
      image: imageByName.get(name),
    }))
    .sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name));
}

export async function fetchCategoriesFromDb(): Promise<string[] | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase.from("category").select("name").order("name");
  if (error) {
    console.warn("[Tryfit] category:", error.message);
    return null;
  }
  return (data ?? []).map((r) => r.name as string);
}

export async function fetchCategories(): Promise<CategorySummary[]> {
  const products = await fetchProducts();
  const summaries = buildCategoriesFromProducts(products);

  const dbNames = await fetchCategoriesFromDb();
  if (!dbNames?.length) return summaries;

  const existing = new Set(summaries.map((s) => s.name));
  const imageByName = new Map(CATEGORIES.map((c) => [c.name, c.image]));

  for (const name of dbNames) {
    if (!existing.has(name)) {
      summaries.push({ name, productCount: 0, image: imageByName.get(name) });
    }
  }

  return summaries.sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name));
}

export async function fetchProductsByCategory(categoryName: string): Promise<Product[]> {
  const products = await fetchProducts();
  const norm = categoryName.trim().toLowerCase();
  return products.filter((p) => p.category.toLowerCase() === norm);
}

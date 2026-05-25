import type { Product } from "@/lib/products";
import type { ProductAudience } from "@/services/types";

const AUDIENCE_BY_CATEGORY: Partial<Record<string, ProductAudience>> = {
  Vestidos: "women",
};

const AUDIENCE_BY_PRODUCT_ID: Record<string, ProductAudience> = {
  "3": "men",
  "7": "men",
};

export function inferProductAudience(product: Product): ProductAudience {
  if (product.audience) return product.audience;
  if (AUDIENCE_BY_PRODUCT_ID[product.id]) return AUDIENCE_BY_PRODUCT_ID[product.id];
  if (AUDIENCE_BY_CATEGORY[product.category]) return AUDIENCE_BY_CATEGORY[product.category];
  return "unisex";
}

export function enrichProductAudience(product: Product): Product {
  return { ...product, audience: inferProductAudience(product) };
}

export function matchesAudience(product: Product, audience: "women" | "men"): boolean {
  const resolved = inferProductAudience(product);
  if (resolved === "unisex") return true;
  return resolved === audience;
}

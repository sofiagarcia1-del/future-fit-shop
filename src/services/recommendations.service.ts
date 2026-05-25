import type { Product } from "@/lib/products";

type Scored = { product: Product; score: number };

/**
 * Recomendaciones por afinidad: misma marca (+8), misma categoría (+5),
 * rango de precio similar ±20% (+3), distinto id obligatorio.
 */
export function getRelatedProducts(
  current: Product,
  catalog: Product[],
  limit = 4,
): Product[] {
  const priceMin = current.price * 0.8;
  const priceMax = current.price * 1.2;

  const scored: Scored[] = [];

  for (const candidate of catalog) {
    if (candidate.id === current.id) continue;

    let score = 0;
    if (candidate.brand === current.brand) score += 8;
    if (candidate.category === current.category) score += 5;
    if (candidate.price >= priceMin && candidate.price <= priceMax) score += 3;

    if (score > 0) scored.push({ product: candidate, score });
  }

  if (scored.length < limit) {
    for (const candidate of catalog) {
      if (candidate.id === current.id) continue;
      if (scored.some((s) => s.product.id === candidate.id)) continue;
      scored.push({ product: candidate, score: 1 });
      if (scored.length >= limit * 2) break;
    }
  }

  return scored
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
    .slice(0, limit)
    .map((s) => s.product);
}

export function getCompleteTheLook(current: Product, catalog: Product[]): Product[] {
  const complementary: Record<string, string[]> = {
    Chaquetas: ["Camisas", "Pantalones"],
    Camisas: ["Pantalones", "Chaquetas"],
    Vestidos: ["Accesorios", "Zapatos"],
    Pantalones: ["Camisas", "Hoodies"],
    Hoodies: ["Pantalones"],
  };

  const targets = complementary[current.category] ?? ["Accesorios"];
  return catalog
    .filter((p) => p.id !== current.id && targets.includes(p.category))
    .slice(0, 3);
}

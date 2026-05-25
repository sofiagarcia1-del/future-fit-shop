import type { Product } from "@/lib/products";

type ScoredProduct = { product: Product; score: number };

/**
 * Búsqueda con puntuación: nombre > marca > categoría > descripción.
 * Solo devuelve productos con score > 0, ordenados por relevancia.
 */
export function searchProducts(products: Product[], query: string): Product[] {
  const terms = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (terms.length === 0) return products;

  const scored: ScoredProduct[] = [];

  for (const product of products) {
    const name = product.name.toLowerCase();
    const brand = product.brand.toLowerCase();
    const category = product.category.toLowerCase();
    const description = product.description.toLowerCase();

    let score = 0;
    for (const term of terms) {
      if (name.includes(term)) score += 10;
      if (brand.includes(term)) score += 6;
      if (category.includes(term)) score += 4;
      if (description.includes(term)) score += 2;
      if (name.startsWith(term)) score += 5;
    }

    if (score > 0) scored.push({ product, score });
  }

  return scored.sort((a, b) => b.score - a.score).map((s) => s.product);
}

export function highlightSearchTerms(text: string, query: string): string {
  const q = query.trim();
  if (!q) return text;
  return text;
}

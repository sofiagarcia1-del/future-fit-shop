import { fetchProducts } from "@/lib/products";
import type { Product } from "@/lib/products";
import { enrichProductAudience, matchesAudience } from "@/lib/product-audience";
import { searchProducts } from "@/services/search.service";
import type { CatalogFilters, CatalogResult } from "@/services/types";

export { enrichProductAudience, inferProductAudience, matchesAudience } from "@/lib/product-audience";

export function filterCatalog(products: Product[], filters: CatalogFilters): Product[] {
  let list = products.map(enrichProductAudience);

  if (filters.audience) {
    list = list.filter((p) => matchesAudience(p, filters.audience!));
  }

  if (filters.brand) {
    const brandNorm = filters.brand.trim().toLowerCase();
    list = list.filter((p) => p.brand.toLowerCase() === brandNorm);
  }

  if (filters.category) {
    const catNorm = filters.category.trim().toLowerCase();
    list = list.filter((p) => p.category.toLowerCase() === catNorm);
  }

  if (filters.query?.trim()) {
    list = searchProducts(list, filters.query);
  }

  return list;
}

export async function fetchCatalog(filters: CatalogFilters = {}): Promise<CatalogResult> {
  const all = await fetchProducts();
  const products = filterCatalog(all, filters);
  return {
    products,
    total: products.length,
    appliedFilters: filters,
  };
}

export function getCatalogPageTitle(filters: CatalogFilters, view?: string): string {
  if (filters.brand) return filters.brand;
  if (filters.category) return filters.category;
  if (filters.audience === "women") return "Mujer";
  if (filters.audience === "men") return "Hombre";
  if (view === "brands") return "Marcas";
  if (view === "categories") return "Categorías";
  if (filters.query) return `Búsqueda: ${filters.query}`;
  return "La selección";
}

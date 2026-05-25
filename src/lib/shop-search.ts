import type { ShopView } from "@/services/types";

export type ShopSearch = {
  q?: string;
  audience?: "women" | "men";
  brand?: string;
  category?: string;
  view?: ShopView;
};

export function validateShopSearch(search: Record<string, unknown>): ShopSearch {
  return {
    q: typeof search.q === "string" ? search.q : undefined,
    audience: search.audience === "women" || search.audience === "men" ? search.audience : undefined,
    brand: typeof search.brand === "string" ? search.brand : undefined,
    category: typeof search.category === "string" ? search.category : undefined,
    view:
      search.view === "brands" || search.view === "categories" || search.view === "all"
        ? search.view
        : undefined,
  };
}

/** Omite claves undefined para evitar errores de serialización en TanStack Router / SSR. */
export function toShopSearchParams(params: Partial<ShopSearch>): ShopSearch {
  const out: ShopSearch = {};
  if (params.q) out.q = params.q;
  if (params.audience) out.audience = params.audience;
  if (params.brand) out.brand = params.brand;
  if (params.category) out.category = params.category;
  if (params.view) out.view = params.view;
  return out;
}

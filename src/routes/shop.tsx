import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { sortProducts, type SortOption } from "@/lib/sort-products";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchCatalog } from "@/services/catalog.service";
import { fetchBrands, decodeBrandSlug } from "@/services/brands.service";
import { fetchCategories } from "@/services/categories.service";
import { getCatalogPageTitle } from "@/services/catalog.service";
import type { CatalogFilters } from "@/services/types";
import { toShopSearchParams, validateShopSearch, type ShopSearch } from "@/lib/shop-search";

export const Route = createFileRoute("/shop")({
  validateSearch: validateShopSearch,
  head: () => ({
    meta: [
      { title: "Tienda — Tryfit" },
      { name: "description", content: "Explora la colección multimarca de Tryfit con AI Try-On." },
      { property: "og:title", content: "Tienda — Tryfit" },
      { property: "og:description", content: "Explora prendas multimarca con AI Try-On." },
    ],
  }),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps }) => {
    const search = deps.search;
    const filters: CatalogFilters = {
      audience: search.audience,
      brand: search.brand ? decodeBrandSlug(search.brand) : undefined,
      category: search.category,
      query: search.q,
    };
    const [catalog, brands, categories] = await Promise.all([
      fetchCatalog(filters),
      fetchBrands(),
      fetchCategories(),
    ]);
    return { catalog, brands, categories, search };
  },
  component: Shop,
});

function Shop() {
  const { catalog, brands, categories, search } = Route.useLoaderData();
  const navigate = useNavigate({ from: "/shop" });
  const products = catalog.products;
  const pageTitle = getCatalogPageTitle(catalog.appliedFilters, search.view);

  const categoryNames = ["Todo", ...categories.filter((c) => c.productCount > 0).map((c) => c.name)];
  const [active, setActive] = useState(search.category ?? "Todo");
  const [sort, setSort] = useState<SortOption>("Destacados");
  const [query, setQuery] = useState(search.q ?? "");

  useEffect(() => {
    setQuery(search.q ?? "");
    setActive(search.category ?? "Todo");
  }, [search.q, search.category]);

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    let list =
      active === "Todo" || search.view === "brands"
        ? products
        : products.filter((p) => p.category === active);
    if (normalizedQuery && !search.q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(normalizedQuery) ||
          p.brand.toLowerCase().includes(normalizedQuery) ||
          p.category.toLowerCase().includes(normalizedQuery),
      );
    }
    return list;
  }, [products, active, normalizedQuery, search.q, search.view]);

  const visible = useMemo(() => sortProducts(filtered, sort), [filtered, sort]);

  const applySearch = (patch: Partial<ShopSearch>) => {
    void navigate({
      to: "/shop",
      search: toShopSearchParams({
        q: patch.q !== undefined ? patch.q : search.q,
        audience: patch.audience !== undefined ? patch.audience : search.audience,
        brand: patch.brand !== undefined ? patch.brand : search.brand,
        category: patch.category !== undefined ? patch.category : search.category,
        view: patch.view !== undefined ? patch.view : search.view,
      }),
    });
  };

  const clearFilters = () => {
    setQuery("");
    setActive("Todo");
    void navigate({ to: "/shop", search: {} });
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12 md:py-20">
      <div className="mb-12 animate-fade-up">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Colección · SS26</p>
        <h1 className="text-5xl md:text-7xl">
          <span className="serif-italic">{pageTitle}</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl">
          {search.audience === "women" && "Selección para mujer: piezas exclusivas y unisex de la curaduría Tryfit."}
          {search.audience === "men" && "Selección para hombre: prendas masculinas y unisex de la curaduría Tryfit."}
          {search.view === "brands" && "Explora por marca. Haz clic en una firma para filtrar el catálogo."}
          {search.view === "categories" && "Explora por categoría. Encuentra el tipo de prenda que buscas."}
          {!search.audience && search.view !== "brands" && search.view !== "categories" &&
            "Curaduría editorial multimarca. Pruébate cualquier pieza con IA antes de añadirla a tu bolsa."}
        </p>
        {catalog.total > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">{catalog.total} productos</p>
        )}
      </div>

      {search.view === "brands" && (
        <div className="mb-8 flex flex-wrap gap-2">
          {brands.map((b) => (
            <Link
              key={b.name}
              to="/shop"
              search={toShopSearchParams({ brand: b.slug, audience: search.audience })}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.14em] border smooth ${
                search.brand === b.slug
                  ? "btn-primary-bg border-transparent"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {b.name}
              <span className="ml-1.5 opacity-60">({b.productCount})</span>
            </Link>
          ))}
        </div>
      )}

      {search.view === "categories" && (
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categories
            .filter((c) => c.productCount > 0)
            .map((c) => (
              <Link
                key={c.name}
                to="/shop"
                search={toShopSearchParams({ category: c.name, audience: search.audience })}
                className="group rounded-2xl border border-border overflow-hidden hover:border-foreground smooth"
              >
                {c.image && (
                  <img
                    src={c.image}
                    alt=""
                    className="aspect-[4/3] w-full object-cover group-hover:scale-105 smooth"
                  />
                )}
                <div className="p-3 text-xs uppercase tracking-[0.14em]">
                  {c.name}
                  <span className="text-muted-foreground ml-1">({c.productCount})</span>
                </div>
              </Link>
            ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-10 gap-4 flex-wrap border-y border-border py-4">
        {search.view !== "brands" && (
          <div className="flex gap-1 flex-wrap">
            {categoryNames.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setActive(c);
                  if (c === "Todo") {
                    applySearch({ category: undefined, view: undefined });
                  } else {
                    applySearch({ category: c, view: undefined });
                  }
                }}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.16em] smooth ${
                  active === c ? "btn-primary-bg" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <label className="sr-only" htmlFor="shop-search">
            Buscar productos
          </label>
          <input
            id="shop-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                applySearch({ q: query.trim() || undefined, view: undefined });
              }
            }}
            placeholder="Buscar marca o prenda…"
            className="bg-transparent border border-border rounded-full px-4 py-2 text-xs min-w-[200px] focus:outline-none focus:border-foreground smooth"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="bg-transparent border border-border rounded-full px-4 py-2 text-xs uppercase tracking-[0.14em] focus:outline-none focus:border-foreground smooth"
            aria-label="Ordenar productos"
          >
            {["Destacados", "Novedades", "Precio: menor a mayor", "Precio: mayor a menor"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-24 rounded-3xl bg-card card-shadow">
          <SlidersHorizontal className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No hay resultados para tu búsqueda o filtro.</p>
          <Button variant="outline" className="mt-6 rounded-full" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {(search.q || search.brand || search.category || search.audience) && (
        <p className="mt-8 text-center text-xs text-muted-foreground">
          <Link to="/shop" search={{}} className="underline-grow">
            Ver toda la colección
          </Link>
        </p>
      )}
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts, type Product } from "@/lib/products";
import { sortProducts, type SortOption } from "@/lib/sort-products";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

type ShopSearch = {
  q?: string;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Tienda — Tryfit" },
      { name: "description", content: "Explora la colección multimarca de Tryfit con AI Try-On." },
      { property: "og:title", content: "Tienda — Tryfit" },
      { property: "og:description", content: "Explora prendas multimarca con AI Try-On." },
    ],
  }),
  loader: () => fetchProducts(),
  component: Shop,
});

function Shop() {
  const products = Route.useLoaderData() as Product[];
  const { q: queryFromUrl } = Route.useSearch();
  const categories = ["Todo", ...Array.from(new Set(products.map((p) => p.category)))];
  const [active, setActive] = useState("Todo");
  const [sort, setSort] = useState<SortOption>("Destacados");
  const [query, setQuery] = useState(queryFromUrl ?? "");

  useEffect(() => {
    setQuery(queryFromUrl ?? "");
  }, [queryFromUrl]);

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    let list = active === "Todo" ? products : products.filter((p) => p.category === active);
    if (normalizedQuery) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(normalizedQuery) ||
          p.brand.toLowerCase().includes(normalizedQuery) ||
          p.category.toLowerCase().includes(normalizedQuery),
      );
    }
    return list;
  }, [products, active, normalizedQuery]);

  const visible = useMemo(() => sortProducts(filtered, sort), [filtered, sort]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12 md:py-20">
      <div className="mb-12 animate-fade-up">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Colección · SS26</p>
        <h1 className="text-5xl md:text-7xl">La <span className="serif-italic">selección</span></h1>
        <p className="mt-4 text-muted-foreground max-w-xl">Curaduría editorial multimarca. Pruébate cualquier pieza con IA antes de añadirla a tu bolsa.</p>
      </div>

      <div className="flex items-center justify-between mb-10 gap-4 flex-wrap border-y border-border py-4">
        <div className="flex gap-1 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.16em] smooth ${
                active === c ? "btn-primary-bg" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="sr-only" htmlFor="shop-search">
            Buscar productos
          </label>
          <input
            id="shop-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
          <Button
            variant="outline"
            className="mt-6 rounded-full"
            onClick={() => {
              setQuery("");
              setActive("Todo");
            }}
          >
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

      {normalizedQuery && (
        <p className="mt-8 text-center text-xs text-muted-foreground">
          <Link to="/shop" search={{}} className="underline-grow">
            Ver toda la colección
          </Link>
        </p>
      )}
    </div>
  );
}

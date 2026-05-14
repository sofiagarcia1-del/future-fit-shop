import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts, type Product } from "@/lib/products";
import { SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/shop")({
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
  const categories = ["Todo", ...Array.from(new Set(products.map((p) => p.category)))];
  const [active, setActive] = useState("Todo");
  const [sort, setSort] = useState("Destacados");
  const visible = active === "Todo" ? products : products.filter((p) => p.category === active);

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
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] hover:text-foreground text-muted-foreground">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filtros
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-transparent border border-border rounded-full px-4 py-2 text-xs uppercase tracking-[0.14em] focus:outline-none focus:border-foreground smooth"
          >
            {["Destacados", "Novedades", "Precio: menor a mayor", "Precio: mayor a menor"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
        {visible.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}

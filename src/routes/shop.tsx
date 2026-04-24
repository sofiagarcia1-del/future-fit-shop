import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts } from "@/lib/products";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — TRYFIT" },
      { name: "description", content: "Browse the latest TRYFIT drop. Modern, futuristic fashion with AI try-on." },
      { property: "og:title", content: "Shop — TRYFIT" },
      { property: "og:description", content: "Browse the latest TRYFIT drop with AI try-on." },
    ],
  }),
  loader: () => fetchProducts(),
  component: Shop,
});

function Shop() {
  const products = Route.useLoaderData();
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const [active, setActive] = useState("All");
  const visible = active === "All" ? products : products.filter((p) => p.category === active);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-widest text-primary mb-2">Collection / SS26</p>
        <h1 className="text-4xl md:text-6xl font-bold">The Drop</h1>
      </div>

      <div className="flex gap-2 flex-wrap mb-10">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`px-4 py-2 rounded-full text-sm smooth border ${
              active === c ? "gradient-bg border-transparent text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {visible.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}

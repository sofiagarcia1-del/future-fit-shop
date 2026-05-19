import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { fetchProduct, fetchProducts, type Product } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Sparkles, ShoppingBag, Heart, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { cn } from "@/lib/utils";
import { TryOnModal } from "@/components/TryOnModal";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    const product = await fetchProduct(params.id);
    if (!product) throw notFound();
    const all = await fetchProducts();
    return { product, related: all.filter((p) => p.id !== product.id).slice(0, 4) };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — TRYFIT` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: `${loaderData.product.name} — TRYFIT` },
          { property: "og:description", content: loaderData.product.description },
          { property: "og:image", content: loaderData.product.image },
        ]
      : [{ title: "Product — TRYFIT" }],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-7xl px-6 py-24 text-center">
      <h1 className="text-3xl font-bold">Product not found</h1>
      <Link to="/shop" className="mt-4 inline-block text-primary">Back to shop</Link>
    </div>
  ),
  component: ProductPage,
});

const SIZES = ["XS", "S", "M", "L", "XL"];
const COLORS = [
  { name: "Olive", hex: "#6F6C43" },
  { name: "Chamomile", hex: "#D2BF81" },
  { name: "Sage", hex: "#99ABA6" },
  { name: "Almond", hex: "#F0EAD8" },
];

function ProductPage() {
  const { product, related } = Route.useLoaderData();
  const { add, setOpen } = useCart();
  const { has, toggle } = useWishlist();
  const [size, setSize] = useState("M");
  const [color, setColor] = useState(COLORS[0].name);
  const [tryOn, setTryOn] = useState(false);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8 md:py-12">
      <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground smooth mb-8">
        <ArrowLeft className="w-3.5 h-3.5" /> Volver a la tienda
      </Link>

      <div className="grid md:grid-cols-12 gap-10 lg:gap-16">
        <div className="md:col-span-7 space-y-3">
          <div className="rounded-2xl overflow-hidden bg-muted aspect-[3/4]">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[product.image, product.image, product.image].map((src, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-muted aspect-square">
                <img src={src} alt="" className="w-full h-full object-cover smooth hover:scale-105" />
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-5 md:sticky md:top-28 self-start">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{product.brand}</p>
          <h1 className="text-3xl md:text-4xl mt-2 leading-tight">{product.name}</h1>
          <p className="text-2xl mt-4 font-display italic">${product.price}</p>

          <p className="mt-8 text-sm text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="mt-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-[0.16em]">Color</p>
              <p className="text-xs text-muted-foreground">{color}</p>
            </div>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  className={`w-9 h-9 rounded-full border-2 smooth ${color === c.name ? "border-foreground" : "border-transparent"}`}
                  style={{ background: c.hex, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)" }}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-[0.16em]">Talla</p>
              <button className="text-xs text-muted-foreground underline-grow">Guía de tallas</button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`h-12 rounded-xl border smooth text-sm ${
                    size === s ? "btn-primary-bg border-transparent" : "border-border hover:border-foreground"
                  }`}
                >{s}</button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2.5">
            <Button size="lg" className="w-full h-14 rounded-full btn-primary-bg border-0 hover:opacity-90 text-sm uppercase tracking-[0.16em]" onClick={() => setTryOn(true)}>
              <Sparkles className="w-4 h-4 mr-2" style={{ color: "var(--accent)" }} /> Probar con IA
            </Button>
            <div className="grid grid-cols-[1fr_auto] gap-2.5">
              <Button size="lg" variant="outline" className="h-14 rounded-full border-foreground/30 hover:bg-muted text-sm uppercase tracking-[0.16em]" onClick={() => { add(product); setOpen(true); }}>
                <ShoppingBag className="w-4 h-4 mr-2" /> Añadir a la bolsa
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 w-14 rounded-full border-foreground/30 hover:bg-muted"
                onClick={() => toggle(product)}
                aria-label={has(product.id) ? "Quitar de wishlist" : "Añadir a wishlist"}
              >
                <Heart className={cn("w-4 h-4", has(product.id) && "fill-foreground")} />
              </Button>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl p-4 bg-card"><p className="font-medium">Envío gratis</p><p className="text-muted-foreground mt-0.5">Desde $200</p></div>
            <div className="rounded-xl p-4 bg-card"><p className="font-medium">30 días</p><p className="text-muted-foreground mt-0.5">Devolución</p></div>
            <div className="rounded-xl p-4 bg-card"><p className="font-medium">AI Fit</p><p className="text-muted-foreground mt-0.5">Pruébalo</p></div>
          </div>
        </div>
      </div>

      <section className="mt-32">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">También te puede gustar</p>
        <h2 className="text-3xl md:text-4xl mb-10">Completa el <span className="serif-italic">look</span></h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {related.map((p: Product) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <TryOnModal open={tryOn} onOpenChange={setTryOn} product={product} />
    </div>
  );
}

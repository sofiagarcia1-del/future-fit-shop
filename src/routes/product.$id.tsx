import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { fetchProduct, fetchProducts } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Sparkles, ShoppingBag, Heart, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart";
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

function ProductPage() {
  const { product, related } = Route.useLoaderData();
  const { add, setOpen } = useCart();
  const [size, setSize] = useState("M");
  const [tryOn, setTryOn] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <Link to="/shop" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground smooth mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="rounded-3xl overflow-hidden bg-card aspect-[3/4] card-shadow">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-primary">{product.category}</p>
          <h1 className="text-4xl md:text-5xl font-bold mt-2">{product.name}</h1>
          <p className="text-2xl font-semibold mt-3">${product.price}</p>

          <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="mt-8">
            <p className="text-sm font-medium mb-3">Size</p>
            <div className="flex gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`w-12 h-12 rounded-xl border smooth text-sm ${
                    size === s ? "gradient-bg border-transparent text-primary-foreground" : "border-border hover:border-foreground"
                  }`}
                >{s}</button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Button size="lg" className="w-full gradient-bg border-0 glow" onClick={() => { add(product); setOpen(true); }}>
              <ShoppingBag className="w-4 h-4 mr-2" /> Add to bag
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button size="lg" variant="outline" className="border-border" onClick={() => setTryOn(true)}>
                <Sparkles className="w-4 h-4 mr-2 text-primary" /> Try-On with AI
              </Button>
              <Button size="lg" variant="outline" className="border-border">
                <Heart className="w-4 h-4 mr-2" /> Wishlist
              </Button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
            <div className="glass rounded-xl p-3"><p className="text-foreground font-medium">Free shipping</p>Over $200</div>
            <div className="glass rounded-xl p-3"><p className="text-foreground font-medium">30-day returns</p>Free & easy</div>
            <div className="glass rounded-xl p-3"><p className="text-foreground font-medium">AI fit</p>Try before buy</div>
          </div>
        </div>
      </div>

      <section className="mt-24">
        <h2 className="text-2xl font-bold mb-8">You might also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {related.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <TryOnModal open={tryOn} onOpenChange={setTryOn} product={product} />
    </div>
  );
}

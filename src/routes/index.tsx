import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts } from "@/lib/products";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  loader: () => fetchProducts(),
  component: Index,
});

function Index() {
  const products = Route.useLoaderData();
  const featured = products.slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden noise-overlay">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" width={1920} height={1080} className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-32 md:pt-36 md:pb-44 relative">
          <div className="max-w-2xl animate-fade-up">
            <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 text-xs mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Powered by AI Try-On</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.05]">
              Fashion that <br />
              <span className="gradient-text">fits the future.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg">
              Discover curated drops, then preview every piece on yourself with our AI virtual fitting room.
            </p>
            <div className="mt-8 flex gap-3">
              <Button asChild size="lg" className="gradient-bg border-0 glow">
                <Link to="/shop">Shop the drop <ArrowRight className="ml-1.5 w-4 h-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-border">
                <Link to="/shop">Explore AI</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary mb-2">Latest Drop</p>
            <h2 className="text-3xl md:text-4xl font-bold">Featured pieces</h2>
          </div>
          <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground smooth hidden sm:flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* AI BANNER */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="relative rounded-3xl overflow-hidden p-10 md:p-16 glass">
          <div className="absolute inset-0 -z-10 opacity-60" style={{ background: "var(--gradient-glow)" }} />
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 text-xs mb-4">
                <Sparkles className="w-3.5 h-3.5 text-secondary" /> AI Virtual Fitting
              </div>
              <h3 className="text-3xl md:text-5xl font-bold leading-tight">
                See it on <span className="gradient-text">you</span>, before you buy.
              </h3>
              <p className="mt-4 text-muted-foreground">
                Upload a photo. Our model renders any TRYFIT piece on your body in seconds.
              </p>
              <Button asChild size="lg" className="mt-6 gradient-bg border-0">
                <Link to="/shop">Try it now</Link>
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {products.slice(0, 6).map((p) => (
                <img key={p.id} src={p.image} alt={p.name} loading="lazy" className="aspect-[3/4] rounded-xl object-cover smooth hover:scale-105" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

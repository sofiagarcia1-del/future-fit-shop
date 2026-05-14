import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, Upload, Wand2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts, BRANDS, CATEGORIES, type Product } from "@/lib/products";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  loader: () => fetchProducts(),
  component: Index,
});

function Index() {
  const products = Route.useLoaderData() as Product[];
  const featured = products.slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="grid lg:grid-cols-12 min-h-[88vh]">
          <div className="lg:col-span-6 flex items-center px-6 md:px-16 py-20 relative z-10">
            <div className="max-w-xl animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.2em]" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                AI Virtual Try-On
              </div>
              <h1 className="mt-6 text-5xl md:text-6xl lg:text-7xl leading-[1.02] text-balance">
                Pruébate la moda <span className="serif-italic">antes</span> de comprar
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-md leading-relaxed">
                Una experiencia de prueba virtual impulsada por IA. Sube tu foto y descubre cómo te queda cualquier prenda multimarca, en segundos.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full h-12 px-8 btn-primary-bg hover:opacity-90 border-0">
                  <Link to="/shop">Probar ahora <ArrowRight className="ml-1 w-4 h-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-8 border-foreground/20 hover:bg-muted">
                  <Link to="/shop">Explorar colección</Link>
                </Button>
              </div>

              <div className="mt-14 flex items-center gap-8 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <div><p className="font-display italic text-2xl text-foreground normal-case tracking-normal">200+</p>Marcas</div>
                <div><p className="font-display italic text-2xl text-foreground normal-case tracking-normal">12k</p>Prendas</div>
                <div><p className="font-display italic text-2xl text-foreground normal-case tracking-normal">98%</p>Precisión IA</div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 relative min-h-[60vh] lg:min-h-full">
            <img src={heroImg} alt="Modelo Tryfit" width={1600} height={1100} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent lg:from-background/60" />
            <div className="absolute bottom-8 right-8 glass rounded-2xl px-5 py-4 flex items-center gap-3 max-w-xs animate-fade-up delay-300">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--accent)" }}>
                <Sparkles className="w-4 h-4 text-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium">Try-On listo en 8s</p>
                <p className="text-[11px] text-muted-foreground">Powered by Tryfit AI</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 md:py-32">
        <div className="text-center mb-16 animate-fade-up">
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Cómo funciona</p>
          <h2 className="mt-3 text-4xl md:text-5xl">Tres pasos. <span className="serif-italic">Cero dudas.</span></h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Upload, t: "Sube tu foto", d: "Una imagen frontal de cuerpo entero. Tus medidas se guardan de forma privada para mejorar el realismo." },
            { icon: ImageIcon, t: "Elige una prenda", d: "Explora cientos de marcas. Selecciona color, talla y guarda tus favoritos." },
            { icon: Wand2, t: "Mira tu resultado", d: "Nuestra IA renderiza la prenda sobre ti en segundos. Compara antes / después y compra con seguridad." },
          ].map((s, i) => (
            <div key={i} className={`group relative bg-card rounded-3xl p-8 md:p-10 hover-lift card-shadow animate-fade-up delay-${(i + 1) * 100}`}>
              <div className="absolute top-8 right-8 font-display italic text-5xl text-foreground/10">0{i + 1}</div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-8" style={{ background: "var(--background)", border: "1px solid var(--border)" }}>
                <s.icon className="w-5 h-5" />
              </div>
              <h3 className="text-2xl mb-3">{s.t}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-[1400px] px-6 pb-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Categorías</p>
            <h2 className="mt-3 text-3xl md:text-4xl">Explora por tipo</h2>
          </div>
          <Link to="/shop" className="hidden sm:inline-flex items-center gap-1 text-sm underline-grow">
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {CATEGORIES.map((c) => (
            <Link to="/shop" key={c.name} className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
              <img src={c.image} alt={c.name} loading="lazy" className="w-full h-full object-cover smooth group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />
              <span className="absolute bottom-4 left-4 right-4 font-display text-xl text-background">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="mx-auto max-w-[1400px] px-6 pb-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Edición SS26</p>
            <h2 className="mt-3 text-3xl md:text-4xl">Prendas destacadas</h2>
          </div>
          <Link to="/shop" className="hidden sm:inline-flex items-center gap-1 text-sm underline-grow">
            Ver toda la colección <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* AI BANNER */}
      <section className="mx-auto max-w-[1400px] px-6 pb-24">
        <div className="relative rounded-[2rem] overflow-hidden p-10 md:p-20 grain" style={{ background: "var(--gradient-warm)" }}>
          <div className="grid md:grid-cols-2 gap-12 items-center relative">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] bg-background/70 backdrop-blur-sm border border-border">
                <Sparkles className="w-3 h-3" /> Tryfit AI
              </div>
              <h3 className="mt-6 text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
                Velo en <span className="serif-italic">ti</span>,<br /> antes de comprarlo.
              </h3>
              <p className="mt-6 text-muted-foreground max-w-md leading-relaxed">
                Sube una foto. Nuestro modelo viste cualquier prenda Tryfit sobre tu cuerpo en segundos, con realismo profesional.
              </p>
              <Button asChild size="lg" className="mt-8 rounded-full h-12 px-8 btn-primary-bg border-0">
                <Link to="/shop">Probar gratis</Link>
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {products.slice(0, 6).map((p, i) => (
                <img key={p.id} src={p.image} alt={p.name} loading="lazy" className={`aspect-[3/4] rounded-2xl object-cover smooth hover:scale-105 ${i % 2 ? "translate-y-6" : ""}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BRANDS MARQUEE */}
      <section className="border-y border-border py-10 overflow-hidden bg-card/40">
        <p className="text-center text-[11px] uppercase tracking-[0.24em] text-muted-foreground mb-6">Marcas que confían en Tryfit</p>
        <div className="flex animate-marquee whitespace-nowrap gap-16">
          {[...BRANDS, ...BRANDS, ...BRANDS].map((b, i) => (
            <span key={i} className="font-display italic text-2xl md:text-3xl text-foreground/40 hover:text-foreground smooth">
              {b}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

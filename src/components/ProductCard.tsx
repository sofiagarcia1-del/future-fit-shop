import { Link } from "@tanstack/react-router";
import { Sparkles, Heart } from "lucide-react";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { TryOnModal } from "@/components/TryOnModal";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { add, setOpen } = useCart();
  const { has, toggle } = useWishlist();
  const [tryOn, setTryOn] = useState(false);
  const saved = has(product.id);

  return (
    <div className="group relative">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="block relative overflow-hidden rounded-xl bg-muted aspect-[3/4]"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover smooth group-hover:scale-[1.04]"
        />

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggle(product);
          }}
          className={cn(
            "absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center smooth",
            saved
              ? "bg-background opacity-100"
              : "bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100",
          )}
          aria-label={saved ? "Quitar de wishlist" : "Añadir a wishlist"}
        >
          <Heart
            className={cn("w-4 h-4", saved && "fill-foreground")}
            style={saved ? { color: "var(--olive)" } : undefined}
          />
        </button>

        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 smooth">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setTryOn(true);
            }}
            className="flex-1 h-10 rounded-full text-xs font-medium tracking-wide bg-background/95 backdrop-blur-sm text-foreground hover:bg-background smooth flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            Probar
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              add(product);
              setOpen(true);
            }}
            className="flex-1 h-10 rounded-full text-xs font-medium tracking-wide btn-primary-bg hover:opacity-90 smooth"
          >
            Añadir
          </button>
        </div>
      </Link>

      <div className="mt-4 px-1">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{product.category}</p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <h3 className="text-sm leading-snug">{product.name}</h3>
          <p className="text-sm font-medium tabular-nums">${product.price}</p>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border border-border" style={{ background: "#6F6C43" }} />
          <span className="w-3 h-3 rounded-full border border-border" style={{ background: "#D2BF81" }} />
          <span className="w-3 h-3 rounded-full border border-border" style={{ background: "#99ABA6" }} />
        </div>
      </div>

      <TryOnModal open={tryOn} onOpenChange={setTryOn} product={product} />
    </div>
  );
}

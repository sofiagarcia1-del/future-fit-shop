import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { TryOnModal } from "@/components/TryOnModal";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const { add, setOpen } = useCart();
  const [tryOn, setTryOn] = useState(false);

  return (
    <div className="group relative">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="block relative overflow-hidden rounded-2xl bg-card aspect-[3/4] card-shadow"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover smooth group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 smooth" />
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 smooth gradient-bg border-0 text-primary-foreground"
          onClick={(e) => { e.preventDefault(); add(product); setOpen(true); }}
        >
          Add to bag
        </Button>
        <button
          onClick={(e) => { e.preventDefault(); setTryOn(true); }}
          className="absolute top-3 right-3 glass rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5 smooth hover:scale-105"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Try-On
        </button>
      </Link>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{product.category}</p>
          <h3 className="text-sm font-medium mt-0.5">{product.name}</h3>
        </div>
        <p className="text-sm font-semibold">${product.price}</p>
      </div>
      <TryOnModal open={tryOn} onOpenChange={setTryOn} product={product} />
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useWishlist } from "@/lib/wishlist";
import { ProductCard } from "@/components/ProductCard";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [{ title: "Wishlist — Tryfit" }, { name: "description", content: "Tus piezas favoritas en Tryfit." }],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { items, clear } = useWishlist();

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Guardados</p>
          <h1 className="text-4xl md:text-6xl">
            Tu <span className="serif-italic">wishlist</span>
          </h1>
        </div>
        {items.length > 0 && (
          <Button variant="outline" className="rounded-full" onClick={clear}>
            Vaciar wishlist
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 rounded-3xl bg-card card-shadow">
          <Heart className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aún no has guardado ninguna pieza.</p>
          <Button asChild className="mt-6 rounded-full btn-primary-bg border-0">
            <Link to="/shop">Explorar colección</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

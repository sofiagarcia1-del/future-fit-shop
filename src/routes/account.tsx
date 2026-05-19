import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/lib/wishlist";
import { Button } from "@/components/ui/button";
import { Heart, Package, Sparkles } from "lucide-react";
import { AccountMeasurementsForm } from "@/components/AccountMeasurementsForm";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [{ title: "Mi cuenta — Tryfit" }, { name: "description", content: "Perfil y preferencias de Tryfit." }],
  }),
  component: AccountPage,
});

function AccountPage() {
  return (
    <RequireAuth>
      <AccountContent />
    </RequireAuth>
  );
}

function AccountContent() {
  const { user, signOut } = useAuth();
  const { count: wishlistCount } = useWishlist();

  const name = user?.user_metadata?.full_name ?? user?.email ?? "Usuario";
  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const email = user?.email;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Mi cuenta</p>
      <h1 className="text-4xl md:text-6xl">
        Hola, <span className="serif-italic">{name.split(" ")[0]}</span>
      </h1>

      <div className="mt-12 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl bg-card p-8 card-shadow h-fit">
          {avatar ? (
            <img src={avatar} alt="" className="w-24 h-24 rounded-full object-cover mx-auto" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-muted mx-auto flex items-center justify-center font-display text-3xl italic">
              {name.charAt(0)}
            </div>
          )}
          <p className="mt-4 text-center font-medium">{name}</p>
          {email && <p className="text-center text-sm text-muted-foreground mt-1">{email}</p>}
          <Button variant="outline" className="w-full mt-6 rounded-full" onClick={() => void signOut()}>
            Cerrar sesión
          </Button>
        </aside>

        <div className="grid sm:grid-cols-2 gap-4">
          <Link to="/orders" className="group rounded-3xl bg-card p-8 card-shadow hover-lift smooth block">
            <Package className="w-6 h-6 mb-4 text-muted-foreground group-hover:text-foreground smooth" />
            <h2 className="text-xl">Mis pedidos</h2>
            <p className="mt-2 text-sm text-muted-foreground">Historial y seguimiento de envíos.</p>
          </Link>

          <Link to="/wishlist" className="group rounded-3xl bg-card p-8 card-shadow hover-lift smooth block">
            <Heart className="w-6 h-6 mb-4 text-muted-foreground group-hover:text-foreground smooth" />
            <h2 className="text-xl">Wishlist</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {wishlistCount} {wishlistCount === 1 ? "pieza guardada" : "piezas guardadas"}.
            </p>
          </Link>

          <Link
            to="/shop"
            className="group rounded-3xl bg-card p-8 card-shadow hover-lift smooth block sm:col-span-2"
          >
            <Sparkles className="w-6 h-6 mb-4" style={{ color: "var(--accent)" }} />
            <h2 className="text-xl">Probar con IA</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Explora la colección y activa Virtual Try-On en cualquier prenda.
            </p>
          </Link>
        </div>

        <AccountMeasurementsForm />
      </div>
    </div>
  );
}

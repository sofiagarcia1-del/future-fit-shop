import { Link } from "@tanstack/react-router";
import { ShoppingBag, Search, Menu, Heart, User, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const NAV = [
  { to: "/" as const, label: "Inicio" },
  { to: "/shop" as const, label: "Mujer" },
  { to: "/shop" as const, label: "Hombre" },
  { to: "/shop" as const, label: "Marcas" },
  { to: "/shop" as const, label: "Categorías" },
];

const MOBILE_LINKS = [
  { to: "/" as const, label: "Inicio" },
  { to: "/shop" as const, label: "Tienda" },
  { to: "/wishlist" as const, label: "Wishlist" },
  { to: "/orders" as const, label: "Mis pedidos" },
  { to: "/account" as const, label: "Mi cuenta" },
];

export function Navbar() {
  const { count, setOpen } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const displayName = (user?.user_metadata?.full_name as string | undefined) ?? user?.email;

  return (
    <>
      <header
        className={`sticky top-0 z-40 smooth border-b ${
          scrolled
            ? "bg-background/70 backdrop-blur-xl border-border"
            : "bg-background border-transparent"
        }`}
      >
        <div className="mx-auto max-w-[1400px] px-6 h-20 flex items-center justify-between gap-8">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <span className="font-display text-3xl tracking-tight italic">Tryfit</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-[13px] uppercase tracking-[0.14em] text-foreground/75">
            {NAV.map((n, i) => (
              <Link key={i} to={n.to} className="underline-grow smooth hover:text-foreground">
                {n.label}
              </Link>
            ))}
            <Link to="/shop" className="inline-flex items-center gap-1.5 text-foreground">
              <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
              AI Try-On
            </Link>
            <Link to="/orders" className="underline-grow smooth hover:text-foreground">
              Mis pedidos
            </Link>
          </nav>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex hover:bg-muted">
              <Search className="w-[18px] h-[18px]" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex hover:bg-muted relative"
              asChild
            >
              <Link to="/wishlist" aria-label="Wishlist">
                <Heart className="w-[18px] h-[18px]" />
                {wishlistCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-medium flex items-center justify-center"
                    style={{
                      background: "var(--accent)",
                      color: "var(--accent-foreground)",
                    }}
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </Button>

            {!loading && user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/account" className="flex items-center gap-2 hover:opacity-80 smooth">
                  {avatar ? (
                    <img src={avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {displayName?.charAt(0) ?? "?"}
                    </div>
                  )}
                  <span className="text-sm max-w-[120px] truncate hidden md:inline">{displayName}</span>
                </Link>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => void signOut()}>
                  Salir
                </Button>
              </div>
            ) : (
              !loading && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-muted"
                  onClick={() => void signInWithGoogle()}
                  aria-label="Iniciar sesión con Google"
                >
                  <User className="w-[18px] h-[18px]" />
                </Button>
              )
            )}

            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-muted"
              onClick={() => setOpen(true)}
              aria-label="Bolsa"
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              {count > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-medium flex items-center justify-center"
                  style={{
                    background: "var(--primary)",
                    color: "var(--primary-foreground)",
                  }}
                >
                  {count}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Menú"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-full sm:max-w-sm bg-background border-border p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
            <SheetTitle className="font-display text-2xl italic">Tryfit</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col px-6 py-6 gap-1 flex-1">
            {MOBILE_LINKS.map((link) => (
              <Link
                key={link.to + link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="py-3 text-sm uppercase tracking-[0.16em] border-b border-border/60 hover:text-foreground text-muted-foreground smooth"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/shop"
              onClick={() => setMobileOpen(false)}
              className="py-3 text-sm uppercase tracking-[0.16em] flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" style={{ color: "var(--accent)" }} />
              AI Try-On
            </Link>
          </nav>
          <div className="px-6 pb-8 border-t border-border pt-6">
            {user ? (
              <div className="space-y-3">
                <Link
                  to="/account"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3"
                >
                  {avatar ? (
                    <img src={avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {displayName?.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-medium truncate">{displayName}</span>
                </Link>
                <Button
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => {
                    void signOut();
                    setMobileOpen(false);
                  }}
                >
                  Cerrar sesión
                </Button>
              </div>
            ) : (
              <Button
                className="w-full rounded-full btn-primary-bg border-0"
                onClick={() => {
                  void signInWithGoogle();
                  setMobileOpen(false);
                }}
              >
                Continuar con Google
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

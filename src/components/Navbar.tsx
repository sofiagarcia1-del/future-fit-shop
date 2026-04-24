import { Link } from "@tanstack/react-router";
import { ShoppingBag, Search, Menu } from "lucide-react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { count, setOpen } = useCart();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-xs font-bold smooth group-hover:scale-110">T</div>
          <span className="font-display font-bold tracking-widest text-lg">TRYFIT</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link to="/shop" className="smooth hover:text-foreground" activeProps={{ className: "text-foreground" }}>Shop</Link>
          <Link to="/shop" search={{ category: "Outerwear" } as never} className="smooth hover:text-foreground">New</Link>
          <Link to="/shop" className="smooth hover:text-foreground">Collections</Link>
          <Link to="/shop" className="smooth hover:text-foreground">AI Stylist</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex"><Search className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen(true)}>
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center gradient-bg">{count}</span>
            )}
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden"><Menu className="w-5 h-5" /></Button>
        </div>
      </div>
    </header>
  );
}

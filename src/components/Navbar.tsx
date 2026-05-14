"use client";

import { Link } from "@tanstack/react-router";
import {
  ShoppingBag,
  Search,
  Menu,
  Heart,
  User,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { to: "/", label: "Inicio" },
  { to: "/shop", label: "Mujer" },
  { to: "/shop", label: "Hombre" },
  { to: "/shop", label: "Marcas" },
  { to: "/shop", label: "Categorías" },
];

export function Navbar() {
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  console.log("USER:", user);


  
  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:8081",
        skipBrowserRedirect: false,
      },
    });

  console.log("LOGIN DATA:", data);
  console.log("LOGIN ERROR:", error);
};
    const handleLogout = async () => {
      await supabase.auth.signOut();
    };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 smooth border-b ${
        scrolled
          ? "bg-background/70 backdrop-blur-xl border-border"
          : "bg-background border-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1400px] px-6 h-20 flex items-center justify-between gap-8">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <span className="font-display text-3xl tracking-tight italic">
            Tryfit
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-[13px] uppercase tracking-[0.14em] text-foreground/75">
          {NAV.map((n, i) => (
            <Link
              key={i}
              to={n.to}
              className="underline-grow smooth hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}

          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-foreground"
          >
            <Sparkles
              className="w-3.5 h-3.5"
              style={{ color: "var(--accent)" }}
            />
            AI Try-On
          </Link>

          <Link
            to="/shop"
            className="underline-grow smooth hover:text-foreground"
          >
            Mis pedidos
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex hover:bg-muted"
          >
            <Search className="w-[18px] h-[18px]" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex hover:bg-muted"
          >
            <Heart className="w-[18px] h-[18px]" />
          </Button>

          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <img
                src={user.user_metadata?.avatar_url}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />

              <span className="text-sm">
                {user.user_metadata?.full_name}
              </span>

              <Button
                variant="ghost"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex hover:bg-muted"
              onClick={handleGoogleLogin}
            >
              <User className="w-[18px] h-[18px]" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-muted"
            onClick={() => setOpen(true)}
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

          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
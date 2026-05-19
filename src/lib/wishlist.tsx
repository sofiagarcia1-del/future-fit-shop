import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "@/lib/products";
import { readStorage, writeStorage } from "@/lib/storage";

const STORAGE_KEY = "tryfit-wishlist";

type WishlistCtx = {
  items: Product[];
  toggle: (product: Product) => void;
  has: (id: string) => boolean;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
};

const Ctx = createContext<WishlistCtx | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    setItems(readStorage<Product[]>(STORAGE_KEY, []));
  }, []);

  useEffect(() => {
    writeStorage(STORAGE_KEY, items);
  }, [items]);

  const has = (id: string) => items.some((p) => p.id === id);

  const toggle = (product: Product) => {
    setItems((cur) =>
      cur.some((p) => p.id === product.id)
        ? cur.filter((p) => p.id !== product.id)
        : [...cur, product],
    );
  };

  const remove = (id: string) => setItems((cur) => cur.filter((p) => p.id !== id));
  const clear = () => setItems([]);

  return (
    <Ctx.Provider value={{ items, toggle, has, remove, clear, count: items.length }}>
      {children}
    </Ctx.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

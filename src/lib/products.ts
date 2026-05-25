import { fetchProductFromDb, fetchProductsFromDb } from "@/services/products.service";

import type { ProductAudience } from "@/services/types";

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  image: string;
  description: string;
  audience?: ProductAudience;
};

const CATALOG: Product[] = [
  { id: "1", name: "Trench de Lino Esencial", price: 289, category: "Chaquetas", brand: "Maison Lou", audience: "unisex", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=80", description: "Trench arquitectónico en mezcla técnica de lino. Silueta oversize con costuras invisibles." },
  { id: "2", name: "Camisa Sage Oversize", price: 149, category: "Camisas", brand: "Norra Studio", audience: "unisex", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&q=80", description: "Camisa fluida de algodón orgánico en tono sage. Corte relajado." },
  { id: "3", name: "Knit de Lana Crema", price: 159, category: "Hoodies", brand: "Atelier 6", audience: "men", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=80", description: "Punto pesado de merino mono-tono. Hombro caído relajado." },
  { id: "4", name: "Pantalón Wide Olive", price: 199, category: "Pantalones", brand: "Form&Co", audience: "unisex", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=900&q=80", description: "Pantalón wide-leg con bolsillos utility y bajo ajustable." },
  { id: "5", name: "Vestido Cami Almond", price: 219, category: "Vestidos", brand: "Maison Lou", audience: "women", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=900&q=80", description: "Vestido midi en satén almond con tirantes ajustables." },
  { id: "6", name: "Hoodie Cashmere Mist", price: 189, category: "Hoodies", brand: "Norra Studio", audience: "unisex", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&q=80", description: "Sudadera de cashmere brushed con bordado tonal." },
  { id: "7", name: "Chaqueta Suede Chamomile", price: 549, category: "Chaquetas", brand: "Atelier 6", audience: "men", image: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=900&q=80", description: "Chaqueta premium en ante. Corte cropped con cierre asimétrico." },
  { id: "8", name: "Pantalón Plisado Sand", price: 169, category: "Pantalones", brand: "Form&Co", audience: "unisex", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900&q=80", description: "Pantalón ancho a medida con pliegues marcados." },
];

export async function fetchProducts(): Promise<Product[]> {
  const fromDb = await fetchProductsFromDb();
  if (fromDb?.length) return fromDb;
  await new Promise((r) => setTimeout(r, 200));
  return CATALOG;
}

export async function fetchProduct(id: string): Promise<Product | undefined> {
  const fromDb = await fetchProductFromDb(id);
  if (fromDb) return fromDb;
  await new Promise((r) => setTimeout(r, 150));
  return CATALOG.find((p) => p.id === id);
}

export const BRANDS = ["Maison Lou", "Norra Studio", "Atelier 6", "Form&Co", "Kindred", "Solene", "Vela Ode"];
export const CATEGORIES = [
  { name: "Camisas", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=700&q=80" },
  { name: "Pantalones", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=700&q=80" },
  { name: "Vestidos", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=700&q=80" },
  { name: "Hoodies", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=700&q=80" },
  { name: "Chaquetas", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&q=80" },
  { name: "Zapatos", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80" },
  { name: "Accesorios", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80" },
];

import type { Product } from "@/lib/products";

export type SortOption =
  | "Destacados"
  | "Novedades"
  | "Precio: menor a mayor"
  | "Precio: mayor a menor";

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const list = [...products];
  switch (sort) {
    case "Precio: menor a mayor":
      return list.sort((a, b) => a.price - b.price);
    case "Precio: mayor a menor":
      return list.sort((a, b) => b.price - a.price);
    case "Novedades":
      return list.reverse();
    case "Destacados":
    default:
      return list;
  }
}

import type { Product } from "@/lib/products";
import type { StockValidation } from "@/services/types";

/** Inventario demo por ID de producto (sincronizado con catálogo 1–8). */
const DEMO_STOCK: Record<string, number> = {
  "1": 12,
  "2": 8,
  "3": 5,
  "4": 15,
  "5": 6,
  "6": 10,
  "7": 3,
  "8": 9,
};

const DEFAULT_STOCK = 10;

export function getAvailableStock(productId: string): number {
  return DEMO_STOCK[productId] ?? DEFAULT_STOCK;
}

export function isInStock(productId: string, requestedQty: number): boolean {
  return requestedQty <= getAvailableStock(productId);
}

export function validateCartStock(
  items: { product: Product; qty: number }[],
): StockValidation {
  const errors: StockValidation["errors"] = [];

  for (const { product, qty } of items) {
    const available = getAvailableStock(product.id);
    if (qty > available) {
      errors.push({
        productId: product.id,
        productName: product.name,
        requested: qty,
        available,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

export function getStockLabel(productId: string): string {
  const n = getAvailableStock(productId);
  if (n <= 3) return `Solo quedan ${n}`;
  if (n <= 8) return "Stock limitado";
  return "En stock";
}

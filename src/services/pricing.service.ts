import type { OrderPricing } from "@/services/types";

/** Envío gratis a partir de este subtotal (COP/USD demo según catálogo). */
export const FREE_SHIPPING_THRESHOLD = 200;

export const STANDARD_SHIPPING_COST = 12;

/** Descuento por volumen: 5% si subtotal >= 400, 10% si >= 600. */
export function calculateVolumeDiscount(subtotal: number): number {
  if (subtotal >= 600) return Math.round(subtotal * 0.1 * 100) / 100;
  if (subtotal >= 400) return Math.round(subtotal * 0.05 * 100) / 100;
  return 0;
}

export function calculateShipping(subtotal: number, discount: number): number {
  const afterDiscount = subtotal - discount;
  if (afterDiscount >= FREE_SHIPPING_THRESHOLD) return 0;
  return STANDARD_SHIPPING_COST;
}

export function calculateOrderPricing(
  items: { unitPrice: number; qty: number }[],
): OrderPricing {
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const discount = calculateVolumeDiscount(subtotal);
  const shipping = calculateShipping(subtotal, discount);
  const total = Math.round((subtotal - discount + shipping) * 100) / 100;
  const afterDiscount = subtotal - discount;
  const amountUntilFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - afterDiscount);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    shipping,
    discount,
    total,
    freeShippingApplied: shipping === 0 && subtotal > 0,
    amountUntilFreeShipping: Math.round(amountUntilFreeShipping * 100) / 100,
  };
}

export function formatPricingHint(pricing: OrderPricing): string | null {
  if (pricing.freeShippingApplied) return "Envío gratis aplicado";
  if (pricing.amountUntilFreeShipping <= 0) return null;
  return `Añade $${pricing.amountUntilFreeShipping} más para envío gratis`;
}

import type { Product } from "@/lib/products";

export type ProductAudience = "women" | "men" | "unisex";

export type ShopView = "all" | "brands" | "categories";

export type CatalogFilters = {
  audience?: "women" | "men";
  brand?: string;
  category?: string;
  query?: string;
};

export type CatalogResult = {
  products: Product[];
  total: number;
  appliedFilters: CatalogFilters;
};

export type BrandSummary = {
  name: string;
  productCount: number;
  slug: string;
};

export type CategorySummary = {
  name: string;
  productCount: number;
  image?: string;
};

export type OrderPricing = {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  freeShippingApplied: boolean;
  amountUntilFreeShipping: number;
};

export type StockValidation = {
  valid: boolean;
  errors: { productId: string; productName: string; requested: number; available: number }[];
};

export type AppNotification = {
  id: string;
  message: string;
  type: "order_update" | "promotion" | "system";
  sentAt: string;
  read: boolean;
};

import type { Product } from "@/lib/products";
import { fetchOrdersFromDb } from "@/services/orders.service";

export type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  items: { product: Product; qty: number }[];
};

export const MOCK_ORDERS: Order[] = [
  {
    id: "TF-24089",
    createdAt: "2026-05-02",
    status: "delivered",
    total: 438,
    items: [
      {
        product: {
          id: "1",
          name: "Trench de Lino Esencial",
          price: 289,
          category: "Chaquetas",
          brand: "Maison Lou",
          image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=80",
          description: "",
        },
        qty: 1,
      },
      {
        product: {
          id: "2",
          name: "Camisa Sage Oversize",
          price: 149,
          category: "Camisas",
          brand: "Norra Studio",
          image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&q=80",
          description: "",
        },
        qty: 1,
      },
    ],
  },
  {
    id: "TF-24102",
    createdAt: "2026-05-14",
    status: "shipped",
    total: 199,
    items: [
      {
        product: {
          id: "4",
          name: "Pantalón Wide Olive",
          price: 199,
          category: "Pantalones",
          brand: "Form&Co",
          image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=900&q=80",
          description: "",
        },
        qty: 1,
      },
    ],
  },
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  processing: "En preparación",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export async function fetchOrders(): Promise<Order[]> {
  const fromDb = await fetchOrdersFromDb();
  if (fromDb !== null) return fromDb;
  return MOCK_ORDERS;
}

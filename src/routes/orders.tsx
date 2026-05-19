import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import { fetchOrders, ORDER_STATUS_LABEL } from "@/lib/orders";
import { Badge } from "@/components/ui/badge";
import { isSupabaseConfigured } from "@/lib/db";

export const Route = createFileRoute("/orders")({
  loader: () => fetchOrders(),
  head: () => ({
    meta: [{ title: "Mis pedidos — Tryfit" }, { name: "description", content: "Historial de pedidos Tryfit." }],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  return (
    <RequireAuth>
      <OrdersContent />
    </RequireAuth>
  );
}

function OrdersContent() {
  const orders = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Pedidos</p>
      <h1 className="text-4xl md:text-6xl">
        Mis <span className="serif-italic">pedidos</span>
      </h1>
      <p className="mt-4 text-muted-foreground max-w-xl">
        {isSupabaseConfigured()
          ? "Historial sincronizado con tu cuenta Tryfit."
          : "Modo demo — conecta Supabase para ver pedidos reales."}
      </p>

      {orders.length === 0 ? (
        <p className="mt-12 text-muted-foreground text-sm">Aún no tienes pedidos.</p>
      ) : (
        <div className="mt-12 space-y-6">
          {orders.map((order) => (
            <article key={order.id} className="rounded-3xl bg-card p-6 md:p-8 card-shadow">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Pedido</p>
                  <p className="font-medium mt-1">{order.id}</p>
                  <p className="text-sm text-muted-foreground mt-1">{order.createdAt}</p>
                </div>
                <Badge variant="secondary" className="rounded-full uppercase tracking-wider text-[10px]">
                  {ORDER_STATUS_LABEL[order.status]}
                </Badge>
                <p className="font-display italic text-2xl tabular-nums">${order.total}</p>
              </div>

              <ul className="mt-6 space-y-4">
                {order.items.map(({ product, qty }) => (
                  <li key={`${order.id}-${product.id}`} className="flex gap-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-24 rounded-xl object-cover bg-muted"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {product.brand}
                      </p>
                      <Link
                        to="/product/$id"
                        params={{ id: product.id }}
                        className="text-sm hover:underline mt-0.5 block truncate"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cantidad: {qty} · ${product.price}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

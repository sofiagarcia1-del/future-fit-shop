import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";
import { createOrderInDb } from "@/services/orders.service";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured } from "@/lib/db";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [{ title: "Checkout — Tryfit" }, { name: "description", content: "Finaliza tu compra en Tryfit." }],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  if (items.length === 0 && !done) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="text-muted-foreground">Tu bolsa está vacía.</p>
        <Button asChild className="mt-6 rounded-full btn-primary-bg border-0">
          <Link to="/shop">Ir a la tienda</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const address = String(fd.get("address") ?? "").trim();
    if (!address) return;

    setSubmitting(true);

    if (isSupabaseConfigured() && user) {
      const created = await createOrderInDb({
        address,
        paymentMethod: "card",
        items: items.map(({ product, qty }) => ({
          productId: product.id,
          qty,
          unitPrice: product.price,
        })),
      });
      if (created) setOrderId(created.orderId);
    } else {
      await new Promise((r) => setTimeout(r, 800));
    }

    clear();
    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center animate-fade-up">
        <CheckCircle2 className="w-14 h-14 mx-auto mb-6" style={{ color: "var(--olive)" }} />
        <h1 className="text-3xl md:text-4xl">Pedido confirmado</h1>
        {orderId && <p className="mt-2 text-sm font-medium">{orderId}</p>}
        <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
          {orderId
            ? "Tu pedido quedó registrado. Puedes seguirlo en Mis pedidos."
            : "Gracias por tu compra. Inicia sesión y conecta Supabase para guardar pedidos en la base de datos."}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button className="rounded-full btn-primary-bg border-0" onClick={() => navigate({ to: "/orders" })}>
            Ver mis pedidos
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/shop">Seguir comprando</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Checkout</p>
      <h1 className="text-4xl md:text-5xl">
        Finalizar <span className="serif-italic">compra</span>
      </h1>

      <div className="mt-12 grid lg:grid-cols-2 gap-12">
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6 rounded-3xl bg-card p-8 card-shadow">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input id="firstName" name="firstName" required className="rounded-xl" placeholder="María" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellidos</Label>
              <Input id="lastName" name="lastName" required className="rounded-xl" placeholder="García" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required className="rounded-xl" placeholder="maria@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" name="address" required className="rounded-xl" placeholder="Calle, número, ciudad" />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-full btn-primary-bg border-0 text-sm uppercase tracking-[0.16em]"
          >
            {submitting ? "Procesando…" : `Pagar $${total}`}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {isSupabaseConfigured() && user
              ? "El pedido se guardará en tu cuenta Tryfit."
              : "Modo demo — inicia sesión con Supabase para persistir pedidos."}
          </p>
        </form>

        <aside className="rounded-3xl bg-card p-8 card-shadow h-fit">
          <h2 className="text-lg font-medium mb-6">Resumen</h2>
          <ul className="space-y-4">
            {items.map(({ product, qty }) => (
              <li key={product.id} className="flex gap-3 text-sm">
                <img src={product.image} alt="" className="w-16 h-20 rounded-lg object-cover bg-muted" />
                <div className="flex-1">
                  <p>{product.name}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    ×{qty} · ${product.price * qty}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-6 border-t border-border flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-display italic text-2xl tabular-nums">${total}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

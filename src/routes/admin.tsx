import { createFileRoute } from "@tanstack/react-router";
import { fetchProducts } from "@/lib/products";
import { RequireAuth } from "@/components/RequireAuth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, ShoppingBag, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/admin")({
  loader: () => fetchProducts(),
  head: () => ({
    meta: [{ title: "Admin — Tryfit" }, { name: "description", content: "Panel administrativo Tryfit." }],
  }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <RequireAuth>
      <AdminContent />
    </RequireAuth>
  );
}

function AdminContent() {
  const products = Route.useLoaderData();

  const stats = [
    { label: "Productos", value: String(products.length), icon: Package },
    { label: "Pedidos (mock)", value: "2", icon: ShoppingBag },
    { label: "Try-Ons hoy", value: "—", icon: Sparkles },
    { label: "Usuarios", value: "—", icon: Users },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Administración</p>
      <h1 className="text-4xl md:text-5xl">
        Panel <span className="serif-italic">Tryfit</span>
      </h1>
      <p className="mt-4 text-sm text-muted-foreground max-w-xl">
        Vista previa del backoffice. Las métricas reales llegarán con la base de datos.
      </p>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-card p-6 card-shadow flex items-start justify-between"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{s.label}</p>
              <p className="mt-2 font-display italic text-3xl">{s.value}</p>
            </div>
            <s.icon className="w-5 h-5 text-muted-foreground" />
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-3xl bg-card p-6 md:p-8 card-shadow overflow-x-auto">
        <h2 className="text-xl mb-6">Catálogo</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Precio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.id}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.brand}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell className="text-right tabular-nums">${p.price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { fetchUserTryOnHistory, pollTryOnStatusApi } from "@/services/try-on.api";
import type { TryOnResult } from "@/types/try-on";
import { Sparkles, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/db";

export const Route = createFileRoute("/try-ons")({
  head: () => ({
    meta: [
      { title: "Mis Try-On — Tryfit" },
      { name: "description", content: "Historial de Virtual Try-On con FASHN AI." },
    ],
  }),
  component: TryOnsPage,
});

const STATUS_LABEL = {
  processing: "Procesando",
  completed: "Completado",
  failed: "Fallido",
} as const;

function TryOnsPage() {
  return (
    <RequireAuth>
      <TryOnsContent />
    </RequireAuth>
  );
}

function TryOnsContent() {
  const [items, setItems] = useState<TryOnResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<TryOnResult | null>(null);

  const loadHistory = useCallback(async () => {
    const rows = await fetchUserTryOnHistory();
    setItems(rows);
    setSelected((prev) => {
      if (!prev) return null;
      return rows.find((r) => r.id === prev.id) ?? prev;
    });
    return rows;
  }, []);

  useEffect(() => {
    void loadHistory().finally(() => setLoading(false));
  }, [loadHistory]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  useEffect(() => {
    const processing = items.filter((i) => i.status === "processing");
    if (!processing.length) return;

    let cancelled = false;

    const tick = async () => {
      for (const item of processing) {
        if (cancelled) return;
        try {
          const status = await pollTryOnStatusApi(item.id);
          if (status.status !== "processing") {
            await loadHistory();
            return;
          }
        } catch {
          /* siguiente ciclo */
        }
      }
    };

    void tick();
    const interval = setInterval(() => void tick(), 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [items, loadHistory]);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-12 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Virtual Try-On</p>
          <h1 className="text-4xl md:text-6xl">
            Mis <span className="serif-italic">Try-On</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl text-sm">
            {isSupabaseConfigured()
              ? "Prendas que probaste con FASHN AI. Las URLs generadas pueden expirar en ~72h en el CDN de FASHN."
              : "Conecta Supabase para ver tu historial."}
          </p>
        </div>
        {items.length > 0 && (
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={refreshing}
            onClick={() => void refresh()}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-12 text-center py-24 rounded-3xl bg-card card-shadow">
          <Sparkles className="w-10 h-10 mx-auto mb-4" style={{ color: "var(--accent)" }} />
          <p className="text-muted-foreground text-sm">Aún no has generado ningún try-on.</p>
          <Button asChild className="mt-6 rounded-full btn-primary-bg border-0">
            <Link to="/shop">Explorar colección</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-12 grid lg:grid-cols-[1fr_380px] gap-8">
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className={`w-full text-left rounded-3xl bg-card p-4 md:p-5 card-shadow flex gap-4 smooth hover-lift ${
                    selected?.id === item.id ? "ring-2 ring-foreground/20" : ""
                  }`}
                >
                  <img
                    src={item.generatedImage ?? item.garmentImage}
                    alt=""
                    className="w-20 h-24 rounded-xl object-cover bg-muted shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {item.productBrand ?? "Tryfit"}
                    </p>
                    <p className="font-medium truncate">{item.productName ?? `Producto #${item.productId}`}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.createdAt}</p>
                    <Badge variant="secondary" className="mt-2 rounded-full text-[10px] uppercase">
                      {STATUS_LABEL[item.status]}
                      {item.status === "processing" && (
                        <Loader2 className="inline h-3 w-3 ml-1 animate-spin" />
                      )}
                    </Badge>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <aside className="rounded-3xl bg-card p-6 card-shadow h-fit sticky top-28">
            {selected ? (
              <TryOnDetail item={selected} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">Selecciona un resultado para ver el detalle.</p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function TryOnDetail({ item }: { item: TryOnResult }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">{item.productName ?? `Producto #${item.productId}`}</h2>
      {item.status === "failed" && (
        <div className="flex gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {item.errorMessage ?? "Generación fallida"}
        </div>
      )}
      {item.status === "processing" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generando con FASHN AI…
        </div>
      )}
      {item.generatedImage ? (
        <img src={item.generatedImage} alt="Resultado" className="w-full rounded-2xl object-cover aspect-[3/4] bg-muted" />
      ) : (
        <div className="aspect-[3/4] rounded-2xl bg-muted flex items-center justify-center text-sm text-muted-foreground">
          {item.status === "processing" ? "Aún procesando…" : "Sin imagen"}
        </div>
      )}
      {item.productId && (
        <Button asChild variant="outline" className="w-full rounded-full">
          <Link to="/product/$id" params={{ id: String(item.productId) }}>
            Ver producto
          </Link>
        </Button>
      )}
    </div>
  );
}

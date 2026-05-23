import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert } from "lucide-react";
import { checkIsAdmin } from "@/services/admin.service";
import { isSupabaseConfigured } from "@/lib/db";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AdminGate>{children}</AdminGate>
    </RequireAuth>
  );
}

function AdminGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      if (!isSupabaseConfigured()) {
        if (mounted) {
          setAllowed(false);
          setLoading(false);
        }
        return;
      }
      const ok = await checkIsAdmin();
      if (mounted) {
        setAllowed(ok);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center animate-fade-up">
        <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Administración</p>
        <h1 className="mt-3 text-3xl md:text-4xl">
          Acceso <span className="serif-italic">restringido</span>
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          {isSupabaseConfigured()
            ? "Tu cuenta no tiene rol de administrador. Asigna el rol admin en Supabase (tabla rol_x_user) para acceder al panel."
            : "Conecta Supabase y configura un usuario con rol admin para usar el panel."}
        </p>
        <Button asChild className="mt-8 rounded-full h-12 px-8 btn-primary-bg border-0">
          <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

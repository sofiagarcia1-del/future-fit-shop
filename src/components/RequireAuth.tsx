import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center animate-fade-up">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Acceso</p>
        <h1 className="mt-3 text-3xl md:text-4xl">
          Inicia sesión para <span className="serif-italic">continuar</span>
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Conecta tu cuenta de Google para ver tu perfil, pedidos y sincronizar tu experiencia.
        </p>
        <Button
          className="mt-8 rounded-full h-12 px-8 btn-primary-bg border-0"
          onClick={() => void signInWithGoogle()}
        >
          Continuar con Google
        </Button>
        <p className="mt-6 text-xs text-muted-foreground">
          <Link to="/shop" className="underline-grow">
            Volver a la tienda
          </Link>
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

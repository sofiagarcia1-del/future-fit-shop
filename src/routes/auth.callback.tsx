import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const goAccount = () => {
      if (!cancelled) navigate({ to: "/account", replace: true });
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        goAccount();
      }
    });

    const finish = async () => {
      // PKCE: ?code= en query
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (!error) {
          goAccount();
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!error && data.session) {
        goAccount();
        return;
      }

      // Último intento tras detectSessionInUrl
      await new Promise((r) => setTimeout(r, 500));
      const retry = await supabase.auth.getSession();
      if (cancelled) return;
      goAccount();
      if (!retry.data.session) {
        console.warn("[Tryfit] OAuth callback sin sesión. Revisa Redirect URLs en Supabase.");
      }
    };

    void finish();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Completando inicio de sesión…</p>
    </div>
  );
}

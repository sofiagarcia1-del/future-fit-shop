import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Upload, Loader2, RotateCcw, Download, Share2, UserCircle2, AlertCircle } from "lucide-react";
import type { Product } from "@/lib/products";
import { useTryOn } from "@/hooks/useTryOn";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function TryOnModal({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  product: Product;
}) {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [compare, setCompare] = useState(50);
  const {
    uiStatus,
    photo,
    result,
    errorMessage,
    loadingProfile,
    canUseApi,
    reset,
    loadProfilePhoto,
    handleFile,
    runTryOn,
    saveResult,
  } = useTryOn(product);

  const handleClose = (o: boolean) => {
    onOpenChange(o);
    if (!o) {
      reset();
      setCompare(50);
    }
  };

  const isGenerating = uiStatus === "generating" || uiStatus === "uploading";
  const hasGarment = Boolean(product.image?.trim());

  if (!authLoading && !user) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display">
              Inicia sesión para <span className="serif-italic">probar</span>
            </DialogTitle>
            <DialogDescription>
              Virtual Try-On con FASHN AI requiere una cuenta Tryfit para guardar tus resultados de forma segura.
            </DialogDescription>
          </DialogHeader>
          <Button className="rounded-full btn-primary-bg border-0" onClick={() => void signInWithGoogle()}>
            Continuar con Google
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl bg-background border-border p-0 overflow-hidden">
        <div className="px-8 pt-8 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
              <Sparkles className="w-3 h-3" style={{ color: "var(--accent)" }} /> FASHN AI · Tryfit
            </div>
            <DialogTitle className="text-3xl font-display">
              Probar cómo me <span className="serif-italic">queda</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {product.name} — Sube una foto de cuerpo entero o usa tu foto de perfil.
            </DialogDescription>
          </DialogHeader>
        </div>

        {!hasGarment && (
          <div className="mx-8 mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Este producto no tiene imagen compatible para try-on.
          </div>
        )}

        {!canUseApi && (
          <div className="mx-8 mb-4 rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
            Configura Supabase y <code className="text-foreground">FASHN_API_KEY</code> en el servidor para activar FASHN AI.
          </div>
        )}

        {errorMessage && uiStatus === "error" && (
          <div className="mx-8 mb-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-3 px-8">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-muted relative">
            {hasGarment ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Skeleton className="w-full h-full" />
            )}
            <span className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]">
              Prenda
            </span>
          </div>

          <div className="aspect-[3/4] rounded-2xl bg-muted relative overflow-hidden flex items-center justify-center">
            {!photo && !isGenerating && (
              <div className="flex flex-col items-center gap-4 p-6 text-center">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex flex-col items-center gap-3 text-muted-foreground hover:text-foreground smooth"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: "var(--accent)" }}
                  >
                    <Upload className="w-6 h-6 text-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Subir foto</span>
                  <span className="text-xs">JPG · PNG · WebP · máx. 5MB</span>
                </button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full text-xs"
                  disabled={loadingProfile}
                  onClick={() => void loadProfilePhoto()}
                >
                  {loadingProfile ? (
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  ) : (
                    <UserCircle2 className="w-3.5 h-3.5 mr-2" />
                  )}
                  Usar foto del perfil
                </Button>
              </div>
            )}

            {photo && !result && !isGenerating && (
              <img src={photo} alt="Tu foto" className="w-full h-full object-cover" />
            )}

            {photo && isGenerating && (
              <>
                <img src={photo} alt="Tu foto" className="w-full h-full object-cover opacity-50" />
                <div className="absolute inset-0 backdrop-blur-sm flex flex-col items-center justify-center gap-4 bg-background/50">
                  <Loader2 className="w-10 h-10 animate-spin" style={{ color: "var(--olive)" }} />
                  <p className="text-sm font-medium">Generando con FASHN AI…</p>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">20–120 segundos</p>
                  <Skeleton className="w-48 h-1 rounded-full" />
                </div>
              </>
            )}

            {photo && result && uiStatus === "success" && (
              <div className="relative w-full h-full select-none">
                <img src={photo} alt="Antes" className="absolute inset-0 w-full h-full object-cover" />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - compare}% 0 0)` }}
                >
                  <img src={result} alt="Try-on generado" className="w-full h-full object-cover" />
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={compare}
                  onChange={(e) => setCompare(Number(e.target.value))}
                  className="absolute inset-x-0 bottom-4 mx-auto w-[80%] accent-foreground"
                  aria-label="Comparar antes y después"
                />
                <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]">
                  Antes
                </div>
                <div
                  className="absolute top-3 right-3 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] flex items-center gap-1"
                  style={{ background: "var(--accent)" }}
                >
                  <Sparkles className="w-3 h-3" /> Resultado
                </div>
              </div>
            )}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />

        <div className="flex gap-2 justify-between items-center px-8 py-6 border-t border-border mt-2 bg-card/50 flex-wrap">
          <div className="flex gap-3 items-center">
            {(photo || result) && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground smooth"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Volver a intentar
              </button>
            )}
            <Link
              to="/try-ons"
              className="text-xs uppercase tracking-[0.16em] text-muted-foreground underline-grow"
              onClick={() => handleClose(false)}
            >
              Mis Try-On
            </Link>
          </div>
          <div className="flex gap-2 flex-wrap">
            {result && uiStatus === "success" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-foreground/20"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = result;
                    a.download = `tryfit-${product.id}.png`;
                    a.target = "_blank";
                    a.click();
                  }}
                >
                  <Download className="w-4 h-4 mr-1.5" /> Descargar
                </Button>
                <Button type="button" variant="outline" className="rounded-full border-foreground/20" onClick={() => void saveResult()}>
                  Guardar resultado
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full border-foreground/20"
                  onClick={() => void shareResult(result, product.name)}
                >
                  <Share2 className="w-4 h-4 mr-1.5" /> Compartir
                </Button>
              </>
            )}
            {photo && !result && (
              <Button
                onClick={() => void runTryOn()}
                disabled={isGenerating || !hasGarment || !canUseApi}
                className={cn("rounded-full h-11 px-6 btn-primary-bg border-0 hover:opacity-90")}
              >
                <Sparkles className="w-4 h-4 mr-2" style={{ color: "var(--accent)" }} />
                {isGenerating ? "Procesando…" : "Probar cómo me queda"}
              </Button>
            )}
            {!photo && (
              <Button onClick={() => inputRef.current?.click()} className="rounded-full h-11 px-6 btn-primary-bg border-0">
                <Upload className="w-4 h-4 mr-2" /> Elegir foto
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

async function shareResult(resultUrl: string, productName: string) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Tryfit — ${productName}`,
        text: "Mi Virtual Try-On",
        url: resultUrl,
      });
    } catch {
      /* cancelled */
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(resultUrl);
  } catch {
    /* unavailable */
  }
}

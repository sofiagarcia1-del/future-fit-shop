import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Upload, Loader2, RotateCcw, Download, Share2 } from "lucide-react";
import type { Product } from "@/lib/products";

export function TryOnModal({
  open, onOpenChange, product,
}: { open: boolean; onOpenChange: (o: boolean) => void; product: Product }) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [compare, setCompare] = useState(50);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const runTryOn = () => {
    setProcessing(true);
    setProgress(0);
    const start = Date.now();
    const interval = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / 2400);
      setProgress(Math.round(t * 100));
      if (t >= 1) {
        clearInterval(interval);
        setResult(photo);
        setProcessing(false);
      }
    }, 80);
  };

  const reset = () => { setPhoto(null); setResult(null); setProcessing(false); setProgress(0); setCompare(50); };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-4xl bg-background border-border p-0 overflow-hidden">
        <div className="px-8 pt-8 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
              <Sparkles className="w-3 h-3" style={{ color: "var(--accent)" }} /> Tryfit AI
            </div>
            <DialogTitle className="text-3xl font-display">
              Pruébate <span className="serif-italic">{product.name}</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Sube una foto frontal de cuerpo entero. Mejor con luz natural y fondo neutro.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="grid md:grid-cols-2 gap-3 px-8">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-muted relative">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            <span className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]">Prenda</span>
          </div>

          <div className="aspect-[3/4] rounded-2xl bg-muted relative overflow-hidden flex items-center justify-center">
            {!photo && (
              <button
                onClick={() => inputRef.current?.click()}
                className="flex flex-col items-center gap-3 text-muted-foreground hover:text-foreground smooth p-6"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "var(--accent)" }}>
                  <Upload className="w-6 h-6 text-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground mt-2">Sube tu foto</span>
                <span className="text-xs">JPG o PNG · cuerpo entero</span>
              </button>
            )}
            {photo && !result && !processing && (
              <img src={photo} alt="Preview" className="w-full h-full object-cover" />
            )}
            {photo && processing && (
              <>
                <img src={photo} alt="Preview" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 backdrop-blur-sm flex flex-col items-center justify-center gap-4 bg-background/40">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-border" />
                    <Loader2 className="absolute inset-0 m-auto w-8 h-8 animate-spin" style={{ color: "var(--olive)" }} />
                  </div>
                  <p className="text-sm font-medium">Generando tu try-on…</p>
                  <div className="w-48 h-1 rounded-full bg-border overflow-hidden">
                    <div className="h-full smooth" style={{ width: `${progress}%`, background: "var(--primary)" }} />
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{progress}%</p>
                </div>
              </>
            )}
            {photo && result && (
              <div className="relative w-full h-full select-none">
                <img src={photo} alt="Antes" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - compare}% 0 0)` }}>
                  <img src={result} alt="Después" className="w-full h-full object-cover" />
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={compare}
                  onChange={(e) => setCompare(Number(e.target.value))}
                  className="absolute inset-x-0 bottom-4 mx-auto w-[80%] accent-foreground"
                />
                <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]">Antes</div>
                <div className="absolute top-3 right-3 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] flex items-center gap-1" style={{ background: "var(--accent)" }}>
                  <Sparkles className="w-3 h-3" /> Después
                </div>
              </div>
            )}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <div className="flex gap-2 justify-between items-center px-8 py-6 border-t border-border mt-2 bg-card/50">
          <div>
            {photo && (
              <button onClick={reset} className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground smooth">
                <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {result && (
              <>
                <Button variant="outline" className="rounded-full border-foreground/20"><Download className="w-4 h-4 mr-1.5" /> Descargar</Button>
                <Button variant="outline" className="rounded-full border-foreground/20"><Share2 className="w-4 h-4 mr-1.5" /> Compartir</Button>
              </>
            )}
            {photo && !result && (
              <Button onClick={runTryOn} disabled={processing} className="rounded-full h-11 px-6 btn-primary-bg border-0 hover:opacity-90">
                <Sparkles className="w-4 h-4 mr-2" style={{ color: "var(--accent)" }} />
                {processing ? "Procesando…" : "Generar Try-On"}
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

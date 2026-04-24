import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Upload, Loader2, RotateCcw } from "lucide-react";
import type { Product } from "@/lib/products";

export function TryOnModal({
  open, onOpenChange, product,
}: { open: boolean; onOpenChange: (o: boolean) => void; product: Product }) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
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
    // Simulated AI processing — replace with real model call
    setTimeout(() => {
      setResult(photo);
      setProcessing(false);
    }, 2200);
  };

  const reset = () => { setPhoto(null); setResult(null); setProcessing(false); };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-3xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-primary" /> AI Try-On — {product.name}
          </DialogTitle>
          <DialogDescription>Upload a full-body photo to preview this piece on you.</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 mt-2">
          <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div className="aspect-[3/4] rounded-xl glass relative overflow-hidden flex items-center justify-center">
            {!photo && (
              <button
                onClick={() => inputRef.current?.click()}
                className="flex flex-col items-center gap-3 text-muted-foreground hover:text-foreground smooth p-6"
              >
                <div className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center animate-pulse-glow">
                  <Upload className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-sm">Upload your photo</span>
                <span className="text-xs">JPG or PNG, full body works best</span>
              </button>
            )}
            {photo && (
              <>
                <img src={result ?? photo} alt="Preview" className="w-full h-full object-cover" />
                {processing && (
                  <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm">Synthesizing fit…</p>
                  </div>
                )}
                {result && !processing && (
                  <div className="absolute top-3 left-3 glass px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-secondary" /> AI preview
                  </div>
                )}
              </>
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

        <div className="flex gap-2 justify-end mt-2">
          {photo && (
            <Button variant="ghost" onClick={reset}>
              <RotateCcw className="w-4 h-4 mr-1.5" /> Reset
            </Button>
          )}
          {photo && !result && (
            <Button onClick={runTryOn} disabled={processing} className="gradient-bg border-0">
              <Sparkles className="w-4 h-4 mr-1.5" /> {processing ? "Processing…" : "Generate Try-On"}
            </Button>
          )}
          {!photo && (
            <Button onClick={() => inputRef.current?.click()} className="gradient-bg border-0">
              <Upload className="w-4 h-4 mr-1.5" /> Choose photo
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

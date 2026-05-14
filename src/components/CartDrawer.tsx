import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";

export function CartDrawer() {
  const { items, open, setOpen, setQty, remove, total, clear } = useCart();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="bg-background border-border flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-2xl font-display"><ShoppingBag className="w-5 h-5" /> Tu bolsa</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {items.length === 0 && (
            <div className="text-center text-muted-foreground py-20 text-sm">Tu bolsa está vacía.</div>
          )}
          {items.map(({ product, qty }) => (
            <div key={product.id} className="flex gap-4">
              <img src={product.image} alt={product.name} className="w-24 h-32 rounded-xl object-cover bg-muted" />
              <div className="flex-1">
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{product.category}</p>
                    <p className="text-sm mt-0.5">{product.name}</p>
                  </div>
                  <button onClick={() => remove(product.id)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 rounded-full border border-border px-1 py-0.5">
                    <button className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center" onClick={() => setQty(product.id, qty - 1)}><Minus className="w-3 h-3" /></button>
                    <span className="text-xs w-5 text-center tabular-nums">{qty}</span>
                    <button className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center" onClick={() => setQty(product.id, qty + 1)}><Plus className="w-3 h-3" /></button>
                  </div>
                  <p className="text-sm font-medium tabular-nums">${product.price * qty}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums">${total}</span>
            </div>
            <p className="text-xs text-muted-foreground">Envío e impuestos calculados al pagar.</p>
            <Button className="w-full h-12 rounded-full btn-primary-bg border-0 text-sm uppercase tracking-[0.16em]">Ir al checkout</Button>
            <button onClick={clear} className="text-xs text-muted-foreground hover:text-foreground w-full">Vaciar bolsa</button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

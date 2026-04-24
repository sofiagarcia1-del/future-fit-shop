import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";

export function CartDrawer() {
  const { items, open, setOpen, setQty, remove, total, clear } = useCart();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="bg-card border-border flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2"><ShoppingBag className="w-5 h-5" /> Your Bag</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 mt-4 space-y-4">
          {items.length === 0 && (
            <div className="text-center text-muted-foreground py-16 text-sm">Your bag is empty.</div>
          )}
          {items.map(({ product, qty }) => (
            <div key={product.id} className="flex gap-3">
              <img src={product.image} alt={product.name} className="w-20 h-24 rounded-lg object-cover" />
              <div className="flex-1">
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  <button onClick={() => remove(product.id)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 glass rounded-full px-1 py-0.5">
                    <button className="w-6 h-6 rounded-full hover:bg-accent flex items-center justify-center" onClick={() => setQty(product.id, qty - 1)}><Minus className="w-3 h-3" /></button>
                    <span className="text-xs w-4 text-center">{qty}</span>
                    <button className="w-6 h-6 rounded-full hover:bg-accent flex items-center justify-center" onClick={() => setQty(product.id, qty + 1)}><Plus className="w-3 h-3" /></button>
                  </div>
                  <p className="text-sm font-semibold">${product.price * qty}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border pt-4 mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">${total}</span>
            </div>
            <Button className="w-full gradient-bg border-0">Checkout</Button>
            <button onClick={clear} className="text-xs text-muted-foreground hover:text-foreground w-full">Clear bag</button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

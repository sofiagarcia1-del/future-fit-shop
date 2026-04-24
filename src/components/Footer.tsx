export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-xs font-bold">T</div>
            <span className="font-display font-bold tracking-widest">TRYFIT</span>
          </div>
          <p className="text-muted-foreground">Fashion meets intelligence. Try anything, anywhere.</p>
        </div>
        {[
          { t: "Shop", l: ["New", "Outerwear", "Knitwear", "Bottoms"] },
          { t: "Help", l: ["Shipping", "Returns", "Size guide", "Contact"] },
          { t: "Company", l: ["About", "Careers", "Press", "Sustainability"] },
        ].map((c) => (
          <div key={c.t}>
            <h4 className="font-semibold mb-3">{c.t}</h4>
            <ul className="space-y-2 text-muted-foreground">
              {c.l.map((i) => <li key={i} className="hover:text-foreground smooth cursor-pointer">{i}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TRYFIT. All rights reserved.
      </div>
    </footer>
  );
}

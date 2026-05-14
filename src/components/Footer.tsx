export function Footer() {
  return (
    <footer className="border-t border-border mt-32 bg-card/50">
      <div className="mx-auto max-w-[1400px] px-6 py-16 grid grid-cols-2 md:grid-cols-5 gap-10 text-sm">
        <div className="col-span-2">
          <span className="font-display italic text-3xl">Tryfit</span>
          <p className="mt-4 text-muted-foreground max-w-xs leading-relaxed">
            Multimarca · Moda impulsada por IA. Pruébate cualquier prenda antes de comprarla.
          </p>
        </div>
        {[
          { t: "Tienda", l: ["Mujer", "Hombre", "Marcas", "Novedades"] },
          { t: "Ayuda", l: ["Envíos", "Devoluciones", "Guía de tallas", "Contacto"] },
          { t: "Tryfit", l: ["Sobre nosotros", "AI Try-On", "Sostenibilidad", "Prensa"] },
        ].map((c) => (
          <div key={c.t}>
            <h4 className="text-xs uppercase tracking-[0.18em] mb-4 font-medium">{c.t}</h4>
            <ul className="space-y-2.5 text-muted-foreground">
              {c.l.map((i) => (
                <li key={i} className="hover:text-foreground smooth cursor-pointer">{i}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground tracking-wider">
        © {new Date().getFullYear()} TRYFIT · Crafted with AI for fashion
      </div>
    </footer>
  );
}

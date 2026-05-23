import { Link } from "@tanstack/react-router";

const FOOTER_COLS = [
  {
    t: "Tienda",
    links: [
      { label: "Mujer", to: "/shop" as const },
      { label: "Hombre", to: "/shop" as const },
      { label: "Marcas", to: "/shop" as const },
      { label: "Novedades", to: "/shop" as const },
    ],
  },
  {
    t: "Ayuda",
    links: [
      { label: "Envíos", to: "/shop" as const },
      { label: "Devoluciones", to: "/shop" as const },
      { label: "Guía de tallas", to: "/shop" as const },
      { label: "Contacto", to: "/shop" as const },
    ],
  },
  {
    t: "Tryfit",
    links: [
      { label: "Mi cuenta", to: "/account" as const },
      { label: "AI Try-On", to: "/shop" as const },
      { label: "Mis Try-On", to: "/try-ons" as const },
      { label: "Mis pedidos", to: "/orders" as const },
      { label: "Admin", to: "/admin" as const },
    ],
  },
];

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
        {FOOTER_COLS.map((c) => (
          <div key={c.t}>
            <h4 className="text-xs uppercase tracking-[0.18em] mb-4 font-medium">{c.t}</h4>
            <ul className="space-y-2.5 text-muted-foreground">
              {c.links.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="hover:text-foreground smooth">
                    {item.label}
                  </Link>
                </li>
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

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
};

// Curated catalog (uses Unsplash REST images). In production swap fetchProducts
// to call your backend REST API.
const CATALOG: Product[] = [
  { id: "1", name: "Neo Trench Coat", price: 289, category: "Outerwear", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=80", description: "An architectural trench cut from technical wool blend. Oversized silhouette with hidden seams." },
  { id: "2", name: "Chrome Bomber", price: 349, category: "Outerwear", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900&q=80", description: "Metallic-finish bomber with ribbed cuffs. A statement layer for after-dark." },
  { id: "3", name: "Mono Knit Sweater", price: 159, category: "Knitwear", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=80", description: "Heavy-gauge merino sweater in mono-tone. Relaxed drop shoulder." },
  { id: "4", name: "Pixel Cargo Pants", price: 199, category: "Bottoms", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=900&q=80", description: "Wide-leg cargo with utility pockets and adjustable hem." },
  { id: "5", name: "Linear Tee", price: 79, category: "Tops", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&q=80", description: "Boxy heavyweight cotton tee with embossed wordmark." },
  { id: "6", name: "Vector Hoodie", price: 189, category: "Tops", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&q=80", description: "Brushed-fleece hoodie with tonal embroidery." },
  { id: "7", name: "Onyx Leather Jacket", price: 549, category: "Outerwear", image: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=900&q=80", description: "Premium lambskin jacket. Cropped fit with asymmetric zip." },
  { id: "8", name: "Grid Wide Trousers", price: 169, category: "Bottoms", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900&q=80", description: "Tailored wide-leg trousers with sharp pleats." },
];

export async function fetchProducts(): Promise<Product[]> {
  // Simulated REST call — replace with: const r = await fetch(API_URL); return r.json();
  await new Promise((r) => setTimeout(r, 200));
  return CATALOG;
}

export async function fetchProduct(id: string): Promise<Product | undefined> {
  await new Promise((r) => setTimeout(r, 150));
  return CATALOG.find((p) => p.id === id);
}

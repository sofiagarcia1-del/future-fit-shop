/** Tipos para bindings de Cloudflare Workers (secrets + vars del dashboard). */
declare module "cloudflare:workers" {
  export const env: Record<string, string | undefined>;
}

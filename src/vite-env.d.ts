/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  /** Clave publishable (recomendada). Formato: sb_publishable_... */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /** Clave anon JWT (legacy); se usa si no hay publishable key */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

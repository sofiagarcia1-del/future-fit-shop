# Tryfit — Future Fit Shop

Tienda multimarca con **Virtual Try-On** (demo), catálogo, carrito, wishlist, checkout y panel admin. Stack: React 19, TanStack Start/Router, Tailwind CSS 4, Supabase (Auth + PostgreSQL).

## Requisitos

- Node.js 20+
- Cuenta [Supabase](https://supabase.com) (opcional; sin ella corre en modo demo con catálogo local)

## Configuración

1. Clona e instala dependencias:

```bash
npm install
```

2. Copia variables de entorno:

```bash
cp .env.example .env
```

3. En `.env` define:

| Variable | Descripción |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave publishable (`sb_publishable_...`) — recomendada |
| `VITE_SUPABASE_ANON_KEY` | Clave anon JWT (opcional, legacy) |
| `VITE_APP_URL` | Origen de la app (ej. `http://localhost:8081`) para OAuth Google |
| `FASHN_API_KEY` | Clave API FASHN (solo servidor, nunca `VITE_`) |
| `FASHN_BASE_URL` | Base API (default `https://api.fashn.ai/v1`) |

4. Aplica migraciones SQL en Supabase (SQL Editor o CLI):

- `supabase/migrations/20250519100000_initial_schema.sql`
- `supabase/migrations/20250519100001_seed_data.sql`
- `supabase/migrations/20250519200000_rls_policies.sql`
- `supabase/migrations/20250519200001_auth_user_sync.sql`
- `supabase/migrations/20250520100000_try_on_results.sql`
- `supabase/migrations/20250520110000_user_photos_storage.sql`

5. En Supabase → Authentication → Providers, activa **Google** y añade la URL de callback:

`{VITE_APP_URL}/auth/callback`

6. (Opcional) Usuario admin: tras el primer login, asigna rol `admin` en `rol_x_user` para el `id` de `public.users`.

## Scripts

| Comando | Acción |
|---------|--------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build producción (cliente + SSR Cloudflare) |
| `npm run preview` | Vista previa del build |
| `npm run lint` | ESLint |

## Arquitectura

```
src/
  routes/          # Páginas (TanStack file-based routing)
  components/      # UI y bloques reutilizables
  features/auth/   # AuthProvider + OAuth Google
  services/        # Acceso Supabase (products, orders, users, admin)
  lib/             # Catálogo fallback, carrito, wishlist, utilidades
supabase/migrations/  # Esquema relacional + RLS + seeds
```

- **Catálogo**: vista `product_catalog` en Postgres; fallback a array local si Supabase no está configurado.
- **Pedidos**: tablas `orders` + `product_x_order` con RLS por usuario.
- **Auth**: Supabase Auth (Google) → trigger/RPC sincroniza `public.users` y rol `customer`.
- **Try-On**: FASHN AI (`tryon-max`) vía rutas servidor `/api/try-on`; historial en `try_on_result`.

## Despliegue

El proyecto incluye configuración **Cloudflare Workers** (`wrangler.jsonc`). Tras `npm run build`, despliega el artefacto en `dist/server` según tu flujo TanStack Start / Wrangler.

## Virtual Try-On (FASHN AI)

1. Configura `FASHN_API_KEY` en `.env` (el servidor la lee en runtime; no se expone al navegador).
2. En la ficha de producto, pulsa **Probar cómo me queda**.
3. Sube foto o usa foto de perfil (`user_photo.photofront_url`).
4. El servidor llama a FASHN (`POST /v1/run` + polling `GET /v1/status/{id}`) y guarda el resultado en Supabase.
5. Revisa el historial en **Mis Try-On** (`/try-ons`).

**Endpoints internos**

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/try-on` | Estado de configuración (`fashnConfigured`, sin auth) |
| POST | `/api/try-on` | Inicia generación (Bearer Supabase JWT) |
| GET | `/api/try-on/:id` | Consulta estado / continúa polling |
| PATCH | `/api/try-on/:id` | Marca `saved: true` |

## Licencia

Proyecto académico / demo — revisa dependencias de terceros antes de uso comercial.

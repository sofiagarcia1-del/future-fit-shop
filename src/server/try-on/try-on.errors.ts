export class TryOnDbError extends Error {
  constructor(
    message: string,
    public readonly status: number = 503,
    public readonly code: string = "DB",
  ) {
    super(message);
    this.name = "TryOnDbError";
  }
}

export function mapDbErrorMessage(raw: string): TryOnDbError {
  const lower = raw.toLowerCase();

  if (lower.includes("try_on_result") && (lower.includes("does not exist") || lower.includes("schema cache"))) {
    return new TryOnDbError(
      "Tabla try_on_result no existe. Ejecuta la migración supabase/migrations/20250520100000_try_on_results.sql en Supabase.",
      503,
      "MIGRATION",
    );
  }

  if (lower.includes('estado "completed"') || lower.includes('estado "failed"')) {
    return new TryOnDbError(
      'Estados "completed" o "failed" no encontrados. Ejecuta la migración 20250520100000_try_on_results.sql.',
      503,
      "MIGRATION",
    );
  }

  if (lower.includes("row-level security") || lower.includes("rls")) {
    return new TryOnDbError(
      "No se pudo guardar el try-on (permisos RLS). Verifica que tu usuario esté sincronizado en public.users.",
      403,
      "RLS",
    );
  }

  return new TryOnDbError(raw, 503, "DB");
}

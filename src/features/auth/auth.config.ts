/**
 * URL base para OAuth. En el navegador usa siempre el origen actual
 * (Cloudflare, localhost, etc.) para no depender de un build con VITE_APP_URL antiguo.
 */
export function getAppUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  const fromEnv = import.meta.env.VITE_APP_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  return "http://localhost:8081";
}

export function getAuthCallbackUrl(): string {
  return `${getAppUrl()}/auth/callback`;
}

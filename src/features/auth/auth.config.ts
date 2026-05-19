/** Base app URL for OAuth redirects. Prefer VITE_APP_URL in all environments. */
export function getAppUrl(): string {
  const fromEnv = import.meta.env.VITE_APP_URL;
  if (fromEnv && typeof fromEnv === "string") {
    return fromEnv.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:8081";
}

export function getAuthCallbackUrl(): string {
  return `${getAppUrl()}/auth/callback`;
}

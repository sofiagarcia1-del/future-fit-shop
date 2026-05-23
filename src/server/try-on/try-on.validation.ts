import { z } from "zod";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export const startTryOnBodySchema = z
  .object({
    productId: z.string().min(1).max(20),
    userImage: z.string().min(32).optional(),
    userImageUrl: z.string().url().optional(),
    source: z.enum(["upload", "profile"]).default("upload"),
  })
  .refine((d) => Boolean(d.userImage || d.userImageUrl), {
    message: "Se requiere imagen del usuario",
  });

export type StartTryOnBody = z.infer<typeof startTryOnBodySchema>;

export function validateUserImageDataUrl(dataUrl: string): { mime: string; base64Payload: string } {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/i.exec(dataUrl.trim());
  if (!match) {
    throw new ValidationError("La imagen debe ser JPG, PNG o WebP en formato base64 válido");
  }

  const mime = match[1].toLowerCase();
  if (!ALLOWED_MIME.has(mime)) {
    throw new ValidationError("Tipo de imagen no permitido");
  }

  const base64Payload = match[2];
  const approxBytes = Math.ceil((base64Payload.length * 3) / 4);
  if (approxBytes > MAX_IMAGE_BYTES) {
    throw new ValidationError(`La imagen supera el máximo de ${MAX_IMAGE_BYTES / (1024 * 1024)}MB`);
  }

  return { mime, base64Payload };
}

export function toFashnImageRef(dataUrl: string): string {
  validateUserImageDataUrl(dataUrl);
  return dataUrl.trim();
}

function validateHttpsImageUrl(url: string, label: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    throw new ValidationError(`${label} no disponible`);
  }
  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new ValidationError(`${label} inválida`);
    }
  } catch {
    throw new ValidationError(`${label} inválida`);
  }
  return trimmed;
}

export function validateGarmentImageUrl(url: string): string {
  return validateHttpsImageUrl(url, "URL de prenda");
}

export function validateUserImageUrl(url: string): string {
  return validateHttpsImageUrl(url, "URL de foto del usuario");
}

/** Evita guardar data URLs completas en Postgres (privacidad y límite varchar). */
export function persistOriginalUserImageRef(body: StartTryOnBody): string {
  if (body.userImage?.startsWith("data:")) {
    return `[upload:${body.source}]`;
  }
  if (body.userImageUrl) {
    return body.userImageUrl.trim().slice(0, 3000);
  }
  return "";
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

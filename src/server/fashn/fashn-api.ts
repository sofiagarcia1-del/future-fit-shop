import { getFashnApiKey, getFashnBaseUrl, isFashnConfigured } from "@/server/env";
import type { FashnRunResponse, FashnStatusResponse, FashnTryOnInputs } from "@/server/fashn/fashn.types";

const RUN_TIMEOUT_MS = 30_000;
const STATUS_TIMEOUT_MS = 15_000;
const DEFAULT_POLL_INTERVAL_MS = 3_000;
const DEFAULT_MAX_POLL_MS = 120_000;

function extractFashnError(data: {
  error?: { name?: string; message?: string } | string | null;
  message?: string;
}): string | null {
  if (typeof data.error === "object" && data.error?.message) {
    return data.error.message;
  }
  if (typeof data.error === "string" && data.error) {
    return data.message ?? data.error;
  }
  if (data.message) {
    return data.message;
  }
  return null;
}

function extractOutputUrl(output: unknown): string | undefined {
  if (Array.isArray(output)) {
    return typeof output[0] === "string" ? output[0] : undefined;
  }
  if (output && typeof output === "object") {
    const images = (output as { images?: unknown }).images;
    if (Array.isArray(images) && typeof images[0] === "string") {
      return images[0];
    }
  }
  return undefined;
}

export class FashnApiError extends Error {
  constructor(
    message: string,
    public readonly code: string = "FASHN_ERROR",
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "FashnApiError";
  }
}

function authHeaders(): HeadersInit {
  const key = getFashnApiKey();
  if (!key) throw new FashnApiError("FASHN_API_KEY no configurada", "CONFIG");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new FashnApiError(`Respuesta inválida de FASHN (${res.status})`, "PARSE", res.status);
  }
}

export async function startTryOnPrediction(inputs: FashnTryOnInputs): Promise<string> {
  if (!isFashnConfigured()) {
    throw new FashnApiError("Integración FASHN no configurada", "CONFIG");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RUN_TIMEOUT_MS);

  try {
    const res = await fetch(`${getFashnBaseUrl()}/run`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        model_name: "tryon-max",
        inputs: {
          ...inputs,
          resolution: "1k",
          generation_mode: "balanced",
          output_format: "png",
          return_base64: false,
        },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text();
      throw new FashnApiError(
        body || `FASHN /run falló (${res.status})`,
        res.status === 401 ? "UNAUTHORIZED" : "RUN_FAILED",
        res.status,
      );
    }

    const data = await parseJson<FashnRunResponse & { message?: string; error?: unknown }>(res);
    const runErr = extractFashnError(data);
    if (runErr) {
      throw new FashnApiError(runErr, "RUN_ERROR");
    }
    if (!data.id) {
      throw new FashnApiError("FASHN no devolvió prediction id", "RUN_ERROR");
    }
    return data.id;
  } catch (err) {
    if (err instanceof FashnApiError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new FashnApiError("Timeout al iniciar try-on en FASHN", "TIMEOUT");
    }
    throw new FashnApiError(err instanceof Error ? err.message : "Error de red con FASHN", "NETWORK");
  } finally {
    clearTimeout(timer);
  }
}

export async function getPredictionStatus(predictionId: string): Promise<FashnStatusResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STATUS_TIMEOUT_MS);

  try {
    const res = await fetch(`${getFashnBaseUrl()}/status/${predictionId}`, {
      method: "GET",
      headers: authHeaders(),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new FashnApiError(`FASHN status falló (${res.status})`, "STATUS_FAILED", res.status);
    }

    return await parseJson<FashnStatusResponse>(res);
  } catch (err) {
    if (err instanceof FashnApiError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new FashnApiError("Timeout consultando estado FASHN", "TIMEOUT");
    }
    throw new FashnApiError(err instanceof Error ? err.message : "Error de red con FASHN", "NETWORK");
  } finally {
    clearTimeout(timer);
  }
}

const ACTIVE_STATUSES = new Set(["starting", "in_queue", "processing"]);

export type PollResult =
  | { status: "completed"; outputUrl: string }
  | { status: "failed"; message: string }
  | { status: "processing" };

export async function pollPrediction(
  predictionId: string,
  maxMs: number = DEFAULT_MAX_POLL_MS,
  intervalMs: number = DEFAULT_POLL_INTERVAL_MS,
): Promise<PollResult> {
  const deadline = Date.now() + maxMs;

  while (Date.now() < deadline) {
    const data = await getPredictionStatus(predictionId);

    if (data.status === "completed") {
      const url = extractOutputUrl(data.output);
      if (!url) {
        throw new FashnApiError("FASHN completó sin URL de salida", "NO_OUTPUT");
      }
      return { status: "completed", outputUrl: url };
    }

    if (data.status === "failed") {
      return {
        status: "failed",
        message: data.error?.message ?? "La generación falló en FASHN",
      };
    }

    if (!ACTIVE_STATUSES.has(data.status)) {
      return { status: "processing" };
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  return { status: "processing" };
}

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/lib/products";
import {
  fetchPrimaryUserPhotoUrl,
  saveTryOnResultApi,
  startTryOnApi,
  urlToDataUrl,
  waitForTryOnCompletion,
} from "@/services/try-on.api";
import type { TryOnUiStatus } from "@/types/try-on";
import { fetchTryOnServerConfig, formatTryOnConfigHint } from "@/lib/try-on-config";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export function useTryOn(product: Product) {
  const [uiStatus, setUiStatus] = useState<TryOnUiStatus>("idle");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoSource, setPhotoSource] = useState<"upload" | "profile" | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [tryOnId, setTryOnId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [canUseApi, setCanUseApi] = useState(false);
  const [configHint, setConfigHint] = useState<string | null>(null);

  useEffect(() => {
    void fetchTryOnServerConfig().then((cfg) => {
      setCanUseApi(cfg.supabaseConfigured && cfg.fashnConfigured);
      setConfigHint(formatTryOnConfigHint(cfg) || null);
    });
  }, []);

  const reset = useCallback(() => {
    setUiStatus("idle");
    setPhoto(null);
    setPhotoSource(null);
    setResult(null);
    setTryOnId(null);
    setErrorMessage(null);
  }, []);

  const loadProfilePhoto = useCallback(async () => {
    setLoadingProfile(true);
    setErrorMessage(null);
    try {
      const url = await fetchPrimaryUserPhotoUrl();
      if (!url) {
        setErrorMessage("No tienes foto guardada en tu perfil. Sube una en Mi cuenta o elige un archivo.");
        return;
      }
      setProfilePhotoUrl(url);
      const dataUrl = await urlToDataUrl(url);
      setPhoto(dataUrl);
      setPhotoSource("profile");
      setResult(null);
      setUiStatus("idle");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "No se pudo cargar la foto del perfil");
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    setErrorMessage(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMessage("Solo JPG, PNG o WebP");
      return;
    }
    if (file.size > MAX_BYTES) {
      setErrorMessage("La imagen no puede superar 5MB");
      return;
    }
    setUiStatus("uploading");
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
      setPhotoSource("upload");
      setResult(null);
      setUiStatus("idle");
    };
    reader.onerror = () => {
      setErrorMessage("No se pudo leer el archivo");
      setUiStatus("error");
    };
    reader.readAsDataURL(file);
  }, []);

  const runTryOn = useCallback(async () => {
    if (!product.image?.trim()) {
      setErrorMessage("Este producto no tiene imagen válida para try-on");
      setUiStatus("error");
      return;
    }
    if (!photo || !photoSource) {
      setErrorMessage("Selecciona o sube una foto primero");
      return;
    }
    if (!canUseApi) {
      setErrorMessage("Configura Supabase y FASHN_API_KEY en el servidor para generar try-on real");
      setUiStatus("error");
      return;
    }

    setUiStatus("generating");
    setErrorMessage(null);
    setResult(null);

    try {
      const startPayload =
        photoSource === "profile" && profilePhotoUrl
          ? {
              productId: product.id,
              userImageUrl: profilePhotoUrl,
              source: "profile" as const,
            }
          : {
              productId: product.id,
              userImage: photo,
              source: "upload" as const,
            };

      const started = await startTryOnApi(startPayload);
      setTryOnId(started.tryOnId);

      if (started.status === "completed" && started.generatedImage) {
        setResult(started.generatedImage);
        setUiStatus("success");
        return;
      }

      if (started.status === "failed") {
        setErrorMessage(started.errorMessage ?? "La generación falló");
        setUiStatus("error");
        return;
      }

      const final = await waitForTryOnCompletion(started.tryOnId);
      if (final.status === "completed" && final.generatedImage) {
        setResult(final.generatedImage);
        setUiStatus("success");
        return;
      }

      if (final.status === "failed") {
        setErrorMessage(final.errorMessage ?? "La generación falló");
        setUiStatus("error");
        return;
      }

      setErrorMessage(final.errorMessage ?? "Sigue procesando. Revisa Mis Try-On más tarde.");
      setUiStatus("error");
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Error al generar try-on");
      setUiStatus("error");
    }
  }, [canUseApi, photo, photoSource, product.id, product.image, profilePhotoUrl]);

  const saveResult = useCallback(async () => {
    if (!tryOnId) return;
    try {
      await saveTryOnResultApi(tryOnId);
      toast.success("Resultado guardado en tu historial");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "No se pudo guardar";
      setErrorMessage(msg);
      toast.error(msg);
    }
  }, [tryOnId]);

  return {
    uiStatus,
    photo,
    photoSource,
    result,
    tryOnId,
    errorMessage,
    loadingProfile,
    canUseApi,
    configHint,
    reset,
    loadProfilePhoto,
    handleFile,
    runTryOn,
    saveResult,
  };
}

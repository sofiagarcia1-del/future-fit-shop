import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, UserCircle2 } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/db";
import { fetchPrimaryUserPhotoUrl, uploadPrimaryUserPhoto } from "@/services/user-photo.service";

export function AccountPhotoUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    void fetchPrimaryUserPhotoUrl().then((url) => {
      setPhotoUrl(url);
      setLoading(false);
    });
  }, []);

  if (!isSupabaseConfigured()) return null;

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadPrimaryUserPhoto(file);
      setPhotoUrl(url);
      toast.success("Foto de perfil guardada para Virtual Try-On");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo subir la foto");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-card p-8 card-shadow space-y-4">
      <div>
        <h2 className="text-xl">Foto para Try-On</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Foto de cuerpo entero, frontal. Se usa en &quot;Usar foto del perfil&quot; al probar prendas.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="w-32 aspect-[3/4] rounded-2xl bg-muted overflow-hidden shrink-0 flex items-center justify-center">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : photoUrl ? (
            <img src={photoUrl} alt="Tu foto de perfil" className="w-full h-full object-cover" />
          ) : (
            <UserCircle2 className="h-10 w-10 text-muted-foreground" />
          )}
        </div>

        <div className="space-y-3 flex-1">
          <Label htmlFor="profile-photo" className="text-sm">
            JPG · PNG · WebP · máx. 5MB
          </Label>
          <input
            ref={inputRef}
            id="profile-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {photoUrl ? "Cambiar foto" : "Subir foto"}
          </Button>
        </div>
      </div>
    </div>
  );
}

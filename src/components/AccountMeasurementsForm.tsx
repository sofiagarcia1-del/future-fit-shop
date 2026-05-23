import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchCurrentUserProfile, updateCurrentUserProfile } from "@/services/users.service";
import type { DbUser } from "@/types/database";
import { isSupabaseConfigured } from "@/lib/db";

export function AccountMeasurementsForm() {
  const [profile, setProfile] = useState<DbUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void fetchCurrentUserProfile().then(setProfile);
  }, []);

  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-muted-foreground rounded-2xl bg-card p-6 card-shadow">
        Conecta Supabase y ejecuta las migraciones para guardar medidas corporales (AI Try-On).
      </p>
    );
  }

  if (!profile) {
    return <p className="text-sm text-muted-foreground">Cargando perfil…</p>;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    setSaved(false);

    const updated = await updateCurrentUserProfile({
      first_name: String(fd.get("first_name") ?? ""),
      last_name: String(fd.get("last_name") ?? ""),
      phone: String(fd.get("phone") ?? "") || null,
      height: numOrNull(fd.get("height")),
      weight: numOrNull(fd.get("weight")),
      chest: numOrNull(fd.get("chest")),
      waist: numOrNull(fd.get("waist")),
      hips: numOrNull(fd.get("hips")),
    });

    setSaving(false);
    if (updated) {
      setProfile(updated);
      setSaved(true);
      toast.success("Perfil actualizado");
    } else {
      toast.error("No se pudo guardar el perfil");
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="rounded-3xl bg-card p-8 card-shadow space-y-6">
      <div>
        <h2 className="text-xl">Perfil y medidas</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Datos del modelo — usados para mejorar el Virtual Try-On.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Nombre</Label>
          <Input id="first_name" name="first_name" defaultValue={profile.first_name} className="rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Apellidos</Label>
          <Input id="last_name" name="last_name" defaultValue={profile.last_name} className="rounded-xl" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} className="rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {(
          [
            ["height", "Altura (cm)"],
            ["weight", "Peso (kg)"],
            ["chest", "Pecho (cm)"],
            ["waist", "Cintura (cm)"],
            ["hips", "Cadera (cm)"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              name={key}
              type="number"
              step="0.1"
              defaultValue={profile[key] ?? ""}
              className="rounded-xl"
            />
          </div>
        ))}
      </div>

      <Button type="submit" disabled={saving} className="rounded-full btn-primary-bg border-0">
        {saving ? "Guardando…" : "Guardar cambios"}
      </Button>
      {saved && <p className="text-xs text-muted-foreground">Perfil actualizado.</p>}
    </form>
  );
}

function numOrNull(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

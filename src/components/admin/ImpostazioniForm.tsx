"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { salvaImpostazioni } from "@/app/admin/actions";
import { IconCheck, IconUpload } from "@/components/ui/Icons";
import { supabaseBrowser } from "@/lib/supabase/client";
import { STORAGE_BUCKET, STORAGE_PUBLIC_URL } from "@/lib/supabase/env";
import type { Impostazioni } from "@/lib/types";

function Campo({ label, k, form, set, placeholder, hint, type = "text" }: { label: string; k: string; form: Impostazioni; set: (k: string, v: string) => void; placeholder?: string; hint?: string; type?: string }) {
  return (
    <div>
      <label className="label" htmlFor={`imp-${k}`}>
        {label}
      </label>
      <input id={`imp-${k}`} type={type} className="input" value={form[k] ?? ""} onChange={(e) => set(k, e.target.value)} placeholder={placeholder} />
      {hint && <p className="mt-1 text-[12px] text-muted">{hint}</p>}
    </div>
  );
}

export default function ImpostazioniForm({ iniziali }: { iniziali: Impostazioni }) {
  const router = useRouter();
  const [form, setForm] = useState<Impostazioni>({ ...iniziali });
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const uploadHero = async (file: File) => {
    setUploading(true);
    setMsg(null);
    try {
      const imageCompression = (await import("browser-image-compression")).default;
      const blob = await imageCompression(file, { maxWidthOrHeight: 2400, maxSizeMB: 1.8, fileType: "image/jpeg", initialQuality: 0.86, useWebWorker: true });
      const path = `sito/hero-${Date.now()}.jpg`;
      const { error } = await supabaseBrowser().storage.from(STORAGE_BUCKET).upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
      if (error) throw new Error(error.message);
      set("hero_image", `${STORAGE_PUBLIC_URL}/${path}`);
    } catch (e) {
      setMsg({ ok: false, text: `Caricamento fallito: ${e instanceof Error ? e.message : "errore"}` });
    } finally {
      setUploading(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const r = await salvaImpostazioni(form);
      setMsg(r.ok ? { ok: true, text: "Impostazioni salvate. Il sito si aggiorna in pochi secondi." } : { ok: false, text: r.error });
      if (r.ok) router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {msg && <div className={`rounded-xl px-4 py-3 text-sm ${msg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>{msg.text}</div>}

      <section className="card p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-navy">Homepage</h2>
        <p className="mt-1 text-[13.5px] text-muted">La grande foto di apertura e i testi che la accompagnano.</p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div>
            <label className="label">Foto di copertina</label>
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-sand">
              {form.hero_image && <Image src={form.hero_image} alt="" fill sizes="600px" className="object-cover" />}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <label className={`btn btn-outline btn-sm cursor-pointer ${uploading ? "opacity-60" : ""}`}>
                <IconUpload size={15} /> {uploading ? "Caricamento…" : "Carica una foto"}
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => e.target.files?.[0] && uploadHero(e.target.files[0])} />
              </label>
            </div>
            <input className="input mt-3" value={form.hero_image ?? ""} onChange={(e) => set("hero_image", e.target.value)} placeholder="oppure incolla l'URL di una foto" />
          </div>
          <div className="space-y-4">
            <Campo label="Titolo" k="hero_titolo" form={form} set={set} placeholder="L'arte di trovare casa" />
            <div>
              <label className="label" htmlFor="imp-hero_sottotitolo">
                Sottotitolo
              </label>
              <textarea id="imp-hero_sottotitolo" className="input min-h-[90px]" value={form.hero_sottotitolo ?? ""} onChange={(e) => set("hero_sottotitolo", e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-navy">Recensioni Google</h2>
        <p className="mt-1 text-[13.5px] text-muted">Il badge con il voto compare in homepage, nel footer e nella pagina contatti. I link portano alle recensioni su Google.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Campo label="Voto (es. 5,0)" k="google_rating" form={form} set={set} placeholder="5,0" />
          <Campo label="Numero recensioni" k="google_reviews_count" form={form} set={set} placeholder="72" />
          <Campo label="Link alle recensioni Google" k="google_reviews_url" form={form} set={set} placeholder="https://www.google.com/…" hint="Da Google Maps → la tua scheda → Recensioni → Condividi." />
          <Campo label="Link “Scrivi una recensione”" k="google_write_review_url" form={form} set={set} placeholder="https://g.page/r/…/review" hint="Dal profilo dell'attività su Google: “Ricevi altre recensioni”." />
          <Campo label="Link scheda Google Maps" k="google_maps_url" form={form} set={set} placeholder="https://maps.google.com/?cid=…" />
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-navy">Social</h2>
        <p className="mt-1 text-[13.5px] text-muted">Lascia vuoto il campo per nascondere l&apos;icona.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Campo label="Instagram" k="social_instagram" form={form} set={set} placeholder="https://www.instagram.com/…" />
          <Campo label="Facebook" k="social_facebook" form={form} set={set} placeholder="https://www.facebook.com/…" />
          <Campo label="YouTube" k="social_youtube" form={form} set={set} placeholder="https://www.youtube.com/@…" />
          <Campo label="TikTok" k="social_tiktok" form={form} set={set} placeholder="https://www.tiktok.com/@…" />
          <Campo label="LinkedIn" k="social_linkedin" form={form} set={set} placeholder="https://www.linkedin.com/company/…" />
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-navy">Portali</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Campo label="Email agenzia su Immobiliare.it" k="immobiliare_agency_email" form={form} set={set} placeholder="info@…" hint="L'indirizzo con cui l'agenzia è registrata su Immobiliare.it (identifica l'agenzia nel feed)." />
          <Campo label="Pagina agenzia su Immobiliare.it" k="immobiliare_agency_url" form={form} set={set} placeholder="https://www.immobiliare.it/agenzie-immobiliari/…" />
          <Campo label="Pagina agenzia su idealista" k="idealista_agency_url" form={form} set={set} placeholder="https://www.idealista.it/pro/…" />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending || uploading} className="btn btn-primary">
          {pending ? "Salvataggio…" : "Salva impostazioni"}
        </button>
        {msg?.ok && <IconCheck size={18} className="text-green-600" />}
      </div>
    </form>
  );
}

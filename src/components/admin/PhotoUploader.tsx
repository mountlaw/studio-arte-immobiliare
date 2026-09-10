"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { IconChevronLeft, IconChevronRight, IconStar, IconTrash, IconUpload } from "@/components/ui/Icons";
import { supabaseBrowser } from "@/lib/supabase/client";
import { STORAGE_BUCKET, STORAGE_PUBLIC_URL } from "@/lib/supabase/env";

const MAX_DIM = 2048;

/** Converte HEIC/HEIF (foto iPhone) in JPEG e comprime tutto a max 2048px. */
async function preparaFoto(file: File): Promise<Blob> {
  let blob: Blob = file;
  const isHeic = /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
  if (isHeic) {
    const heic2any = (await import("heic2any")).default;
    const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
    blob = Array.isArray(out) ? out[0] : out;
  }
  const imageCompression = (await import("browser-image-compression")).default;
  const compressed = await imageCompression(new File([blob], file.name, { type: blob.type || "image/jpeg" }), {
    maxWidthOrHeight: MAX_DIM,
    maxSizeMB: 1.5,
    fileType: "image/jpeg",
    initialQuality: 0.86,
    useWebWorker: true,
  });
  return compressed;
}

export default function PhotoUploader({ value, onChange }: { value: string[]; onChange: (urls: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [urlInput, setUrlInput] = useState("");

  async function upload(files: File[]) {
    if (!files.length) return;
    setBusy(true);
    setError("");
    const supabase = supabaseBrowser();
    const nuove: string[] = [];
    let i = 0;
    for (const file of files) {
      i++;
      setProgress(`Caricamento ${i} di ${files.length}…`);
      try {
        const blob = await preparaFoto(file);
        const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
        const path = `immobili/${name}`;
        const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
        if (error) throw new Error(error.message);
        nuove.push(`${STORAGE_PUBLIC_URL}/${path}`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "errore";
        setError((prev) => `${prev ? prev + " · " : ""}${file.name}: ${msg.includes("row-level security") || msg.includes("policy") ? "permesso negato (utente non autorizzato)" : msg}`);
      }
    }
    if (nuove.length) onChange([...value, ...nuove]);
    setProgress("");
    setBusy(false);
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length || from === to) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (dragIndex !== null) return;
          upload(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/") || /\.hei[cf]$/i.test(f.name)));
        }}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${dragOver ? "border-gold bg-gold/10" : "border-line bg-cream"}`}
      >
        <IconUpload size={26} className="text-navy/60" />
        <p className="mt-2 text-sm text-ink">
          Trascina qui le foto oppure{" "}
          <button type="button" onClick={() => inputRef.current?.click()} className="font-semibold text-navy underline underline-offset-2" disabled={busy}>
            scegli dal computer / telefono
          </button>
        </p>
        <p className="mt-1 text-[12px] text-muted">JPG, PNG, HEIC (iPhone). Le foto vengono ridimensionate e convertite automaticamente. Puoi selezionarne molte insieme.</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          className="hidden"
          onChange={(e) => {
            upload(Array.from(e.target.files || []));
            e.target.value = "";
          }}
        />
        {busy && <p className="mt-3 text-sm font-medium text-navy">{progress}</p>}
      </div>

      {error && <div className="rounded-xl bg-red-50 px-4 py-2.5 text-[13px] text-red-700">{error}</div>}

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {value.map((url, i) => (
            <div
              key={url + i}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (dragIndex !== null) move(dragIndex, i);
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              className={`group relative aspect-[4/3] overflow-hidden rounded-xl bg-sand ring-2 ${i === 0 ? "ring-gold" : "ring-transparent"} ${dragIndex === i ? "opacity-50" : ""}`}
            >
              <Image src={url} alt="" fill sizes="200px" className="object-cover" unoptimized={url.toLowerCase().endsWith(".heic")} />
              {i === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy-deep">Copertina</span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
                <button type="button" onClick={() => move(i, i - 1)} className="rounded-full bg-white/90 p-1 text-navy disabled:opacity-40" disabled={i === 0} title="Sposta a sinistra">
                  <IconChevronLeft size={14} />
                </button>
                {i !== 0 && (
                  <button type="button" onClick={() => move(i, 0)} className="rounded-full bg-white/90 p-1 text-navy" title="Usa come copertina">
                    <IconStar size={14} />
                  </button>
                )}
                <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded-full bg-white/90 p-1 text-red-600" title="Rimuovi">
                  <IconTrash size={14} />
                </button>
                <button type="button" onClick={() => move(i, i + 1)} className="rounded-full bg-white/90 p-1 text-navy disabled:opacity-40" disabled={i === value.length - 1} title="Sposta a destra">
                  <IconChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-[12px] text-muted">
        {value.length} foto · la prima è la copertina. Trascina le miniature per riordinare.
      </p>

      <div className="flex gap-2">
        <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="Oppure incolla l'URL di una foto già online…" className="input" />
        <button
          type="button"
          className="btn btn-outline btn-sm shrink-0"
          onClick={() => {
            const u = urlInput.trim();
            if (/^https?:\/\//.test(u)) {
              onChange([...value, u]);
              setUrlInput("");
            }
          }}
        >
          Aggiungi
        </button>
      </div>
    </div>
  );
}

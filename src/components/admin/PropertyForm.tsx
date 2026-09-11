"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { salvaImmobile } from "@/app/admin/actions";
import PhotoUploader from "./PhotoUploader";
import { IconCheck, IconExternal, IconX } from "@/components/ui/Icons";
import { CARATTERISTICHE_SUGGERITE, CATEGORIE, CLASSI_ENERGETICHE, CONDIZIONI, RISCALDAMENTI } from "@/lib/config";
import type { Immobile, ImmobileInput } from "@/lib/types";
import { formatNumber, immobileHref } from "@/lib/utils";

const VUOTO: ImmobileInput = {
  codice: "",
  titolo: "",
  tipo: "vendita",
  categoria: "Appartamento",
  locali: 0,
  camere: 0,
  bagni: 0,
  mq: 0,
  prezzo: 0,
  citta: "",
  zona: "",
  indirizzo: "",
  cap: "",
  provincia: "",
  piano: "",
  anno: null,
  stato: "Buono",
  classe_energetica: "In corso",
  riscaldamento: "Autonomo",
  descrizione: "",
  caratteristiche: [],
  immagini: [],
  video_url: "",
  spese_condominiali: null,
  latitudine: null,
  longitudine: null,
  mostra_indirizzo: false,
  evidenza: false,
  pubblicato: false,
  disponibile: true,
  pubblica_portali: true,
  data_inserimento: new Date().toISOString().slice(0, 10),
};

function Field({ label, children, hint, className = "" }: { label: string; children: React.ReactNode; hint?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[12px] text-muted">{hint}</p>}
    </div>
  );
}

export default function PropertyForm({ immobile, cittaSuggerite = [] }: { immobile: Immobile | null; cittaSuggerite?: string[] }) {
  const router = useRouter();
  const [form, setForm] = useState<ImmobileInput>(immobile ? { ...immobile } : { ...VUOTO });
  const [prezzoText, setPrezzoText] = useState(immobile?.prezzo ? formatNumber(immobile.prezzo) : "");
  const [nuovaCar, setNuovaCar] = useState("");
  const [pending, startTransition] = useTransition();
  const [errore, setErrore] = useState("");
  const [salvato, setSalvato] = useState<Immobile | null>(null);

  const set = <K extends keyof ImmobileInput>(k: K, v: ImmobileInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const num = (v: string) => (v === "" ? 0 : Number(v));

  const classi = CLASSI_ENERGETICHE.includes(form.classe_energetica as (typeof CLASSI_ENERGETICHE)[number]) || !form.classe_energetica ? [...CLASSI_ENERGETICHE] : [form.classe_energetica, ...CLASSI_ENERGETICHE];
  const condizioni = CONDIZIONI.includes(form.stato as (typeof CONDIZIONI)[number]) || !form.stato ? [...CONDIZIONI] : [form.stato, ...CONDIZIONI];
  const categorie = CATEGORIE.includes(form.categoria as (typeof CATEGORIE)[number]) ? [...CATEGORIE] : [form.categoria, ...CATEGORIE];

  const addCar = (c: string) => {
    const v = c.trim();
    if (!v || form.caratteristiche.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    set("caratteristiche", [...form.caratteristiche, v]);
    setNuovaCar("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrore("");
    startTransition(async () => {
      const r = await salvaImmobile(immobile?.id ?? null, form);
      if (!r.ok) {
        setErrore(r.error);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setSalvato(r.data ?? null);
      if (!immobile && r.data) {
        router.replace(`/admin/immobili/${r.data.id}?salvato=1`);
      } else {
        router.refresh();
        setTimeout(() => setSalvato(null), 4000);
      }
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {errore && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errore}</div>}
      {salvato && (
        <div className="flex items-center gap-3 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
          <IconCheck size={18} /> Annuncio salvato.
          {salvato.pubblicato && (
            <Link href={immobileHref(salvato)} target="_blank" className="ml-auto inline-flex items-center gap-1 font-semibold underline underline-offset-2">
              Vedi sul sito <IconExternal size={14} />
            </Link>
          )}
        </div>
      )}

      {/* PUBBLICAZIONE (in alto, e' quello che si tocca piu' spesso) */}
      <section className="card p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Stato annuncio">
            <select className="input" value={form.pubblicato ? "1" : "0"} onChange={(e) => set("pubblicato", e.target.value === "1")}>
              <option value="0">Bozza (non visibile sul sito)</option>
              <option value="1">Pubblicato (online)</option>
            </select>
          </Field>
          <Field label="Disponibilità">
            <select className="input" value={form.disponibile ? "1" : "0"} onChange={(e) => set("disponibile", e.target.value === "1")}>
              <option value="1">Disponibile</option>
              <option value="0">Non più disponibile</option>
            </select>
          </Field>
          <Field label="Homepage">
            <label className="flex h-[42px] items-center gap-2 text-sm">
              <input type="checkbox" checked={form.evidenza} onChange={(e) => set("evidenza", e.target.checked)} className="h-4 w-4 accent-navy" /> In evidenza
            </label>
          </Field>
          <Field label="Portali">
            <label className="flex h-[42px] items-center gap-2 text-sm">
              <input type="checkbox" checked={form.pubblica_portali} onChange={(e) => set("pubblica_portali", e.target.checked)} className="h-4 w-4 accent-navy" /> Invia a Immobiliare.it / idealista
            </label>
          </Field>
        </div>
      </section>

      {/* DATI PRINCIPALI */}
      <section className="card p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-navy">Dati principali</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Titolo annuncio" className="sm:col-span-2 lg:col-span-3">
            <input className="input" value={form.titolo} onChange={(e) => set("titolo", e.target.value)} placeholder="Es. Trilocale luminoso con terrazzo in Porta Venezia" required />
          </Field>
          <Field label="Codice riferimento" hint="Lascia vuoto per generarlo automaticamente">
            <input className="input" value={form.codice} onChange={(e) => set("codice", e.target.value)} placeholder="SAI001" />
          </Field>
          <Field label="Contratto">
            <select className="input" value={form.tipo} onChange={(e) => set("tipo", e.target.value as "vendita" | "affitto")}>
              <option value="vendita">Vendita</option>
              <option value="affitto">Affitto</option>
            </select>
          </Field>
          <Field label="Tipologia">
            <select className="input" value={form.categoria} onChange={(e) => set("categoria", e.target.value)}>
              {categorie.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label={form.tipo === "affitto" ? "Canone mensile (€)" : "Prezzo (€)"} hint="0 = trattativa riservata">
            <input
              className="input"
              inputMode="numeric"
              value={prezzoText}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, "");
                setPrezzoText(raw ? formatNumber(Number(raw)) : "");
                set("prezzo", raw ? Number(raw) : 0);
              }}
              placeholder="es. 185.000"
            />
          </Field>
          <Field label="Spese condominiali (€/mese)">
            <input
              className="input"
              type="number"
              min={0}
              value={form.spese_condominiali ?? ""}
              onChange={(e) => set("spese_condominiali", e.target.value === "" ? null : Number(e.target.value))}
              placeholder="es. 120"
            />
          </Field>
        </div>
      </section>

      {/* CARATTERISTICHE */}
      <section className="card p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-navy">Dettagli</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Field label="Superficie (mq)">
            <input className="input" type="number" min={0} value={form.mq || ""} onChange={(e) => set("mq", num(e.target.value))} />
          </Field>
          <Field label="Locali">
            <input className="input" type="number" min={0} value={form.locali || ""} onChange={(e) => set("locali", num(e.target.value))} />
          </Field>
          <Field label="Camere">
            <input className="input" type="number" min={0} value={form.camere || ""} onChange={(e) => set("camere", num(e.target.value))} />
          </Field>
          <Field label="Bagni">
            <input className="input" type="number" min={0} value={form.bagni || ""} onChange={(e) => set("bagni", num(e.target.value))} />
          </Field>
          <Field label="Piano" hint="Es. 3, Terra, Rialzato, Ultimo">
            <input className="input" value={form.piano ?? ""} onChange={(e) => set("piano", e.target.value)} placeholder="3" />
          </Field>
          <Field label="Anno costruzione">
            <input className="input" type="number" min={1000} max={2100} value={form.anno ?? ""} onChange={(e) => set("anno", e.target.value === "" ? null : Number(e.target.value))} placeholder="1960" />
          </Field>
          <Field label="Condizioni" className="col-span-2">
            <select className="input" value={form.stato ?? ""} onChange={(e) => set("stato", e.target.value)}>
              {condizioni.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Classe energetica" className="col-span-2" hint="“In corso” se l'APE non è ancora disponibile">
            <select className="input" value={form.classe_energetica ?? "In corso"} onChange={(e) => set("classe_energetica", e.target.value)}>
              {classi.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Riscaldamento" className="col-span-2">
            <select className="input" value={form.riscaldamento ?? ""} onChange={(e) => set("riscaldamento", e.target.value)}>
              {RISCALDAMENTI.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-6">
          <label className="label">Caratteristiche</label>
          <div className="flex flex-wrap gap-2">
            {form.caratteristiche.map((c) => (
              <span key={c} className="chip">
                {c}
                <button type="button" onClick={() => set("caratteristiche", form.caratteristiche.filter((x) => x !== c))} className="text-muted hover:text-red-600" aria-label={`Rimuovi ${c}`}>
                  <IconX size={13} />
                </button>
              </span>
            ))}
            {form.caratteristiche.length === 0 && <span className="text-[13px] text-muted">Nessuna caratteristica ancora.</span>}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              className="input"
              value={nuovaCar}
              onChange={(e) => setNuovaCar(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCar(nuovaCar);
                }
              }}
              placeholder="Aggiungi una caratteristica e premi Invio"
            />
            <button type="button" className="btn btn-outline btn-sm shrink-0" onClick={() => addCar(nuovaCar)}>
              Aggiungi
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {CARATTERISTICHE_SUGGERITE.filter((s) => !form.caratteristiche.some((c) => c.toLowerCase() === s.toLowerCase())).map((s) => (
              <button key={s} type="button" onClick={() => addCar(s)} className="rounded-full border border-line bg-white px-2.5 py-1 text-[12px] text-muted transition hover:border-navy hover:text-navy">
                + {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* POSIZIONE */}
      <section className="card p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-navy">Posizione</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Città">
            <input className="input" list="citta-list" value={form.citta} onChange={(e) => set("citta", e.target.value)} placeholder="Milano" required />
            <datalist id="citta-list">
              {cittaSuggerite.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Zona / quartiere">
            <input className="input" value={form.zona ?? ""} onChange={(e) => set("zona", e.target.value)} placeholder="Porta Venezia" />
          </Field>
          <Field label="CAP">
            <input className="input" value={form.cap ?? ""} onChange={(e) => set("cap", e.target.value)} placeholder="20129" maxLength={5} />
          </Field>
          <Field label="Provincia (sigla)">
            <input className="input" value={form.provincia ?? ""} onChange={(e) => set("provincia", e.target.value.toUpperCase())} placeholder="MI" maxLength={2} />
          </Field>
          <Field label="Indirizzo" className="sm:col-span-2 lg:col-span-3">
            <input className="input" value={form.indirizzo ?? ""} onChange={(e) => set("indirizzo", e.target.value)} placeholder="Via Roma 15" />
          </Field>
          <Field label="Indirizzo sul sito">
            <label className="flex h-[42px] items-center gap-2 text-sm">
              <input type="checkbox" checked={form.mostra_indirizzo} onChange={(e) => set("mostra_indirizzo", e.target.checked)} className="h-4 w-4 accent-navy" /> Mostra la via nell&apos;annuncio
            </label>
          </Field>
        </div>
      </section>

      {/* DESCRIZIONE */}
      <section className="card p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-navy">Descrizione</h2>
        <textarea
          className="input mt-4 min-h-[220px] leading-relaxed"
          value={form.descrizione ?? ""}
          onChange={(e) => set("descrizione", e.target.value)}
          placeholder="Racconta l'immobile: distribuzione degli spazi, luce, contesto, servizi in zona…"
        />
        <p className="mt-1 text-[12px] text-muted">{(form.descrizione || "").length} caratteri · vai a capo per separare i paragrafi.</p>
      </section>

      {/* FOTO E VIDEO */}
      <section className="card p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold text-navy">Foto</h2>
        <div className="mt-4">
          <PhotoUploader value={form.immagini} onChange={(urls) => set("immagini", urls)} />
        </div>
        <div className="mt-6">
          <Field label="Video (link YouTube)" hint="Incolla il link del video YouTube: verrà mostrato nella scheda dell'immobile e inviato ai portali.">
            <input className="input" value={form.video_url ?? ""} onChange={(e) => set("video_url", e.target.value)} placeholder="https://youtu.be/…" />
          </Field>
        </div>
      </section>

      <div className="sticky bottom-0 z-20 -mx-4 flex items-center justify-between gap-3 border-t border-line bg-white/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <Link href="/admin/immobili" className="btn btn-ghost btn-sm">
          ← Torna alla lista
        </Link>
        <div className="flex items-center gap-3">
          {immobile && immobile.pubblicato && (
            <Link href={immobileHref(immobile)} target="_blank" className="btn btn-outline btn-sm">
              <IconExternal size={15} /> Vedi sul sito
            </Link>
          )}
          <button type="submit" disabled={pending} className="btn btn-primary">
            {pending ? "Salvataggio…" : immobile ? "Salva modifiche" : "Salva annuncio"}
          </button>
        </div>
      </div>
    </form>
  );
}

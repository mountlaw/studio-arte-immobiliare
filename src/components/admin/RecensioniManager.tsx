"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { eliminaRecensione, salvaRecensione } from "@/app/admin/actions";
import { Pill } from "./ui";
import { IconEdit, IconExternal, IconStar, IconTrash } from "@/components/ui/Icons";
import type { Recensione } from "@/lib/types";

const VUOTA = { nome: "", testo: "", stelle: 5, citta: "", fonte: "google", pubblicata: true, ordine: 0 };

export default function RecensioniManager({ recensioni, googleUrl }: { recensioni: Recensione[]; googleUrl?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<typeof VUOTA>({ ...VUOTA });
  const [editing, setEditing] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [errore, setErrore] = useState("");

  const reset = () => {
    setForm({ ...VUOTA });
    setEditing(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrore("");
    startTransition(async () => {
      const r = await salvaRecensione(editing, form);
      if (!r.ok) return setErrore(r.error);
      reset();
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form onSubmit={submit} className="card h-fit p-5 lg:col-span-2">
        <h2 className="font-display text-2xl font-semibold text-navy">{editing ? "Modifica recensione" : "Aggiungi recensione"}</h2>
        {googleUrl && (
          <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-[12.5px] text-muted hover:text-navy">
            Apri le recensioni su Google per copiarle <IconExternal size={12} />
          </a>
        )}
        {errore && <div className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{errore}</div>}
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Nome</label>
              <input className="input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Mario R." required />
            </div>
            <div>
              <label className="label">Città (facoltativa)</label>
              <input className="input" value={form.citta} onChange={(e) => setForm({ ...form, citta: e.target.value })} placeholder="Milano" />
            </div>
          </div>
          <div>
            <label className="label">Stelle</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setForm({ ...form, stelle: n })} className={n <= form.stelle ? "text-gold" : "text-stone"} aria-label={`${n} stelle`}>
                  <IconStar size={26} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Testo</label>
            <textarea className="input min-h-[120px]" value={form.testo} onChange={(e) => setForm({ ...form, testo: e.target.value })} placeholder="Il testo della recensione…" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Fonte</label>
              <select className="input" value={form.fonte} onChange={(e) => setForm({ ...form, fonte: e.target.value })}>
                <option value="google">Google</option>
                <option value="facebook">Facebook</option>
                <option value="cliente">Cliente</option>
              </select>
            </div>
            <div>
              <label className="label">Ordine</label>
              <input className="input" type="number" value={form.ordine} onChange={(e) => setForm({ ...form, ordine: Number(e.target.value) })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.pubblicata} onChange={(e) => setForm({ ...form, pubblicata: e.target.checked })} className="h-4 w-4 accent-navy" /> Mostra sul sito
          </label>
        </div>
        <div className="mt-5 flex gap-2">
          <button type="submit" disabled={pending} className="btn btn-primary">
            {pending ? "Salvataggio…" : editing ? "Salva" : "Aggiungi"}
          </button>
          {editing && (
            <button type="button" onClick={reset} className="btn btn-ghost">
              Annulla
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3 lg:col-span-3">
        {recensioni.length === 0 && <div className="card p-8 text-center text-muted">Nessuna recensione inserita.</div>}
        {recensioni.map((r) => (
          <div key={r.id} className="card flex gap-4 p-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-navy">{r.nome}</span>
                {r.citta && <span className="text-[12.5px] text-muted">{r.citta}</span>}
                <span className="flex text-gold">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <IconStar key={n} size={13} className={n <= r.stelle ? "" : "text-stone"} />
                  ))}
                </span>
                <Pill>{r.fonte}</Pill>
                {!r.pubblicata && <Pill tone="amber">Nascosta</Pill>}
              </div>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink/85">{r.testo}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                onClick={() => {
                  setEditing(r.id);
                  setForm({ nome: r.nome, testo: r.testo, stelle: r.stelle, citta: r.citta || "", fonte: r.fonte, pubblicata: r.pubblicata, ordine: r.ordine });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-navy/8"
                title="Modifica"
              >
                <IconEdit size={16} />
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  confirm("Eliminare questa recensione?") &&
                  startTransition(async () => {
                    const res = await eliminaRecensione(r.id);
                    if (!res.ok) alert(res.error);
                    router.refresh();
                  })
                }
                className="flex h-9 w-9 items-center justify-center rounded-full text-red-600 hover:bg-red-50"
                title="Elimina"
              >
                <IconTrash size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

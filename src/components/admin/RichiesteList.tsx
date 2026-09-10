"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { aggiornaRichiesta, eliminaRichiesta } from "@/app/admin/actions";
import { Pill } from "./ui";
import { IconMail, IconPhone, IconTrash, IconWhatsapp } from "@/components/ui/Icons";
import type { Richiesta } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

const TIPI: Record<string, { label: string; tone: "navy" | "gold" | "neutral" }> = {
  info: { label: "Info immobile", tone: "navy" },
  valutazione: { label: "Valutazione", tone: "gold" },
  contatto: { label: "Contatto", tone: "neutral" },
};

export default function RichiesteList({ richieste, archiviate }: { richieste: Richiesta[]; archiviate: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      const r = await fn();
      if (!r.ok) alert(r.error);
      router.refresh();
    });

  const toggle = (r: Richiesta) => {
    const next = open === r.id ? null : r.id;
    setOpen(next);
    if (next && !r.letta) run(() => aggiornaRichiesta(r.id, { letta: true }));
  };

  if (!richieste.length) {
    return <div className="card p-10 text-center text-muted">{archiviate ? "Nessuna richiesta archiviata." : "Nessuna richiesta: quando qualcuno compila un modulo sul sito la trovi qui."}</div>;
  }

  return (
    <div className="card divide-y divide-line overflow-hidden">
      {richieste.map((r) => {
        const t = TIPI[r.tipo] || TIPI.contatto;
        const d = r.dettagli || {};
        const tel = (r.telefono || "").replace(/[^\d+]/g, "");
        return (
          <div key={r.id} className={`${r.letta ? "" : "bg-gold/5"}`}>
            <button type="button" onClick={() => toggle(r)} className="flex w-full items-center gap-4 px-4 py-3.5 text-left hover:bg-cream/70 sm:px-5">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${r.letta ? "bg-transparent" : "bg-gold"}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`${r.letta ? "font-medium" : "font-semibold"} text-navy`}>{r.nome}</span>
                  <Pill tone={t.tone}>{t.label}</Pill>
                  {r.immobile_codice && <span className="text-[12px] text-muted">rif. {r.immobile_codice}</span>}
                </div>
                <div className="mt-0.5 truncate text-[13px] text-muted">{r.messaggio || r.indirizzo_valutazione || d.immobile_titolo || "—"}</div>
              </div>
              <span className="shrink-0 text-[12px] text-muted">{formatDateTime(r.created_at)}</span>
            </button>
            {open === r.id && (
              <div className="border-t border-line bg-white px-4 py-4 sm:px-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    {r.messaggio && <p className="whitespace-pre-line text-[14.5px] leading-relaxed text-ink">{r.messaggio}</p>}
                    <dl className="mt-3 grid gap-x-6 gap-y-1 text-[13px] sm:grid-cols-2">
                      {r.indirizzo_valutazione && (
                        <>
                          <dt className="text-muted">Indirizzo da valutare</dt>
                          <dd className="font-medium">{r.indirizzo_valutazione}</dd>
                        </>
                      )}
                      {Object.entries(d)
                        .filter(([k]) => !["immobile_url"].includes(k))
                        .map(([k, v]) => (
                          <div key={k} className="contents">
                            <dt className="capitalize text-muted">{k.replace("immobile_titolo", "immobile").replace("_", " ")}</dt>
                            <dd className="font-medium">{v}</dd>
                          </div>
                        ))}
                    </dl>
                    {d.immobile_url && (
                      <Link href={d.immobile_url} target="_blank" className="mt-2 inline-block text-[13px] font-medium text-navy underline underline-offset-2">
                        Apri l&apos;annuncio →
                      </Link>
                    )}
                  </div>
                  <div className="space-y-2">
                    {r.telefono && (
                      <>
                        <a href={`tel:${tel}`} className="btn btn-primary btn-sm w-full">
                          <IconPhone size={15} /> {r.telefono}
                        </a>
                        <a href={`https://wa.me/${tel.replace(/^\+/, "").replace(/^00/, "").replace(/^(?!39)/, "39")}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm w-full">
                          <IconWhatsapp size={15} className="text-[#25D366]" /> WhatsApp
                        </a>
                      </>
                    )}
                    {r.email && (
                      <a href={`mailto:${r.email}`} className="btn btn-outline btn-sm w-full">
                        <IconMail size={15} /> {r.email}
                      </a>
                    )}
                    <div className="flex gap-2 pt-2">
                      <button type="button" disabled={pending} onClick={() => run(() => aggiornaRichiesta(r.id, { letta: !r.letta }))} className="btn btn-ghost btn-sm flex-1">
                        {r.letta ? "Segna da leggere" : "Segna letta"}
                      </button>
                      <button type="button" disabled={pending} onClick={() => run(() => aggiornaRichiesta(r.id, { archiviata: !r.archiviata }))} className="btn btn-ghost btn-sm flex-1">
                        {r.archiviata ? "Ripristina" : "Archivia"}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => confirm("Eliminare questa richiesta?") && run(() => eliminaRichiesta(r.id))}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-red-600 hover:bg-red-50"
                        title="Elimina"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

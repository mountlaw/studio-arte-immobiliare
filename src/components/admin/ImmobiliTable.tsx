"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { aggiornaFlagImmobile, duplicaImmobile, eliminaImmobile } from "@/app/admin/actions";
import { Pill } from "./ui";
import { IconCopy, IconEdit, IconExternal, IconSearch, IconTrash } from "@/components/ui/Icons";
import type { Immobile } from "@/lib/types";
import { formatPrice, immobileHref } from "@/lib/utils";

type Filtro = "" | "online" | "nd" | "bozza" | "vendita" | "affitto";

export default function ImmobiliTable({ immobili, filtroIniziale = "" }: { immobili: Immobile[]; filtroIniziale?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<Filtro>((["online", "nd", "bozza", "vendita", "affitto"].includes(filtroIniziale) ? filtroIniziale : "") as Filtro);
  const [pending, startTransition] = useTransition();
  const [errore, setErrore] = useState("");

  const lista = useMemo(() => {
    const term = q.trim().toLowerCase();
    return immobili.filter((p) => {
      if (filtro === "online" && !(p.pubblicato && p.disponibile)) return false;
      if (filtro === "nd" && p.disponibile) return false;
      if (filtro === "bozza" && p.pubblicato) return false;
      if (filtro === "vendita" && p.tipo !== "vendita") return false;
      if (filtro === "affitto" && p.tipo !== "affitto") return false;
      if (!term) return true;
      return [p.titolo, p.codice, p.citta, p.zona || "", p.indirizzo || ""].some((s) => s.toLowerCase().includes(term));
    });
  }, [immobili, q, filtro]);

  const run = (fn: () => Promise<{ ok: boolean; error?: string; data?: unknown }>, after?: (r: { ok: boolean; data?: unknown }) => void) => {
    setErrore("");
    startTransition(async () => {
      const r = await fn();
      if (!r.ok) setErrore(r.error || "Errore");
      else {
        after?.(r);
        router.refresh();
      }
    });
  };

  const FILTRI: Array<[Filtro, string]> = [
    ["", "Tutti"],
    ["online", "Online"],
    ["nd", "Non più disponibili"],
    ["bozza", "Bozze"],
    ["vendita", "Vendita"],
    ["affitto", "Affitto"],
  ];

  return (
    <div className="space-y-4">
      <div className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <IconSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca per titolo, codice, città, via…" className="input pl-10" />
        </div>
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          {FILTRI.map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFiltro(k)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition ${filtro === k ? "bg-navy text-white" : "bg-sand text-navy hover:bg-stone"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {errore && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errore}</div>}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-[13.5px]">
            <thead className="bg-cream text-[11px] uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">Annuncio</th>
                <th className="px-4 py-3">Contratto</th>
                <th className="px-4 py-3">Prezzo</th>
                <th className="px-4 py-3">Stato</th>
                <th className="px-4 py-3">Disponibilità</th>
                <th className="px-4 py-3 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {lista.map((p) => (
                <tr key={p.id} className="align-middle hover:bg-cream/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-sand">
                        {p.immagini[0] && <Image src={p.immagini[0]} alt="" fill sizes="80px" className={`object-cover ${!p.disponibile ? "saturate-[0.3]" : ""}`} />}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/immobili/${p.id}`} className="block max-w-[360px] truncate font-medium text-navy hover:underline">
                          {p.titolo}
                        </Link>
                        <div className="text-[12px] text-muted">
                          {p.codice} · {p.categoria} · {p.citta}
                          {p.zona ? ` (${p.zona})` : ""} · {p.immagini.length} foto
                          {p.evidenza && p.disponibile ? " · in evidenza" : ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.tipo === "vendita" ? <Pill tone="navy">Vendita</Pill> : <Pill tone="gold">Affitto</Pill>}</td>
                  <td className="px-4 py-3 font-semibold text-navy">{formatPrice(p.prezzo, p.tipo)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(() => aggiornaFlagImmobile(p.id, "pubblicato", !p.pubblicato))}
                      title={p.pubblicato ? "Clicca per mettere in bozza" : "Clicca per pubblicare"}
                    >
                      {p.pubblicato ? <Pill tone="green">Online</Pill> : <Pill tone="amber">Bozza</Pill>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={p.disponibile ? "si" : "no"}
                      disabled={pending}
                      onChange={(e) => run(() => aggiornaFlagImmobile(p.id, "disponibile", e.target.value === "si"))}
                      className="rounded-lg border border-line bg-white px-2 py-1 text-[13px]"
                    >
                      <option value="si">Disponibile</option>
                      <option value="no">Non più disponibile</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/immobili/${p.id}`} className="flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-navy/8" title="Modifica">
                        <IconEdit size={17} />
                      </Link>
                      <Link href={immobileHref(p)} target="_blank" className="flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-navy/8" title="Vedi sul sito">
                        <IconExternal size={17} />
                      </Link>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => duplicaImmobile(p.id), (r) => r.data && router.push(`/admin/immobili/${r.data}`))}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-navy/8"
                        title="Duplica"
                      >
                        <IconCopy size={17} />
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => {
                          if (confirm(`Eliminare definitivamente "${p.titolo}"?\nSe vuoi solo toglierlo dal sito, mettilo in bozza o "Non più disponibile".`)) run(() => eliminaImmobile(p.id));
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-red-600 hover:bg-red-50"
                        title="Elimina"
                      >
                        <IconTrash size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted">
                    Nessun annuncio trovato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { PageHeader, Pill, StatCard } from "@/components/admin/ui";
import { IconPlus } from "@/components/ui/Icons";
import { getTuttiImmobili } from "@/lib/data/immobili";
import { getRichieste } from "@/lib/data/richieste";
import { supabaseServer } from "@/lib/supabase/server";
import { OLD_STORAGE_PUBLIC_URL } from "@/lib/supabase/env";
import { formatDate, formatPrice, immobileHref } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await supabaseServer();
  const [immobili, richieste] = await Promise.all([getTuttiImmobili(supabase), getRichieste(supabase).catch(() => [])]);
  const pubblicati = immobili.filter((p) => p.pubblicato);
  const disponibili = pubblicati.filter((p) => p.disponibile);
  const bozze = immobili.filter((p) => !p.pubblicato);
  const nonLette = richieste.filter((r) => !r.letta);
  const fotoVecchioArchivio = immobili.reduce((n, p) => n + p.immagini.filter((u) => u.startsWith(OLD_STORAGE_PUBLIC_URL)).length, 0);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Uno sguardo d'insieme su annunci e richieste."
        action={
          <Link href="/admin/immobili/nuovo" className="btn btn-primary">
            <IconPlus size={18} /> Nuovo annuncio
          </Link>
        }
      />

      {fotoVecchioArchivio > 0 && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[14px] text-ink">
            <strong>{fotoVecchioArchivio} foto</strong> sono ancora nel vecchio archivio: vanno copiate in quello nuovo (bastano un paio di minuti).
          </div>
          <Link href="/admin/migrazione" className="btn btn-primary btn-sm">
            Copia le foto ora
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Annunci online" value={disponibili.length} href="/admin/immobili" />
        <StatCard label="Non più disponibili" value={pubblicati.length - disponibili.length} href="/admin/immobili?stato=nd" tone="muted" />
        <StatCard label="Bozze" value={bozze.length} href="/admin/immobili?stato=bozza" tone="amber" />
        <StatCard label="Richieste da leggere" value={nonLette.length} href="/admin/richieste" tone="gold" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="card p-5 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-navy">Ultimi annunci</h2>
            <Link href="/admin/immobili" className="text-sm font-medium text-navy hover:underline">
              Vedi tutti
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {immobili.slice(0, 6).map((p) => (
              <li key={p.id} className="flex items-center gap-4 py-3">
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-sand">
                  {p.immagini[0] && <Image src={p.immagini[0]} alt="" fill sizes="80px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/immobili/${p.id}`} className="block truncate font-medium text-navy hover:underline">
                    {p.titolo}
                  </Link>
                  <div className="text-[12.5px] text-muted">
                    {p.codice} · {p.citta} · {formatPrice(p.prezzo, p.tipo)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {p.pubblicato ? <Pill tone="green">Online</Pill> : <Pill tone="amber">Bozza</Pill>}
                  {!p.disponibile && <Pill>Non più disponibile</Pill>}
                </div>
              </li>
            ))}
            {immobili.length === 0 && <li className="py-6 text-sm text-muted">Nessun annuncio ancora.</li>}
          </ul>
        </div>

        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-navy">Ultime richieste</h2>
            <Link href="/admin/richieste" className="text-sm font-medium text-navy hover:underline">
              Tutte
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {richieste.slice(0, 6).map((r) => (
              <li key={r.id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className={`truncate ${r.letta ? "text-ink" : "font-semibold text-navy"}`}>{r.nome}</span>
                  <span className="shrink-0 text-[12px] text-muted">{formatDate(r.created_at)}</span>
                </div>
                <div className="mt-0.5 text-[12.5px] text-muted">
                  {r.tipo === "info" ? "Info immobile" : r.tipo === "valutazione" ? "Valutazione" : "Contatto"}
                  {r.immobile_codice ? ` · rif. ${r.immobile_codice}` : ""}
                  {r.telefono ? ` · ${r.telefono}` : ""}
                </div>
              </li>
            ))}
            {richieste.length === 0 && <li className="py-6 text-sm text-muted">Nessuna richiesta ricevuta finora.</li>}
          </ul>
        </div>
      </div>

      <div className="mt-8 card p-5">
        <h2 className="font-display text-2xl font-semibold text-navy">Link rapidi</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/" target="_blank" className="btn btn-outline btn-sm">
            Apri il sito
          </Link>
          <Link href="/admin/recensioni" className="btn btn-outline btn-sm">
            Recensioni
          </Link>
          <Link href="/admin/impostazioni" className="btn btn-outline btn-sm">
            Foto di copertina e social
          </Link>
          <Link href="/admin/portali" className="btn btn-outline btn-sm">
            Portali (Immobiliare.it / idealista)
          </Link>
          {disponibili[0] && (
            <Link href={immobileHref(disponibili[0])} target="_blank" className="btn btn-ghost btn-sm">
              Vedi un annuncio sul sito →
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

import Link from "next/link";
import PortaliActions from "@/components/admin/PortaliActions";
import { PageHeader, Pill, Section } from "@/components/admin/ui";
import { SITE_URL } from "@/lib/config";
import { getTuttiImmobili } from "@/lib/data/immobili";
import { buildFeedXml, type FeedWarning } from "@/lib/portali/immobiliare";
import { statoConfigurazione } from "@/lib/portali/sync";
import { supabaseServer } from "@/lib/supabase/server";
import type { PortaleLog } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

function Stato({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
      <span className="text-[14px] text-ink">{label}</span>
      {ok ? <Pill tone="green">Configurato</Pill> : <Pill tone="amber">Da configurare</Pill>}
    </div>
  );
}

export default async function PortaliPage() {
  const supabase = await supabaseServer();
  const cfg = statoConfigurazione();
  const [immobili, logRes] = await Promise.all([getTuttiImmobili(supabase), supabase.from("portali_log").select("*").order("created_at", { ascending: false }).limit(40)]);
  const log = (logRes.data ?? []) as PortaleLog[];
  const attivi = immobili.filter((p) => p.pubblicato && p.disponibile && p.pubblica_portali);
  const conErrori = immobili.filter((p) => p.portali_errore);
  // Genera il feed a vuoto solo per raccogliere gli avvisi sui dati (comune non riconosciuto, foto mancanti...)
  const avvisi: FeedWarning[] = [];
  buildFeedXml(attivi, avvisi);
  const feedToken = process.env.FEED_TOKEN ? `?token=${process.env.FEED_TOKEN}` : "";
  const feedImm = `${SITE_URL}/api/feed/immobiliare.xml${feedToken}`;
  const feedIde = `${SITE_URL}/api/feed/idealista.json${feedToken}`;

  return (
    <>
      <PageHeader
        title="Portali"
        subtitle="Pubblicazione automatica degli annunci su Immobiliare.it e idealista."
        action={<PortaliActions abilitato={cfg.immobiliareRest || cfg.immobiliareFtp || cfg.idealista} />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="font-display text-4xl font-semibold text-navy">{attivi.length}</div>
          <div className="mt-1 text-[12px] font-semibold uppercase tracking-wider text-muted">Annunci da pubblicare sui portali</div>
        </div>
        <div className="card p-5">
          <div className="font-display text-4xl font-semibold text-navy">{immobili.filter((p) => p.immobiliare_id).length}</div>
          <div className="mt-1 text-[12px] font-semibold uppercase tracking-wider text-muted">Collegati a Immobiliare.it</div>
        </div>
        <div className="card p-5">
          <div className={`font-display text-4xl font-semibold ${conErrori.length ? "text-red-600" : "text-navy"}`}>{conErrori.length}</div>
          <div className="mt-1 text-[12px] font-semibold uppercase tracking-wider text-muted">Con errori di sincronizzazione</div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Section title="Stato dell'integrazione" description="Le credenziali si impostano come variabili d'ambiente su Vercel (Settings → Environment Variables), mai nel sito.">
          <div className="space-y-2">
            <Stato ok={cfg.immobiliareRest} label="Immobiliare.it · API REST in tempo reale (consigliata)" />
            <Stato ok={cfg.immobiliareFtp} label="Immobiliare.it · feed batch via FTP (alternativa)" />
            <Stato ok={cfg.idealista} label="idealista · API integrazione" />
            <Stato ok={cfg.serviceRole} label="Chiave server Supabase (per API REST e cron)" />
            <Stato ok={cfg.apiKey} label="Chiave API per sistemi esterni (API_KEY)" />
          </div>
        </Section>

        <Section title="Feed e API pronti" description="Questi indirizzi generano sempre l'elenco aggiornato degli annunci nel formato dei portali.">
          <div className="space-y-3 text-[13.5px]">
            <div>
              <div className="label">Feed XML Immobiliare.it (formato ufficiale 2.0)</div>
              <div className="flex gap-2">
                <input readOnly value={feedImm} className="input font-mono text-[12px]" />
                <Link href={feedImm} target="_blank" className="btn btn-outline btn-sm shrink-0">
                  Apri
                </Link>
              </div>
            </div>
            <div>
              <div className="label">Export JSON idealista</div>
              <div className="flex gap-2">
                <input readOnly value={feedIde} className="input font-mono text-[12px]" />
                <Link href={feedIde} target="_blank" className="btn btn-outline btn-sm shrink-0">
                  Apri
                </Link>
              </div>
            </div>
            <div>
              <div className="label">API REST annunci (per gestionali esterni)</div>
              <code className="block rounded-xl bg-cream px-3 py-2 font-mono text-[12px] text-navy">
                GET/POST {SITE_URL}/api/v1/immobili
                <br />
                GET/PUT/PATCH/DELETE {SITE_URL}/api/v1/immobili/{"{codice}"}
                <br />
                Authorization: Bearer API_KEY
              </code>
              <p className="mt-1 text-[12px] text-muted">
                Documentazione completa in <code>docs/API.md</code> nel repository.
              </p>
            </div>
          </div>
        </Section>
      </div>

      <Section title="Come si attiva (una volta sola)" className="mt-6">
        <ol className="list-decimal space-y-3 pl-5 text-[14px] leading-relaxed text-ink/90">
          <li>
            <strong>Immobiliare.it</strong>: scrivi al tuo referente commerciale (o al supporto agenzie) chiedendo l&apos;attivazione dell&apos;
            <em>importazione annunci da gestionale esterno</em> con feed XML 2.0. Ti forniranno le credenziali REST (username, password e codice sorgente
            X-IMMO-SOURCE) oppure un accesso FTP per il feed batch. Vanno inserite su Vercel nelle variabili <code>IMMOBILIARE_REST_USER</code>,{" "}
            <code>IMMOBILIARE_REST_PASSWORD</code>, <code>IMMOBILIARE_SOURCE</code> (oppure <code>IMMOBILIARE_FTP_*</code>). Se chiedono l&apos;indirizzo del feed,
            dai quello qui sopra.
          </li>
          <li>
            <strong>idealista</strong>: dal pannello idealista/tools chiedi al tuo account manager l&apos;<em>integrazione con software esterno</em>. Ti daranno API key,
            secret e documentazione: vanno nelle variabili <code>IDEALISTA_API_URL</code>, <code>IDEALISTA_API_KEY</code>, <code>IDEALISTA_API_SECRET</code>.
          </li>
          <li>
            Da quel momento ogni annuncio salvato con &ldquo;Invia a Immobiliare.it / idealista&rdquo; attivo viene pubblicato o aggiornato in automatico; ogni notte alle
            2:30 parte comunque un riallineamento completo. Un annuncio messo in bozza o &ldquo;Non più disponibile&rdquo; viene ritirato dai portali.
          </li>
        </ol>
      </Section>

      {avvisi.length > 0 && (
        <Section title="Dati da sistemare prima dell'invio" description="I portali possono rifiutare gli annunci con questi problemi." className="mt-6">
          <ul className="divide-y divide-line text-[13.5px]">
            {avvisi.map((w, i) => (
              <li key={i} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <Link href={`/admin/immobili/${w.immobileId}`} className="font-medium text-navy hover:underline">
                  {w.codice}
                </Link>
                <span className="text-amber-700">{w.messaggio}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {conErrori.length > 0 && (
        <Section title="Annunci con errori" className="mt-6">
          <ul className="divide-y divide-line text-[13.5px]">
            {conErrori.map((p) => (
              <li key={p.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <Link href={`/admin/immobili/${p.id}`} className="font-medium text-navy hover:underline">
                  {p.codice} · {p.titolo}
                </Link>
                <span className="text-red-700">{p.portali_errore}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Ultime operazioni" className="mt-6">
        {log.length === 0 ? (
          <p className="text-sm text-muted">Nessuna sincronizzazione ancora eseguita.</p>
        ) : (
          <ul className="divide-y divide-line text-[13px]">
            {log.map((l) => {
              const imm = immobili.find((p) => p.id === l.immobile_id);
              return (
                <li key={l.id} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:gap-4">
                  <span className="w-36 shrink-0 text-muted">{formatDateTime(l.created_at)}</span>
                  <Pill tone={l.esito === "ok" ? "green" : "red"}>{l.portale}</Pill>
                  <span className="min-w-0 flex-1 truncate">
                    {imm ? `${imm.codice} · ` : ""}
                    {l.messaggio}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </>
  );
}

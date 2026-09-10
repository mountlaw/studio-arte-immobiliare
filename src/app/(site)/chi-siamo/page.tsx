import type { Metadata } from "next";
import Link from "next/link";
import GoogleBadge from "@/components/site/GoogleBadge";
import { IconCheck } from "@/components/ui/Icons";
import { getImpostazioni } from "@/lib/data/impostazioni";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Chi siamo",
  description: "Studio Arte Immobiliare nasce dall'unione di professionisti con anni di esperienza tra Milano, Como e la Brianza. La persona prima di ogni trattativa.",
  alternates: { canonical: "/chi-siamo" },
};

const VALORI = [
  { titolo: "Professionalità", desc: "Competenza reale, aggiornamento continuo e metodo rigoroso in ogni trattativa." },
  { titolo: "Trasparenza", desc: "Comunicazione chiara e onesta, senza sorprese. Sempre." },
  { titolo: "Squadra", desc: "Il nostro punto di forza è il gruppo: competenze diverse unite da un obiettivo comune." },
  { titolo: "Persona al centro", desc: "Prima dell'immobile viene chi lo vive. Ascoltiamo, capiamo, agiamo." },
];

export default async function ChiSiamoPage() {
  const impostazioni = await getImpostazioni();
  return (
    <>
      <section className="bg-navy py-20 text-white">
        <div className="container-site max-w-3xl text-center">
          <div className="eyebrow mb-3 text-gold">Chi siamo</div>
          <h1 className="font-display text-5xl font-semibold sm:text-6xl">Dove la passione per l&apos;immobiliare incontra l&apos;esperienza</h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/75">Un approccio unico, nato dall&apos;unione di professionisti che hanno scelto di fare squadra.</p>
          <div className="mt-8 flex justify-center">
            <GoogleBadge impostazioni={impostazioni} dark size="lg" />
          </div>
        </div>
      </section>

      <section className="container-site max-w-3xl py-16">
        <article className="prose-site text-[16.5px]">
          <h2 className="font-display text-3xl font-semibold text-navy">Il nostro inizio: fare squadra</h2>
          <div className="gold-rule my-4" />
          <p>
            Studio Arte Immobiliare nasce dall&apos;unione di colleghi con anni di esperienza nel settore, che hanno deciso di mettere insieme competenze e
            visione. Non siamo partiti da soli, ma come gruppo. Crediamo fermamente che solo attraverso la collaborazione si possa offrire un servizio di
            qualità superiore. Questa sinergia ci motiva ogni giorno a superare le aspettative e a garantire un supporto concreto e affidabile ai nostri
            clienti.
          </p>

          <h2 className="mt-12 font-display text-3xl font-semibold text-navy">L&apos;arte del servizio immobiliare</h2>
          <div className="gold-rule my-4" />
          <p>
            Ci chiamiamo &ldquo;Studio Arte Immobiliare&rdquo; per una ragione precisa: andiamo oltre la classica agenzia. Per noi, prima della commissione e prima
            del servizio, c&apos;è la persona. Ogni immobile ha una sua storia, preziosa e unica. Il nostro impegno è comprenderla e valorizzarla al meglio,
            offrendo un&apos;esperienza in cui i nostri clienti sanno di essere al centro della nostra attenzione.
          </p>

          <h2 className="mt-12 font-display text-3xl font-semibold text-navy">I valori che ci guidano</h2>
          <div className="gold-rule my-4" />
          <p>
            Professionalità, lavoro di squadra e un&apos;immagine curata sono i pilastri del nostro lavoro quotidiano. Vogliamo che chi si rivolge a noi
            percepisca Studio Arte Immobiliare non come una semplice agenzia di zona, ma come un partner fidato e competente, attento ai dettagli e sempre
            orientato al raggiungimento degli obiettivi di ciascuno.
          </p>
          <p>
            Operiamo tra Milano, Como e la Brianza, un territorio che conosciamo a fondo. Dall&apos;incarico alla firma dal notaio, accompagniamo ogni cliente
            con trasparenza in ogni fase del percorso.
          </p>
        </article>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {VALORI.map((v) => (
            <div key={v.titolo} className="card flex gap-4 p-6">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold-deep">
                <IconCheck size={16} />
              </span>
              <div>
                <h3 className="font-display text-[22px] font-semibold text-navy">{v.titolo}</h3>
                <p className="mt-1 text-[14.5px] leading-relaxed text-muted">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-navy p-10 text-center text-white">
          <h3 className="font-display text-3xl font-semibold">Vuoi conoscerci di persona?</h3>
          <p className="mt-2 text-white/75">Vieni a trovarci in ufficio a Lomazzo o contattaci per una consulenza senza impegno.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/contatti" className="btn btn-gold">
              Contattaci
            </Link>
            <Link href="/valuta-casa" className="btn btn-light">
              Valuta la tua casa
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

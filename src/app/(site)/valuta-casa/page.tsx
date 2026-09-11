import type { Metadata } from "next";
import RequestForm from "@/components/site/RequestForm";
import { getCittaDisponibili } from "@/lib/data/immobili";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Valutazione immobile gratuita",
  description: "Quanto vale la tua casa? Richiedi una valutazione professionale, gratuita e senza impegno a Milano, Como e Brianza.",
  alternates: { canonical: "/valuta-casa" },
};

const STEPS = [
  { num: "01", title: "Analisi di mercato", desc: "Studiamo le compravendite recenti nella tua zona per una stima basata su dati concreti." },
  { num: "02", title: "Sopralluogo dedicato", desc: "Visitiamo l'immobile per valutare ogni dettaglio che incide sul valore reale." },
  { num: "03", title: "Report e strategia", desc: "Ricevi una valutazione completa e i consigli per vendere o affittare al meglio." },
];

export default async function ValutaCasaPage() {
  const citta = await getCittaDisponibili();
  return (
    <>
      <section className="bg-navy pb-28 pt-20 text-white">
        <div className="container-site max-w-3xl text-center">
          <div className="eyebrow mb-3 text-gold">Valutazione gratuita</div>
          <h1 className="font-display text-5xl font-semibold sm:text-6xl">Quanto vale il tuo immobile?</h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/75">
            Richiedi una valutazione professionale, gratuita e senza impegno. Analizziamo mercato, posizione e caratteristiche per darti una stima precisa.
          </p>
        </div>
      </section>

      <section className="container-site -mt-16 grid gap-4 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.num} className="card p-6 text-center">
            <div className="font-display text-4xl font-semibold text-gold">{s.num}</div>
            <h3 className="mt-2 font-display text-[22px] font-semibold text-navy">{s.title}</h3>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{s.desc}</p>
          </div>
        ))}
      </section>

      <section className="container-site max-w-2xl py-16">
        <RequestForm tipo="valutazione" citta={citta} title="Compila il modulo" subtitle="Ti ricontattiamo entro 24 ore per fissare l'appuntamento." />
      </section>
    </>
  );
}

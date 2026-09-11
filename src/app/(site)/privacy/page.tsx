import type { Metadata } from "next";
import { AZIENDA } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy e cookie policy",
  description: "Informativa sul trattamento dei dati personali e sull'uso dei cookie del sito di Studio Arte Immobiliare.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <section className="container-site max-w-3xl py-16">
      <div className="eyebrow mb-3">Informativa</div>
      <h1 className="font-display text-5xl font-semibold text-navy">Privacy e cookie</h1>
      <div className="gold-rule mt-5" />
      <div className="prose-site mt-8 text-[15.5px]">
        <p>
          <strong>Titolare del trattamento</strong>
          <br />
          {AZIENDA.nome}, con sede in {AZIENDA.indirizzo}, {AZIENDA.cap} {AZIENDA.citta} ({AZIENDA.provincia}), P.IVA {AZIENDA.piva}. Email di contatto: {AZIENDA.email}.
        </p>
        <p>
          <strong>Dati raccolti</strong>
          <br />
          Attraverso i moduli del sito raccogliamo esclusivamente i dati forniti volontariamente: nome e cognome, email, telefono, l&apos;eventuale indirizzo
          dell&apos;immobile da valutare e il contenuto del messaggio. I dati vengono conservati in un archivio protetto (database su server europei) accessibile
          solo al personale dell&apos;agenzia. Non raccogliamo dati in modo automatico, a eccezione delle informazioni tecniche anonime necessarie al
          funzionamento del sito.
        </p>
        <p>
          <strong>Finalità</strong>
          <br />
          I dati vengono utilizzati esclusivamente per rispondere alle richieste e fornire il servizio richiesto (informazioni su un immobile, valutazione,
          contatto). Non li usiamo per marketing automatizzato e non li cediamo a terzi.
        </p>
        <p>
          <strong>Base giuridica</strong>
          <br />
          Consenso dell&apos;interessato, espresso con l&apos;invio del modulo, ed esecuzione di misure precontrattuali adottate su richiesta dell&apos;interessato
          (art. 6, comma 1, lett. a e b del Regolamento UE 2016/679).
        </p>
        <p>
          <strong>Conservazione</strong>
          <br />
          Per il tempo necessario a evadere la richiesta e comunque per un massimo di 24 mesi, salvo obblighi di legge.
        </p>
        <p>
          <strong>Diritti dell&apos;interessato</strong>
          <br />
          Accesso, rettifica, cancellazione, limitazione, portabilità e opposizione al trattamento, scrivendo a {AZIENDA.email}.
        </p>
        <p>
          <strong>Cookie</strong>
          <br />
          Il sito utilizza esclusivamente cookie tecnici necessari al funzionamento (ad esempio per ricordare la chiusura dell&apos;avviso cookie e la sessione
          dell&apos;area riservata). Non vengono utilizzati cookie di profilazione. I video YouTube incorporati nelle schede degli immobili sono caricati in
          modalità &ldquo;privacy avanzata&rdquo; (youtube-nocookie) e la mappa di Google nella pagina contatti è fornita da Google LLC secondo la sua informativa.
        </p>
        <p className="text-[13px] text-muted">Ultimo aggiornamento: settembre 2026</p>
      </div>
    </section>
  );
}

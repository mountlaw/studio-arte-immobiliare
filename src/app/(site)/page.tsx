import Image from "next/image";
import Link from "next/link";
import PropertyCard from "@/components/site/PropertyCard";
import Reviews from "@/components/site/Reviews";
import SearchBar from "@/components/site/SearchBar";
import { BrandLogo } from "@/components/site/Logo";
import { IconArrowRight, IconCheck } from "@/components/ui/Icons";
import { AZIENDA } from "@/lib/config";
import { getCittaDisponibili, getImmobiliEvidenza } from "@/lib/data/immobili";
import { getImpostazioni } from "@/lib/data/impostazioni";
import { getRecensioniPubblicate } from "@/lib/data/recensioni";

export const revalidate = 300;

const SERVIZI = [
  {
    titolo: "Vendita e acquisto",
    desc: "Valutazione accurata, servizio fotografico professionale, strategia di marketing personalizzata e accompagnamento fino al rogito.",
  },
  {
    titolo: "Locazione e gestione",
    desc: "Dalla ricerca dell'inquilino ideale alla gestione del contratto: serenità sia per il proprietario che per chi va ad abitare.",
  },
  {
    titolo: "Consulenza e valutazione",
    desc: "Analisi di mercato approfondita e valutazione professionale gratuita per decidere con consapevolezza sul proprio patrimonio.",
  },
];

export default async function HomePage() {
  const [evidenza, citta, impostazioni, recensioni] = await Promise.all([
    getImmobiliEvidenza(6),
    getCittaDisponibili(),
    getImpostazioni(),
    getRecensioniPubblicate(3),
  ]);
  const hero = impostazioni.hero_image;

  return (
    <>
      {/* HERO */}
      <section className="relative -mt-[72px] min-h-[92vh] overflow-hidden bg-navy-deep text-white">
        {hero ? (
          <Image src={hero} alt="" fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#2a3d66_0%,_#1b2a4a_45%,_#111c33_100%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/70 via-navy-deep/40 to-navy-deep/85" />
        <div className="absolute -right-32 top-24 h-[420px] w-[420px] rounded-full border border-gold/15" />
        <div className="absolute -left-24 bottom-40 h-[260px] w-[260px] rounded-full border border-gold/10" />

        <div className="container-site relative flex min-h-[92vh] flex-col justify-center pb-32 pt-28 md:pb-28">
          <div className="max-w-2xl">
            <div className="animate-fade-up mb-6 flex items-center gap-3">
              <BrandLogo size={84} />
            </div>
            <h1 className="animate-fade-up delay-100 font-display text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
              {impostazioni.hero_titolo || "L'arte di trovare casa"}
            </h1>
            <p className="animate-fade-up delay-200 mt-6 max-w-xl text-lg leading-relaxed text-white/80">
              {impostazioni.hero_sottotitolo}
            </p>
            <div className="animate-fade-up delay-300 mt-8 flex flex-wrap gap-3">
              <Link href="/vendita" className="btn btn-gold">
                Immobili in vendita <IconArrowRight size={18} />
              </Link>
              <Link href="/valuta-casa" className="btn btn-light">
                Valuta la tua casa
              </Link>
            </div>
            <div className="animate-fade-up delay-300 mt-10 text-[12px] font-semibold uppercase tracking-[0.3em] text-gold">
              {AZIENDA.zone.join("  ·  ")}
            </div>
          </div>
        </div>

      </section>

      {/* RICERCA (sovrapposta al bordo inferiore dell'hero) */}
      <div className="container-site relative z-10 -mt-20 md:-mt-14">
        <SearchBar citta={citta} />
      </div>

      {/* IMMOBILI IN EVIDENZA */}
      <section className="container-site pb-16 pt-16 sm:pt-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="eyebrow mb-3">Selezione</div>
            <h2 className="font-display text-4xl font-semibold text-navy sm:text-5xl">Immobili in evidenza</h2>
            <div className="gold-rule mt-5" />
          </div>
          <div className="flex gap-2">
            <Link href="/vendita" className="btn btn-outline btn-sm">
              Tutte le vendite
            </Link>
            <Link href="/affitto" className="btn btn-outline btn-sm">
              Tutti gli affitti
            </Link>
          </div>
        </div>
        {evidenza.length ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {evidenza.map((p, i) => (
              <PropertyCard key={p.id} property={p} priority={i < 3} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-muted">Nuove proposte in arrivo. Torna a trovarci presto.</p>
        )}
      </section>

      {/* APPROCCIO */}
      <section className="container-site py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="eyebrow mb-3">Il nostro approccio</div>
            <h2 className="font-display text-4xl font-semibold leading-tight text-navy sm:text-5xl">Ogni immobile ha una storia. Noi la valorizziamo.</h2>
            <div className="gold-rule mt-5" />
            <p className="mt-6 text-[16px] leading-relaxed text-ink/80">
              Ogni cliente ha un&apos;esigenza diversa. Per questo offriamo un servizio completo e trasparente, dall&apos;incarico alla conclusione della
              trattativa, con la cura che riserveremmo alla nostra casa.
            </p>
            <Link href="/chi-siamo" className="btn btn-primary mt-8">
              Scopri chi siamo
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:col-span-7 lg:grid-cols-1">
            {SERVIZI.map((s, i) => (
              <div key={s.titolo} className="card flex gap-5 p-6">
                <div className="font-display text-4xl font-semibold text-gold">0{i + 1}</div>
                <div>
                  <h3 className="font-display text-[22px] font-semibold text-navy">{s.titolo}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHI SIAMO PREVIEW */}
      <section className="relative overflow-hidden bg-navy py-20 text-white">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-gold/15" />
        <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full border border-gold/10" />
        <div className="container-site relative grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="eyebrow mb-3 text-gold">Non una semplice agenzia</div>
            <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">Sensibilità, tecnica ed esperienza</h2>
            <p className="mt-6 text-[16px] leading-relaxed text-white/80">
              Ci chiamiamo Studio Arte Immobiliare perché crediamo che l&apos;immobiliare sia come l&apos;arte. Siamo nati dall&apos;unione di professionisti
              che hanno scelto di fare squadra, mettendo al centro la persona prima di ogni trattativa.
            </p>
            <ul className="mt-6 space-y-2.5 text-[15px] text-white/85">
              {["Valutazione professionale gratuita", "Foto e video professionali per ogni immobile", "Accompagnamento fino al rogito", "Zona: Milano, Como e Brianza"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-gold">
                    <IconCheck size={14} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/chi-siamo" className="btn btn-gold">
                La nostra storia
              </Link>
              <Link href="/contatti" className="btn btn-light">
                Contattaci
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: "5,0", label: "Valutazione Google" },
              { num: impostazioni.google_reviews_count ? `${impostazioni.google_reviews_count}+` : "70+", label: "Recensioni a 5 stelle" },
              { num: "3", label: "Province servite" },
              { num: "100%", label: "Foto professionali" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
                <div className="font-display text-5xl font-semibold text-gold">{s.num}</div>
                <div className="mt-1 text-[11.5px] font-semibold uppercase tracking-[0.18em] text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Reviews recensioni={recensioni} impostazioni={impostazioni} />

      {/* CTA VALUTAZIONE */}
      <section className="container-site py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gold via-gold to-gold-deep px-8 py-14 text-center text-navy-deep sm:px-16">
          <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/15" />
          <div className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-navy/10" />
          <div className="relative">
            <h2 className="font-display text-4xl font-semibold sm:text-5xl">Quanto vale la tua casa?</h2>
            <p className="mx-auto mt-4 max-w-xl text-[16px] text-navy-deep/80">
              Richiedi una valutazione professionale, gratuita e senza impegno. Ti guidiamo con trasparenza in ogni fase.
            </p>
            <Link href="/valuta-casa" className="btn btn-primary mt-8">
              Richiedi la valutazione gratuita
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

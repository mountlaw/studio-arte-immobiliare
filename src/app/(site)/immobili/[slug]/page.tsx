import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import Gallery from "@/components/site/Gallery";
import PropertyCard, { NonDisponibileBadge, TipoBadge } from "@/components/site/PropertyCard";
import RequestForm from "@/components/site/RequestForm";
import ShareBar from "@/components/site/ShareBar";
import { IconArrowLeft, IconBath, IconBed, IconCheck, IconDoor, IconLeaf, IconMapPin, IconPhone, IconRuler, IconStairs, IconWhatsapp } from "@/components/ui/Icons";
import { AZIENDA, SITE_URL } from "@/lib/config";
import { getImmobileBySlug, getImmobiliSimili } from "@/lib/data/immobili";
import { classeEnergeticaColor, classeEnergeticaLabel, formatNumber, formatPrice, immobileHref, localita, ogImageFor, truncate, youtubeId } from "@/lib/utils";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getImmobileBySlug(slug);
  if (!p) return { title: "Immobile non trovato" };
  const title = `${p.titolo} - ${formatPrice(p.prezzo, p.tipo)}`;
  const description = truncate(p.descrizione || `${p.categoria} ${p.tipo === "vendita" ? "in vendita" : "in affitto"} a ${localita(p)}. ${p.mq} mq, ${p.locali} locali.`, 180);
  const url = `${SITE_URL}${immobileHref(p)}`;
  const image = ogImageFor(SITE_URL, p);
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: p.disponibile ? undefined : { index: false, follow: true },
    openGraph: {
      type: "article",
      url,
      title: `${p.titolo} · ${formatPrice(p.prezzo, p.tipo)}`,
      description,
      siteName: AZIENDA.nome,
      locale: "it_IT",
      images: [{ url: image, width: 1200, height: 800, alt: p.titolo }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ImmobilePage({ params }: Props) {
  const { slug } = await params;
  const p = await getImmobileBySlug(slug);
  if (!p) notFound();
  // URL canonico: se qualcuno arriva con un vecchio slug o con il solo id, rimanda a quello giusto.
  if (p.slug && p.slug !== slug) permanentRedirect(immobileHref(p));

  const simili = await getImmobiliSimili(p, 3);
  const url = `${SITE_URL}${immobileHref(p)}`;
  const nd = !p.disponibile;
  const yt = youtubeId(p.video_url);
  const shareText = `${p.titolo} · ${formatPrice(p.prezzo, p.tipo)} · ${localita(p)}`;
  const whatsapp = `https://wa.me/${AZIENDA.telefonoE164.replace("+", "")}?text=${encodeURIComponent(`Buongiorno, vorrei informazioni sull'immobile "${p.titolo}" (rif. ${p.codice}) ${url}`)}`;

  const stats = [
    p.mq > 0 && { icon: IconRuler, value: `${formatNumber(p.mq)} mq`, label: "Superficie" },
    p.locali > 0 && { icon: IconDoor, value: p.locali, label: "Locali" },
    p.camere > 0 && { icon: IconBed, value: p.camere, label: "Camere" },
    p.bagni > 0 && { icon: IconBath, value: p.bagni, label: "Bagni" },
    p.piano && { icon: IconStairs, value: /^\d+$/.test(p.piano) ? `${p.piano}°` : p.piano, label: "Piano" },
    p.classe_energetica && { icon: IconLeaf, value: classeEnergeticaLabel(p.classe_energetica), label: "Classe energetica", color: classeEnergeticaColor(p.classe_energetica) },
  ].filter(Boolean) as Array<{ icon: typeof IconRuler; value: string | number; label: string; color?: string }>;

  const dettagli = [
    ["Riferimento", p.codice],
    ["Tipologia", p.categoria],
    ["Contratto", p.tipo === "vendita" ? "Vendita" : "Affitto"],
    ["Condizioni", p.stato],
    ["Anno di costruzione", p.anno && p.anno > 1000 ? String(p.anno) : null],
    ["Riscaldamento", p.riscaldamento],
    ["Classe energetica", classeEnergeticaLabel(p.classe_energetica)],
    ["Spese condominiali", p.spese_condominiali ? `${formatNumber(p.spese_condominiali)} €/mese` : null],
    ["Zona", p.zona],
    ["Indirizzo", p.mostra_indirizzo ? p.indirizzo : null],
    ["Disponibilità", p.disponibile ? "Disponibile" : "Non più disponibile"],
  ].filter(([, v]) => v) as Array<[string, string]>;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.titolo,
    url,
    description: truncate(p.descrizione, 300),
    datePosted: p.data_inserimento || p.created_at,
    image: p.immagini.slice(0, 5),
    offers: {
      "@type": "Offer",
      price: p.prezzo,
      priceCurrency: "EUR",
      availability: p.disponibile ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      businessFunction: p.tipo === "vendita" ? "http://purl.org/goodrelations/v1#Sell" : "http://purl.org/goodrelations/v1#LeaseOut",
    },
    about: {
      "@type": p.categoria === "Villa" || p.categoria === "Villetta" ? "House" : "Apartment",
      numberOfRooms: p.locali || undefined,
      numberOfBathroomsTotal: p.bagni || undefined,
      floorSize: p.mq ? { "@type": "QuantitativeValue", value: p.mq, unitCode: "MTK" } : undefined,
      address: { "@type": "PostalAddress", addressLocality: p.citta, addressRegion: p.provincia || undefined, postalCode: p.cap || undefined, addressCountry: "IT" },
    },
    provider: { "@type": "RealEstateAgent", name: AZIENDA.nome, telephone: AZIENDA.telefonoE164, email: AZIENDA.email },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container-site pb-16 pt-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-navy">
            Home
          </Link>
          <span>/</span>
          <Link href={`/${p.tipo}`} className="hover:text-navy">
            {p.tipo === "vendita" ? "Vendita" : "Affitto"}
          </Link>
          <span>/</span>
          <span className="truncate text-ink">{p.titolo}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Colonna principale */}
          <div className="min-w-0 lg:col-span-8">
            <Gallery images={p.immagini} title={p.titolo} nonDisponibile={nd} />

            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-2">
                <TipoBadge tipo={p.tipo} className="!bg-navy !text-white" />
                <span className="badge bg-sand text-navy">{p.categoria}</span>
                {nd && <NonDisponibileBadge />}
                <span className="ml-auto text-[12px] text-muted">Rif. {p.codice}</span>
              </div>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-navy sm:text-5xl">{p.titolo}</h1>
              <div className="mt-3 flex items-center gap-2 text-[15px] text-muted">
                <IconMapPin size={17} className="text-gold" />
                {p.mostra_indirizzo && p.indirizzo ? `${p.indirizzo}, ${localita(p)}` : localita(p)}
              </div>
              <div className={`mt-5 font-display text-4xl font-semibold ${nd ? "text-muted line-through decoration-2" : "text-navy"}`}>{formatPrice(p.prezzo, p.tipo)}</div>
              {nd && <p className="mt-2 text-sm text-muted">Questo immobile non è più disponibile. Contattaci per proposte simili.</p>}
            </div>

            {stats.length > 0 && (
              <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                {stats.map((s) => (
                  <div key={s.label} className="card flex flex-col items-center px-3 py-4 text-center sm:min-w-[130px] sm:flex-1">
                    <s.icon size={22} className="text-navy/70" style={s.color ? { color: s.color } : undefined} />
                    <div className="mt-2 text-[16px] font-semibold text-navy">{s.value}</div>
                    <div className="text-[11px] uppercase tracking-wider text-muted">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8">
              <ShareBar url={url} title={p.titolo} text={shareText} />
            </div>

            {p.descrizione && (
              <section className="mt-10">
                <h2 className="font-display text-3xl font-semibold text-navy">Descrizione</h2>
                <div className="gold-rule mt-3" />
                <div className="prose-site mt-5 whitespace-pre-line text-[16px]">{p.descrizione}</div>
              </section>
            )}

            {p.caratteristiche.length > 0 && (
              <section className="mt-10">
                <h2 className="font-display text-3xl font-semibold text-navy">Caratteristiche</h2>
                <div className="gold-rule mt-3" />
                <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {p.caratteristiche.map((c) => (
                    <li key={c} className="flex items-center gap-3 text-[15px] text-ink/85">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold-deep">
                        <IconCheck size={13} />
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {yt || p.video_url ? (
              <section className="mt-10">
                <h2 className="font-display text-3xl font-semibold text-navy">Video</h2>
                <div className="gold-rule mt-3" />
                <div className="mt-5 overflow-hidden rounded-2xl bg-black shadow-card">
                  <div className="relative aspect-video">
                    {yt ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${yt}?rel=0`}
                        title={`Video: ${p.titolo}`}
                        className="absolute inset-0 h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                      />
                    ) : (
                      <video src={p.video_url!} controls className="absolute inset-0 h-full w-full" preload="metadata" />
                    )}
                  </div>
                </div>
              </section>
            ) : null}

            <section className="mt-10">
              <h2 className="font-display text-3xl font-semibold text-navy">Dettagli</h2>
              <div className="gold-rule mt-3" />
              <dl className="card mt-5 grid gap-x-8 px-6 py-2 sm:grid-cols-2">
                {dettagli.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4 border-b border-line py-3 text-[14.5px] last:border-0 sm:[&:nth-last-child(2)]:border-0">
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-right font-medium text-ink">
                      {k === "Classe energetica" && p.classe_energetica ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: classeEnergeticaColor(p.classe_energetica) }} />
                          {v}
                        </span>
                      ) : (
                        v
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          {/* Sidebar contatto */}
          <aside className="min-w-0 lg:col-span-4">
            <div className="space-y-4 lg:sticky lg:top-24">
              <div className="card overflow-hidden">
                <div className="bg-navy p-5 text-white">
                  <div className="eyebrow text-gold">Ti interessa?</div>
                  <div className="mt-1 font-display text-2xl font-semibold">Parla con noi</div>
                  <p className="mt-1 text-[13.5px] text-white/70">Rispondiamo in giornata, visite anche il sabato.</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <a href={`tel:${AZIENDA.telefonoE164}`} className="btn btn-gold btn-sm">
                      <IconPhone size={16} /> Chiama
                    </a>
                    <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-light btn-sm">
                      <IconWhatsapp size={16} /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
              <RequestForm
                tipo="info"
                compact
                title="Richiedi informazioni"
                subtitle={`Rif. ${p.codice} · ${p.titolo}`}
                hidden={{ immobile_codice: p.codice, immobile_id: String(p.id), immobile_titolo: p.titolo, immobile_url: url }}
                defaultMessage={`Buongiorno, vorrei ricevere maggiori informazioni sull'immobile "${p.titolo}" e, se possibile, fissare una visita.`}
              />
            </div>
          </aside>
        </div>

        <div className="mt-12">
          <Link href={`/${p.tipo}`} className="btn btn-ghost btn-sm -ml-3">
            <IconArrowLeft size={16} /> Torna agli immobili {p.tipo === "vendita" ? "in vendita" : "in affitto"}
          </Link>
        </div>

        {simili.length > 0 && (
          <section className="mt-12 border-t border-line pt-12">
            <div className="eyebrow mb-3">Potrebbero interessarti</div>
            <h2 className="font-display text-4xl font-semibold text-navy">Immobili simili</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {simili.map((s) => (
                <PropertyCard key={s.id} property={s} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

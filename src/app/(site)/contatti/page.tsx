import type { Metadata } from "next";
import GoogleBadge from "@/components/site/GoogleBadge";
import RequestForm from "@/components/site/RequestForm";
import SocialLinks from "@/components/site/SocialLinks";
import { IconClock, IconMail, IconMapPin, IconPhone, IconWhatsapp } from "@/components/ui/Icons";
import { AZIENDA } from "@/lib/config";
import { getImpostazioni } from "@/lib/data/impostazioni";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contatti",
  description: "Studio Arte Immobiliare, Via Unione 15, Lomazzo (CO). Telefono 02 3272465. Scrivici o vieni a trovarci.",
  alternates: { canonical: "/contatti" },
};

export default async function ContattiPage() {
  const impostazioni = await getImpostazioni();
  const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(`${AZIENDA.nome}, ${AZIENDA.indirizzo}, ${AZIENDA.cap} ${AZIENDA.citta}`)}&output=embed`;
  return (
    <>
      <section className="bg-navy py-16 text-white">
        <div className="container-site">
          <div className="eyebrow mb-3 text-gold">Contatti</div>
          <h1 className="font-display text-5xl font-semibold sm:text-6xl">Parliamone</h1>
          <p className="mt-4 max-w-xl text-white/75">Siamo a Lomazzo, tra Milano e Como. Chiamaci, scrivici o vieni a trovarci in ufficio.</p>
        </div>
      </section>

      <section className="container-site grid gap-8 py-14 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <div className="card p-6">
            <ul className="space-y-4 text-[15px]">
              <li className="flex gap-3">
                <IconMapPin size={20} className="mt-0.5 shrink-0 text-gold" />
                <div>
                  <div className="font-semibold text-navy">Ufficio</div>
                  <a href={impostazioni.google_maps_url || "#"} target="_blank" rel="noopener noreferrer" className="text-ink/80 hover:text-navy">
                    {AZIENDA.indirizzo}, {AZIENDA.cap} {AZIENDA.citta} ({AZIENDA.provincia})
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <IconPhone size={20} className="mt-0.5 shrink-0 text-gold" />
                <div>
                  <div className="font-semibold text-navy">Telefono</div>
                  <a href={`tel:${AZIENDA.telefonoE164}`} className="text-ink/80 hover:text-navy">
                    +39 {AZIENDA.telefonoDisplay}
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <IconMail size={20} className="mt-0.5 shrink-0 text-gold" />
                <div>
                  <div className="font-semibold text-navy">Email</div>
                  <a href={`mailto:${AZIENDA.email}`} className="text-ink/80 hover:text-navy">
                    {AZIENDA.email}
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <IconClock size={20} className="mt-0.5 shrink-0 text-gold" />
                <div>
                  <div className="font-semibold text-navy">Orari</div>
                  {AZIENDA.orari.map((o) => (
                    <div key={o.giorni} className="text-ink/80">
                      {o.giorni}: {o.ore}
                    </div>
                  ))}
                </div>
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={`tel:${AZIENDA.telefonoE164}`} className="btn btn-primary btn-sm">
                <IconPhone size={16} /> Chiama ora
              </a>
              <a href={`https://wa.me/${AZIENDA.telefonoE164.replace("+", "")}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                <IconWhatsapp size={16} className="text-[#25D366]" /> WhatsApp
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <GoogleBadge impostazioni={impostazioni} />
              <SocialLinks impostazioni={impostazioni} className="text-navy" />
            </div>
          </div>
          <div className="card overflow-hidden">
            <iframe title="Mappa: Studio Arte Immobiliare" src={mapsEmbed} className="h-72 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
        <div className="lg:col-span-7">
          <RequestForm tipo="contatto" title="Scrivici" subtitle="Compila il modulo: ti rispondiamo il prima possibile." />
        </div>
      </section>
    </>
  );
}

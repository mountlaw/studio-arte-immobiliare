import Link from "next/link";
import { LogoMark } from "./Logo";
import SocialLinks from "./SocialLinks";
import GoogleBadge from "./GoogleBadge";
import { IconMail, IconMapPin, IconPhone } from "@/components/ui/Icons";
import { AZIENDA } from "@/lib/config";
import type { Impostazioni } from "@/lib/types";

export default function Footer({ impostazioni }: { impostazioni: Impostazioni }) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto bg-navy-deep text-white/75">
      <div className="container-site grid gap-10 py-14 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <LogoMark size={48} />
            <div className="leading-none">
              <div className="font-display text-2xl font-bold tracking-[0.16em] text-gold">ARTE</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">Studio Immobiliare</div>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed">
            L&apos;immobiliare è come l&apos;arte: richiede sensibilità, tecnica ed esperienza. Ogni immobile ha una storia. Noi la valorizziamo.
          </p>
          <div className="mt-6">
            <GoogleBadge impostazioni={impostazioni} dark />
          </div>
          <div className="mt-6">
            <SocialLinks impostazioni={impostazioni} className="text-white/70" />
          </div>
        </div>

        <div className="md:col-span-3">
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">Navigazione</h3>
          <ul className="space-y-2.5 text-[15px]">
            {[
              ["/", "Home"],
              ["/vendita", "Immobili in vendita"],
              ["/affitto", "Immobili in affitto"],
              ["/chi-siamo", "Chi siamo"],
              ["/valuta-casa", "Valutazione gratuita"],
              ["/contatti", "Contatti"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="transition hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">Contatti</h3>
          <ul className="space-y-3 text-[15px]">
            <li>
              <a href={impostazioni.google_maps_url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 transition hover:text-white">
                <IconMapPin size={18} className="mt-0.5 shrink-0 text-gold" />
                <span>
                  {AZIENDA.indirizzo}
                  <br />
                  {AZIENDA.cap} {AZIENDA.citta} ({AZIENDA.provincia})
                </span>
              </a>
            </li>
            <li>
              <a href={`tel:${AZIENDA.telefonoE164}`} className="flex items-center gap-3 transition hover:text-white">
                <IconPhone size={18} className="shrink-0 text-gold" /> +39 {AZIENDA.telefonoDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${AZIENDA.email}`} className="flex items-center gap-3 transition hover:text-white">
                <IconMail size={18} className="shrink-0 text-gold" /> {AZIENDA.email}
              </a>
            </li>
          </ul>
          <div className="mt-6 text-[13px] leading-relaxed text-white/55">
            <div className="mb-1 font-semibold text-white/70">Orari</div>
            {AZIENDA.orari.map((o) => (
              <div key={o.giorni}>
                {o.giorni}: {o.ore}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-6 text-[12.5px] text-white/45 md:flex-row">
          <div>
            © {year} {AZIENDA.nome} · P.IVA {AZIENDA.piva}
          </div>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-white/80">
              Privacy &amp; Cookie
            </Link>
            <Link href="/admin" className="hover:text-white/80">
              Area riservata
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

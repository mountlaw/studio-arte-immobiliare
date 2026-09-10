import Image from "next/image";
import Link from "next/link";
import { IconBath, IconBed, IconCamera, IconMapPin, IconRuler } from "@/components/ui/Icons";
import type { Immobile } from "@/lib/types";
import { formatPrice, immobileHref, localita } from "@/lib/utils";

export function TipoBadge({ tipo, className = "" }: { tipo: Immobile["tipo"]; className?: string }) {
  return (
    <span className={`badge ${tipo === "vendita" ? "bg-white/95 text-navy" : "bg-navy/90 text-white"} ${className}`}>
      {tipo === "vendita" ? "In vendita" : "In affitto"}
    </span>
  );
}

export function NonDisponibileBadge({ className = "" }: { className?: string }) {
  return <span className={`badge bg-stone/95 text-navy ${className}`}>Non più disponibile</span>;
}

export default function PropertyCard({ property, priority = false }: { property: Immobile; priority?: boolean }) {
  const href = immobileHref(property);
  const cover = property.immagini[0];
  const nd = !property.disponibile;
  return (
    <Link
      href={href}
      className="group card flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        {cover ? (
          <Image
            src={cover}
            alt={property.titolo}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-transform duration-700 group-hover:scale-[1.04] ${nd ? "saturate-[0.35]" : ""}`}
            priority={priority}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <IconCamera size={36} />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-deep/70 via-navy-deep/0 to-navy-deep/0" />
        <div className="absolute left-3 top-3 flex gap-2">
          <TipoBadge tipo={property.tipo} />
          {property.evidenza && property.disponibile && <span className="badge bg-gold text-navy-deep">In evidenza</span>}
        </div>
        {nd && (
          <div className="absolute inset-0 flex items-center justify-center">
            <NonDisponibileBadge className="px-4 py-1.5 text-[12px] shadow-lg" />
          </div>
        )}
        {property.immagini.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
            <IconCamera size={13} /> {property.immagini.length}
          </div>
        )}
        <div className={`absolute bottom-3 left-3 font-display text-[26px] font-semibold leading-none text-white drop-shadow ${nd ? "opacity-70" : ""}`}>
          {formatPrice(property.prezzo, property.tipo)}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="eyebrow mb-1.5">{property.categoria}</div>
        <h3 className="line-clamp-2 font-display text-[21px] font-semibold leading-tight text-navy group-hover:text-navy-soft">{property.titolo}</h3>
        <div className="mt-2 flex items-center gap-1.5 text-[13.5px] text-muted">
          <IconMapPin size={15} className="shrink-0 text-gold" /> <span className="truncate">{localita(property)}</span>
        </div>
        <div className="mt-4 flex items-center gap-4 border-t border-line pt-4 text-[13px] text-ink/80">
          {property.mq > 0 && (
            <span className="flex items-center gap-1.5">
              <IconRuler size={16} className="text-navy/60" /> <strong className="font-semibold">{property.mq}</strong> mq
            </span>
          )}
          {property.locali > 0 && (
            <span className="flex items-center gap-1.5">
              <strong className="font-semibold">{property.locali}</strong> locali
            </span>
          )}
          {property.camere > 0 && (
            <span className="flex items-center gap-1.5">
              <IconBed size={16} className="text-navy/60" /> <strong className="font-semibold">{property.camere}</strong>
            </span>
          )}
          {property.bagni > 0 && (
            <span className="flex items-center gap-1.5">
              <IconBath size={16} className="text-navy/60" /> <strong className="font-semibold">{property.bagni}</strong>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

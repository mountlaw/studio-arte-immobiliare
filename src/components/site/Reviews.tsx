import GoogleBadge from "./GoogleBadge";
import { IconGoogle, IconStar } from "@/components/ui/Icons";
import type { Impostazioni, Recensione } from "@/lib/types";

export default function Reviews({ recensioni, impostazioni }: { recensioni: Recensione[]; impostazioni: Impostazioni }) {
  const url = impostazioni.google_reviews_url || impostazioni.google_maps_url;
  if (!recensioni.length && !url) return null;
  return (
    <section className="bg-white py-20">
      <div className="container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="eyebrow mb-3">Recensioni</div>
            <h2 className="font-display text-4xl font-semibold text-navy sm:text-5xl">Cosa dicono i nostri clienti</h2>
            <div className="gold-rule mt-5" />
          </div>
          <GoogleBadge impostazioni={impostazioni} size="lg" />
        </div>

        {recensioni.length > 0 && (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {recensioni.map((r) => (
              <figure key={r.id} className="relative flex flex-col rounded-2xl bg-cream p-7">
                <span className="absolute right-6 top-5 font-display text-7xl leading-none text-gold/25">&rdquo;</span>
                <div className="flex gap-0.5 text-gold">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <IconStar key={n} size={15} filled={n <= r.stelle} className={n <= r.stelle ? "" : "text-stone"} />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-ink/85">{r.testo}</blockquote>
                <figcaption className="mt-5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-navy">{r.nome}</div>
                    {r.citta && <div className="text-[12.5px] text-muted">{r.citta}</div>}
                  </div>
                  {r.fonte === "google" && (
                    <span className="flex items-center gap-1 text-[12px] text-muted">
                      <IconGoogle size={14} /> Google
                    </span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        {url && (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              Leggi tutte le recensioni su Google
            </a>
            {impostazioni.google_write_review_url && (
              <a href={impostazioni.google_write_review_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                Lascia una recensione
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

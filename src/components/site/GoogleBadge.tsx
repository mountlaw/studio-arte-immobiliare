import { IconGoogle, IconStar } from "@/components/ui/Icons";
import type { Impostazioni } from "@/lib/types";

/** Badge con il voto Google e il link alle recensioni. */
export default function GoogleBadge({ impostazioni, dark = false, size = "md" }: { impostazioni: Impostazioni; dark?: boolean; size?: "md" | "lg" }) {
  const url = impostazioni.google_reviews_url || impostazioni.google_maps_url;
  if (!url) return null;
  const rating = impostazioni.google_rating || "5,0";
  const count = impostazioni.google_reviews_count;
  const big = size === "lg";
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-3 rounded-full border px-4 ${big ? "py-3" : "py-2"} transition ${
        dark ? "border-white/15 bg-white/5 hover:bg-white/10" : "border-line bg-white shadow-card hover:shadow-card-hover"
      }`}
    >
      <IconGoogle size={big ? 22 : 18} className={dark ? "text-white" : "text-navy"} />
      <span className="flex items-center gap-1 text-gold">
        {[0, 1, 2, 3, 4].map((i) => (
          <IconStar key={i} size={big ? 15 : 13} />
        ))}
      </span>
      <span className={`text-sm ${dark ? "text-white" : "text-navy"}`}>
        <strong className="font-semibold">{rating}</strong>
        {count ? <span className={dark ? "text-white/60" : "text-muted"}> · {count} recensioni Google</span> : <span className={dark ? "text-white/60" : "text-muted"}> su Google</span>}
      </span>
    </a>
  );
}

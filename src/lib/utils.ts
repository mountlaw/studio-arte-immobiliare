import type { Immobile, Tipo } from "./types";

export function formatPrice(price: number | null | undefined, tipo?: Tipo) {
  if (price === null || price === undefined || Number.isNaN(Number(price))) return "";
  const n = Number(price);
  if (n <= 0) return "Trattativa riservata";
  const formatted = formatNumber(n);
  return tipo === "affitto" ? `${formatted} €/mese` : `${formatted} €`;
}

const NUM_IT = new Intl.NumberFormat("it-IT", { useGrouping: "always" as unknown as boolean });

/** Numeri all'italiana con il punto delle migliaia anche sotto i 10.000 (2.100 €). */
export function formatNumber(n: number | null | undefined) {
  if (n === null || n === undefined) return "";
  return NUM_IT.format(Number(n));
}

export function formatDate(iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" }) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("it-IT", opts).format(new Date(iso));
  } catch {
    return "";
  }
}

export function formatDateTime(iso: string | null | undefined) {
  return formatDate(iso, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Slug definitivo: titolo + id, sempre univoco e stabile. */
export function buildSlug(titolo: string, id: number) {
  const base = slugify(titolo || "immobile") || "immobile";
  return `${base}-${id}`;
}

/** Ricava l'id numerico da uno slug (l'ultimo segmento dopo il trattino). */
export function idFromSlug(slug: string): number | null {
  const m = slug.match(/-(\d+)$/);
  if (m) return Number(m[1]);
  if (/^\d+$/.test(slug)) return Number(slug);
  return null;
}

export function immobileHref(p: Pick<Immobile, "slug" | "id" | "titolo">) {
  return `/immobili/${p.slug || buildSlug(p.titolo, p.id)}`;
}

export function tipoLabel(tipo: Tipo, inForm = false) {
  if (tipo === "affitto") return inForm ? "In affitto" : "Affitto";
  return inForm ? "In vendita" : "Vendita";
}

export function localita(p: Pick<Immobile, "citta" | "zona">) {
  return p.zona ? `${p.citta} · ${p.zona}` : p.citta;
}

export function classeEnergeticaLabel(c: string | null | undefined) {
  if (!c) return "N.D.";
  if (c.toLowerCase() === "in corso") return "APE in corso";
  if (c.toLowerCase() === "non disponibile") return "N.D.";
  return c;
}

export function classeEnergeticaColor(c: string | null | undefined) {
  const v = (c || "").toUpperCase();
  if (v.startsWith("A")) return "#1f8f4a";
  if (v === "B") return "#4caf50";
  if (v === "C") return "#8bc34a";
  if (v === "D") return "#d4c02a";
  if (v === "E") return "#e0a028";
  if (v === "F") return "#e07b28";
  if (v === "G") return "#c65a3b";
  return "#8a8f98";
}

export function youtubeId(url: string | null | undefined) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.split("/").filter(Boolean)[0] || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || null;
      return u.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

export function truncate(text: string | null | undefined, n = 160) {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= n) return clean;
  return clean.slice(0, n - 1).replace(/\s\S*$/, "") + "…";
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Prima foto dell'immobile ridimensionata dal server per le anteprime social. */
export function ogImageFor(siteUrl: string, p: Pick<Immobile, "immagini">) {
  const first = p.immagini?.[0];
  if (!first) return `${siteUrl}/og-default.jpg`;
  return `${siteUrl}/_next/image?url=${encodeURIComponent(first)}&w=1200&q=75`;
}

export function toNumber(v: unknown, fallback = 0) {
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(/[^\d.,-]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

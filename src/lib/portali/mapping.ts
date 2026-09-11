import type { Immobile } from "@/lib/types";

/** Tipologia Immobiliare.it (attributo IDType) a partire dalla categoria del sito. */
export const IMMOBILIARE_TIPOLOGIE: Record<string, number> = {
  Appartamento: 14,
  Attico: 15,
  Mansarda: 16,
  Loft: 17,
  Villa: 23,
  "Villa a schiera": 26,
  Villetta: 23,
  "Casa indipendente": 21,
  Rustico: 28,
  Ufficio: 258,
  Negozio: 268,
  Box: 253,
  "Posto auto": 254,
  Terreno: 261,
  Altro: 14,
};

/** Tipologia idealista (propertyType) a partire dalla categoria del sito. */
export const IDEALISTA_TIPOLOGIE: Record<string, string> = {
  Appartamento: "flat",
  Attico: "penthouse",
  Mansarda: "flat",
  Loft: "flat",
  Villa: "house",
  "Villa a schiera": "house",
  Villetta: "house",
  "Casa indipendente": "house",
  Rustico: "countryHouse",
  Ufficio: "office",
  Negozio: "premises",
  Box: "garage",
  "Posto auto": "garage",
  Terreno: "land",
  Altro: "flat",
};

export function immobiliareStatus(stato: string | null) {
  const s = (stato || "").toLowerCase();
  const map: Record<string, string> = {
    nuovo: "nuovo",
    ottimo: "ottimo",
    ristrutturato: "ristrutturato",
    buono: "buono",
    abitabile: "abitabile",
    "da ristrutturare": "da ristrutturare",
    discreto: "discreto",
    "in costruzione": "in costruzione",
  };
  return map[s] || "nd";
}

/** Classe energetica per il feed: valore + flag certificato. */
export function immobiliareEnergy(classe: string | null): { value: string; certified: boolean } {
  const c = (classe || "").trim();
  const lower = c.toLowerCase();
  if (!c || lower === "in corso" || lower === "non disponibile" || lower === "nd" || lower === "n.d.") return { value: "NC", certified: false };
  if (lower === "esente") return { value: "esente", certified: true };
  const ok = ["A4", "A3", "A2", "A1", "A+", "A", "B", "C", "D", "E", "F", "G"];
  const up = c.toUpperCase();
  if (ok.includes(up)) return { value: up, certified: true };
  return { value: "NC", certified: false };
}

/** Interpreta il campo "piano" scritto a mano (es. "3", "Terra", "Rialzato", "5 di 6"). */
export function parsePiano(piano: string | null): { type?: string; value?: number } | null {
  if (!piano) return null;
  const p = piano.trim().toLowerCase();
  if (!p) return null;
  if (/^(t|pt|terra|piano terra|p\.?t\.?)$/.test(p)) return { type: "PianoTerra", value: 0 };
  if (/rialzat/.test(p)) return { type: "Rialzato", value: 0 };
  if (/seminterrat/.test(p)) return { type: "Seminterrato", value: -1 };
  if (/interrat|scantinat/.test(p)) return { type: "Interrato", value: -1 };
  if (/ammezzat/.test(p)) return { type: "Ammezzato", value: 0 };
  if (/ultimo/.test(p)) return { type: "Ultimo" };
  if (/attico/.test(p)) return { type: "Attico" };
  if (/multipiano|piu' piani|più piani|su due|su tre|livelli/.test(p)) return { type: "Multipiano" };
  const m = p.match(/-?\d+/);
  if (m) {
    const n = Number(m[0]);
    if (n === 0) return { type: "PianoTerra", value: 0 };
    if (n < 0) return { type: "Interrato", value: n };
    return { type: "Intermedio", value: n };
  }
  return null;
}

const has = (list: string[], re: RegExp) => list.some((c) => re.test(c.toLowerCase()));

/** Deduce le caratteristiche strutturate dai "chip" liberi inseriti nell'annuncio. */
export function deriveExtraFeatures(p: Immobile) {
  const c = p.caratteristiche || [];
  const desc = (p.descrizione || "").toLowerCase();
  return {
    elevator: has(c, /ascensore/) || undefined,
    balcony: has(c, /balcon/) || undefined,
    terrace: has(c, /terrazz/) || undefined,
    garden: has(c, /giardino privato|giardino/) ? (has(c, /condominial|comune/) ? "Comune" : "Privato") : undefined,
    garage: has(c, /box|garage|posto auto|posti auto/) ? { type: has(c, /box|garage/) ? "Box" : "PostoAuto", count: 1 } : undefined,
    furniture: has(c, /arredat/) ? (has(c, /parzialmente/) ? "Parzialmente Arredato" : "Arredato") : desc.includes("non arredato") ? "Non Arredato" : undefined,
    alarm: has(c, /allarme/) || undefined,
    airConditioning: has(c, /aria condizionata|climatizz/) || undefined,
    fireplace: has(c, /camino/) || undefined,
    pool: has(c, /piscina/) || undefined,
    cellar: has(c, /cantina/) || undefined,
    lakeView: has(c, /vista lago/) || undefined,
    reception: has(c, /portiner/) || undefined,
  };
}

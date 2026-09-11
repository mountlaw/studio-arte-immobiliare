import { AZIENDA, SITE_URL } from "@/lib/config";
import type { Immobile } from "@/lib/types";
import { immobileHref, youtubeId } from "@/lib/utils";
import { trovaComune } from "./geo";
import { IDEALISTA_TIPOLOGIE, deriveExtraFeatures, immobiliareEnergy, parsePiano } from "./mapping";
import { fotoPerPortali } from "./immobiliare";

/**
 * Export per idealista.
 *
 * idealista non pubblica specifiche aperte: l'import da gestionali esterni
 * avviene tramite la loro API JSON, le cui credenziali e documentazione vengono
 * consegnate dal team integrazioni idealista/tools dopo l'attivazione.
 * Questo modulo produce gia' un JSON completo e ordinato con tutti i campi che
 * idealista richiede (codice, operazione, tipologia, prezzo, superficie, locali,
 * bagni, indirizzo, comune, provincia, coordinate, descrizione, foto, classe
 * energetica, piano, ascensore...). Quando arrivano le specifiche ufficiali basta
 * adattare i nomi dei campi in `toIdealista` e l'endpoint in `pushIdealista`.
 */

export interface IdealistaListing {
  propertyCode: string;
  externalReference: string;
  operation: "sale" | "rent";
  propertyType: string;
  status: "active" | "inactive";
  price: number;
  currency: "EUR";
  communityFees: number | null;
  size: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  floor: string | null;
  floorNumber: number | null;
  hasLift: boolean | null;
  condition: string | null;
  constructionYear: number | null;
  energyCertification: { rating: string | null; status: "certified" | "inProcess" | "exempt" };
  address: {
    street: string | null;
    showAddress: boolean;
    postalCode: string | null;
    municipality: string;
    municipalityCode: string | null;
    province: string | null;
    region: string | null;
    country: "IT";
    latitude: number | null;
    longitude: number | null;
    neighborhood: string | null;
  };
  description: { it: string };
  title: { it: string };
  features: {
    terrace: boolean;
    balcony: boolean;
    garden: boolean;
    parkingSpace: boolean;
    furnished: boolean | null;
    airConditioning: boolean;
    swimmingPool: boolean;
    storageRoom: boolean;
    alarm: boolean;
    doorman: boolean;
  };
  tags: string[];
  images: Array<{ url: string; position: number }>;
  videos: string[];
  url: string;
  publishedAt: string;
  updatedAt: string;
  agency: { name: string; email: string; phone: string; website: string };
}

export function toIdealista(p: Immobile): IdealistaListing {
  const comune = trovaComune(p.citta);
  const energy = immobiliareEnergy(p.classe_energetica);
  const piano = parsePiano(p.piano);
  const extra = deriveExtraFeatures(p);
  const attivo = p.pubblicato && p.disponibile && p.pubblica_portali;
  const yt = youtubeId(p.video_url);
  return {
    propertyCode: String(p.id),
    externalReference: p.codice,
    operation: p.tipo === "affitto" ? "rent" : "sale",
    propertyType: IDEALISTA_TIPOLOGIE[p.categoria] || "flat",
    status: attivo ? "active" : "inactive",
    price: Math.round(p.prezzo),
    currency: "EUR",
    communityFees: p.spese_condominiali ?? null,
    size: p.mq,
    rooms: p.locali,
    bedrooms: p.camere,
    bathrooms: p.bagni,
    floor: piano?.type ?? null,
    floorNumber: piano?.value ?? null,
    hasLift: extra.elevator ?? null,
    condition: p.stato,
    constructionYear: p.anno && p.anno >= 1000 ? p.anno : null,
    energyCertification: {
      rating: energy.value === "NC" || energy.value === "esente" ? null : energy.value,
      status: energy.value === "esente" ? "exempt" : energy.certified ? "certified" : "inProcess",
    },
    address: {
      street: p.indirizzo,
      showAddress: p.mostra_indirizzo,
      postalCode: p.cap,
      municipality: comune?.nome || p.citta,
      municipalityCode: comune?.istat || null,
      province: p.provincia || comune?.provincia || null,
      region: comune?.regione || null,
      country: "IT",
      latitude: p.latitudine,
      longitude: p.longitudine,
      neighborhood: p.zona,
    },
    description: { it: p.descrizione || p.titolo },
    title: { it: p.titolo },
    features: {
      terrace: Boolean(extra.terrace),
      balcony: Boolean(extra.balcony),
      garden: Boolean(extra.garden),
      parkingSpace: Boolean(extra.garage),
      furnished: extra.furniture ? extra.furniture !== "Non Arredato" : null,
      airConditioning: Boolean(extra.airConditioning),
      swimmingPool: Boolean(extra.pool),
      storageRoom: Boolean(extra.cellar),
      alarm: Boolean(extra.alarm),
      doorman: Boolean(extra.reception),
    },
    tags: p.caratteristiche,
    images: p.immagini.slice(0, 100).map((url, i) => ({ url: fotoPerPortali(url), position: i + 1 })),
    videos: yt ? [`https://www.youtube.com/watch?v=${yt}`] : [],
    url: `${SITE_URL}${immobileHref(p)}`,
    publishedAt: p.data_inserimento || p.created_at,
    updatedAt: p.updated_at || p.created_at,
    agency: { name: AZIENDA.nome, email: AZIENDA.email, phone: AZIENDA.telefonoE164, website: SITE_URL },
  };
}

export function idealistaConfig() {
  const url = process.env.IDEALISTA_API_URL;
  const key = process.env.IDEALISTA_API_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key, secret: process.env.IDEALISTA_API_SECRET || "", agencyId: process.env.IDEALISTA_AGENCY_ID || "" };
}

/**
 * Invio a idealista. L'endpoint e l'autenticazione vanno allineati alle
 * specifiche consegnate da idealista all'attivazione (qui: POST JSON con
 * Bearer token, che e' lo schema piu' comune).
 */
export async function pushIdealista(p: Immobile): Promise<{ ok: boolean; id?: string; message: string }> {
  const cfg = idealistaConfig();
  if (!cfg) return { ok: false, message: "Credenziali API idealista non configurate" };
  const body = toIdealista(p);
  const res = await fetch(`${cfg.url}/listings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.key}`, ...(cfg.agencyId ? { "X-Agency-Id": cfg.agencyId } : {}) },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let id: string | undefined;
  try {
    const j = JSON.parse(text);
    id = j.id || j.listingId || j.propertyId;
  } catch {
    /* risposta non JSON */
  }
  return { ok: res.ok, id: id ? String(id) : undefined, message: `HTTP ${res.status} · ${text.slice(0, 200)}` };
}

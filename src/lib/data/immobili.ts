import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { supabasePublic } from "@/lib/supabase/public";
import type { FiltriRicerca, Immobile, Tipo } from "@/lib/types";
import { buildSlug, idFromSlug, toNumber } from "@/lib/utils";

/**
 * Normalizza una riga del database in un Immobile completo, con valori di
 * default per le colonne aggiunte dalla migrazione v2 (cosi' il sito regge
 * anche se la migrazione non e' ancora stata lanciata).
 */
export function normalizeImmobile(row: Record<string, unknown>): Immobile {
  const id = Number(row.id);
  const titolo = String(row.titolo ?? "");
  const immagini = Array.isArray(row.immagini) ? (row.immagini as string[]).filter(Boolean) : [];
  const caratteristiche = Array.isArray(row.caratteristiche) ? (row.caratteristiche as string[]).filter(Boolean) : [];
  return {
    id,
    codice: String(row.codice ?? ""),
    slug: (row.slug as string) || buildSlug(titolo, id),
    titolo,
    tipo: (row.tipo === "affitto" ? "affitto" : "vendita") as Tipo,
    categoria: String(row.categoria ?? "Appartamento"),
    locali: toNumber(row.locali),
    camere: toNumber(row.camere),
    bagni: toNumber(row.bagni),
    mq: toNumber(row.mq),
    prezzo: toNumber(row.prezzo),
    citta: String(row.citta ?? ""),
    zona: (row.zona as string) || null,
    indirizzo: (row.indirizzo as string) || null,
    cap: (row.cap as string) || null,
    provincia: (row.provincia as string) || null,
    piano: row.piano === null || row.piano === undefined ? null : String(row.piano),
    anno: row.anno ? toNumber(row.anno) : null,
    stato: (row.stato as string) || null,
    classe_energetica: (row.classe_energetica as string) || null,
    riscaldamento: (row.riscaldamento as string) || null,
    descrizione: (row.descrizione as string) || null,
    caratteristiche,
    immagini,
    video_url: (row.video_url as string) || null,
    spese_condominiali: row.spese_condominiali === null || row.spese_condominiali === undefined ? null : toNumber(row.spese_condominiali),
    latitudine: row.latitudine === null || row.latitudine === undefined ? null : Number(row.latitudine),
    longitudine: row.longitudine === null || row.longitudine === undefined ? null : Number(row.longitudine),
    mostra_indirizzo: Boolean(row.mostra_indirizzo ?? false),
    evidenza: Boolean(row.evidenza),
    pubblicato: Boolean(row.pubblicato),
    disponibile: row.disponibile === undefined || row.disponibile === null ? true : Boolean(row.disponibile),
    pubblica_portali: row.pubblica_portali === undefined || row.pubblica_portali === null ? true : Boolean(row.pubblica_portali),
    immobiliare_id: (row.immobiliare_id as string) || null,
    idealista_id: (row.idealista_id as string) || null,
    portali_sync_at: (row.portali_sync_at as string) || null,
    portali_errore: (row.portali_errore as string) || null,
    data_inserimento: (row.data_inserimento as string) || null,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? row.created_at ?? ""),
  };
}

type Client = SupabaseClient<Database>;

const ORDER = [
  ["evidenza", { ascending: false }],
  ["created_at", { ascending: false }],
] as const;

/** Tutti gli immobili pubblicati, opzionalmente filtrati. */
export async function getImmobiliPubblicati(filtri: FiltriRicerca = {}, client: Client = supabasePublic()) {
  let q = client.from("immobili").select("*").eq("pubblicato", true);
  if (filtri.tipo) q = q.eq("tipo", filtri.tipo);
  if (filtri.categoria) q = q.eq("categoria", filtri.categoria);
  if (filtri.citta) q = q.ilike("citta", filtri.citta);
  if (filtri.prezzoMax) q = q.lte("prezzo", filtri.prezzoMax);
  if (filtri.localiMin) q = q.gte("locali", filtri.localiMin);
  if (filtri.q) {
    const term = `%${filtri.q.replace(/[%_]/g, "")}%`;
    q = q.or(`titolo.ilike.${term},zona.ilike.${term},citta.ilike.${term},indirizzo.ilike.${term},codice.ilike.${term}`);
  }
  for (const [col, opt] of ORDER) q = q.order(col, opt);
  const { data, error } = await q;
  if (error) {
    console.error("getImmobiliPubblicati", error.message);
    return [];
  }
  return (data ?? []).map(normalizeImmobile);
}

export async function getImmobiliEvidenza(limit = 6, client: Client = supabasePublic()) {
  const { data, error } = await client
    .from("immobili")
    .select("*")
    .eq("pubblicato", true)
    .order("evidenza", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("getImmobiliEvidenza", error.message);
    return [];
  }
  const all = (data ?? []).map(normalizeImmobile);
  // Prima quelli in evidenza e disponibili, poi gli altri per completare la griglia.
  return [...all.filter((p) => p.evidenza && p.disponibile), ...all.filter((p) => !(p.evidenza && p.disponibile))].slice(0, limit);
}

/** Cerca un immobile pubblicato per slug (o per id numerico in coda allo slug). */
export async function getImmobileBySlug(slug: string, client: Client = supabasePublic()) {
  const bySlug = await client.from("immobili").select("*").eq("slug", slug).eq("pubblicato", true).maybeSingle();
  if (bySlug.data) return normalizeImmobile(bySlug.data as Record<string, unknown>);
  const id = idFromSlug(slug);
  if (id) {
    const byId = await client.from("immobili").select("*").eq("id", id).eq("pubblicato", true).maybeSingle();
    if (byId.data) return normalizeImmobile(byId.data as Record<string, unknown>);
  }
  return null;
}

export async function getImmobiliSimili(p: Immobile, limit = 3, client: Client = supabasePublic()) {
  const { data } = await client
    .from("immobili")
    .select("*")
    .eq("pubblicato", true)
    .eq("tipo", p.tipo)
    .neq("id", p.id)
    .order("created_at", { ascending: false })
    .limit(12);
  const list = (data ?? []).map(normalizeImmobile).filter((x) => x.disponibile);
  const sameCity = list.filter((x) => x.citta.toLowerCase() === p.citta.toLowerCase());
  const rest = list.filter((x) => x.citta.toLowerCase() !== p.citta.toLowerCase());
  return [...sameCity, ...rest].slice(0, limit);
}

/** Citta' distinte tra gli immobili pubblicati (per i filtri). */
export async function getCittaDisponibili(client: Client = supabasePublic()) {
  const { data } = await client.from("immobili").select("citta").eq("pubblicato", true);
  const set = new Map<string, string>();
  for (const r of data ?? []) {
    const c = String((r as { citta: string }).citta ?? "").trim();
    if (c) set.set(c.toLowerCase(), c);
  }
  return [...set.values()].sort((a, b) => a.localeCompare(b, "it"));
}

/** Tutti gli immobili (admin: include bozze). */
export async function getTuttiImmobili(client: Client) {
  const { data, error } = await client.from("immobili").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizeImmobile);
}

export async function getImmobileById(id: number, client: Client) {
  const { data, error } = await client.from("immobili").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? normalizeImmobile(data as Record<string, unknown>) : null;
}

export async function getImmobileByCodice(codice: string, client: Client) {
  const { data, error } = await client.from("immobili").select("*").eq("codice", codice).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? normalizeImmobile(data as Record<string, unknown>) : null;
}

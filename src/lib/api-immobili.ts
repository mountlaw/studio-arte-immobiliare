import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { CATEGORIE, CLASSI_ENERGETICHE, CONDIZIONI, RISCALDAMENTI } from "@/lib/config";
import { normalizeImmobile } from "@/lib/data/immobili";
import { sincronizzaImmobile } from "@/lib/portali/sync";
import type { Database } from "@/lib/supabase/database.types";
import type { Immobile } from "@/lib/types";
import { buildSlug, immobileHref, toNumber } from "@/lib/utils";
import { SITE_URL } from "@/lib/config";

type Client = SupabaseClient<Database>;

/** Formato pubblico dell'annuncio restituito dalle API. */
export function toApi(p: Immobile) {
  return {
    id: p.id,
    codice: p.codice,
    url: `${SITE_URL}${immobileHref(p)}`,
    titolo: p.titolo,
    tipo: p.tipo,
    categoria: p.categoria,
    prezzo: p.prezzo,
    spese_condominiali: p.spese_condominiali,
    mq: p.mq,
    locali: p.locali,
    camere: p.camere,
    bagni: p.bagni,
    piano: p.piano,
    anno: p.anno,
    condizioni: p.stato,
    classe_energetica: p.classe_energetica,
    riscaldamento: p.riscaldamento,
    citta: p.citta,
    zona: p.zona,
    indirizzo: p.indirizzo,
    cap: p.cap,
    provincia: p.provincia,
    latitudine: p.latitudine,
    longitudine: p.longitudine,
    mostra_indirizzo: p.mostra_indirizzo,
    descrizione: p.descrizione,
    caratteristiche: p.caratteristiche,
    immagini: p.immagini,
    video_url: p.video_url,
    pubblicato: p.pubblicato,
    disponibile: p.disponibile,
    evidenza: p.evidenza,
    pubblica_portali: p.pubblica_portali,
    portali: { immobiliare_id: p.immobiliare_id, idealista_id: p.idealista_id, ultima_sincronizzazione: p.portali_sync_at, errore: p.portali_errore },
    data_inserimento: p.data_inserimento,
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const str = (v: unknown, max = 500) => (v === undefined ? undefined : String(v ?? "").trim().slice(0, max));

/**
 * Valida e normalizza il body JSON in un oggetto pronto per il database.
 * Con `partial` (PATCH) i campi assenti non vengono toccati.
 */
export function validaBody(body: Record<string, unknown>, partial = false) {
  const out: Record<string, unknown> = {};
  const set = (k: string, v: unknown) => {
    if (v !== undefined) out[k] = v;
  };

  if (!partial || body.titolo !== undefined) {
    const t = str(body.titolo, 200);
    if (!t) throw new ApiError("Campo obbligatorio: titolo");
    set("titolo", t);
  }
  if (!partial || body.tipo !== undefined) {
    const tipo = str(body.tipo, 20)?.toLowerCase();
    if (!["vendita", "affitto"].includes(tipo || "")) throw new ApiError("Campo tipo: usare 'vendita' o 'affitto'");
    set("tipo", tipo);
  }
  if (!partial || body.prezzo !== undefined) {
    const prezzo = toNumber(body.prezzo, -1);
    if (prezzo < 0) throw new ApiError("Campo prezzo non valido");
    set("prezzo", Math.round(prezzo));
  }
  if (!partial || body.citta !== undefined) {
    const c = str(body.citta, 120);
    if (!c) throw new ApiError("Campo obbligatorio: citta");
    set("citta", c);
  }
  if (body.codice !== undefined) set("codice", str(body.codice, 80));
  if (body.categoria !== undefined) {
    const cat = str(body.categoria, 60) || "Appartamento";
    const match = CATEGORIE.find((c) => c.toLowerCase() === cat.toLowerCase());
    set("categoria", match || cat);
  } else if (!partial) set("categoria", "Appartamento");

  for (const k of ["locali", "camere", "bagni", "mq"]) {
    if (body[k] !== undefined) set(k, Math.max(0, Math.round(toNumber(body[k]))));
  }
  if (body.spese_condominiali !== undefined) set("spese_condominiali", body.spese_condominiali === null ? null : Math.round(toNumber(body.spese_condominiali)));
  if (body.anno !== undefined) set("anno", toNumber(body.anno) >= 1000 ? Math.round(toNumber(body.anno)) : null);
  if (body.piano !== undefined) set("piano", str(body.piano, 30) || null);
  for (const k of ["zona", "indirizzo"]) if (body[k] !== undefined) set(k, str(body[k], 200) || null);
  if (body.cap !== undefined) set("cap", str(body.cap, 10) || null);
  if (body.provincia !== undefined) set("provincia", str(body.provincia, 4)?.toUpperCase() || null);
  if (body.latitudine !== undefined) set("latitudine", body.latitudine === null ? null : Number(body.latitudine) || null);
  if (body.longitudine !== undefined) set("longitudine", body.longitudine === null ? null : Number(body.longitudine) || null);

  const condizioni = body.condizioni ?? body.stato;
  if (condizioni !== undefined) {
    const c = str(condizioni, 40) || "";
    set("stato", CONDIZIONI.find((x) => x.toLowerCase() === c.toLowerCase()) || c || null);
  }
  if (body.classe_energetica !== undefined) {
    const c = str(body.classe_energetica, 20) || "In corso";
    set("classe_energetica", CLASSI_ENERGETICHE.find((x) => x.toLowerCase() === c.toLowerCase()) || c);
  } else if (!partial) set("classe_energetica", "In corso");
  if (body.riscaldamento !== undefined) {
    const r = str(body.riscaldamento, 40) || "";
    set("riscaldamento", RISCALDAMENTI.find((x) => x.toLowerCase() === r.toLowerCase()) || r || null);
  }
  if (body.descrizione !== undefined) set("descrizione", str(body.descrizione, 8000) || null);
  if (body.caratteristiche !== undefined) {
    if (!Array.isArray(body.caratteristiche)) throw new ApiError("Campo caratteristiche: deve essere una lista di testi");
    set("caratteristiche", body.caratteristiche.map((c) => str(c, 60)).filter(Boolean).slice(0, 40));
  }
  if (body.immagini !== undefined) {
    if (!Array.isArray(body.immagini)) throw new ApiError("Campo immagini: deve essere una lista di URL");
    const imgs = body.immagini.map((c) => str(c, 600) || "").filter((u) => /^https?:\/\//.test(u));
    set("immagini", imgs.slice(0, 100));
  }
  if (body.video_url !== undefined) set("video_url", str(body.video_url, 400) || null);
  for (const k of ["pubblicato", "disponibile", "evidenza", "pubblica_portali", "mostra_indirizzo"]) {
    if (body[k] !== undefined) set(k, Boolean(body[k]));
  }
  if (body.data_inserimento !== undefined) set("data_inserimento", str(body.data_inserimento, 10) || null);
  return out;
}

export async function creaImmobileApi(db: Client, body: Record<string, unknown>) {
  const data = validaBody(body, false);
  if (!data.codice) data.codice = `API${Date.now().toString().slice(-8)}`;
  if (data.pubblicato === undefined) data.pubblicato = true;
  const { data: row, error } = await db
    .from("immobili")
    .insert(data as Database["public"]["Tables"]["immobili"]["Insert"])
    .select("*")
    .single();
  if (error) throw new ApiError(error.message.includes("duplicate") ? "Esiste già un immobile con questo codice" : error.message, error.message.includes("duplicate") ? 409 : 500);
  const id = Number((row as { id: number }).id);
  const { data: row2 } = await db.from("immobili").update({ slug: buildSlug(String(data.titolo), id) }).eq("id", id).select("*").single();
  const immobile = normalizeImmobile((row2 || row) as Record<string, unknown>);
  revalidatePath("/", "layout");
  return immobile;
}

export async function aggiornaImmobileApi(db: Client, esistente: Immobile, body: Record<string, unknown>, partial: boolean) {
  const data = validaBody(body, partial);
  const titolo = (data.titolo as string) || esistente.titolo;
  const { data: row, error } = await db
    .from("immobili")
    .update({ ...data, slug: buildSlug(titolo, esistente.id) } as Database["public"]["Tables"]["immobili"]["Update"])
    .eq("id", esistente.id)
    .select("*")
    .single();
  if (error) throw new ApiError(error.message, 500);
  const immobile = normalizeImmobile(row as Record<string, unknown>);
  revalidatePath("/", "layout");
  return immobile;
}

/** Sincronizza sui portali e restituisce l'esito (senza far fallire la risposta). */
export async function syncApi(db: Client, immobile: Immobile) {
  try {
    const r = await sincronizzaImmobile(immobile, db);
    return r.skipped ? { portali: "non configurati" } : { portali: r.errori?.length ? `errori: ${r.errori.join(" | ")}` : "sincronizzato" };
  } catch (e) {
    return { portali: `errore: ${e instanceof Error ? e.message : String(e)}` };
  }
}

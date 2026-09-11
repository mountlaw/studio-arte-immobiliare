import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";
import { supabaseServer } from "@/lib/supabase/server";
import type { Immobile } from "@/lib/types";
import { normalizeImmobile } from "@/lib/data/immobili";
import { idealistaConfig, pushIdealista } from "./idealista";
import { buildFeedXml, immobiliareFtpConfig, immobiliareRestConfig, pushImmobiliareRest, type FeedWarning } from "./immobiliare";

type Client = SupabaseClient<Database>;

/** Client con permessi di scrittura: service role se c'e', altrimenti la sessione dell'admin loggato. */
async function writerClient(): Promise<Client> {
  const admin = supabaseAdmin();
  if (admin) return admin;
  return supabaseServer();
}

export function statoConfigurazione() {
  return {
    immobiliareRest: Boolean(immobiliareRestConfig()),
    immobiliareFtp: Boolean(immobiliareFtpConfig()),
    idealista: Boolean(idealistaConfig()),
    serviceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    apiKey: Boolean(process.env.API_KEY),
  };
}

async function log(db: Client, portale: string, immobile_id: number | null, esito: string, messaggio: string) {
  const { error } = await db.from("portali_log").insert({ portale, immobile_id, esito, messaggio: messaggio.slice(0, 2000) });
  if (error) console.error("portali_log", error.message);
}

/** Sincronizza un singolo immobile su tutti i portali configurati (in tempo reale). */
export async function sincronizzaImmobile(p: Immobile, dbOverride?: Client) {
  const cfg = statoConfigurazione();
  if (!cfg.immobiliareRest && !cfg.idealista) return { skipped: true };
  const db = dbOverride ?? (await writerClient());
  const patch: Partial<Database["public"]["Tables"]["immobili"]["Update"]> = {};
  const errori: string[] = [];

  if (cfg.immobiliareRest) {
    try {
      const r = await pushImmobiliareRest(p);
      await log(db, "immobiliare", p.id, r.ok ? "ok" : "errore", r.message);
      if (r.ok && r.idListing) patch.immobiliare_id = r.idListing;
      if (!r.ok) errori.push(`Immobiliare.it: ${r.message}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await log(db, "immobiliare", p.id, "errore", msg);
      errori.push(`Immobiliare.it: ${msg}`);
    }
  }
  if (cfg.idealista) {
    try {
      const r = await pushIdealista(p);
      await log(db, "idealista", p.id, r.ok ? "ok" : "errore", r.message);
      if (r.ok && r.id) patch.idealista_id = r.id;
      if (!r.ok) errori.push(`idealista: ${r.message}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await log(db, "idealista", p.id, "errore", msg);
      errori.push(`idealista: ${msg}`);
    }
  }
  patch.portali_sync_at = new Date().toISOString();
  patch.portali_errore = errori.length ? errori.join(" | ") : null;
  await db.from("immobili").update(patch).eq("id", p.id);
  return { skipped: false, errori };
}

/** Sincronizzazione completa (cron notturno o pulsante in admin). */
export async function sincronizzaTutti(dbOverride?: Client) {
  const db = dbOverride ?? (await writerClient());
  const cfg = statoConfigurazione();
  const { data, error } = await db.from("immobili").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const immobili = (data ?? []).map(normalizeImmobile);
  const messaggi: string[] = [];
  let inviati = 0;
  let errori = 0;

  // Batch FTP (Immobiliare.it "modalita' batch"): un unico feed.xml.gz con tutti gli annunci.
  if (cfg.immobiliareFtp) {
    try {
      const warnings: FeedWarning[] = [];
      const xml = buildFeedXml(immobili.filter((p) => p.pubblicato && p.disponibile && p.pubblica_portali), warnings);
      await uploadFeedFtp(xml);
      messaggi.push(`Feed Immobiliare.it caricato via FTP (${immobili.length} annunci)${warnings.length ? `, ${warnings.length} avvisi` : ""}`);
      await log(db, "immobiliare-ftp", null, "ok", messaggi[messaggi.length - 1]);
      inviati++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      messaggi.push(`Errore FTP Immobiliare.it: ${msg}`);
      await log(db, "immobiliare-ftp", null, "errore", msg);
      errori++;
    }
  }

  if (cfg.immobiliareRest || cfg.idealista) {
    for (const p of immobili) {
      if (!p.pubblica_portali && !p.immobiliare_id && !p.idealista_id) continue;
      const r = await sincronizzaImmobile(p, db);
      if (r.skipped) continue;
      if (r.errori && r.errori.length) {
        errori++;
        messaggi.push(`${p.codice}: ${r.errori.join(" | ")}`);
      } else inviati++;
    }
  }

  if (!cfg.immobiliareFtp && !cfg.immobiliareRest && !cfg.idealista) {
    messaggi.push("Nessun portale configurato: inserisci le credenziali nelle variabili d'ambiente (vedi pagina Portali).");
  }
  return { inviati, errori, messaggi };
}

async function uploadFeedFtp(xml: string) {
  const cfg = immobiliareFtpConfig();
  if (!cfg) throw new Error("FTP non configurato");
  const { gzipSync } = await import("node:zlib");
  const { Client } = await import("basic-ftp");
  const { Readable } = await import("node:stream");
  const gz = gzipSync(Buffer.from(xml, "utf8"));
  const client = new Client(30_000);
  try {
    await client.access({ host: cfg.host, user: cfg.user, password: cfg.password, secure: false });
    if (cfg.path && cfg.path !== "/") await client.ensureDir(cfg.path);
    await client.uploadFrom(Readable.from(gz), "feed.xml.gz");
  } finally {
    client.close();
  }
}

import { AZIENDA, SITE_URL } from "@/lib/config";
import type { Immobile } from "@/lib/types";
import { youtubeId } from "@/lib/utils";
import { trovaComune } from "./geo";
import { IMMOBILIARE_TIPOLOGIE, deriveExtraFeatures, immobiliareEnergy, immobiliareStatus, parsePiano } from "./mapping";

/**
 * Generatore del feed XML per Immobiliare.it (specifica "feed di importazione 2.0",
 * https://feed.immobiliare.it/integration/ii/docs/import/payload-specifications).
 *
 * Lo stesso XML viene usato sia per la modalita' batch (file feed.xml con tutti
 * gli annunci) sia per le chiamate REST in tempo reale (un solo <property>).
 * L'ordine dei nodi rispetta lo schema XSD (src/lib/portali/data/immobiliare-import-schema.xsd).
 */

export function agencyEmail() {
  return process.env.IMMOBILIARE_AGENCY_EMAIL || AZIENDA.email;
}

const esc = (s: string | number | null | undefined) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const cdata = (s: string | null | undefined) => `<![CDATA[${String(s ?? "").replace(/\]\]>/g, "]]]]><![CDATA[>")}]]>`;

const iso = (d: string | Date | null | undefined) => {
  const date = d ? new Date(d) : new Date();
  return (Number.isNaN(date.getTime()) ? new Date() : date).toISOString().slice(0, 19);
};

/** URL della foto convertita in JPEG e ridimensionata (i portali accettano solo JPEG). */
export function fotoPerPortali(url: string) {
  return `${SITE_URL}/api/foto?u=${encodeURIComponent(url)}&w=1920`;
}

export interface FeedWarning {
  immobileId: number;
  codice: string;
  messaggio: string;
}

/** Costruisce il nodo <property> di un singolo immobile. */
export function buildPropertyXml(p: Immobile, warnings: FeedWarning[] = [], opts: { indent?: string } = {}): string {
  const ind = opts.indent ?? "";
  const comune = trovaComune(p.citta);
  if (!comune) warnings.push({ immobileId: p.id, codice: p.codice, messaggio: `Comune "${p.citta}" non riconosciuto: manca il codice ISTAT (verrà usata la sola citta').` });
  const provincia = p.provincia || comune?.provincia || "";
  const idType = IMMOBILIARE_TIPOLOGIE[p.categoria] ?? 14;
  const energy = immobiliareEnergy(p.classe_energetica);
  const piano = parsePiano(p.piano);
  const extra = deriveExtraFeatures(p);
  const archiviato = !p.pubblicato || !p.disponibile || !p.pubblica_portali;
  const mapMode = p.latitudine && p.longitudine ? (p.mostra_indirizzo ? "exact" : "near") : "no";
  const yt = youtubeId(p.video_url);
  const pictures = p.immagini.slice(0, 100);
  if (!pictures.length) warnings.push({ immobileId: p.id, codice: p.codice, messaggio: "Nessuna foto: il portale potrebbe rifiutare l'annuncio." });
  if (!p.descrizione) warnings.push({ immobileId: p.id, codice: p.codice, messaggio: "Descrizione mancante." });

  const lines: string[] = [];
  const push = (s: string) => lines.push(ind + s);

  push(`<property operation="${archiviato ? "archive" : "write"}"${p.immobiliare_id ? ` ID="${esc(p.immobiliare_id)}"` : ""}>`);
  push(`  <unique-id>${cdata(String(p.id))}</unique-id>`);
  push(`  <published-on>${iso(p.data_inserimento || p.created_at)}</published-on>`);
  push(`  <date-updated>${iso(p.updated_at || p.created_at)}</date-updated>`);
  push(`  <agent>`);
  push(`    <office-name>${cdata(AZIENDA.nome)}</office-name>`);
  push(`    <email>${esc(agencyEmail())}</email>`);
  push(`    <phone>${esc(AZIENDA.telefonoE164)}</phone>`);
  push(`    <web>${esc(SITE_URL)}</web>`);
  push(`  </agent>`);
  push(`  <location>`);
  push(`    <country-code>IT</country-code>`);
  push(`    <administrative-area>${esc(comune?.regione || AZIENDA.regione)}</administrative-area>`);
  push(`    <sub-administrative-area${provincia ? ` code="${esc(provincia)}"` : ""}>${esc(comune?.provinciaNome || provincia || "")}</sub-administrative-area>`);
  push(`    <city${comune ? ` code="${esc(comune.istat)}"` : ""}>${esc(comune?.nome || p.citta)}</city>`);
  push(`    <locality map="${mapMode}">`);
  if (p.zona) push(`      <neighbourhood>${cdata(p.zona)}</neighbourhood>`);
  if (p.indirizzo) push(`      <thoroughfare display="${p.mostra_indirizzo ? "yes" : "no"}">${cdata(p.indirizzo.slice(0, 200))}</thoroughfare>`);
  if (p.cap) push(`      <postal-code>${esc(p.cap)}</postal-code>`);
  if (p.latitudine && p.longitudine) {
    push(`      <latitude>${p.latitudine}</latitude>`);
    push(`      <longitude>${p.longitudine}</longitude>`);
  }
  push(`    </locality>`);
  push(`  </location>`);
  if (pictures.length) {
    push(`  <pictures>`);
    pictures.forEach((url, i) => push(`    <picture position="${i + 1}" url="${esc(fotoPerPortali(url))}"/>`));
    push(`  </pictures>`);
  }
  if (yt) {
    push(`  <videos>`);
    push(`    <video type="remote">${esc(`https://www.youtube.com/watch?v=${yt}`)}</video>`);
    push(`  </videos>`);
  }
  push(`  <reference-code>${cdata(p.codice.slice(0, 255))}</reference-code>`);
  push(`  <publish>`);
  push(`    <portal id="immobiliare.it" status="${archiviato ? "false" : "true"}"/>`);
  push(`  </publish>`);
  push(`  <transactions>`);
  push(`    <transaction type="${p.tipo === "affitto" ? "R" : "S"}">`);
  push(`      <price currency="EUR" reserved="${p.prezzo > 0 ? "false" : "true"}">${Math.max(0, Math.round(p.prezzo))}</price>`);
  push(`    </transaction>`);
  push(`  </transactions>`);
  push(`  <building IDType="${idType}">`);
  push(`    <status>${immobiliareStatus(p.stato)}</status>`);
  push(`  </building>`);
  push(`  <features>`);
  if (p.camere > 0 || p.locali > 0) {
    push(`    <rooms-detail>`);
    if (p.camere > 0) push(`      <amount-bedrooms>${p.camere}</amount-bedrooms>`);
    const altre = Math.max(0, p.locali - p.camere);
    if (p.locali > 0) push(`      <amount-other-rooms>${altre}</amount-other-rooms>`);
    push(`    </rooms-detail>`);
  }
  if (p.mq > 0) push(`    <size unit="m2">${p.mq}</size>`);
  push(`    <descriptions>`);
  push(`      <description language="it">`);
  push(`        <title>${cdata(p.titolo.slice(0, 255))}</title>`);
  push(`        <content>${cdata(p.descrizione || p.titolo)}</content>`);
  push(`      </description>`);
  push(`    </descriptions>`);
  push(`    <energy-class value="${esc(energy.value)}" certified="${energy.certified ? "true" : "false"}" scale="2"/>`);
  push(`  </features>`);
  push(`  <extra-features>`);
  if (p.bagni > 0) push(`    <bathrooms>${p.bagni}</bathrooms>`);
  if (extra.garage) push(`    <garage type="${extra.garage.type}">${extra.garage.count}</garage>`);
  if (extra.garden) push(`    <garden>${extra.garden}</garden>`);
  if (extra.terrace) push(`    <terrace>true</terrace>`);
  if (extra.balcony) push(`    <balcony>true</balcony>`);
  if (extra.elevator) push(`    <elevator>true</elevator>`);
  if (piano) push(`    <floor${piano.type ? ` type="${piano.type}"` : ""}>${piano.value ?? ""}</floor>`);
  if (p.spese_condominiali && p.spese_condominiali > 0) push(`    <additional-costs currency="EUR">${p.spese_condominiali}</additional-costs>`);
  if (extra.furniture) push(`    <furniture>${extra.furniture}</furniture>`);
  if (extra.alarm) push(`    <security-alarm>true</security-alarm>`);
  if (extra.reception) push(`    <reception>true</reception>`);
  if (p.anno && p.anno >= 1000 && p.anno <= 3000) push(`    <build-year>${p.anno}</build-year>`);
  push(`  </extra-features>`);
  push(`</property>`);
  return lines.join("\n");
}

/** Feed completo (modalita' batch): tutti gli annunci pubblicabili. */
export function buildFeedXml(immobili: Immobile[], warnings: FeedWarning[] = []) {
  const now = iso(new Date());
  const body = immobili.map((p) => buildPropertyXml(p, warnings, { indent: "    " })).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<feed>
  <version>2.9</version>
  <metadata>
    <publisher>
      <name>${cdata(AZIENDA.nome)}</name>
      <site>${esc(SITE_URL)}</site>
      <email>${esc(agencyEmail())}</email>
      <phone>${esc(AZIENDA.telefonoE164)}</phone>
    </publisher>
    <build-date>${now}</build-date>
  </metadata>
  <properties>
${body}
  </properties>
</feed>
`;
}

/** Payload per una chiamata REST (radice = <property>). */
export function buildPropertyPayload(p: Immobile, warnings: FeedWarning[] = []) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n${buildPropertyXml(p, warnings)}\n`;
}

/** Configurazione REST di Immobiliare.it (fornita dal loro supporto). */
export function immobiliareRestConfig() {
  const user = process.env.IMMOBILIARE_REST_USER;
  const password = process.env.IMMOBILIARE_REST_PASSWORD;
  if (!user || !password) return null;
  return {
    baseUrl: (process.env.IMMOBILIARE_REST_URL || "https://feed.immobiliare.it/ws/import/immobiliare").replace(/\/$/, ""),
    user,
    password,
    source: process.env.IMMOBILIARE_SOURCE || "",
  };
}

export function immobiliareFtpConfig() {
  const host = process.env.IMMOBILIARE_FTP_HOST;
  const user = process.env.IMMOBILIARE_FTP_USER;
  const password = process.env.IMMOBILIARE_FTP_PASSWORD;
  if (!host || !user || !password) return null;
  return { host, user, password, path: process.env.IMMOBILIARE_FTP_PATH || "/" };
}

/** Invio in tempo reale di un annuncio (PUT) o della sua rimozione (DELETE). */
export async function pushImmobiliareRest(p: Immobile): Promise<{ ok: boolean; idListing?: string; message: string }> {
  const cfg = immobiliareRestConfig();
  if (!cfg) return { ok: false, message: "Credenziali REST Immobiliare.it non configurate" };
  const auth = "Basic " + Buffer.from(`${cfg.user}:${cfg.password}`).toString("base64");
  const headers: Record<string, string> = { Authorization: auth, "Content-Type": "application/xml; charset=utf-8", Accept: "application/xml" };
  if (cfg.source) headers["X-IMMO-SOURCE"] = cfg.source;

  const archiviato = !p.pubblicato || !p.disponibile || !p.pubblica_portali;
  if (archiviato && p.immobiliare_id) {
    const res = await fetch(`${cfg.baseUrl}/property/${encodeURIComponent(p.immobiliare_id)}`, { method: "DELETE", headers });
    const text = await res.text();
    return { ok: res.ok, idListing: p.immobiliare_id, message: parseServiceResponse(text, res.status) };
  }
  if (archiviato) return { ok: true, message: "Non pubblicato sul portale (annuncio non pubblicato/non disponibile)" };

  const warnings: FeedWarning[] = [];
  const payload = buildPropertyPayload(p, warnings);
  const url = p.immobiliare_id ? `${cfg.baseUrl}/property/${encodeURIComponent(p.immobiliare_id)}` : `${cfg.baseUrl}/property`;
  const res = await fetch(url, { method: "PUT", headers, body: payload });
  const text = await res.text();
  const idListing = text.match(/<idListing>(\d+)<\/idListing>/)?.[1];
  const msg = parseServiceResponse(text, res.status) + (warnings.length ? ` | Avvisi: ${warnings.map((w) => w.messaggio).join("; ")}` : "");
  return { ok: res.ok && /<Result>true<\/Result>/.test(text), idListing, message: msg };
}

function parseServiceResponse(text: string, status: number) {
  const code = text.match(/<ErrorCode>(\d+)<\/ErrorCode>/)?.[1];
  const message = text.match(/<ErrorMessage>([^<]*)<\/ErrorMessage>/)?.[1];
  if (code || message) return `HTTP ${status} · ErrorCode ${code ?? "?"} · ${message ?? ""}`.trim();
  return `HTTP ${status} · ${text.slice(0, 200)}`;
}

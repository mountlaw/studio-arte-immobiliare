"use server";

import { inviaNotificaRichiesta } from "@/lib/email";
import { supabasePublic } from "@/lib/supabase/public";

export type RichiestaState = { ok: boolean; error?: string } | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(v: FormDataEntryValue | null, max = 500) {
  return String(v ?? "")
    .trim()
    .slice(0, max);
}

/** Invio di una richiesta dai form pubblici (info immobile, valutazione, contatto). */
export async function inviaRichiesta(_prev: RichiestaState, formData: FormData): Promise<RichiestaState> {
  // Honeypot anti-spam: campo nascosto che gli umani non compilano.
  if (clean(formData.get("website"))) return { ok: true };

  const tipo = clean(formData.get("tipo"), 20);
  if (!["info", "valutazione", "contatto"].includes(tipo)) return { ok: false, error: "Richiesta non valida." };

  const nome = clean(formData.get("nome"), 120);
  const email = clean(formData.get("email"), 160);
  const telefono = clean(formData.get("telefono"), 40);
  const messaggio = clean(formData.get("messaggio"), 3000);
  const privacy = formData.get("privacy");

  if (!nome) return { ok: false, error: "Inserisci il tuo nome." };
  if (!email && !telefono) return { ok: false, error: "Lascia almeno un recapito: email o telefono." };
  if (email && !EMAIL_RE.test(email)) return { ok: false, error: "L'indirizzo email non sembra corretto." };
  if (!privacy) return { ok: false, error: "Devi accettare l'informativa privacy." };
  if (tipo === "contatto" && !messaggio) return { ok: false, error: "Scrivi un messaggio." };

  const dettagli: Record<string, string> = {};
  for (const k of ["citta", "tipologia", "mq", "indirizzo", "note", "immobile_titolo", "immobile_url"]) {
    const v = clean(formData.get(k), 500);
    if (v) dettagli[k] = v;
  }
  const immobile_codice = clean(formData.get("immobile_codice"), 80) || null;
  const immobile_id = Number(clean(formData.get("immobile_id"), 20)) || null;
  const indirizzo_valutazione = tipo === "valutazione" ? clean(formData.get("indirizzo"), 300) || null : null;
  if (tipo === "valutazione" && !indirizzo_valutazione) return { ok: false, error: "Indica l'indirizzo dell'immobile da valutare." };

  const supabase = supabasePublic();
  const { error } = await supabase.from("richieste").insert({
    tipo,
    nome,
    email: email || null,
    telefono: telefono || null,
    messaggio: messaggio || null,
    immobile_codice,
    immobile_id,
    indirizzo_valutazione,
    dettagli: Object.keys(dettagli).length ? dettagli : null,
  });
  if (error) {
    console.error("inviaRichiesta", error.message);
    return { ok: false, error: "Non siamo riusciti a inviare la richiesta. Riprova tra poco o chiamaci." };
  }

  const righe: Array<[string, string]> = [];
  if (immobile_codice) righe.push(["Immobile", `${dettagli.immobile_titolo || ""} (rif. ${immobile_codice})`]);
  if (dettagli.immobile_url) righe.push(["Link", dettagli.immobile_url]);
  if (indirizzo_valutazione) righe.push(["Indirizzo", indirizzo_valutazione]);
  if (dettagli.citta) righe.push(["Città", dettagli.citta]);
  if (dettagli.tipologia) righe.push(["Tipologia", dettagli.tipologia]);
  if (dettagli.mq) righe.push(["Superficie", `${dettagli.mq} mq`]);
  if (dettagli.note) righe.push(["Note", dettagli.note]);
  await inviaNotificaRichiesta({ tipo, nome, email, telefono, messaggio, righe });

  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { CATEGORIE, CLASSI_ENERGETICHE, CONDIZIONI, RISCALDAMENTI } from "@/lib/config";
import { getImmobileById, normalizeImmobile } from "@/lib/data/immobili";
import { sincronizzaImmobile, sincronizzaTutti } from "@/lib/portali/sync";
import { supabaseServer } from "@/lib/supabase/server";
import type { Immobile, ImmobileInput } from "@/lib/types";
import { buildSlug, toNumber } from "@/lib/utils";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

function fail(e: unknown): { ok: false; error: string } {
  const msg = e instanceof Error ? e.message : String(e);
  return { ok: false, error: msg };
}

function revalidateSito() {
  revalidatePath("/", "layout");
}

// ------------------------------------------------------------------
// AUTH
// ------------------------------------------------------------------
export async function logout() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ------------------------------------------------------------------
// IMMOBILI
// ------------------------------------------------------------------
function pulisciImmobile(input: Partial<ImmobileInput>) {
  const s = (v: unknown, max = 500) => String(v ?? "").trim().slice(0, max);
  const tipo = input.tipo === "affitto" ? "affitto" : "vendita";
  const categoria = CATEGORIE.includes(s(input.categoria) as (typeof CATEGORIE)[number]) ? s(input.categoria) : s(input.categoria) || "Appartamento";
  const classe = s(input.classe_energetica) || "In corso";
  const stato = s(input.stato) || CONDIZIONI[3];
  const risc = s(input.riscaldamento) || RISCALDAMENTI[0];
  void CLASSI_ENERGETICHE; // le opzioni vengono validate lato UI, qui accettiamo anche valori storici
  return {
    codice: s(input.codice, 80),
    titolo: s(input.titolo, 200),
    tipo,
    categoria,
    locali: Math.max(0, Math.round(toNumber(input.locali))),
    camere: Math.max(0, Math.round(toNumber(input.camere))),
    bagni: Math.max(0, Math.round(toNumber(input.bagni))),
    mq: Math.max(0, Math.round(toNumber(input.mq))),
    prezzo: Math.max(0, Math.round(toNumber(input.prezzo))),
    citta: s(input.citta, 120),
    zona: s(input.zona, 120) || null,
    indirizzo: s(input.indirizzo, 200) || null,
    cap: s(input.cap, 10) || null,
    provincia: s(input.provincia, 4).toUpperCase() || null,
    piano: s(input.piano, 30) || null,
    anno: toNumber(input.anno) >= 1000 ? Math.round(toNumber(input.anno)) : null,
    stato,
    classe_energetica: classe,
    riscaldamento: risc,
    descrizione: s(input.descrizione, 8000) || null,
    caratteristiche: Array.isArray(input.caratteristiche) ? input.caratteristiche.map((c) => s(c, 60)).filter(Boolean).slice(0, 40) : [],
    immagini: Array.isArray(input.immagini) ? input.immagini.map((c) => s(c, 600)).filter((u) => /^https?:\/\//.test(u)).slice(0, 100) : [],
    video_url: s(input.video_url, 400) || null,
    spese_condominiali: input.spese_condominiali === null || input.spese_condominiali === undefined || input.spese_condominiali === ("" as unknown) ? null : Math.round(toNumber(input.spese_condominiali)),
    latitudine: input.latitudine === null || input.latitudine === undefined ? null : Number(input.latitudine) || null,
    longitudine: input.longitudine === null || input.longitudine === undefined ? null : Number(input.longitudine) || null,
    mostra_indirizzo: Boolean(input.mostra_indirizzo),
    evidenza: Boolean(input.evidenza),
    pubblicato: Boolean(input.pubblicato),
    disponibile: input.disponibile === undefined ? true : Boolean(input.disponibile),
    pubblica_portali: input.pubblica_portali === undefined ? true : Boolean(input.pubblica_portali),
    data_inserimento: input.data_inserimento || new Date().toISOString().slice(0, 10),
  };
}

export async function salvaImmobile(id: number | null, input: Partial<ImmobileInput>): Promise<ActionResult<Immobile>> {
  try {
    await requireAdmin();
    const data = pulisciImmobile(input);
    if (!data.titolo) return { ok: false, error: "Inserisci il titolo dell'annuncio." };
    if (!data.citta) return { ok: false, error: "Inserisci la città." };
    if (!data.codice) data.codice = `SAI${Date.now().toString().slice(-6)}`;

    const supabase = await supabaseServer();
    let saved: Record<string, unknown> | null = null;

    if (id) {
      const { data: row, error } = await supabase
        .from("immobili")
        .update({ ...data, slug: buildSlug(data.titolo, id) })
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw new Error(traduciErrore(error.message));
      saved = row as Record<string, unknown>;
    } else {
      const { data: row, error } = await supabase.from("immobili").insert(data).select("*").single();
      if (error) throw new Error(traduciErrore(error.message));
      const newId = Number((row as { id: number }).id);
      const { data: row2 } = await supabase.from("immobili").update({ slug: buildSlug(data.titolo, newId) }).eq("id", newId).select("*").single();
      saved = (row2 || row) as Record<string, unknown>;
    }

    const immobile = normalizeImmobile(saved!);
    revalidateSito();
    // Sincronizzazione portali in background, dopo la risposta.
    after(async () => {
      try {
        await sincronizzaImmobile(immobile);
      } catch (e) {
        console.error("sync portali", e);
      }
    });
    return { ok: true, data: immobile };
  } catch (e) {
    return fail(e);
  }
}

function traduciErrore(msg: string) {
  if (msg.includes("immobili_codice_key") || msg.includes("duplicate key")) return "Esiste già un immobile con questo codice di riferimento.";
  if (msg.includes("row-level security")) return "Non hai i permessi per salvare (utente non autorizzato).";
  return msg;
}

export async function eliminaImmobile(id: number): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = await supabaseServer();
    const prima = await getImmobileById(id, supabase);
    const { error } = await supabase.from("immobili").delete().eq("id", id);
    if (error) throw new Error(traduciErrore(error.message));
    revalidateSito();
    if (prima) {
      after(async () => {
        try {
          await sincronizzaImmobile({ ...prima, pubblicato: false });
        } catch (e) {
          console.error("sync portali", e);
        }
      });
    }
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function aggiornaFlagImmobile(id: number, campo: "pubblicato" | "disponibile" | "evidenza", valore: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = await supabaseServer();
    const patch: { pubblicato?: boolean; disponibile?: boolean; evidenza?: boolean } = {};
    patch[campo] = valore;
    const { data, error } = await supabase.from("immobili").update(patch).eq("id", id).select("*").single();
    if (error) throw new Error(traduciErrore(error.message));
    revalidateSito();
    const immobile = normalizeImmobile(data as Record<string, unknown>);
    after(async () => {
      try {
        await sincronizzaImmobile(immobile);
      } catch (e) {
        console.error("sync portali", e);
      }
    });
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function duplicaImmobile(id: number): Promise<ActionResult<number>> {
  try {
    await requireAdmin();
    const supabase = await supabaseServer();
    const orig = await getImmobileById(id, supabase);
    if (!orig) return { ok: false, error: "Immobile non trovato." };
    const copia = pulisciImmobile({ ...orig, codice: `${orig.codice}-copia`, titolo: `${orig.titolo} (copia)`, pubblicato: false, evidenza: false });
    const { data, error } = await supabase.from("immobili").insert(copia).select("id").single();
    if (error) throw new Error(traduciErrore(error.message));
    const newId = Number((data as { id: number }).id);
    await supabase.from("immobili").update({ slug: buildSlug(copia.titolo, newId) }).eq("id", newId);
    return { ok: true, data: newId };
  } catch (e) {
    return fail(e);
  }
}

// ------------------------------------------------------------------
// RICHIESTE
// ------------------------------------------------------------------
export async function aggiornaRichiesta(id: number, patch: { letta?: boolean; archiviata?: boolean }): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = await supabaseServer();
    const { error } = await supabase.from("richieste").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function eliminaRichiesta(id: number): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = await supabaseServer();
    const { error } = await supabase.from("richieste").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ------------------------------------------------------------------
// RECENSIONI
// ------------------------------------------------------------------
export async function salvaRecensione(
  id: number | null,
  input: { nome: string; testo: string; stelle: number; citta?: string; fonte?: string; pubblicata?: boolean; ordine?: number; data_recensione?: string | null },
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = {
      nome: String(input.nome || "").trim().slice(0, 120),
      testo: String(input.testo || "").trim().slice(0, 2000),
      stelle: Math.min(5, Math.max(1, Math.round(Number(input.stelle) || 5))),
      citta: String(input.citta || "").trim().slice(0, 80) || null,
      fonte: String(input.fonte || "google").trim().slice(0, 40),
      pubblicata: input.pubblicata !== false,
      ordine: Math.round(Number(input.ordine) || 0),
      data_recensione: input.data_recensione || null,
    };
    if (!data.nome || !data.testo) return { ok: false, error: "Inserisci nome e testo della recensione." };
    const supabase = await supabaseServer();
    const { error } = id ? await supabase.from("recensioni").update(data).eq("id", id) : await supabase.from("recensioni").insert(data);
    if (error) throw new Error(error.message);
    revalidateSito();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function eliminaRecensione(id: number): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = await supabaseServer();
    const { error } = await supabase.from("recensioni").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidateSito();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ------------------------------------------------------------------
// IMPOSTAZIONI
// ------------------------------------------------------------------
export async function salvaImpostazioni(valori: Record<string, string>): Promise<ActionResult> {
  try {
    await requireAdmin();
    const supabase = await supabaseServer();
    const rows = Object.entries(valori)
      .filter(([k]) => /^[a-z0-9_]{2,60}$/.test(k))
      .map(([chiave, valore]) => ({ chiave, valore: String(valore ?? "").trim().slice(0, 2000), updated_at: new Date().toISOString() }));
    if (!rows.length) return { ok: true };
    const { error } = await supabase.from("impostazioni").upsert(rows, { onConflict: "chiave" });
    if (error) throw new Error(error.message);
    revalidateSito();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ------------------------------------------------------------------
// UTENTI (lista indirizzi autorizzati)
// ------------------------------------------------------------------
export async function aggiungiUtente(input: { nome: string; email: string; ruolo?: string }): Promise<ActionResult> {
  try {
    await requireAdmin();
    const email = String(input.email || "").trim().toLowerCase();
    const nome = String(input.nome || "").trim().slice(0, 80);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, error: "Email non valida." };
    const supabase = await supabaseServer();
    const { error } = await supabase.from("utenti_admin").insert({ nome: nome || email.split("@")[0], email, ruolo: input.ruolo === "agente" ? "agente" : "admin", attivo: true });
    if (error) throw new Error(error.message.includes("duplicate") ? "Questa email è già nella lista." : error.message);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function aggiornaUtente(id: number, patch: { attivo?: boolean; ruolo?: string; nome?: string }): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const supabase = await supabaseServer();
    // Non permettere di disattivare se stessi (si resterebbe fuori).
    const { data: me } = await supabase.from("utenti_admin").select("id, email").eq("id", id).maybeSingle();
    if (me && (me as { email: string }).email.toLowerCase() === session.email.toLowerCase() && patch.attivo === false) {
      return { ok: false, error: "Non puoi disattivare il tuo stesso account." };
    }
    const { error } = await supabase.from("utenti_admin").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function rimuoviUtente(id: number): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const supabase = await supabaseServer();
    const { data: me } = await supabase.from("utenti_admin").select("id, email").eq("id", id).maybeSingle();
    if (me && (me as { email: string }).email.toLowerCase() === session.email.toLowerCase()) return { ok: false, error: "Non puoi rimuovere il tuo stesso account." };
    const { error } = await supabase.from("utenti_admin").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ------------------------------------------------------------------
// PORTALI
// ------------------------------------------------------------------
export async function sincronizzaPortaliOra(): Promise<ActionResult<{ inviati: number; errori: number; messaggi: string[] }>> {
  try {
    await requireAdmin();
    const esito = await sincronizzaTutti();
    revalidatePath("/admin/portali");
    return { ok: true, data: esito };
  } catch (e) {
    return fail(e);
  }
}

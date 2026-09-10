import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { apiAuthorized } from "@/lib/api-auth";
import { ApiError, aggiornaImmobileApi, syncApi, toApi } from "@/lib/api-immobili";
import { getImmobileByCodice, getImmobileById } from "@/lib/data/immobili";
import { sincronizzaImmobile } from "@/lib/portali/sync";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabasePublic } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ codice: string }> };

async function trova(codice: string, db: ReturnType<typeof supabasePublic>) {
  const byCodice = await getImmobileByCodice(codice, db);
  if (byCodice) return byCodice;
  if (/^\d+$/.test(codice)) return getImmobileById(Number(codice), db);
  return null;
}

/** GET /api/v1/immobili/{codice}  (codice di riferimento oppure id numerico) */
export async function GET(request: NextRequest, { params }: Ctx) {
  const { codice } = await params;
  const auth = apiAuthorized(request);
  const db = (auth.ok && supabaseAdmin()) || supabasePublic();
  const p = await trova(decodeURIComponent(codice), db);
  if (!p || (!auth.ok && !p.pubblicato)) return NextResponse.json({ error: "Immobile non trovato" }, { status: 404 });
  return NextResponse.json({ immobile: toApi(p) });
}

async function update(request: NextRequest, { params }: Ctx, partial: boolean) {
  const auth = apiAuthorized(request);
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: 401 });
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: "API non configurata: manca SUPABASE_SERVICE_ROLE_KEY" }, { status: 503 });
  const { codice } = await params;
  const esistente = await trova(decodeURIComponent(codice), db);
  if (!esistente) return NextResponse.json({ error: "Immobile non trovato" }, { status: 404 });
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const immobile = await aggiornaImmobileApi(db, esistente, body, partial);
    const sync = await syncApi(db, immobile);
    return NextResponse.json({ ok: true, immobile: toApi(immobile), ...sync });
  } catch (e) {
    if (e instanceof ApiError) return NextResponse.json({ error: e.message }, { status: e.status });
    if (e instanceof SyntaxError) return NextResponse.json({ error: "Body JSON non valido" }, { status: 400 });
    return NextResponse.json({ error: e instanceof Error ? e.message : "Errore" }, { status: 500 });
  }
}

/** PUT = aggiornamento completo, PATCH = aggiornamento parziale */
export async function PUT(request: NextRequest, ctx: Ctx) {
  return update(request, ctx, false);
}
export async function PATCH(request: NextRequest, ctx: Ctx) {
  return update(request, ctx, true);
}

/** DELETE /api/v1/immobili/{codice}: elimina dal sito e ritira dai portali */
export async function DELETE(request: NextRequest, { params }: Ctx) {
  const auth = apiAuthorized(request);
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: 401 });
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: "API non configurata: manca SUPABASE_SERVICE_ROLE_KEY" }, { status: 503 });
  const { codice } = await params;
  const esistente = await trova(decodeURIComponent(codice), db);
  if (!esistente) return NextResponse.json({ error: "Immobile non trovato" }, { status: 404 });
  let portali = "non configurati";
  try {
    const r = await sincronizzaImmobile({ ...esistente, pubblicato: false }, db);
    if (!r.skipped) portali = r.errori?.length ? `errori: ${r.errori.join(" | ")}` : "ritirato";
  } catch (e) {
    portali = `errore: ${e instanceof Error ? e.message : String(e)}`;
  }
  const { error } = await db.from("immobili").delete().eq("id", esistente.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, eliminato: esistente.codice, portali });
}

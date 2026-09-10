import { NextResponse, type NextRequest } from "next/server";
import { apiAuthorized } from "@/lib/api-auth";
import { ApiError, creaImmobileApi, syncApi, toApi } from "@/lib/api-immobili";
import { getImmobiliPubblicati, getTuttiImmobili } from "@/lib/data/immobili";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabasePublic } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

/**
 * API REST degli annunci.
 *
 *   GET  /api/v1/immobili            -> lista (senza chiave: solo pubblicati; con chiave: tutti)
 *   POST /api/v1/immobili            -> crea un annuncio e lo pubblica sul sito e sui portali configurati
 *
 * Autenticazione: header "Authorization: Bearer <API_KEY>".
 */
export async function GET(request: NextRequest) {
  const auth = apiAuthorized(request);
  const admin = auth.ok ? supabaseAdmin() : null;
  const tipo = request.nextUrl.searchParams.get("tipo");
  const immobili = admin ? await getTuttiImmobili(admin) : await getImmobiliPubblicati({ tipo: tipo === "affitto" ? "affitto" : tipo === "vendita" ? "vendita" : undefined }, supabasePublic());
  const lista = tipo && admin ? immobili.filter((p) => p.tipo === tipo) : immobili;
  return NextResponse.json({ count: lista.length, immobili: lista.map(toApi) });
}

export async function POST(request: NextRequest) {
  const auth = apiAuthorized(request);
  if (!auth.ok) return NextResponse.json({ error: auth.reason }, { status: 401 });
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: "API non configurata: manca SUPABASE_SERVICE_ROLE_KEY" }, { status: 503 });
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const immobile = await creaImmobileApi(db, body);
    const sync = await syncApi(db, immobile);
    return NextResponse.json({ ok: true, immobile: toApi(immobile), ...sync }, { status: 201 });
  } catch (e) {
    if (e instanceof ApiError) return NextResponse.json({ error: e.message }, { status: e.status });
    if (e instanceof SyntaxError) return NextResponse.json({ error: "Body JSON non valido" }, { status: 400 });
    return NextResponse.json({ error: e instanceof Error ? e.message : "Errore" }, { status: 500 });
  }
}

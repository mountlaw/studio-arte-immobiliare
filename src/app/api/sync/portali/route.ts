import { NextResponse, type NextRequest } from "next/server";
import { cronAuthorized } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sincronizzaTutti } from "@/lib/portali/sync";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Cron giornaliero (vercel.json) che riallinea i portali. */
export async function GET(request: NextRequest) {
  if (!cronAuthorized(request)) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY non impostata: il cron non puo' scrivere nel database" }, { status: 503 });
  const esito = await sincronizzaTutti(admin);
  return NextResponse.json({ ok: true, ...esito, at: new Date().toISOString() });
}

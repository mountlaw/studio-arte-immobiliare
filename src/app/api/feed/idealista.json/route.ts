import { NextResponse, type NextRequest } from "next/server";
import { feedAuthorized } from "@/lib/api-auth";
import { getImmobiliPubblicati } from "@/lib/data/immobili";
import { toIdealista } from "@/lib/portali/idealista";

export const dynamic = "force-dynamic";

/** Export JSON per idealista (tutti gli annunci attivi). */
export async function GET(request: NextRequest) {
  if (!feedAuthorized(request)) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const immobili = (await getImmobiliPubblicati()).filter((p) => p.disponibile && p.pubblica_portali);
  return NextResponse.json(
    { generatedAt: new Date().toISOString(), count: immobili.length, listings: immobili.map(toIdealista) },
    { headers: { "Cache-Control": "public, max-age=300" } },
  );
}

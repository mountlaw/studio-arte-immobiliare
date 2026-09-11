import { NextResponse, type NextRequest } from "next/server";
import { feedAuthorized } from "@/lib/api-auth";
import { getImmobiliPubblicati } from "@/lib/data/immobili";
import { buildFeedXml, type FeedWarning } from "@/lib/portali/immobiliare";

export const dynamic = "force-dynamic";

/**
 * Feed XML per Immobiliare.it (formato "feed di importazione 2.0").
 * Contiene tutti gli annunci pubblicati, disponibili e con "pubblica sui portali" attivo.
 * Facoltativo: proteggerlo con FEED_TOKEN (?token=...).
 */
export async function GET(request: NextRequest) {
  if (!feedAuthorized(request)) return new NextResponse("Non autorizzato", { status: 401 });
  const immobili = (await getImmobiliPubblicati()).filter((p) => p.disponibile && p.pubblica_portali);
  const warnings: FeedWarning[] = [];
  const xml = buildFeedXml(immobili, warnings);
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "X-Feed-Items": String(immobili.length),
      "X-Feed-Warnings": String(warnings.length),
    },
  });
}

import { NextResponse, type NextRequest } from "next/server";
import { OLD_STORAGE_PUBLIC_URL, STORAGE_PUBLIC_URL } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

/**
 * Converte una foto del nostro storage in JPEG ridimensionato.
 * I portali (Immobiliare.it, idealista) accettano solo JPEG entro ~5 MB:
 * qui serviamo sempre un JPEG, anche se in archivio la foto e' PNG/WebP.
 * Accetta solo URL del nostro bucket, per non diventare un proxy aperto.
 */
export async function GET(request: NextRequest) {
  const u = request.nextUrl.searchParams.get("u") || "";
  const w = Math.min(2400, Math.max(320, Number(request.nextUrl.searchParams.get("w")) || 1920));
  if (!u.startsWith(STORAGE_PUBLIC_URL) && !u.startsWith(OLD_STORAGE_PUBLIC_URL)) return new NextResponse("URL non consentito", { status: 400 });

  const upstream = await fetch(u, { headers: { Accept: "image/*" } });
  if (!upstream.ok) return new NextResponse("Foto non trovata", { status: 404 });
  const input = Buffer.from(await upstream.arrayBuffer());

  try {
    const sharp = (await import("sharp")).default;
    const out = await sharp(input, { failOn: "none" }).rotate().resize({ width: w, withoutEnlargement: true }).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
    return new NextResponse(new Uint8Array(out), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400, s-maxage=604800", "Content-Length": String(out.length) },
    });
  } catch {
    // Formato non decodificabile (es. HEIC): restituisce l'originale.
    return new NextResponse(new Uint8Array(input), { headers: { "Content-Type": upstream.headers.get("content-type") || "application/octet-stream", "Cache-Control": "public, max-age=3600" } });
  }
}

export async function HEAD(request: NextRequest) {
  const res = await GET(request);
  return new NextResponse(null, { status: res.status, headers: res.headers });
}

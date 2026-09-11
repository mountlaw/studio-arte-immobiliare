import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** Controllo del token opzionale sui feed pubblici (?token=... o header Authorization). */
export function feedAuthorized(request: NextRequest) {
  const expected = process.env.FEED_TOKEN;
  if (!expected) return true;
  const token = request.nextUrl.searchParams.get("token") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  return safeEqual(token, expected);
}

/** Controllo della chiave delle API REST (/api/v1): Authorization: Bearer API_KEY. */
export function apiAuthorized(request: NextRequest) {
  const expected = process.env.API_KEY;
  if (!expected) return { ok: false as const, reason: "API non configurata: manca la variabile API_KEY" };
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || request.headers.get("x-api-key") || "";
  if (!token || !safeEqual(token, expected)) return { ok: false as const, reason: "Chiave API non valida" };
  return { ok: true as const };
}

/** Il cron di Vercel manda Authorization: Bearer CRON_SECRET. */
export function cronAuthorized(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return process.env.NODE_ENV !== "production";
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  return safeEqual(token, expected);
}

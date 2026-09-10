import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { supabasePublic } from "@/lib/supabase/public";
import type { Impostazioni } from "@/lib/types";

export const IMPOSTAZIONI_DEFAULT: Impostazioni = {
  hero_image: "https://tcoeolazrlitiyxtyful.supabase.co/storage/v1/object/public/foto-immobili/immobili/1784797218822-onbk1d.PNG",
  hero_titolo: "L'arte di trovare casa",
  hero_sottotitolo: "Sensibilità, tecnica ed esperienza al servizio del tuo immobile, tra Milano, Como e la Brianza.",
  social_instagram: "https://www.instagram.com/studioarteimmobiliare/",
  social_youtube: "https://www.youtube.com/@studioarteimmobiliare",
  social_tiktok: "https://www.tiktok.com/@studioarteimmobiliare",
  social_facebook: "",
  social_linkedin: "",
  google_reviews_url: "",
  google_write_review_url: "",
  google_maps_url: "https://maps.google.com/?cid=9062987467288245248",
  google_rating: "",
  google_reviews_count: "",
  immobiliare_agency_email: "info@studioarteimmobiliare.com",
  immobiliare_agency_url: "",
  idealista_agency_url: "",
};

export async function getImpostazioni(client: SupabaseClient<Database> = supabasePublic()): Promise<Impostazioni> {
  const { data, error } = await client.from("impostazioni").select("chiave, valore");
  const out: Impostazioni = { ...IMPOSTAZIONI_DEFAULT };
  if (error) {
    console.error("getImpostazioni", error.message);
    return out;
  }
  for (const r of data ?? []) {
    const row = r as { chiave: string; valore: string | null };
    if (row.valore === null || row.valore === undefined) continue;
    // Foto hero vuota = usa quella di default
    if (row.chiave === "hero_image" && !row.valore) continue;
    out[row.chiave] = row.valore;
  }
  return out;
}

export function socialLinks(imp: Impostazioni) {
  return {
    instagram: imp.social_instagram || "",
    youtube: imp.social_youtube || "",
    tiktok: imp.social_tiktok || "",
    facebook: imp.social_facebook || "",
    linkedin: imp.social_linkedin || "",
  };
}

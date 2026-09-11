import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { supabasePublic } from "@/lib/supabase/public";
import type { Recensione } from "@/lib/types";

export async function getRecensioniPubblicate(limit = 6, client: SupabaseClient<Database> = supabasePublic()): Promise<Recensione[]> {
  const { data, error } = await client
    .from("recensioni")
    .select("*")
    .eq("pubblicata", true)
    .order("ordine", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    // La tabella potrebbe non esistere ancora (migrazione non lanciata).
    return [];
  }
  return (data ?? []) as Recensione[];
}

export async function getTutteRecensioni(client: SupabaseClient<Database>): Promise<Recensione[]> {
  const { data, error } = await client.from("recensioni").select("*").order("ordine", { ascending: true }).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Recensione[];
}

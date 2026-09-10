import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { Richiesta } from "@/lib/types";

export async function getRichieste(client: SupabaseClient<Database>, opts: { archiviate?: boolean } = {}): Promise<Richiesta[]> {
  let q = client.from("richieste").select("*").order("created_at", { ascending: false }).limit(300);
  q = q.eq("archiviata", Boolean(opts.archiviate));
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Richiesta[];
}

export async function countRichiesteNonLette(client: SupabaseClient<Database>): Promise<number> {
  const { count, error } = await client.from("richieste").select("id", { count: "exact", head: true }).eq("letta", false).eq("archiviata", false);
  if (error) return 0;
  return count ?? 0;
}

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

// Client "pubblico" senza cookie: usato dalle pagine del sito (ISR) e dalle
// API dei feed. Vede solo cio' che le policy RLS concedono all'anonimo.
let cached: ReturnType<typeof createClient<Database>> | null = null;
export function supabasePublic() {
  if (!cached) {
    cached = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return cached;
}

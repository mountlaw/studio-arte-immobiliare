// Le chiavi pubbliche (URL + anon key) possono stare nel codice: sono
// pensate per il browser e la sicurezza vera la fanno le policy RLS.
// In produzione conviene comunque impostarle come variabili d'ambiente.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tcoeolazrlitiyxtyful.supabase.co";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjb2VvbGF6cmxpdGl5eHR5ZnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NjY3NjEsImV4cCI6MjA5MDA0Mjc2MX0.DaC_4I33OmQ6vRjUsx_oS19FXrHOdojSfS66IRIfqSc";
export const STORAGE_BUCKET = "foto-immobili";
export const STORAGE_PUBLIC_URL = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}`;

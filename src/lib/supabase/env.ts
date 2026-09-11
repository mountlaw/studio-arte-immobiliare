// Le chiavi pubbliche (URL + anon key) possono stare nel codice: sono
// pensate per il browser e la sicurezza vera la fanno le policy RLS.
// In produzione conviene comunque impostarle come variabili d'ambiente.
// Progetto Supabase "studio-arte-immobiliare" (account info@ideacasasrl.com, org Andrea Monti), creato l'11/09/2026.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://efldhensgxzvgawgxzwz.supabase.co";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_Xj6-HN8wmqSf714QlESBfA_mj2eZ1op";
// Vecchio progetto (marzo-settembre 2026): le foto vengono copiate da qui con /admin/migrazione.
export const OLD_STORAGE_PUBLIC_URL = "https://tcoeolazrlitiyxtyful.supabase.co/storage/v1/object/public/foto-immobili";
export const STORAGE_BUCKET = "foto-immobili";
export const STORAGE_PUBLIC_URL = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}`;

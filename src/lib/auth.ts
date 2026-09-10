import { cache } from "react";
import { supabaseServer } from "@/lib/supabase/server";

export interface AdminSession {
  userId: string;
  email: string;
  isAdmin: boolean;
}

/** Utente loggato nell'area riservata (null se non loggato). Cache per richiesta. */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: isAdmin } = await supabase.rpc("is_admin");
  return { userId: user.id, email: user.email || "", isAdmin: Boolean(isAdmin) };
});

/** Lancia un errore se chi chiama non e' un admin autorizzato (per le server action). */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session || !session.isAdmin) throw new Error("Non autorizzato");
  return session;
}

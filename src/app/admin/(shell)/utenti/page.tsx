import UtentiManager from "@/components/admin/UtentiManager";
import { PageHeader } from "@/components/admin/ui";
import { getAdminSession } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import type { UtenteAdmin } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function UtentiPage() {
  const supabase = await supabaseServer();
  const session = await getAdminSession();
  const { data } = await supabase.from("utenti_admin").select("*").order("created_at", { ascending: true });
  const utenti = (data ?? []) as UtenteAdmin[];
  return (
    <>
      <PageHeader title="Utenti" subtitle="Chi può entrare nell'area riservata. Solo le email in questa lista possono accedere." />
      <UtentiManager utenti={utenti} mioEmail={session?.email || ""} />
    </>
  );
}

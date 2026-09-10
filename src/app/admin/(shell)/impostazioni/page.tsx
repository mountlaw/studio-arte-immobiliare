import ImpostazioniForm from "@/components/admin/ImpostazioniForm";
import { PageHeader } from "@/components/admin/ui";
import { getImpostazioni } from "@/lib/data/impostazioni";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ImpostazioniPage() {
  const supabase = await supabaseServer();
  const impostazioni = await getImpostazioni(supabase);
  return (
    <>
      <PageHeader title="Impostazioni" subtitle="Foto di copertina, recensioni Google, social e riferimenti portali." />
      <ImpostazioniForm iniziali={impostazioni} />
    </>
  );
}

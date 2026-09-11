import RecensioniManager from "@/components/admin/RecensioniManager";
import { PageHeader } from "@/components/admin/ui";
import { getTutteRecensioni } from "@/lib/data/recensioni";
import { getImpostazioni } from "@/lib/data/impostazioni";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function RecensioniPage() {
  const supabase = await supabaseServer();
  const [recensioni, impostazioni] = await Promise.all([getTutteRecensioni(supabase).catch(() => []), getImpostazioni(supabase)]);
  return (
    <>
      <PageHeader title="Recensioni" subtitle="Le recensioni mostrate in homepage. Il voto e il link Google si impostano in Impostazioni." />
      <RecensioniManager recensioni={recensioni} googleUrl={impostazioni.google_reviews_url} />
    </>
  );
}

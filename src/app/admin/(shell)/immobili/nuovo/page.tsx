import PropertyForm from "@/components/admin/PropertyForm";
import { PageHeader } from "@/components/admin/ui";
import { getCittaDisponibili } from "@/lib/data/immobili";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NuovoImmobilePage() {
  const supabase = await supabaseServer();
  const citta = await getCittaDisponibili(supabase);
  return (
    <>
      <PageHeader title="Nuovo annuncio" subtitle="Compila i dati, carica le foto e pubblica quando è pronto." />
      <PropertyForm immobile={null} cittaSuggerite={citta} />
    </>
  );
}

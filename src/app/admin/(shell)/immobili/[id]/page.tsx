import { notFound } from "next/navigation";
import PropertyForm from "@/components/admin/PropertyForm";
import { PageHeader, Pill } from "@/components/admin/ui";
import { getCittaDisponibili, getImmobileById } from "@/lib/data/immobili";
import { supabaseServer } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ModificaImmobilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const immobile = await getImmobileById(Number(id), supabase);
  if (!immobile) notFound();
  const citta = await getCittaDisponibili(supabase);
  return (
    <>
      <PageHeader
        title={immobile.titolo}
        subtitle={`Rif. ${immobile.codice} · ultimo aggiornamento ${formatDateTime(immobile.updated_at)}`}
        action={
          <div className="flex gap-2">
            {immobile.pubblicato ? <Pill tone="green">Online</Pill> : <Pill tone="amber">Bozza</Pill>}
            {!immobile.disponibile && <Pill>Non più disponibile</Pill>}
            {immobile.portali_errore && <Pill tone="red">Errore portali</Pill>}
          </div>
        }
      />
      <PropertyForm immobile={immobile} cittaSuggerite={citta} />
    </>
  );
}

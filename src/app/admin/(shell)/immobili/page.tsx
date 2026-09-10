import Link from "next/link";
import ImmobiliTable from "@/components/admin/ImmobiliTable";
import { PageHeader } from "@/components/admin/ui";
import { IconPlus } from "@/components/ui/Icons";
import { getTuttiImmobili } from "@/lib/data/immobili";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ImmobiliPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const stato = typeof sp.stato === "string" ? sp.stato : "";
  const supabase = await supabaseServer();
  const immobili = await getTuttiImmobili(supabase);
  return (
    <>
      <PageHeader
        title="Immobili"
        subtitle={`${immobili.length} annunci in archivio · ${immobili.filter((p) => p.pubblicato && p.disponibile).length} online`}
        action={
          <Link href="/admin/immobili/nuovo" className="btn btn-primary">
            <IconPlus size={18} /> Nuovo annuncio
          </Link>
        }
      />
      <ImmobiliTable immobili={immobili} filtroIniziale={stato} />
    </>
  );
}

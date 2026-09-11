import Link from "next/link";
import RichiesteList from "@/components/admin/RichiesteList";
import { PageHeader } from "@/components/admin/ui";
import { getRichieste } from "@/lib/data/richieste";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function RichiestePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const archiviate = sp.archivio === "1";
  const supabase = await supabaseServer();
  const richieste = await getRichieste(supabase, { archiviate }).catch(() => []);
  const nonLette = richieste.filter((r) => !r.letta).length;
  return (
    <>
      <PageHeader
        title="Richieste"
        subtitle={archiviate ? "Richieste archiviate" : nonLette ? `${nonLette} da leggere` : "Tutte le richieste arrivate dai moduli del sito"}
        action={
          <div className="flex gap-2">
            <Link href="/admin/richieste" className={`btn btn-sm ${!archiviate ? "btn-primary" : "btn-outline"}`}>
              In arrivo
            </Link>
            <Link href="/admin/richieste?archivio=1" className={`btn btn-sm ${archiviate ? "btn-primary" : "btn-outline"}`}>
              Archivio
            </Link>
          </div>
        }
      />
      <RichiesteList richieste={richieste} archiviate={archiviate} />
      {!process.env.RESEND_API_KEY && (
        <p className="mt-4 text-[12.5px] text-muted">
          Suggerimento: per ricevere anche un&apos;email a ogni richiesta, imposta la variabile <code>RESEND_API_KEY</code> su Vercel (vedi pagina Portali → Configurazione).
        </p>
      )}
    </>
  );
}

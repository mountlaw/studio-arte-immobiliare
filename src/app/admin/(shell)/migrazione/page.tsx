import MigrazioneFoto from "@/components/admin/MigrazioneFoto";
import { PageHeader } from "@/components/admin/ui";
import { contaFotoVecchioProgetto } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export default async function MigrazionePage() {
  const r = await contaFotoVecchioProgetto();
  const rimaste = r.ok ? (r.data ?? 0) : 0;
  return (
    <>
      <PageHeader title="Migrazione foto" subtitle="Copia delle foto dal vecchio archivio a quello nuovo (operazione una tantum)." />
      <MigrazioneFoto iniziali={rimaste} errore={r.ok ? "" : r.error} />
    </>
  );
}

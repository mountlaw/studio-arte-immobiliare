import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getAdminSession } from "@/lib/auth";
import { countRichiesteNonLette } from "@/lib/data/richieste";
import { supabaseServer } from "@/lib/supabase/server";
import { logout } from "@/app/admin/actions";

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  if (!session.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="card max-w-md p-8 text-center">
          <h1 className="font-display text-3xl font-semibold text-navy">Account non autorizzato</h1>
          <p className="mt-3 text-sm text-muted">
            Sei entrato come <strong>{session.email}</strong>, ma questo indirizzo non è nella lista degli utenti autorizzati. Chiedi a un amministratore di
            aggiungerlo da <em>Utenti</em>, poi accedi di nuovo.
          </p>
          <form action={logout} className="mt-6">
            <button type="submit" className="btn btn-outline">
              Esci
            </button>
          </form>
        </div>
      </div>
    );
  }

  const supabase = await supabaseServer();
  const nonLette = await countRichiesteNonLette(supabase);

  return (
    <AdminShell email={session.email} richiesteNonLette={nonLette}>
      {children}
    </AdminShell>
  );
}

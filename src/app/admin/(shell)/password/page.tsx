import PasswordForm from "@/components/admin/PasswordForm";
import { PageHeader } from "@/components/admin/ui";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PasswordPage() {
  const session = await getAdminSession();
  return (
    <>
      <PageHeader title="Cambia password" subtitle={`Account: ${session?.email ?? ""}`} />
      <PasswordForm />
    </>
  );
}

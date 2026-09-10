import LoginForm from "@/components/admin/LoginForm";
import { BrandLogo } from "@/components/site/Logo";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/admin";
  const errore = typeof sp.errore === "string" ? sp.errore : "";
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <BrandLogo size={110} />
        </div>
        <LoginForm next={next} errore={errore} />
      </div>
    </div>
  );
}

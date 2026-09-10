import Link from "next/link";
import Header from "@/components/site/Header";
import { LogoMark } from "@/components/site/Logo";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="container-site flex flex-1 flex-col items-center justify-center py-32 text-center">
        <LogoMark size={64} />
        <h1 className="mt-6 font-display text-5xl font-semibold text-navy">Pagina non trovata</h1>
        <p className="mt-3 max-w-md text-muted">L&apos;immobile potrebbe essere stato venduto o l&apos;indirizzo non è corretto. Dai un&apos;occhiata alle proposte attuali.</p>
        <div className="mt-8 flex gap-3">
          <Link href="/vendita" className="btn btn-primary">
            Immobili in vendita
          </Link>
          <Link href="/" className="btn btn-outline">
            Torna alla home
          </Link>
        </div>
      </main>
    </>
  );
}

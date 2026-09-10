import Link from "next/link";
import { redirect } from "next/navigation";
import PropertyCard from "./PropertyCard";
import SearchBar from "./SearchBar";
import { getCittaDisponibili, getImmobiliPubblicati } from "@/lib/data/immobili";
import type { Tipo } from "@/lib/types";

type SP = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function Listings({ tipo, searchParams }: { tipo: Tipo; searchParams: SP }) {
  const requestedTipo = first(searchParams.tipo);
  if (requestedTipo && requestedTipo !== tipo && (requestedTipo === "vendita" || requestedTipo === "affitto")) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      const val = first(v);
      if (val && k !== "tipo") qs.set(k, val);
    }
    redirect(`/${requestedTipo}${qs.toString() ? `?${qs}` : ""}`);
  }

  const categoria = first(searchParams.categoria) || "";
  const citta = first(searchParams.citta) || "";
  const prezzoMax = Number(first(searchParams.prezzoMax) || 0) || undefined;
  const localiMin = Number(first(searchParams.localiMin) || 0) || undefined;
  const q = first(searchParams.q) || "";

  const [immobili, cittaList] = await Promise.all([
    getImmobiliPubblicati({ tipo, categoria: categoria || undefined, citta: citta || undefined, prezzoMax, localiMin, q: q || undefined }),
    getCittaDisponibili(),
  ]);
  const disponibili = immobili.filter((p) => p.disponibile);
  const nonDisponibili = immobili.filter((p) => !p.disponibile);
  const hasFilters = Boolean(categoria || citta || prezzoMax || localiMin || q);

  return (
    <>
      <section className="bg-navy pb-24 pt-16 text-white">
        <div className="container-site">
          <div className="eyebrow mb-3 text-gold">{tipo === "vendita" ? "Compra" : "Affitta"}</div>
          <h1 className="font-display text-5xl font-semibold sm:text-6xl">{tipo === "vendita" ? "Immobili in vendita" : "Immobili in affitto"}</h1>
          <p className="mt-4 max-w-xl text-white/75">
            {tipo === "vendita"
              ? "Appartamenti, ville e soluzioni selezionate tra Milano, Como e la Brianza."
              : "Soluzioni in locazione selezionate e verificate, con foto reali e descrizioni complete."}
          </p>
        </div>
      </section>

      <section className="container-site -mt-12">
        <SearchBar
          citta={cittaList}
          compact
          defaults={{ tipo, categoria, citta, prezzoMax: prezzoMax ? String(prezzoMax) : "", localiMin: localiMin ? String(localiMin) : "" }}
        />
      </section>

      <section className="container-site py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {disponibili.length === 0
              ? "Nessun immobile disponibile con questi criteri."
              : `${disponibili.length} ${disponibili.length === 1 ? "immobile disponibile" : "immobili disponibili"}`}
            {hasFilters && (
              <>
                {" · "}
                <Link href={`/${tipo}`} className="text-navy underline underline-offset-2">
                  Azzera i filtri
                </Link>
              </>
            )}
          </p>
          <Link href={tipo === "vendita" ? "/affitto" : "/vendita"} className="text-sm font-medium text-navy hover:underline">
            {tipo === "vendita" ? "Cerchi in affitto? →" : "Cerchi in vendita? →"}
          </Link>
        </div>

        {disponibili.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {disponibili.map((p, i) => (
              <PropertyCard key={p.id} property={p} priority={i < 3} />
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center">
            <p className="font-display text-2xl text-navy">Non abbiamo trovato immobili con questi criteri.</p>
            <p className="mt-2 text-muted">Prova ad allargare la ricerca oppure raccontaci cosa cerchi: spesso abbiamo proposte non ancora pubblicate.</p>
            <Link href="/contatti" className="btn btn-primary mt-6">
              Dicci cosa cerchi
            </Link>
          </div>
        )}

        {nonDisponibili.length > 0 && (
          <div className="mt-16">
            <div className="flex items-end justify-between">
              <div>
                <div className="eyebrow mb-2">Archivio</div>
                <h2 className="font-display text-3xl font-semibold text-navy">Non più disponibili</h2>
              </div>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {nonDisponibili.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

import { IconSearch } from "@/components/ui/Icons";
import { CATEGORIE } from "@/lib/config";

/**
 * Barra di ricerca: un normale form GET che porta a /vendita o /affitto
 * con i filtri nell'URL (condivisibile, indicizzabile, senza JavaScript).
 */
export default function SearchBar({
  citta,
  defaults = {},
  compact = false,
}: {
  citta: string[];
  defaults?: { tipo?: string; categoria?: string; citta?: string; prezzoMax?: string; localiMin?: string };
  compact?: boolean;
}) {
  const tipo = defaults.tipo === "affitto" ? "affitto" : "vendita";
  return (
    <form
      action={`/${tipo}`}
      method="get"
      className={`card grid gap-3 p-4 ${compact ? "md:grid-cols-[1fr_1fr_1fr_1fr_auto]" : "md:grid-cols-[1.1fr_1fr_1fr_1fr_auto] md:p-5"}`}
      role="search"
    >
      <div>
        <label className="label" htmlFor="q-tipo">
          Contratto
        </label>
        <select id="q-tipo" name="tipo" defaultValue={tipo} className="input">
          <option value="vendita">Vendita</option>
          <option value="affitto">Affitto</option>
        </select>
      </div>
      <div>
        <label className="label" htmlFor="q-categoria">
          Tipologia
        </label>
        <select id="q-categoria" name="categoria" defaultValue={defaults.categoria || ""} className="input">
          <option value="">Qualsiasi</option>
          {CATEGORIE.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="q-citta">
          Città
        </label>
        <select id="q-citta" name="citta" defaultValue={defaults.citta || ""} className="input">
          <option value="">Tutte</option>
          {citta.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="q-prezzo">
          Budget massimo
        </label>
        <select id="q-prezzo" name="prezzoMax" defaultValue={defaults.prezzoMax || ""} className="input">
          <option value="">Nessun limite</option>
          {tipo === "affitto"
            ? [800, 1000, 1200, 1500, 2000, 2500, 3000, 4000].map((v) => (
                <option key={v} value={v}>
                  fino a {v.toLocaleString("it-IT")} €/mese
                </option>
              ))
            : [150000, 200000, 250000, 300000, 400000, 500000, 750000, 1000000].map((v) => (
                <option key={v} value={v}>
                  fino a {v.toLocaleString("it-IT")} €
                </option>
              ))}
        </select>
      </div>
      <div className="flex items-end">
        <button type="submit" className="btn btn-primary w-full md:w-auto md:px-5">
          <IconSearch size={18} /> Cerca
        </button>
      </div>
    </form>
  );
}

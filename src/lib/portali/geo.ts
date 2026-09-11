import comuni from "./data/comuni-istat.json";

// [codice ISTAT, sigla provincia, regione, nome provincia, nome comune]
type Entry = [string, string, string, string, string];
const COMUNI = comuni as unknown as Record<string, Entry>;

function key(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export interface ComuneInfo {
  istat: string;
  provincia: string; // sigla, es. MI
  provinciaNome: string;
  regione: string;
  nome: string;
}

/** Trova il comune italiano dal nome scritto dall'agenzia (tollerante a maiuscole/accenti). */
export function trovaComune(nome: string | null | undefined): ComuneInfo | null {
  if (!nome) return null;
  const k = key(nome);
  let e = COMUNI[k];
  if (!e) {
    // Prova togliendo la provincia tra parentesi o dopo la virgola: "Milano (MI)", "Como, CO"
    const base = key(nome.replace(/\(.*?\)/g, "").split(",")[0]);
    e = COMUNI[base];
  }
  if (!e) return null;
  return { istat: e[0], provincia: e[1], regione: e[2], provinciaNome: e[3], nome: e[4] };
}

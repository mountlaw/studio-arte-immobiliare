export type Tipo = "vendita" | "affitto";

export interface Immobile {
  id: number;
  codice: string;
  slug: string;
  titolo: string;
  tipo: Tipo;
  categoria: string;
  locali: number;
  camere: number;
  bagni: number;
  mq: number;
  prezzo: number;
  citta: string;
  zona: string | null;
  indirizzo: string | null;
  cap: string | null;
  provincia: string | null;
  piano: string | null;
  anno: number | null;
  stato: string | null; // condizioni: Nuovo, Ottimo, Ristrutturato...
  classe_energetica: string | null;
  riscaldamento: string | null;
  descrizione: string | null;
  caratteristiche: string[];
  immagini: string[];
  video_url: string | null;
  spese_condominiali: number | null;
  latitudine: number | null;
  longitudine: number | null;
  mostra_indirizzo: boolean;
  evidenza: boolean;
  pubblicato: boolean;
  disponibile: boolean;
  pubblica_portali: boolean;
  immobiliare_id: string | null;
  idealista_id: string | null;
  portali_sync_at: string | null;
  portali_errore: string | null;
  data_inserimento: string | null;
  created_at: string;
  updated_at: string;
}

export type ImmobileInput = Omit<
  Immobile,
  "id" | "slug" | "created_at" | "updated_at" | "immobiliare_id" | "idealista_id" | "portali_sync_at" | "portali_errore"
> & { slug?: string | null };

export interface Recensione {
  id: number;
  nome: string;
  testo: string;
  stelle: number;
  citta: string | null;
  fonte: string;
  data_recensione: string | null;
  pubblicata: boolean;
  ordine: number;
  created_at: string;
}

export interface Richiesta {
  id: number;
  tipo: "info" | "valutazione" | "contatto";
  nome: string;
  email: string | null;
  telefono: string | null;
  messaggio: string | null;
  immobile_codice: string | null;
  immobile_id: number | null;
  indirizzo_valutazione: string | null;
  dettagli: Record<string, string> | null;
  letta: boolean;
  archiviata: boolean;
  created_at: string;
}

export interface UtenteAdmin {
  id: number;
  nome: string;
  email: string;
  ruolo: "admin" | "agente";
  attivo: boolean;
  created_at: string;
}

export interface PortaleLog {
  id: number;
  portale: string;
  immobile_id: number | null;
  esito: string;
  messaggio: string | null;
  created_at: string;
}

export type Impostazioni = Record<string, string>;

export interface FiltriRicerca {
  tipo?: Tipo;
  categoria?: string;
  citta?: string;
  prezzoMax?: number;
  localiMin?: number;
  q?: string;
}

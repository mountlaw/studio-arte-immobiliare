// Tipi del database (scritti a mano, allineati a supabase/02-migrazione-v2.sql).
// Se cambi lo schema, aggiorna qui.

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ImmobileRow = {
  id: number;
  codice: string;
  slug: string | null;
  titolo: string;
  tipo: string;
  categoria: string;
  locali: number | null;
  camere: number | null;
  bagni: number | null;
  mq: number | null;
  prezzo: number;
  citta: string;
  zona: string | null;
  indirizzo: string | null;
  cap: string | null;
  provincia: string | null;
  piano: string | null;
  anno: number | null;
  stato: string | null;
  classe_energetica: string | null;
  riscaldamento: string | null;
  descrizione: string | null;
  caratteristiche: string[] | null;
  immagini: string[] | null;
  video_url: string | null;
  spese_condominiali: number | null;
  latitudine: number | null;
  longitudine: number | null;
  mostra_indirizzo: boolean | null;
  evidenza: boolean | null;
  pubblicato: boolean | null;
  disponibile: boolean | null;
  pubblica_portali: boolean | null;
  immobiliare_id: string | null;
  idealista_id: string | null;
  portali_sync_at: string | null;
  portali_errore: string | null;
  data_inserimento: string | null;
  created_at: string;
  updated_at: string | null;
}

export type RecensioneRow = {
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

export type RichiestaRow = {
  id: number;
  tipo: string;
  nome: string;
  email: string | null;
  telefono: string | null;
  messaggio: string | null;
  immobile_codice: string | null;
  immobile_id: number | null;
  indirizzo_valutazione: string | null;
  dettagli: Json | null;
  letta: boolean | null;
  archiviata: boolean;
  created_at: string;
}

export type ImpostazioneRow = {
  chiave: string;
  valore: string | null;
  updated_at: string | null;
}

export type UtenteAdminRow = {
  id: number;
  nome: string;
  email: string;
  ruolo: string;
  auth_user_id: string | null;
  attivo: boolean;
  created_at: string;
}

export type PortaleLogRow = {
  id: number;
  portale: string;
  immobile_id: number | null;
  esito: string;
  messaggio: string | null;
  created_at: string;
}

type Table<Row, Required extends keyof Row = never> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Required>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      immobili: Table<ImmobileRow, "codice" | "titolo" | "tipo" | "categoria" | "prezzo" | "citta">;
      recensioni: Table<RecensioneRow, "nome" | "testo">;
      richieste: Table<RichiestaRow, "tipo" | "nome">;
      impostazioni: Table<ImpostazioneRow, "chiave">;
      utenti_admin: Table<UtenteAdminRow, "nome" | "email">;
      portali_log: Table<PortaleLogRow, "portale" | "esito">;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      slugify: { Args: { txt: string }; Returns: string };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

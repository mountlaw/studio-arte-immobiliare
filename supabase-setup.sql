-- ============================================================
-- STUDIO ARTE IMMOBILIARE - Setup Database Supabase
-- ============================================================
-- Copia e incolla tutto questo script nel SQL Editor di Supabase
-- e clicca "Run" per creare tutte le tabelle necessarie.
-- ============================================================

-- Tabella immobili
CREATE TABLE immobili (
  id BIGSERIAL PRIMARY KEY,
  codice TEXT UNIQUE NOT NULL,
  titolo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('vendita', 'affitto')),
  categoria TEXT NOT NULL,
  locali INTEGER,
  camere INTEGER,
  bagni INTEGER,
  mq INTEGER,
  prezzo NUMERIC NOT NULL,
  citta TEXT NOT NULL,
  zona TEXT,
  indirizzo TEXT,
  piano TEXT,
  anno INTEGER,
  stato TEXT,
  classe_energetica TEXT,
  riscaldamento TEXT,
  descrizione TEXT,
  caratteristiche TEXT[],
  immagini TEXT[],
  evidenza BOOLEAN DEFAULT FALSE,
  pubblicato BOOLEAN DEFAULT FALSE,
  data_inserimento DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella utenti admin
CREATE TABLE utenti_admin (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  ruolo TEXT NOT NULL CHECK (ruolo IN ('admin', 'agente')),
  auth_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella richieste (form contatto e valutazioni)
CREATE TABLE richieste (
  id BIGSERIAL PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('info', 'valutazione', 'contatto')),
  nome TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  messaggio TEXT,
  immobile_codice TEXT,
  indirizzo_valutazione TEXT,
  letta BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabella impostazioni sito (per hero image, testi, etc.)
CREATE TABLE impostazioni (
  chiave TEXT PRIMARY KEY,
  valore TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserisci valore di default per hero image
INSERT INTO impostazioni (chiave, valore) VALUES ('hero_image', '');

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Abilita RLS su tutte le tabelle
ALTER TABLE immobili ENABLE ROW LEVEL SECURITY;
ALTER TABLE richieste ENABLE ROW LEVEL SECURITY;
ALTER TABLE utenti_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE impostazioni ENABLE ROW LEVEL SECURITY;

-- IMMOBILI: tutti possono leggere quelli pubblicati
CREATE POLICY "immobili_pubblici_select"
  ON immobili FOR SELECT
  USING (pubblicato = true);

-- IMMOBILI: utenti autenticati possono leggere tutti (anche bozze)
CREATE POLICY "immobili_admin_select"
  ON immobili FOR SELECT
  TO authenticated
  USING (true);

-- IMMOBILI: utenti autenticati possono inserire
CREATE POLICY "immobili_admin_insert"
  ON immobili FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- IMMOBILI: utenti autenticati possono modificare
CREATE POLICY "immobili_admin_update"
  ON immobili FOR UPDATE
  TO authenticated
  USING (true);

-- IMMOBILI: utenti autenticati possono eliminare
CREATE POLICY "immobili_admin_delete"
  ON immobili FOR DELETE
  TO authenticated
  USING (true);

-- RICHIESTE: chiunque puo' inserire (form pubblici)
CREATE POLICY "richieste_insert_pubblico"
  ON richieste FOR INSERT
  WITH CHECK (true);

-- RICHIESTE: solo autenticati possono leggere
CREATE POLICY "richieste_admin_select"
  ON richieste FOR SELECT
  TO authenticated
  USING (true);

-- RICHIESTE: solo autenticati possono aggiornare (segnare come lette)
CREATE POLICY "richieste_admin_update"
  ON richieste FOR UPDATE
  TO authenticated
  USING (true);

-- UTENTI ADMIN: solo autenticati possono leggere
CREATE POLICY "utenti_admin_select"
  ON utenti_admin FOR SELECT
  TO authenticated
  USING (true);

-- UTENTI ADMIN: solo autenticati possono gestire
CREATE POLICY "utenti_admin_all"
  ON utenti_admin FOR ALL
  TO authenticated
  USING (true);

-- IMPOSTAZIONI: tutti possono leggere (serve per hero image pubblica)
CREATE POLICY "impostazioni_select_pubblico"
  ON impostazioni FOR SELECT
  USING (true);

-- IMPOSTAZIONI: solo autenticati possono modificare
CREATE POLICY "impostazioni_admin_update"
  ON impostazioni FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================================
-- STORAGE BUCKET per le foto
-- ============================================================
-- Questo va fatto manualmente dalla dashboard Supabase:
-- 1. Vai su Storage > New Bucket
-- 2. Nome: foto-immobili
-- 3. Spunta "Public bucket"
-- 4. Clicca Create
--
-- Poi aggiungi questa policy per permettere l'upload:
-- INSERT policy: authenticated users can upload
-- SELECT policy: anyone can view (public)
-- ============================================================

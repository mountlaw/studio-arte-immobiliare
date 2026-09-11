-- ============================================================
-- STUDIO ARTE IMMOBILIARE - Schema completo per un progetto nuovo
-- ============================================================
-- Da lanciare UNA volta nel SQL Editor di un progetto Supabase vuoto.
-- Contiene tutto: tabelle, funzioni, sicurezza (RLS), storage e dati iniziali.
-- Equivale a 01-setup-iniziale.sql + 02-migrazione-v2.sql.
-- ============================================================

-- ------------------------------------------------------------
-- TABELLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.immobili (
  id BIGSERIAL PRIMARY KEY,
  codice TEXT UNIQUE NOT NULL,
  slug TEXT,
  titolo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('vendita', 'affitto')),
  categoria TEXT NOT NULL DEFAULT 'Appartamento',
  locali INTEGER DEFAULT 0,
  camere INTEGER DEFAULT 0,
  bagni INTEGER DEFAULT 0,
  mq INTEGER DEFAULT 0,
  prezzo NUMERIC NOT NULL DEFAULT 0,
  citta TEXT NOT NULL,
  zona TEXT,
  indirizzo TEXT,
  cap TEXT,
  provincia TEXT,
  piano TEXT,
  anno INTEGER,
  stato TEXT,
  classe_energetica TEXT,
  riscaldamento TEXT,
  descrizione TEXT,
  caratteristiche TEXT[] DEFAULT '{}',
  immagini TEXT[] DEFAULT '{}',
  video_url TEXT,
  spese_condominiali NUMERIC,
  latitudine DOUBLE PRECISION,
  longitudine DOUBLE PRECISION,
  mostra_indirizzo BOOLEAN NOT NULL DEFAULT FALSE,
  evidenza BOOLEAN NOT NULL DEFAULT FALSE,
  pubblicato BOOLEAN NOT NULL DEFAULT FALSE,
  disponibile BOOLEAN NOT NULL DEFAULT TRUE,
  pubblica_portali BOOLEAN NOT NULL DEFAULT TRUE,
  immobiliare_id TEXT,
  idealista_id TEXT,
  portali_sync_at TIMESTAMPTZ,
  portali_errore TEXT,
  data_inserimento DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS immobili_slug_idx ON public.immobili (slug);
CREATE INDEX IF NOT EXISTS immobili_pubblicato_idx ON public.immobili (pubblicato, tipo);

CREATE TABLE IF NOT EXISTS public.utenti_admin (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  ruolo TEXT NOT NULL DEFAULT 'admin' CHECK (ruolo IN ('admin', 'agente')),
  auth_user_id UUID REFERENCES auth.users(id),
  attivo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.richieste (
  id BIGSERIAL PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('info', 'valutazione', 'contatto')),
  nome TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  messaggio TEXT,
  immobile_codice TEXT,
  immobile_id BIGINT REFERENCES public.immobili(id) ON DELETE SET NULL,
  indirizzo_valutazione TEXT,
  dettagli JSONB,
  letta BOOLEAN DEFAULT FALSE,
  archiviata BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.impostazioni (
  chiave TEXT PRIMARY KEY,
  valore TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recensioni (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  testo TEXT NOT NULL,
  stelle INTEGER NOT NULL DEFAULT 5 CHECK (stelle BETWEEN 1 AND 5),
  citta TEXT,
  fonte TEXT NOT NULL DEFAULT 'google',
  data_recensione DATE,
  pubblicata BOOLEAN NOT NULL DEFAULT TRUE,
  ordine INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.portali_log (
  id BIGSERIAL PRIMARY KEY,
  portale TEXT NOT NULL,
  immobile_id BIGINT REFERENCES public.immobili(id) ON DELETE CASCADE,
  esito TEXT NOT NULL,
  messaggio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS portali_log_created_idx ON public.portali_log (created_at DESC);

-- ------------------------------------------------------------
-- FUNZIONI E TRIGGER
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.slugify(txt TEXT) RETURNS TEXT
LANGUAGE sql IMMUTABLE STRICT AS $$
  SELECT trim(both '-' from regexp_replace(
    lower(translate(txt,
      'àáâäãåèéêëìíîïòóôöõùúûüýÿçñÀÁÂÄÃÅÈÉÊËÌÍÎÏÒÓÔÖÕÙÚÛÜÝÇÑ''’`´',
      'aaaaaaeeeeiiiiooooouuuuyycnAAAAAAEEEEIIIIOOOOOUUUUYCN    ')),
    '[^a-z0-9]+', '-', 'g'));
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS immobili_set_updated_at ON public.immobili;
CREATE TRIGGER immobili_set_updated_at
  BEFORE UPDATE ON public.immobili
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Chi e' amministratore: email dell'utente loggato presente e attiva in utenti_admin
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.utenti_admin u
    WHERE u.attivo
      AND lower(u.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- ------------------------------------------------------------
-- DATI INIZIALI
-- ------------------------------------------------------------
INSERT INTO public.utenti_admin (nome, email, ruolo) VALUES
  ('Andrea', 'andrea.edmusic@gmail.com', 'admin'),
  ('Andrea (Idea Casa)', 'info@ideacasasrl.com', 'admin'),
  ('Studio Arte Immobiliare', 'info@studioarteimmobiliare.com', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.impostazioni (chiave, valore) VALUES
  ('hero_image', ''),
  ('hero_titolo', 'L''arte di trovare casa'),
  ('hero_sottotitolo', 'Sensibilità, tecnica ed esperienza al servizio del tuo immobile, tra Milano, Como e la Brianza.'),
  ('social_instagram', 'https://www.instagram.com/studioarteimmobiliare/'),
  ('social_youtube', 'https://www.youtube.com/@studioarteimmobiliare'),
  ('social_tiktok', 'https://www.tiktok.com/@studioarteimmobiliare'),
  ('social_facebook', ''),
  ('social_linkedin', ''),
  ('google_reviews_url', 'https://www.google.com/search?q=Studio+Arte+Immobiliare+Lomazzo&ludocid=9062987467288245248#lrd=0x4786913d05eb96f7:0x7dc633156f887400,1'),
  ('google_write_review_url', 'https://www.google.com/search?q=Studio+Arte+Immobiliare+Lomazzo&ludocid=9062987467288245248#lrd=0x4786913d05eb96f7:0x7dc633156f887400,3'),
  ('google_maps_url', 'https://maps.google.com/?cid=9062987467288245248'),
  ('google_rating', '5,0'),
  ('google_reviews_count', '72'),
  ('immobiliare_agency_email', 'info@studioarteimmobiliare.com'),
  ('immobiliare_agency_url', 'https://www.immobiliare.it/agenzie-immobiliari/127390/'),
  ('idealista_agency_url', 'https://www.idealista.it/pro/studio-arte-immobiliare/')
ON CONFLICT (chiave) DO NOTHING;

INSERT INTO public.recensioni (nome, testo, stelle, citta, fonte, ordine)
SELECT * FROM (VALUES
  ('Davide', 'Molto professionali ed efficaci in ogni momento della vendita, dalla preparazione delle bellissime foto all''assistenza al compromesso e al rogito. Sempre disponibili per soddisfare ogni nostra richiesta. Grazie!', 5, NULL, 'google', 1),
  ('MxR Rodax', 'Mi sono trovato davvero bene. Tutti sono stati gentili, disponibili e mi hanno seguito con attenzione dall''inizio alla fine. Consiglio questa agenzia, ottimo servizio!', 5, NULL, 'google', 2),
  ('Luca Volpi', 'Studio immobiliare veramente competente. Eccellente nell''esporre trattative con professionalità e cortesia. Bravo Giulio, sei molto professionale e gentile.', 5, NULL, 'google', 3)
) AS v(nome, testo, stelle, citta, fonte, ordine)
WHERE NOT EXISTS (SELECT 1 FROM public.recensioni);

-- ------------------------------------------------------------
-- SICUREZZA (RLS)
-- ------------------------------------------------------------
ALTER TABLE public.immobili ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.richieste ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utenti_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impostazioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recensioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portali_log ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('immobili', 'richieste', 'utenti_admin', 'impostazioni', 'recensioni', 'portali_log')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', p.policyname, p.tablename);
  END LOOP;
END $$;

CREATE POLICY immobili_select ON public.immobili FOR SELECT
  USING (pubblicato = TRUE OR public.is_admin());
CREATE POLICY immobili_insert ON public.immobili FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());
CREATE POLICY immobili_update ON public.immobili FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY immobili_delete ON public.immobili FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE POLICY richieste_insert ON public.richieste FOR INSERT
  WITH CHECK (TRUE);
CREATE POLICY richieste_select ON public.richieste FOR SELECT TO authenticated
  USING (public.is_admin());
CREATE POLICY richieste_update ON public.richieste FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY richieste_delete ON public.richieste FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE POLICY recensioni_select ON public.recensioni FOR SELECT
  USING (pubblicata = TRUE OR public.is_admin());
CREATE POLICY recensioni_write ON public.recensioni FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY impostazioni_select ON public.impostazioni FOR SELECT
  USING (TRUE);
CREATE POLICY impostazioni_write ON public.impostazioni FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY utenti_admin_select ON public.utenti_admin FOR SELECT TO authenticated
  USING (public.is_admin());
CREATE POLICY utenti_admin_write ON public.utenti_admin FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY portali_log_admin ON public.portali_log FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- STORAGE: bucket pubblico per le foto, upload solo admin
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('foto-immobili', 'foto-immobili', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', p.policyname);
  END LOOP;

  EXECUTE 'CREATE POLICY foto_lettura_pubblica ON storage.objects FOR SELECT USING (bucket_id = ''foto-immobili'')';
  EXECUTE 'CREATE POLICY foto_upload_admin ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''foto-immobili'' AND public.is_admin())';
  EXECUTE 'CREATE POLICY foto_update_admin ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = ''foto-immobili'' AND public.is_admin())';
  EXECUTE 'CREATE POLICY foto_delete_admin ON storage.objects FOR DELETE TO authenticated USING (bucket_id = ''foto-immobili'' AND public.is_admin())';
EXCEPTION WHEN insufficient_privilege THEN
  RAISE NOTICE 'Policy storage non modificate (permessi insufficienti): impostarle da Storage > Policies';
END $$;

-- Controllo finale
SELECT
  (SELECT count(*) FROM public.immobili) AS immobili,
  (SELECT count(*) FROM public.recensioni) AS recensioni,
  (SELECT count(*) FROM public.utenti_admin) AS utenti_admin,
  (SELECT count(*) FROM public.impostazioni) AS impostazioni,
  (SELECT count(*) FROM storage.buckets WHERE id = 'foto-immobili') AS bucket;

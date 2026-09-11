-- ============================================================
-- STUDIO ARTE IMMOBILIARE - Migrazione v2 (settembre 2026)
-- ============================================================
-- Da incollare nel SQL Editor di Supabase e lanciare con "Run".
-- E' idempotente: si puo' rilanciare senza fare danni.
--
-- Cosa fa:
--   1. Nuove colonne su immobili (slug, disponibile, dati portali)
--   2. Tabella recensioni (prima erano salvate nel browser)
--   3. Impostazioni del sito (hero, social, link recensioni Google)
--   4. Tabella utenti_admin come lista degli indirizzi autorizzati
--   5. Log delle sincronizzazioni verso i portali
--   6. Sicurezza: RLS vera (scrittura solo agli admin autenticati)
-- ============================================================

-- ------------------------------------------------------------
-- 1. IMMOBILI: nuove colonne
-- ------------------------------------------------------------
ALTER TABLE public.immobili
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS disponibile BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS cap TEXT,
  ADD COLUMN IF NOT EXISTS provincia TEXT,
  ADD COLUMN IF NOT EXISTS latitudine DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitudine DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS spese_condominiali NUMERIC,
  ADD COLUMN IF NOT EXISTS mostra_indirizzo BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS pubblica_portali BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS immobiliare_id TEXT,
  ADD COLUMN IF NOT EXISTS idealista_id TEXT,
  ADD COLUMN IF NOT EXISTS portali_sync_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS portali_errore TEXT;

-- Rimuove il vincolo storico sul tipo (vendita/affitto) e lo ricrea uguale,
-- solo per essere sicuri che esista con il nome giusto.
ALTER TABLE public.immobili DROP CONSTRAINT IF EXISTS immobili_tipo_check;
ALTER TABLE public.immobili ADD CONSTRAINT immobili_tipo_check CHECK (tipo IN ('vendita', 'affitto'));

-- Funzione per creare lo slug (URL leggibile) da un testo
CREATE OR REPLACE FUNCTION public.slugify(txt TEXT) RETURNS TEXT
LANGUAGE sql IMMUTABLE STRICT AS $$
  SELECT trim(both '-' from regexp_replace(
    lower(translate(txt,
      'àáâäãåèéêëìíîïòóôöõùúûüýÿçñÀÁÂÄÃÅÈÉÊËÌÍÎÏÒÓÔÖÕÙÚÛÜÝÇÑ''’`´',
      'aaaaaaeeeeiiiiooooouuuuyycnAAAAAAEEEEIIIIOOOOOUUUUYCN    ')),
    '[^a-z0-9]+', '-', 'g'));
$$;

-- Popola gli slug mancanti: titolo + id per garantire l'univocita'
UPDATE public.immobili
SET slug = left(public.slugify(coalesce(nullif(titolo, ''), 'immobile')), 80) || '-' || id
WHERE slug IS NULL OR slug = '';

CREATE UNIQUE INDEX IF NOT EXISTS immobili_slug_idx ON public.immobili (slug);
CREATE INDEX IF NOT EXISTS immobili_pubblicato_idx ON public.immobili (pubblicato, tipo);

-- updated_at automatico
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

-- ------------------------------------------------------------
-- 2. RECENSIONI
-- ------------------------------------------------------------
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

-- Prime recensioni (prese dal profilo Google dell'agenzia, 5,0 su 72)
INSERT INTO public.recensioni (nome, testo, stelle, citta, fonte, ordine)
SELECT * FROM (VALUES
  ('Davide', 'Molto professionali ed efficaci in ogni momento della vendita, dalla preparazione delle bellissime foto all''assistenza al compromesso e al rogito. Sempre disponibili per soddisfare ogni nostra richiesta. Grazie!', 5, NULL, 'google', 1),
  ('MxR Rodax', 'Mi sono trovato davvero bene. Tutti sono stati gentili, disponibili e mi hanno seguito con attenzione dall''inizio alla fine. Consiglio questa agenzia, ottimo servizio!', 5, NULL, 'google', 2),
  ('Luca Volpi', 'Studio immobiliare veramente competente. Eccellente nell''esporre trattative con professionalità e cortesia. Bravo Giulio, sei molto professionale e gentile.', 5, NULL, 'google', 3)
) AS v(nome, testo, stelle, citta, fonte, ordine)
WHERE NOT EXISTS (SELECT 1 FROM public.recensioni);

-- ------------------------------------------------------------
-- 3. IMPOSTAZIONI (chiave/valore)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.impostazioni (
  chiave TEXT PRIMARY KEY,
  valore TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.impostazioni (chiave, valore) VALUES
  ('hero_image', 'https://tcoeolazrlitiyxtyful.supabase.co/storage/v1/object/public/foto-immobili/immobili/1784797218822-onbk1d.PNG'),
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

-- La riga hero_image esisteva gia' vuota: se e' ancora vuota, mettiamo la foto di default
UPDATE public.impostazioni SET valore = 'https://tcoeolazrlitiyxtyful.supabase.co/storage/v1/object/public/foto-immobili/immobili/1784797218822-onbk1d.PNG' WHERE chiave = 'hero_image' AND (valore IS NULL OR valore = '');

-- ------------------------------------------------------------
-- 4. UTENTI ADMIN = lista degli indirizzi email autorizzati
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.utenti_admin (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  ruolo TEXT NOT NULL DEFAULT 'admin' CHECK (ruolo IN ('admin', 'agente')),
  auth_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.utenti_admin ADD COLUMN IF NOT EXISTS attivo BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.utenti_admin ALTER COLUMN ruolo SET DEFAULT 'admin';

INSERT INTO public.utenti_admin (nome, email, ruolo) VALUES
  ('Andrea', 'andrea.edmusic@gmail.com', 'admin'),
  ('Studio Arte Immobiliare', 'info@studioarteimmobiliare.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- La funzione che decide chi e' amministratore: l'email dell'utente
-- autenticato deve essere nella lista utenti_admin e attiva.
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
-- 5. RICHIESTE (form del sito) - allineamento colonne
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.richieste (
  id BIGSERIAL PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('info', 'valutazione', 'contatto')),
  nome TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  messaggio TEXT,
  immobile_codice TEXT,
  indirizzo_valutazione TEXT,
  letta BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.richieste
  ADD COLUMN IF NOT EXISTS immobile_id BIGINT REFERENCES public.immobili(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS dettagli JSONB,
  ADD COLUMN IF NOT EXISTS archiviata BOOLEAN NOT NULL DEFAULT FALSE;

-- ------------------------------------------------------------
-- 6. LOG SINCRONIZZAZIONI PORTALI
-- ------------------------------------------------------------
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
-- 7. SICUREZZA (RLS)
-- ------------------------------------------------------------
ALTER TABLE public.immobili ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.richieste ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utenti_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impostazioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recensioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portali_log ENABLE ROW LEVEL SECURITY;

-- Butta via tutte le policy vecchie (alcune permettevano scritture anonime)
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

-- IMMOBILI: il pubblico vede solo i pubblicati, gli admin tutto e scrivono
CREATE POLICY immobili_select ON public.immobili FOR SELECT
  USING (pubblicato = TRUE OR public.is_admin());
CREATE POLICY immobili_insert ON public.immobili FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());
CREATE POLICY immobili_update ON public.immobili FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY immobili_delete ON public.immobili FOR DELETE TO authenticated
  USING (public.is_admin());

-- RICHIESTE: chiunque puo' inviarne una, solo gli admin le leggono
CREATE POLICY richieste_insert ON public.richieste FOR INSERT
  WITH CHECK (TRUE);
CREATE POLICY richieste_select ON public.richieste FOR SELECT TO authenticated
  USING (public.is_admin());
CREATE POLICY richieste_update ON public.richieste FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY richieste_delete ON public.richieste FOR DELETE TO authenticated
  USING (public.is_admin());

-- RECENSIONI: pubbliche se pubblicate, gestite dagli admin
CREATE POLICY recensioni_select ON public.recensioni FOR SELECT
  USING (pubblicata = TRUE OR public.is_admin());
CREATE POLICY recensioni_write ON public.recensioni FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- IMPOSTAZIONI: lettura pubblica (servono al sito), scrittura admin
CREATE POLICY impostazioni_select ON public.impostazioni FOR SELECT
  USING (TRUE);
CREATE POLICY impostazioni_write ON public.impostazioni FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- UTENTI ADMIN: solo gli admin vedono e gestiscono la lista
CREATE POLICY utenti_admin_select ON public.utenti_admin FOR SELECT TO authenticated
  USING (public.is_admin());
CREATE POLICY utenti_admin_write ON public.utenti_admin FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- LOG PORTALI: solo admin
CREATE POLICY portali_log_admin ON public.portali_log FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- 8. STORAGE: foto pubbliche in lettura, caricabili solo dagli admin
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

-- Fine. Controllo rapido:
SELECT
  (SELECT count(*) FROM public.immobili) AS immobili,
  (SELECT count(*) FROM public.immobili WHERE slug IS NULL) AS senza_slug,
  (SELECT count(*) FROM public.recensioni) AS recensioni,
  (SELECT count(*) FROM public.utenti_admin) AS utenti_admin,
  (SELECT count(*) FROM public.impostazioni) AS impostazioni;

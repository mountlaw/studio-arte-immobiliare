# Studio Arte Immobiliare — sito e gestionale annunci

Sito pubblico + area riservata per [studioarteimmobiliare.com](https://www.studioarteimmobiliare.com).

- **Next.js 16** (App Router, React 19, Tailwind 4) su **Vercel**
- **Supabase** (Postgres + Auth + Storage) per annunci, foto, richieste, recensioni, impostazioni
- Pagine annuncio con URL proprio e anteprima social (WhatsApp/Instagram/Facebook), SEO, sitemap
- Area riservata `/admin`: annunci (foto con conversione HEIC e compressione), richieste dai moduli, recensioni, impostazioni, utenti, portali
- Feed XML **Immobiliare.it** (formato ufficiale 2.0, validato con lo schema XSD), export **idealista**, API REST `/api/v1`

## Sviluppo locale

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build di produzione
```

Le chiavi pubbliche Supabase hanno un default nel codice (`src/lib/supabase/env.ts`); tutto il resto si imposta con le variabili in `.env.example`.

## Messa online (una volta sola)

1. **Database** — apri Supabase → progetto `tcoeolazrlitiyxtyful` → *SQL Editor* → incolla `supabase/02-migrazione-v2.sql` → *Run*. È idempotente (si può rilanciare). Aggiunge le colonne nuove, le tabelle recensioni/log, gli utenti autorizzati e **attiva la sicurezza vera** (RLS): da quel momento il vecchio pannello non può più scrivere, quindi fai subito il passo 2.
2. **Deploy** — unisci il ramo `v2-nextjs` in `main`: Vercel pubblica in automatico (progetto `studio-arte-immobiliare`, già collegato al repo).
3. **Auth Supabase** — *Authentication → URL Configuration*: Site URL `https://www.studioarteimmobiliare.com`, Redirect URLs `https://www.studioarteimmobiliare.com/**`. Serve perché i link delle email (conferma indirizzo, reset password) tornino sul sito.
4. **Primo accesso** — su `/admin/login` → *Primo accesso: crea la password* con un indirizzo autorizzato (`andrea.edmusic@gmail.com` o `info@studioarteimmobiliare.com` sono già in lista). Poi da *Utenti* aggiungi l'email di Cristina.
5. **Variabili su Vercel** (*Settings → Environment Variables*), facoltative ma consigliate:
   - `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Project Settings → API Keys → service_role): abilita API REST e cron portali
   - `API_KEY`: una stringa lunga a caso, per chi chiama le API `/api/v1`
   - `RESEND_API_KEY`, `RESEND_FROM`, `NOTIFY_EMAIL`: email di avviso per ogni richiesta dal sito (le richieste restano comunque salvate in *Richieste*)
   - `NEXT_PUBLIC_SITE_URL=https://www.studioarteimmobiliare.com`
   - credenziali portali (vedi sotto)

## Portali (Immobiliare.it / idealista)

Nessuno dei due portali ha API aperte: l'integrazione va **attivata dal loro supporto** sull'account professionale dell'agenzia.

- **Immobiliare.it**: chiedere al referente commerciale l'*importazione annunci da gestionale esterno* (feed 2.0). Danno credenziali REST (`IMMOBILIARE_REST_USER`, `IMMOBILIARE_REST_PASSWORD`, `IMMOBILIARE_SOURCE`) oppure FTP (`IMMOBILIARE_FTP_*`). Il feed pronto è su `/api/feed/immobiliare.xml` e valida con il loro XSD (`src/lib/portali/data/immobiliare-import-schema.xsd`).
- **idealista**: chiedere in idealista/tools l'*integrazione con software esterno*; danno API key/secret e documentazione → `IDEALISTA_API_URL`, `IDEALISTA_API_KEY`, `IDEALISTA_API_SECRET`. Il modulo `src/lib/portali/idealista.ts` va allineato ai nomi dei campi delle loro specifiche.

Con le credenziali impostate: ogni salvataggio dall'admin o dalle API sincronizza l'annuncio; il cron `vercel.json` (2:30 di notte) riallinea tutto. Stato, log e avvisi in `/admin/portali`.

## Struttura

```
src/app/(site)        pagine pubbliche (home, vendita, affitto, immobili/[slug], chi-siamo, valuta-casa, contatti, privacy)
src/app/admin         area riservata (login, dashboard, immobili, richieste, recensioni, impostazioni, utenti, portali)
src/app/api           feed portali, foto JPEG per i portali, API REST v1, cron sync
src/lib/data          accesso ai dati (Supabase)
src/lib/portali       generatori feed Immobiliare.it / idealista, codici ISTAT, sincronizzazione
supabase/             script SQL (setup iniziale + migrazione v2)
docs/API.md           documentazione API REST
```

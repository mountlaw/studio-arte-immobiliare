# API REST annunci — Studio Arte Immobiliare

Base URL: `https://www.studioarteimmobiliare.com/api`

Tutte le chiamate che scrivono richiedono l'header `Authorization: Bearer <API_KEY>`
(la chiave è la variabile d'ambiente `API_KEY` su Vercel). Le risposte sono JSON.
Quando un annuncio viene creato o modificato, il sito lo pubblica e lo sincronizza
in automatico sui portali configurati (Immobiliare.it, idealista); nella risposta il campo
`portali` dice com'è andata.

## Annunci

| Metodo | Endpoint | Cosa fa |
| --- | --- | --- |
| `GET` | `/v1/immobili` | Lista annunci pubblicati (con chiave: tutti, anche bozze). Filtro `?tipo=vendita|affitto` |
| `POST` | `/v1/immobili` | Crea un annuncio |
| `GET` | `/v1/immobili/{codice}` | Un annuncio (per codice di riferimento o id numerico) |
| `PUT` | `/v1/immobili/{codice}` | Aggiorna (tutti i campi) |
| `PATCH` | `/v1/immobili/{codice}` | Aggiorna solo i campi inviati |
| `DELETE` | `/v1/immobili/{codice}` | Elimina dal sito e ritira dai portali |

### Campi

| Campo | Tipo | Note |
| --- | --- | --- |
| `titolo` * | testo | max 200 caratteri |
| `tipo` * | `vendita` \| `affitto` | |
| `prezzo` * | numero | euro (per l'affitto: canone mensile). `0` = trattativa riservata |
| `citta` * | testo | nome del comune (serve per il codice ISTAT dei portali) |
| `codice` | testo | riferimento agenzia, univoco. Se manca viene generato |
| `categoria` | testo | Appartamento, Attico, Mansarda, Loft, Villa, Villa a schiera, Villetta, Casa indipendente, Rustico, Ufficio, Negozio, Box, Posto auto, Terreno, Altro |
| `mq`, `locali`, `camere`, `bagni` | numeri interi | |
| `piano` | testo | es. `3`, `Terra`, `Rialzato`, `Ultimo` |
| `anno` | numero | anno di costruzione |
| `condizioni` | testo | Nuovo, Ottimo, Ristrutturato, Buono, Abitabile, Da ristrutturare |
| `classe_energetica` | testo | `In corso` (APE non ancora disponibile), A4…G, Esente |
| `riscaldamento` | testo | Autonomo, Centralizzato, A pavimento, Assente |
| `spese_condominiali` | numero | €/mese |
| `zona`, `indirizzo`, `cap`, `provincia` | testo | provincia = sigla (MI, CO…) |
| `latitudine`, `longitudine` | numeri | facoltativi |
| `mostra_indirizzo` | booleano | mostra la via sul sito e sui portali (default `false`) |
| `descrizione` | testo | max 8000 caratteri, a capo per i paragrafi |
| `caratteristiche` | lista di testi | es. `["Ascensore", "Balcone", "Box auto"]` |
| `immagini` | lista di URL | la prima è la copertina (max 100). Immagini già online (JPG/PNG) |
| `video_url` | URL | link YouTube |
| `pubblicato` | booleano | default `true` via API |
| `disponibile` | booleano | `false` = "Non più disponibile" (resta sul sito come archivio, ritirato dai portali) |
| `evidenza` | booleano | in homepage |
| `pubblica_portali` | booleano | default `true` |

\* obbligatori in `POST` e `PUT`.

### Esempio: creare un annuncio

```bash
curl -X POST https://www.studioarteimmobiliare.com/api/v1/immobili \
  -H "Authorization: Bearer LA_TUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "codice": "SAI042",
    "titolo": "Trilocale con terrazzo in Porta Venezia",
    "tipo": "vendita",
    "categoria": "Appartamento",
    "prezzo": 495000,
    "mq": 95, "locali": 3, "camere": 2, "bagni": 2,
    "piano": "4", "anno": 1930,
    "condizioni": "Ristrutturato",
    "classe_energetica": "In corso",
    "citta": "Milano", "zona": "Porta Venezia", "indirizzo": "Via Stoppani 40", "cap": "20129", "provincia": "MI",
    "descrizione": "Ampio trilocale all ultimo piano...",
    "caratteristiche": ["Ascensore", "Terrazzo", "Aria condizionata"],
    "immagini": ["https://.../foto1.jpg", "https://.../foto2.jpg"],
    "video_url": "https://youtu.be/xxxx",
    "pubblicato": true,
    "evidenza": true
  }'
```

Risposta `201`:

```json
{
  "ok": true,
  "immobile": { "id": 21, "codice": "SAI042", "url": "https://www.studioarteimmobiliare.com/immobili/trilocale-con-terrazzo-in-porta-venezia-21", "...": "..." },
  "portali": "sincronizzato"
}
```

`portali` può valere `"non configurati"` (credenziali dei portali non ancora impostate), `"sincronizzato"` oppure `"errori: ..."`.

### Esempio: segnare un annuncio come non più disponibile

```bash
curl -X PATCH https://www.studioarteimmobiliare.com/api/v1/immobili/SAI042 \
  -H "Authorization: Bearer LA_TUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "disponibile": false }'
```

### Errori

| Codice | Significato |
| --- | --- |
| `400` | dati non validi (il messaggio dice quale campo) |
| `401` | chiave API mancante o errata |
| `404` | annuncio non trovato |
| `409` | codice di riferimento già usato |
| `503` | API non configurata sul server (manca `SUPABASE_SERVICE_ROLE_KEY` o `API_KEY`) |

## Feed per i portali

| Endpoint | Formato |
| --- | --- |
| `GET /feed/immobiliare.xml` | Feed XML Immobiliare.it "feed di importazione 2.0" (tutti gli annunci pubblicati, disponibili e con "pubblica sui portali" attivo) |
| `GET /feed/idealista.json` | Export JSON per idealista |
| `GET /foto?u=<url foto>&w=1920` | La foto convertita in JPEG ridimensionato (è quella referenziata nei feed) |

Se è impostata la variabile `FEED_TOKEN`, i feed richiedono `?token=...`.

## Cron

`GET /sync/portali` (protetto da `CRON_SECRET`, chiamato da Vercel ogni notte alle 2:30) riallinea tutti gli annunci sui portali configurati.

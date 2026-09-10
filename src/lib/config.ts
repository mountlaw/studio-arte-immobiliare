// Dati aziendali e costanti condivise tra sito, admin e API.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.studioarteimmobiliare.com").replace(/\/$/, "");

export const AZIENDA = {
  nome: "Studio Arte Immobiliare",
  ragioneSociale: "Studio Arte Immobiliare",
  indirizzo: "Via Unione 15",
  cap: "22074",
  citta: "Lomazzo",
  provincia: "CO",
  regione: "Lombardia",
  telefono: "023272465",
  telefonoE164: "+39023272465",
  telefonoDisplay: "02 3272465",
  email: "info@studioarteimmobiliare.com",
  piva: "06852560967",
  zone: ["Milano", "Como", "Brianza"],
  orari: [
    { giorni: "Lunedì - Venerdì", ore: "9:00 - 13:00 / 14:30 - 19:00" },
    { giorni: "Sabato", ore: "9:00 - 12:30" },
    { giorni: "Domenica", ore: "Su appuntamento" },
  ],
  coordinate: { lat: 45.6973394, lng: 9.0401771 },
};

export const CATEGORIE = [
  "Appartamento",
  "Attico",
  "Mansarda",
  "Loft",
  "Villa",
  "Villa a schiera",
  "Villetta",
  "Casa indipendente",
  "Rustico",
  "Ufficio",
  "Negozio",
  "Box",
  "Posto auto",
  "Terreno",
  "Altro",
] as const;

export const CLASSI_ENERGETICHE = ["In corso", "A4", "A3", "A2", "A1", "B", "C", "D", "E", "F", "G", "Esente"] as const;

export const CONDIZIONI = ["Nuovo", "Ottimo", "Ristrutturato", "Buono", "Abitabile", "Da ristrutturare"] as const;

export const RISCALDAMENTI = ["Autonomo", "Centralizzato", "A pavimento", "Assente"] as const;

export const CARATTERISTICHE_SUGGERITE = [
  "Ascensore",
  "Balcone",
  "Terrazzo",
  "Giardino",
  "Box auto",
  "Posto auto",
  "Cantina",
  "Aria condizionata",
  "Arredato",
  "Porta blindata",
  "Videocitofono",
  "Camino",
  "Piscina",
  "Vista lago",
  "Parquet",
  "Doppi vetri",
  "Allarme",
  "Domotica",
  "Fibra ottica",
  "Portineria",
  "Esposizione doppia",
  "Bagno finestrato",
  "Cucina abitabile",
  "Soppalco",
  "Travi a vista",
];

export const TIPI = [
  { value: "vendita", label: "Vendita", labelIn: "In vendita" },
  { value: "affitto", label: "Affitto", labelIn: "In affitto" },
] as const;

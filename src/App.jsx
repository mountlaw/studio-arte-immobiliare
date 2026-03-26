import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

// ============================================================
// STUDIO ARTE IMMOBILIARE - Sito Web + Dashboard Admin
// ============================================================

// --- SUPABASE CLIENT ---
const supabase = createClient(
  "https://tcoeolazrlitiyxtyful.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjb2VvbGF6cmxpdGl5eHR5ZnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NjY3NjEsImV4cCI6MjA5MDA0Mjc2MX0.DaC_4I33OmQ6vRjUsx_oS19FXrHOdojSfS66IRIfqSc"
);

const SUPABASE_STORAGE_URL = "https://tcoeolazrlitiyxtyful.supabase.co/storage/v1/object/public/foto-immobili";

// --- MOCK DATA ---
const INITIAL_PROPERTIES = [
  {
    id: 1,
    codice: "SAI001",
    titolo: "Trilocale luminoso con terrazzo panoramico",
    tipo: "vendita",
    categoria: "Appartamento",
    locali: 3,
    camere: 2,
    bagni: 1,
    mq: 95,
    prezzo: 185000,
    citta: "Milano",
    zona: "Navigli",
    indirizzo: "Via Alzaia Naviglio Grande, 12",
    piano: "3",
    anno: 1960,
    stato: "Ristrutturato",
    classe_energetica: "C",
    riscaldamento: "Autonomo",
    descrizione: "Splendido trilocale completamente ristrutturato nel cuore dei Navigli. L'appartamento si presenta in ottime condizioni con finiture di pregio. Soggiorno ampio e luminoso con accesso diretto al terrazzo panoramico, cucina abitabile, due camere da letto e bagno finestrato. Ideale per chi cerca la vivacita' del quartiere senza rinunciare alla tranquillita'.",
    caratteristiche: ["Terrazzo", "Aria Condizionata", "Porta Blindata", "Parquet"],
    immagini: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
    ],
    evidenza: true,
    pubblicato: true,
    data_inserimento: "2026-03-10",
  },
  {
    id: 2,
    codice: "SAI002",
    titolo: "Villa con giardino privato e piscina",
    tipo: "vendita",
    categoria: "Villa",
    locali: 6,
    camere: 4,
    bagni: 3,
    mq: 280,
    prezzo: 650000,
    citta: "Como",
    zona: "Brunate",
    indirizzo: "Via per Brunate, 45",
    piano: "Terra",
    anno: 2005,
    stato: "Ottimo",
    classe_energetica: "B",
    riscaldamento: "Autonomo",
    descrizione: "Magnifica villa immersa nel verde con vista lago. La proprieta' si sviluppa su tre livelli con ampi spazi luminosi. Al piano terra soggiorno doppio con camino, cucina professionale e bagno ospiti. Al primo piano master suite con cabina armadio e bagno en-suite, due ulteriori camere e secondo bagno. Piano seminterrato con taverna, lavanderia e garage doppio. Giardino di 500mq con piscina.",
    caratteristiche: ["Piscina", "Giardino", "Garage Doppio", "Camino", "Vista Lago", "Cantina"],
    immagini: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    ],
    evidenza: true,
    pubblicato: true,
    data_inserimento: "2026-03-05",
  },
  {
    id: 3,
    codice: "SAI003",
    titolo: "Bilocale moderno zona Isola",
    tipo: "affitto",
    categoria: "Appartamento",
    locali: 2,
    camere: 1,
    bagni: 1,
    mq: 55,
    prezzo: 1200,
    citta: "Milano",
    zona: "Isola",
    indirizzo: "Via Borsieri, 8",
    piano: "5",
    anno: 2018,
    stato: "Nuovo",
    classe_energetica: "A",
    riscaldamento: "Centralizzato",
    descrizione: "Bilocale di recente costruzione in uno dei quartieri piu' dinamici di Milano. Design contemporaneo con finiture di alta qualita'. Soggiorno con angolo cottura a vista, camera matrimoniale, bagno con doccia walk-in. Completamente arredato con mobili di design. Spese condominiali incluse nel prezzo.",
    caratteristiche: ["Arredato", "Ascensore", "Aria Condizionata", "Videocitofono"],
    immagini: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
    ],
    evidenza: true,
    pubblicato: true,
    data_inserimento: "2026-03-15",
  },
  {
    id: 4,
    codice: "SAI004",
    titolo: "Attico esclusivo con roof garden",
    tipo: "vendita",
    categoria: "Attico",
    locali: 4,
    camere: 3,
    bagni: 2,
    mq: 160,
    prezzo: 520000,
    citta: "Milano",
    zona: "Porta Romana",
    indirizzo: "Viale Bligny, 22",
    piano: "7",
    anno: 2015,
    stato: "Ottimo",
    classe_energetica: "A",
    riscaldamento: "Autonomo",
    descrizione: "Straordinario attico all'ultimo piano con terrazza privata di 80mq. Vista a 360 gradi sulla citta'. Living open space con cucina a isola, tre camere da letto, doppi servizi. Finiture di lusso, domotica, impianto di allarme. Due posti auto nel garage condominiale.",
    caratteristiche: ["Terrazza", "Domotica", "Posto Auto", "Vista Panoramica", "Allarme"],
    immagini: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800",
    ],
    evidenza: false,
    pubblicato: true,
    data_inserimento: "2026-02-28",
  },
  {
    id: 5,
    codice: "SAI005",
    titolo: "Rustico ristrutturato sul lago",
    tipo: "vendita",
    categoria: "Rustico",
    locali: 5,
    camere: 3,
    bagni: 2,
    mq: 200,
    prezzo: 390000,
    citta: "Como",
    zona: "Torno",
    indirizzo: "Via della Riviera, 7",
    piano: "Terra",
    anno: 1800,
    stato: "Ristrutturato",
    classe_energetica: "D",
    riscaldamento: "Autonomo",
    descrizione: "Affascinante rustico del '800 completamente ristrutturato mantenendo il fascino originale. Travi a vista, pavimenti in cotto, muri in pietra. Tre camere, due bagni, ampio soggiorno con camino, cucina rustica. Giardino terrazzato con accesso diretto al lago. Una proprieta' unica nel suo genere.",
    caratteristiche: ["Vista Lago", "Camino", "Giardino", "Travi a Vista", "Accesso Lago"],
    immagini: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
    ],
    evidenza: true,
    pubblicato: true,
    data_inserimento: "2026-03-01",
  },
  {
    id: 6,
    codice: "SAI006",
    titolo: "Loft industriale open space",
    tipo: "affitto",
    categoria: "Loft",
    locali: 2,
    camere: 1,
    bagni: 1,
    mq: 90,
    prezzo: 1600,
    citta: "Milano",
    zona: "Lambrate",
    indirizzo: "Via Ventura, 15",
    piano: "2",
    anno: 2020,
    stato: "Nuovo",
    classe_energetica: "A",
    riscaldamento: "A pavimento",
    descrizione: "Loft di design ricavato dalla riconversione di un ex stabilimento industriale. Soffitti alti 4 metri, ampie vetrate, pavimento in cemento lucidato. Zona giorno e notte con soppalco in acciaio e legno. Perfetto per professionisti e creativi che cercano uno spazio unico.",
    caratteristiche: ["Soppalco", "Soffitti Alti", "Arredato", "Fibra Ottica"],
    immagini: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
    ],
    evidenza: false,
    pubblicato: true,
    data_inserimento: "2026-03-18",
  },
];

const INITIAL_USERS = [
  { id: 1, nome: "Andrea", email: "andrea.edmusic@gmail.com", ruolo: "admin", password: "StudioArte2024!" },
];

// --- UTILITY ---
const formatPrice = (price, tipo) => {
  const formatted = new Intl.NumberFormat("it-IT").format(price);
  return tipo === "affitto" ? `${formatted} \u20AC/mese` : `${formatted} \u20AC`;
};

const CITTA_OPTIONS = ["Milano", "Como"];
const CATEGORIA_OPTIONS = ["Appartamento", "Villa", "Attico", "Rustico", "Loft", "Ufficio", "Negozio", "Box"];
const TIPO_OPTIONS = [
  { value: "vendita", label: "Vendita" },
  { value: "affitto", label: "Affitto" },
];

// --- ICONS (inline SVG components) ---
const IconHome = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const IconBuilding = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
);
const IconUsers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);
const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
);
const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
);
const IconPhone = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);
const IconMail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
);
const IconMapPin = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
const IconLogOut = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);
const IconMenu = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
);
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const IconChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
);
const IconChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
);
const IconDashboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
);
const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);

// --- STYLES ---
const colors = {
  primary: "#1b2a4a",
  primaryLight: "#263d66",
  accent: "#c9a54c",
  accentLight: "#d4bd7a",
  white: "#ffffff",
  bg: "#f5f3ef",
  bgCard: "#ffffff",
  text: "#2c2c2c",
  textLight: "#6b7280",
  border: "#e5e5e5",
  success: "#22c55e",
  danger: "#ef4444",
  warning: "#f59e0b",
};

const styles = {
  // Global
  page: { fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif", color: colors.text, background: colors.bg, minHeight: "100vh" },

  // Navbar
  navbar: { background: colors.primary, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" },
  navLogo: { color: colors.accent, fontSize: 20, fontWeight: 700, letterSpacing: 1, cursor: "pointer", textDecoration: "none" },
  navLogoSub: { color: colors.white, fontSize: 11, letterSpacing: 2, display: "block", opacity: 0.8, fontWeight: 400 },
  navLinks: { display: "flex", gap: 8, alignItems: "center" },
  navLink: { color: colors.white, textDecoration: "none", padding: "8px 16px", borderRadius: 6, fontSize: 14, cursor: "pointer", transition: "background 0.2s", background: "transparent", border: "none", fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif", letterSpacing: 0.2 },
  navLinkActive: { background: "rgba(200,169,126,0.2)", color: colors.accent },
  navCTA: { background: colors.accent, color: colors.primary, padding: "8px 20px", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none", fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif" },
  mobileMenuBtn: { display: "none", background: "none", border: "none", color: colors.white, cursor: "pointer", padding: 4 },

  // Hero
  hero: { background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 50%, ${colors.primary} 100%)`, padding: "80px 24px 96px", textAlign: "center", position: "relative", overflow: "hidden" },
  heroOverlay: { position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(27,42,74,0.7) 0%, rgba(27,42,74,0.95) 100%)", zIndex: 1 },
  heroContent: { position: "relative", zIndex: 2 },
  heroLogo: { width: 64, height: 64, margin: "0 auto 12px", display: "block" },
  heroTitle: { color: colors.white, fontSize: 42, fontWeight: 300, margin: 0, letterSpacing: 2, textTransform: "uppercase" },
  heroBrand: { color: colors.accent, fontWeight: 700, display: "block", fontSize: 48, letterSpacing: 4 },
  heroSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 18, marginTop: 16, fontWeight: 300, maxWidth: 600, marginLeft: "auto", marginRight: "auto" },
  heroLocation: { color: colors.accent, fontSize: 15, letterSpacing: 3, marginTop: 20, fontWeight: 400, textTransform: "uppercase" },
  heroTagline: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontStyle: "italic", marginTop: 6, letterSpacing: 1 },

  // Search Bar
  searchBar: { background: colors.white, maxWidth: 900, margin: "-32px auto 0", borderRadius: 12, padding: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", position: "relative", zIndex: 10 },
  searchRow: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" },
  searchField: { flex: "1 1 140px", display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  searchLabel: { fontSize: 12, fontWeight: 600, color: colors.textLight, textTransform: "uppercase", letterSpacing: 0.5 },
  searchSelect: { padding: "10px 12px", border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14, background: colors.white, color: colors.text, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
  searchBtn: { background: colors.primary, color: colors.white, border: "none", borderRadius: 8, padding: "10px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit", whiteSpace: "nowrap" },

  // Section
  section: { maxWidth: 1200, margin: "0 auto", padding: "48px 24px" },
  sectionTitle: { fontSize: 28, fontWeight: 300, marginBottom: 8, color: colors.primary },
  sectionAccent: { width: 48, height: 3, background: colors.accent, borderRadius: 2, marginBottom: 32 },

  // Property Card
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 },
  card: { background: colors.bgCard, borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" },
  cardImg: { width: "100%", height: 220, objectFit: "cover", display: "block" },
  cardBody: { padding: 20 },
  cardBadge: { display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 },
  cardBadgeVendita: { background: "#e8f5e9", color: "#2e7d32" },
  cardBadgeAffitto: { background: "#e3f2fd", color: "#1565c0" },
  cardTitle: { fontSize: 17, fontWeight: 600, margin: "10px 0 6px", lineHeight: 1.3, color: colors.primary },
  cardLocation: { fontSize: 13, color: colors.textLight, display: "flex", alignItems: "center", gap: 4 },
  cardPrice: { fontSize: 22, fontWeight: 700, color: colors.accent, marginTop: 12 },
  cardDetails: { display: "flex", gap: 16, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${colors.border}` },
  cardDetail: { fontSize: 13, color: colors.textLight },
  cardDetailValue: { fontWeight: 600, color: colors.text },

  // Property Detail
  detailHero: { position: "relative", background: "#111", width: "100%", height: 500, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" },
  detailImg: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" },
  detailNav: { position: "absolute", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: "50%", width: 44, height: 44, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  detailContent: { maxWidth: 1000, margin: "0 auto", padding: "32px 24px" },
  detailTitle: { fontSize: 30, fontWeight: 300, color: colors.primary, marginBottom: 8 },
  detailPrice: { fontSize: 32, fontWeight: 700, color: colors.accent },
  detailGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 16, margin: "24px 0", padding: 20, background: colors.white, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  detailStat: { textAlign: "center" },
  detailStatValue: { fontSize: 22, fontWeight: 700, color: colors.primary },
  detailStatLabel: { fontSize: 12, color: colors.textLight, textTransform: "uppercase", letterSpacing: 0.5 },
  detailDesc: { fontSize: 15, lineHeight: 1.8, color: colors.text, margin: "24px 0" },
  detailFeatures: { display: "flex", flexWrap: "wrap", gap: 8, margin: "16px 0" },
  detailFeature: { background: colors.bg, padding: "6px 14px", borderRadius: 20, fontSize: 13, color: colors.textLight },
  detailInfo: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 32px", padding: 20, background: colors.white, borderRadius: 12, margin: "24px 0" },
  detailInfoRow: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${colors.border}` },
  detailInfoLabel: { fontSize: 14, color: colors.textLight },
  detailInfoValue: { fontSize: 14, fontWeight: 600 },

  // CTA Banner
  ctaBanner: { background: `linear-gradient(135deg, ${colors.accent} 0%, #b89340 100%)`, padding: "48px 24px", textAlign: "center", borderRadius: 16, maxWidth: 900, margin: "0 auto 48px" },
  ctaTitle: { color: colors.white, fontSize: 28, fontWeight: 600, margin: 0 },
  ctaText: { color: "rgba(255,255,255,0.9)", fontSize: 16, marginTop: 12 },
  ctaBtn: { background: colors.primary, color: colors.white, border: "none", borderRadius: 8, padding: "14px 36px", fontSize: 16, fontWeight: 600, cursor: "pointer", marginTop: 20, fontFamily: "inherit" },

  // Form
  formGroup: { marginBottom: 16 },
  formLabel: { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: colors.textLight },
  formInput: { width: "100%", padding: "10px 12px", border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
  formTextarea: { width: "100%", padding: "10px 12px", border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", minHeight: 100, resize: "vertical", boxSizing: "border-box" },
  formSelect: { width: "100%", padding: "10px 12px", border: `1px solid ${colors.border}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: colors.white, boxSizing: "border-box" },
  formRow: { display: "grid", gap: 16 },
  formBtn: { background: colors.primary, color: colors.white, border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  formBtnSecondary: { background: colors.border, color: colors.text, border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  formBtnDanger: { background: colors.danger, color: colors.white, border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },

  // Footer
  footer: { background: colors.primary, color: "rgba(255,255,255,0.7)", padding: "48px 24px 24px" },
  footerInner: { maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 32 },
  footerTitle: { color: colors.accent, fontSize: 16, fontWeight: 600, marginBottom: 16 },
  footerText: { fontSize: 14, lineHeight: 1.8 },
  footerLink: { color: "rgba(255,255,255,0.7)", textDecoration: "none", display: "block", padding: "4px 0", fontSize: 14 },
  footerBottom: { maxWidth: 1200, margin: "32px auto 0", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.1)", textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.4)" },

  // Admin
  adminLayout: { display: "flex", minHeight: "100vh", flexDirection: "row" },
  adminSidebar: { width: 240, background: colors.primary, padding: "24px 0", flexShrink: 0, overflowY: "auto" },
  adminSidebarLogo: { color: colors.accent, fontSize: 16, fontWeight: 700, padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: 16 },
  adminSidebarLink: { display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", color: "rgba(255,255,255,0.7)", fontSize: 14, cursor: "pointer", transition: "all 0.2s", border: "none", background: "none", width: "100%", textAlign: "left", fontFamily: "inherit" },
  adminSidebarLinkActive: { color: colors.white, background: "rgba(200,169,126,0.15)", borderLeft: `3px solid ${colors.accent}` },
  adminMain: { flex: 1, padding: 32, overflow: "auto" },
  adminHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  adminTitle: { fontSize: 24, fontWeight: 300, color: colors.primary },
  adminCard: { background: colors.white, borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: 24 },
  adminStatGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 },
  adminStat: { background: colors.white, borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", textAlign: "center" },
  adminStatNumber: { fontSize: 32, fontWeight: 700, color: colors.primary },
  adminStatLabel: { fontSize: 13, color: colors.textLight, marginTop: 4 },
  adminTable: { width: "100%", borderCollapse: "collapse" },
  adminTh: { textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 600, color: colors.textLight, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `2px solid ${colors.border}` },
  adminTd: { padding: "12px 16px", fontSize: 14, borderBottom: `1px solid ${colors.border}`, verticalAlign: "middle" },
  adminBtnSmall: { padding: "6px 12px", borderRadius: 6, border: "none", fontSize: 12, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 4 },

  // Contact Form
  contactGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, maxWidth: 1000, margin: "0 auto" },
  contactInfo: { padding: 32, background: colors.primary, borderRadius: 12, color: colors.white },
  contactInfoTitle: { fontSize: 24, fontWeight: 300, marginBottom: 24, color: colors.accent },
  contactInfoItem: { display: "flex", alignItems: "center", gap: 12, padding: "12px 0", fontSize: 15 },

  // Responsive
  mobileNav: { display: "none", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: colors.primary, zIndex: 200, flexDirection: "column", padding: "80px 24px 24px" },

  // Thumbnails
  thumbRow: { display: "flex", gap: 8, marginTop: 8 },
  thumb: { width: 80, height: 60, objectFit: "cover", borderRadius: 6, cursor: "pointer", opacity: 0.6, border: "2px solid transparent" },
  thumbActive: { opacity: 1, border: `2px solid ${colors.accent}` },

  // Login
  loginPage: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: colors.bg },
  loginCard: { background: colors.white, borderRadius: 16, padding: "40px 24px", width: "100%", maxWidth: 380, margin: "0 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" },
  loginTitle: { fontSize: 24, fontWeight: 300, color: colors.primary, marginBottom: 8 },
  loginSubtitle: { fontSize: 14, color: colors.textLight, marginBottom: 32 },
};

// ============================================================
// PUBLIC COMPONENTS
// ============================================================

function Navbar({ page, setPage, setShowMobileMenu, showMobileMenu, isMobile }) {
  return (
    <nav style={styles.navbar}>
      <div style={{ cursor: "pointer" }} onClick={() => setPage({ name: "home" })}>
        <NavLogo size={56} />
      </div>
      {!isMobile && (
        <div style={styles.navLinks}>
          {[
            { name: "home", label: "Home" },
            { name: "vendite", label: "Vendite" },
            { name: "affitti", label: "Affitti" },
            { name: "chi-siamo", label: "Chi Siamo" },
            { name: "valutazione", label: "Valuta Casa" },
            { name: "contatti", label: "Contatti" },
          ].map((item) => (
            <button
              key={item.name}
              style={{ ...styles.navLink, ...(page.name === item.name ? styles.navLinkActive : {}) }}
              onClick={() => setPage({ name: item.name })}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      {isMobile && (
        <button style={{ background: "none", border: "none", color: colors.white, cursor: "pointer", padding: 4 }} onClick={() => setShowMobileMenu(!showMobileMenu)}>
          {showMobileMenu ? <IconX /> : <IconMenu />}
        </button>
      )}
    </nav>
  );
}

function MobileMenu({ page, setPage, onClose }) {
  return (
    <div style={{ ...styles.mobileNav, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <button onClick={onClose} style={{ position: "absolute", top: 24, right: 24, background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 8 }}>
        <IconX />
      </button>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: "100%" }}>
        <div style={{ marginBottom: 24 }}>
          <NavLogo size={50} />
        </div>
        {[
          { name: "home", label: "Home" },
          { name: "vendite", label: "Vendite" },
          { name: "affitti", label: "Affitti" },
          { name: "chi-siamo", label: "Chi Siamo" },
          { name: "valutazione", label: "Valuta Casa" },
          { name: "contatti", label: "Contatti" },
        ].map((item) => (
          <button
            key={item.name}
            style={{
              color: page.name === item.name ? colors.accent : colors.white,
              textDecoration: "none",
              padding: "16px 32px",
              fontSize: 22,
              fontWeight: page.name === item.name ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.2s",
              background: page.name === item.name ? "rgba(201,165,76,0.1)" : "transparent",
              border: "none",
              borderRadius: 10,
              fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
              letterSpacing: 1,
              width: "100%",
              maxWidth: 280,
              textAlign: "center",
            }}
            onClick={() => { setPage({ name: item.name }); onClose(); }}
          >
            {item.label}
          </button>
        ))}
        <div style={{ marginTop: 32, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
          <a href={`tel:+39${AZIENDA.telefono}`} style={{ color: colors.accent, textDecoration: "none", fontSize: 15, fontWeight: 500 }}>
            +39 {AZIENDA.telefonoDisplay}
          </a>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// LOGO: Usa il file logo.png originale
// Posiziona il file "logo.png" nella stessa cartella del sito (public/)
// In produzione sara' in /public/logo.png
// ===========================================
// --- DATI AZIENDALI ---
const AZIENDA = {
  nome: "Studio Arte Immobiliare",
  indirizzo: "Via Unione 15",
  citta: "Lomazzo",
  provincia: "CO",
  cap: "22074",
  telefono: "023272465",
  telefonoDisplay: "02 3272465",
  email: "info@studioarteimmobiliare.com",
  piva: "06852560967",
};

// --- LOGO SVG INLINE ---
// Riproduzione fedele del logo: blob organico + casa + testo oro
function BrandLogo({ size = 140 }) {
  const h = size * 1.3;
  return (
    <svg width={size} height={h} viewBox="0 0 260 338" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.25))" }}>
      {/* Blob organico asimmetrico */}
      <path d="
        M 130 10
        C 170 2, 215 20, 240 55
        C 258 80, 260 110, 252 142
        C 246 166, 235 185, 232 208
        C 228 235, 238 260, 245 285
        C 250 305, 238 322, 210 332
        C 180 345, 148 338, 118 330
        C 85 322, 55 310, 35 285
        C 18 264, 10 240, 12 215
        C 14 192, 22 172, 20 148
        C 18 120, 5 95, 12 68
        C 20 42, 45 22, 80 12
        C 95 8, 110 10, 130 10
        Z
      " fill="#1b2a4a"/>
      {/* Casa - tetto */}
      <path d="M 130 52 L 95 82 L 95 115 L 165 115 L 165 82 Z"
        stroke="#c9a54c" strokeWidth="4" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
      {/* Casa - porta con arco */}
      <path d="M 118 98 L 118 115 L 142 115 L 142 98 C 142 90 130 84 130 84 C 130 84 118 90 118 98 Z"
        stroke="#c9a54c" strokeWidth="3" fill="none" strokeLinejoin="round"/>
      {/* STUDIO */}
      <text x="130" y="152" textAnchor="middle" fill="#c9a54c"
        fontSize="20" fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="5" fontWeight="400">STUDIO</text>
      {/* ARTE - grande e bold */}
      <text x="130" y="200" textAnchor="middle" fill="#c9a54c"
        fontSize="58" fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="6" fontWeight="700">ARTE</text>
      {/* IMMOBILIARE */}
      <text x="130" y="235" textAnchor="middle" fill="#c9a54c"
        fontSize="20" fontFamily="Georgia, 'Times New Roman', serif"
        letterSpacing="4" fontWeight="400">IMMOBILIARE</text>
    </svg>
  );
}

// Logo piccolo per la navbar (solo blob + casa, senza testo)
function NavLogo({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="
        M 50 4
        C 68 1, 85 10, 93 25
        C 100 38, 100 52, 96 66
        C 92 80, 85 90, 72 96
        C 58 102, 42 100, 30 92
        C 18 84, 8 72, 4 58
        C 0 44, 4 28, 14 18
        C 26 6, 38 4, 50 4
        Z
      " fill="#1b2a4a"/>
      <path d="M 50 22 L 30 38 L 30 58 L 70 58 L 70 38 Z"
        stroke="#c9a54c" strokeWidth="3" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
      <path d="M 42 46 L 42 58 L 58 58 L 58 46 C 58 40 50 35 50 35 C 50 35 42 40 42 46 Z"
        stroke="#c9a54c" strokeWidth="2" fill="none" strokeLinejoin="round"/>
    </svg>
  );
}

function Hero({ setPage, isMobile, heroImage }) {
  const fallbackGradient = `linear-gradient(180deg, #4a6fa5 0%, #7b94b8 15%, #c4a882 28%, #d4a860 35%, #8fa4b8 42%, #5c7d99 55%, #3a5c78 70%, #1b2a4a 100%)`;
  return (
    <div style={{
      position: "relative",
      height: isMobile ? 420 : 520,
      overflow: "hidden",
      background: heroImage ? `url(${heroImage}) center/cover no-repeat` : fallbackGradient,
    }}>
      {/* Silhouette montagne (solo se non c'e' immagine) */}
      {!heroImage && (
        <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "60%" }} viewBox="0 0 1200 400" preserveAspectRatio="none">
          <path d="M0 250 L100 180 L200 220 L350 120 L450 170 L550 90 L650 150 L750 80 L850 140 L950 100 L1050 160 L1150 130 L1200 170 L1200 400 L0 400Z" fill="rgba(27,42,74,0.4)"/>
          <path d="M0 300 L150 240 L300 270 L450 200 L600 250 L750 190 L900 230 L1050 210 L1200 240 L1200 400 L0 400Z" fill="rgba(27,42,74,0.6)"/>
          <path d="M0 350 L200 310 L400 330 L600 300 L800 320 L1000 305 L1200 330 L1200 400 L0 400Z" fill="#1b2a4a"/>
        </svg>
      )}
      {/* Overlay scuro per leggibilita' testo sopra la foto */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: heroImage ? "rgba(27,42,74,0.55)" : "radial-gradient(ellipse at center 40%, transparent 0%, rgba(27,42,74,0.3) 100%)",
      }} />
      {/* Content */}
      <div style={{
        position: "relative",
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "0 24px",
      }}>
        <BrandLogo size={isMobile ? 120 : 170} />
        <p style={{
          color: "rgba(255,255,255,0.85)",
          fontSize: isMobile ? 15 : 18,
          marginTop: 20,
          fontWeight: 300,
          textAlign: "center",
          letterSpacing: 1,
          maxWidth: 550,
          lineHeight: 1.6,
        }}>
          Sensibilita', tecnica ed esperienza al servizio del tuo immobile.
          <br />
          <span style={{ color: colors.accent, fontSize: isMobile ? 12 : 14, letterSpacing: 3, textTransform: "uppercase", marginTop: 8, display: "inline-block" }}>Milano &bull; Como &bull; Brianza</span>
        </p>
      </div>
    </div>
  );
}

function SearchBar({ filters, setFilters, onSearch }) {
  return (
    <div className="search-bar-responsive" style={styles.searchBar}>
      <div className="search-row-responsive" style={styles.searchRow}>
        <div style={styles.searchField}>
          <span style={styles.searchLabel}>Tipo</span>
          <select style={styles.searchSelect} value={filters.tipo} onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}>
            <option value="">Tutti</option>
            <option value="vendita">Vendita</option>
            <option value="affitto">Affitto</option>
          </select>
        </div>
        <div style={styles.searchField}>
          <span style={styles.searchLabel}>Categoria</span>
          <select style={styles.searchSelect} value={filters.categoria} onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}>
            <option value="">Qualsiasi</option>
            {CATEGORIA_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={styles.searchField}>
          <span style={styles.searchLabel}>Citta'</span>
          <select style={styles.searchSelect} value={filters.citta} onChange={(e) => setFilters({ ...filters, citta: e.target.value })}>
            <option value="">Tutte</option>
            {CITTA_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button className="search-btn-responsive" style={styles.searchBtn} onClick={onSearch}>
          <IconSearch /> Cerca
        </button>
      </div>
    </div>
  );
}

function PropertyCard({ property, onClick }) {
  const badge = property.tipo === "vendita" ? styles.cardBadgeVendita : styles.cardBadgeAffitto;
  return (
    <div style={styles.card} onClick={onClick} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
      <div style={{ position: "relative" }}>
        <img src={property.immagini?.[0] || "https://via.placeholder.com/400x220"} alt={property.titolo} style={styles.cardImg} />
        <span style={{ ...styles.cardBadge, ...badge, position: "absolute", top: 12, left: 12 }}>
          {property.tipo === "vendita" ? "In vendita" : "In affitto"}
        </span>
      </div>
      <div style={styles.cardBody}>
        <div style={styles.cardTitle}>{property.titolo}</div>
        <div style={styles.cardLocation}>
          <IconMapPin /> {property.citta} ({property.zona})
        </div>
        <div style={styles.cardPrice}>{formatPrice(property.prezzo, property.tipo)}</div>
        <div style={styles.cardDetails}>
          <span style={styles.cardDetail}><span style={styles.cardDetailValue}>{property.locali}</span> locali</span>
          <span style={styles.cardDetail}><span style={styles.cardDetailValue}>{property.mq}</span> mq</span>
          <span style={styles.cardDetail}><span style={styles.cardDetailValue}>{property.camere}</span> camere</span>
          <span style={styles.cardDetail}><span style={styles.cardDetailValue}>{property.bagni}</span> bagni</span>
        </div>
      </div>
    </div>
  );
}

function DetailContactForm({ property }) {
  const [f, setF] = useState({ nome: "", telefono: "", email: "", messaggio: "" });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = () => {
    if (!f.nome || !f.email) { setErr("Compila almeno nome e email."); return; }
    setErr("");
    const subject = encodeURIComponent(`Richiesta info immobile ${property.codice}`);
    const body = encodeURIComponent(
      `Richiesta informazioni per l'immobile ${property.codice} - ${property.titolo}\n\nNome: ${f.nome}\nTelefono: ${f.telefono}\nEmail: ${f.email}\n\nMessaggio:\n${f.messaggio || "Vorrei ricevere informazioni su questo immobile."}`
    );
    try {
      const a = document.createElement("a");
      a.href = `mailto:${AZIENDA.email}?subject=${subject}&body=${body}`;
      a.click();
    } catch (e) {}
    setSent(true);
  };

  if (sent) {
    return (
      <div style={{ ...styles.adminCard, marginTop: 32, textAlign: "center", padding: 40 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: colors.primary }}>Richiesta inviata</h3>
        <p style={{ color: colors.textLight, fontSize: 14 }}>Ti contatteremo il prima possibile per l'immobile {property.codice}.</p>
      </div>
    );
  }

  return (
    <div style={{ ...styles.adminCard, marginTop: 32 }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: colors.primary, marginBottom: 16 }}>Richiedi informazioni</h3>
      {err && <div style={{ background: "#fef2f2", color: colors.danger, padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{err}</div>}
      <div className="form-row-responsive" style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Nome e Cognome *</label>
          <input style={styles.formInput} placeholder="Il tuo nome" value={f.nome} onChange={(e) => setF({...f, nome: e.target.value})} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Telefono</label>
          <input style={styles.formInput} placeholder="Il tuo numero" value={f.telefono} onChange={(e) => setF({...f, telefono: e.target.value})} />
        </div>
      </div>
      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Email *</label>
        <input style={styles.formInput} placeholder="La tua email" type="email" value={f.email} onChange={(e) => setF({...f, email: e.target.value})} />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Messaggio</label>
        <textarea style={styles.formTextarea} placeholder={`Vorrei ricevere informazioni sull'immobile ${property.codice}`} value={f.messaggio} onChange={(e) => setF({...f, messaggio: e.target.value})} />
      </div>
      <button style={{ ...styles.formBtn, width: "100%" }} onClick={handleSubmit}>Invia Richiesta</button>
    </div>
  );
}

function PropertyDetail({ property, setPage }) {
  const [imgIndex, setImgIndex] = useState(0);
  const imgs = property.immagini || [];
  return (
    <div>
      <div style={styles.detailHero}>
        {imgs.length > 0 && <img src={imgs[imgIndex]} alt="" style={styles.detailImg} />}
        {imgs.length > 1 && (
          <>
            <button style={{ ...styles.detailNav, left: 16 }} onClick={() => setImgIndex((imgIndex - 1 + imgs.length) % imgs.length)}><IconChevronLeft /></button>
            <button style={{ ...styles.detailNav, right: 16 }} onClick={() => setImgIndex((imgIndex + 1) % imgs.length)}><IconChevronRight /></button>
          </>
        )}
        <div style={{ position: "absolute", bottom: 16, right: 16, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "6px 12px", borderRadius: 6, fontSize: 13 }}>
          {imgIndex + 1} / {imgs.length}
        </div>
      </div>
      {imgs.length > 1 && (
        <div style={{ ...styles.thumbRow, justifyContent: "center", padding: "12px 24px", background: "#111" }}>
          {imgs.map((img, i) => (
            <img key={i} src={img} alt="" style={{ ...styles.thumb, ...(i === imgIndex ? styles.thumbActive : {}) }} onClick={() => setImgIndex(i)} />
          ))}
        </div>
      )}
      <div style={styles.detailContent}>
        <button style={{ ...styles.navLink, color: colors.primary, padding: "8px 0", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }} onClick={() => setPage({ name: property.tipo === "vendita" ? "vendite" : "affitti" })}>
          <IconArrowLeft /> Torna agli annunci
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ ...styles.cardBadge, ...(property.tipo === "vendita" ? styles.cardBadgeVendita : styles.cardBadgeAffitto) }}>
              {property.tipo === "vendita" ? "In vendita" : "In affitto"}
            </span>
            <h1 className="detail-title-responsive" style={styles.detailTitle}>{property.titolo}</h1>
            <div style={{ ...styles.cardLocation, fontSize: 15 }}>
              <IconMapPin /> {property.indirizzo} - {property.citta} ({property.zona})
            </div>
          </div>
          <div className="detail-price-responsive" style={styles.detailPrice}>{formatPrice(property.prezzo, property.tipo)}</div>
        </div>
        <div style={styles.detailGrid}>
          {[
            { value: property.mq, label: "Superficie (mq)" },
            { value: property.locali, label: "Locali" },
            { value: property.camere, label: "Camere" },
            { value: property.bagni, label: "Bagni" },
            { value: `Piano ${property.piano}`, label: "Piano" },
            { value: property.classe_energetica, label: "Classe Energ." },
          ].map((s, i) => (
            <div key={i} style={styles.detailStat}>
              <div style={styles.detailStatValue}>{s.value}</div>
              <div style={styles.detailStatLabel}>{s.label}</div>
            </div>
          ))}
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: colors.primary }}>Descrizione</h3>
        <p style={styles.detailDesc}>{property.descrizione}</p>
        {property.caratteristiche?.length > 0 && (
          <>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: colors.primary }}>Caratteristiche</h3>
            <div style={styles.detailFeatures}>
              {property.caratteristiche.map((f, i) => <span key={i} style={styles.detailFeature}>{f}</span>)}
            </div>
          </>
        )}
        <div className="detail-info-responsive" style={styles.detailInfo}>
          {[
            { l: "Codice", v: property.codice },
            { l: "Categoria", v: property.categoria },
            { l: "Stato Immobile", v: property.stato },
            { l: "Anno Costruzione", v: property.anno },
            { l: "Riscaldamento", v: property.riscaldamento },
            { l: "Classe Energetica", v: property.classe_energetica },
          ].map((row, i) => (
            <div key={i} style={styles.detailInfoRow}>
              <span style={styles.detailInfoLabel}>{row.l}</span>
              <span style={styles.detailInfoValue}>{row.v}</span>
            </div>
          ))}
        </div>
        <DetailContactForm property={property} />
      </div>
    </div>
  );
}

function ListingsPage({ properties, tipo, setPage }) {
  const filtered = properties.filter((p) => p.tipo === tipo && p.pubblicato);
  const title = tipo === "vendita" ? "Immobili in Vendita" : "Immobili in Affitto";
  return (
    <div style={styles.section}>
      <h2 className="section-title-responsive" style={styles.sectionTitle}>{title}</h2>
      <div style={styles.sectionAccent} />
      {filtered.length === 0 ? (
        <p style={{ color: colors.textLight, fontSize: 16 }}>Nessun immobile disponibile al momento. Torna a trovarci presto.</p>
      ) : (
        <div className="card-grid-responsive" style={styles.cardGrid}>
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} onClick={() => setPage({ name: "dettaglio", id: p.id })} />
          ))}
        </div>
      )}
    </div>
  );
}

function HomePage({ properties, setPage, filters, setFilters, isMobile, heroImage }) {
  const evidenza = properties.filter((p) => p.evidenza && p.pubblicato);
  return (
    <div>
      <Hero setPage={setPage} isMobile={isMobile} heroImage={heroImage} />
      <SearchBar
        filters={filters}
        setFilters={setFilters}
        onSearch={() => setPage({ name: filters.tipo === "affitto" ? "affitti" : "vendite" })}
      />
      <div style={{ ...styles.section, paddingTop: 64 }}>
        <h2 className="section-title-responsive" style={styles.sectionTitle}>Immobili Selezionati per Te</h2>
        <div style={styles.sectionAccent} />
        <div className="card-grid-responsive" style={styles.cardGrid}>
          {evidenza.map((p) => (
            <PropertyCard key={p.id} property={p} onClick={() => setPage({ name: "dettaglio", id: p.id })} />
          ))}
        </div>
      </div>
      {/* Sezione Servizi */}
      <div style={{ ...styles.section, paddingTop: 16, paddingBottom: 48 }}>
        <h2 className="section-title-responsive" style={styles.sectionTitle}>Il Nostro Approccio</h2>
        <div style={styles.sectionAccent} />
        <p style={{ fontSize: 16, lineHeight: 1.8, color: colors.textLight, maxWidth: 700, marginBottom: 32 }}>
          Ogni immobile ha una storia e ogni cliente un'esigenza diversa. Per questo offriamo un servizio completo e trasparente, dall'incarico alla conclusione della trattativa.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
          {[
            { titolo: "Vendita e Acquisto", desc: "Valutazione accurata, strategia di marketing personalizzata e accompagnamento fino al rogito. Ogni proprieta' viene valorizzata al meglio per raggiungere il risultato ottimale." },
            { titolo: "Locazione e Gestione", desc: "Dalla ricerca dell'inquilino ideale alla gestione del contratto, ci occupiamo di ogni aspetto per garantire serenita' sia al proprietario che all'affittuario." },
            { titolo: "Consulenza e Valutazione", desc: "Analisi di mercato approfondita, valutazione professionale e consulenza su misura per prendere decisioni consapevoli e informate sul proprio patrimonio." },
          ].map((s, i) => (
            <div key={i} style={{ background: colors.white, borderRadius: 12, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 48, height: 3, background: colors.accent, borderRadius: 2, marginBottom: 16 }} />
              <h3 style={{ fontSize: 18, fontWeight: 600, color: colors.primary, marginBottom: 10 }}>{s.titolo}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: colors.textLight, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sezione Chi Siamo preview */}
      <div style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, #1a2540 50%, ${colors.primaryLight} 100%)`, padding: isMobile ? "56px 24px" : "72px 24px", position: "relative", overflow: "hidden" }}>
        {/* Decorative element */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 250, height: 250, borderRadius: "50%", border: `1px solid rgba(201,165,76,0.1)` }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 180, height: 180, borderRadius: "50%", border: `1px solid rgba(201,165,76,0.08)` }} />
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 32 : 48, alignItems: "center", position: "relative", zIndex: 2 }}>
          <div>
            <div style={{ width: 48, height: 3, background: colors.accent, borderRadius: 2, marginBottom: 20 }} />
            <h2 style={{ color: colors.white, fontSize: isMobile ? 24 : 30, fontWeight: 300, marginBottom: 16, letterSpacing: 0.5, lineHeight: 1.3 }}>Non una semplice agenzia</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 16, lineHeight: 1.8, marginBottom: 0 }}>
              Ci chiamiamo Studio Arte Immobiliare perche' crediamo che l'immobiliare sia come l'arte: richiede sensibilita', tecnica ed esperienza. Siamo nati dall'unione di professionisti che hanno scelto di fare squadra, mettendo al centro la persona prima di ogni trattativa.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
              <button style={{ ...styles.ctaBtn, background: colors.accent, color: colors.primary, padding: "12px 28px", borderRadius: 8, fontWeight: 600 }} onClick={() => setPage({ name: "chi-siamo" })}>Scopri chi siamo</button>
              <button style={{ ...styles.ctaBtn, background: "transparent", color: colors.accent, padding: "12px 28px", borderRadius: 8, fontWeight: 600, border: `1px solid ${colors.accent}` }} onClick={() => setPage({ name: "contatti" })}>Contattaci</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { num: "15+", label: "Anni di esperienza" },
              { num: "500+", label: "Trattative concluse" },
              { num: "98%", label: "Clienti soddisfatti" },
              { num: "3", label: "Zone operative" },
            ].map((stat, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 20, textAlign: "center", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: colors.accent, marginBottom: 4 }}>{stat.num}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Valutazione */}
      <div style={{ ...styles.section, paddingTop: 48 }}>
        <div style={styles.ctaBanner}>
          <h2 className="cta-title-responsive" style={styles.ctaTitle}>Vuoi conoscere il valore del tuo immobile?</h2>
          <p style={styles.ctaText}>Richiedi una valutazione professionale, gratuita e senza impegno. Ti guideremo con trasparenza in ogni fase.</p>
          <button style={styles.ctaBtn} onClick={() => setPage({ name: "valutazione" })}>Richiedi Valutazione Gratuita</button>
        </div>
      </div>
    </div>
  );
}

function ChiSiamoPage({ setPage }) {
  return (
    <div>
      {/* Intro */}
      <div style={{ background: colors.primary, padding: "56px 24px", textAlign: "center" }}>
        <h1 style={{ color: colors.white, fontSize: 34, fontWeight: 300, letterSpacing: 2, margin: 0 }}>Chi Siamo</h1>
        <div style={{ width: 48, height: 3, background: colors.accent, borderRadius: 2, margin: "16px auto 0" }} />
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 17, marginTop: 20, maxWidth: 650, margin: "20px auto 0", lineHeight: 1.7, fontWeight: 300 }}>
          Dove la passione per il settore immobiliare si fonde con l'esperienza e un approccio unico.
        </p>
      </div>

      <div style={{ ...styles.section, maxWidth: 800 }}>
        {/* Il nostro inizio */}
        <h2 style={{ fontSize: 24, fontWeight: 600, color: colors.primary, marginBottom: 16 }}>Il nostro inizio: fare squadra</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 32, color: colors.text }}>
          Studio Arte Immobiliare nasce dall'unione di colleghi con anni di esperienza nel settore, che hanno deciso di mettere insieme competenze e visione. Non siamo partiti da soli, ma come gruppo. Crediamo fermamente che solo attraverso la collaborazione si possa offrire un servizio di qualita' superiore. Questa sinergia ci motiva ogni giorno a superare le aspettative e a garantire un supporto concreto e affidabile ai nostri clienti.
        </p>

        {/* L'arte del servizio */}
        <h2 style={{ fontSize: 24, fontWeight: 600, color: colors.primary, marginBottom: 16 }}>L'arte del servizio immobiliare</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 32, color: colors.text }}>
          Ci chiamiamo "Studio Arte Immobiliare" per una ragione precisa: andiamo oltre la classica agenzia. Per noi, prima della commissione e prima del servizio, c'e' la persona. Ogni immobile ha una sua storia, preziosa e unica. Il nostro impegno e' comprenderla e valorizzarla al meglio, offrendo un'esperienza in cui i nostri clienti sanno di essere al centro della nostra attenzione.
        </p>

        {/* I valori */}
        <h2 style={{ fontSize: 24, fontWeight: 600, color: colors.primary, marginBottom: 16 }}>I valori che ci guidano</h2>
        <p style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 16, color: colors.text }}>
          Professionalita', lavoro di squadra e un'immagine curata sono i pilastri del nostro lavoro quotidiano. Vogliamo che chi si rivolge a noi percepisca Studio Arte Immobiliare non come una semplice agenzia di zona, ma come un partner fidato e competente, attento ai dettagli e sempre orientato al raggiungimento degli obiettivi di ciascuno.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 32, color: colors.text }}>
          Operiamo tra Milano, Como e la Brianza, un territorio che conosciamo a fondo. Dall'incarico alla firma dal notaio, accompagniamo ogni cliente con trasparenza in ogni fase del percorso.
        </p>

        {/* Valori cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, margin: "32px 0 48px" }}>
          {[
            { titolo: "Professionalita'", desc: "Competenza reale, aggiornamento continuo e metodo rigoroso in ogni trattativa." },
            { titolo: "Trasparenza", desc: "Comunicazione chiara e onesta, senza sorprese. Sempre." },
            { titolo: "Squadra", desc: "Il nostro punto di forza e' il gruppo: competenze diverse unite da un obiettivo comune." },
            { titolo: "Persona al centro", desc: "Prima dell'immobile viene chi lo vive. Ascoltiamo, capiamo, agiamo." },
          ].map((v, i) => (
            <div key={i} style={{ background: colors.bg, borderRadius: 12, padding: 24, borderLeft: `3px solid ${colors.accent}` }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.primary, marginBottom: 8 }}>{v.titolo}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: colors.textLight, margin: 0 }}>{v.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ ...styles.ctaBanner, textAlign: "center" }}>
          <h3 style={{ ...styles.ctaTitle, fontSize: 22 }}>Vuoi conoscerci di persona?</h3>
          <p style={styles.ctaText}>Vieni a trovarci in ufficio o contattaci per una consulenza senza impegno.</p>
          <button style={styles.ctaBtn} onClick={() => setPage({ name: "contatti" })}>Contattaci</button>
        </div>
      </div>
    </div>
  );
}

function ValutazionePage({ isMobile }) {
  const [sent, setSent] = useState(false);
  const [valForm, setValForm] = useState({ nome: "", telefono: "", email: "", citta: "", tipo: "", indirizzo: "", mq: "", note: "" });
  const [valError, setValError] = useState("");

  const handleValSubmit = () => {
    if (!valForm.nome || !valForm.telefono || !valForm.email || !valForm.indirizzo) {
      setValError("Compila almeno nome, telefono, email e indirizzo.");
      return;
    }
    setValError("");
    // Invio email tramite mailto come fallback + salvataggio
    const subject = encodeURIComponent("Richiesta Valutazione Immobile");
    const body = encodeURIComponent(
      `Nuova richiesta di valutazione immobile\n\nNome: ${valForm.nome}\nTelefono: ${valForm.telefono}\nEmail: ${valForm.email}\nCitta': ${valForm.citta}\nTipo: ${valForm.tipo}\nIndirizzo: ${valForm.indirizzo}\nSuperficie: ${valForm.mq} mq\nNote: ${valForm.note}`
    );
    // Tentativo invio silenzioso, poi mostra conferma
    try {
      const mailtoLink = document.createElement("a");
      mailtoLink.href = `mailto:${AZIENDA.email}?subject=${subject}&body=${body}`;
      mailtoLink.click();
    } catch (e) { /* fallback silenzioso */ }
    setSent(true);
  };

  if (sent) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 500, padding: "0 24px" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #22c55e, #16a34a)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 8px 24px rgba(34,197,94,0.3)" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 300, color: colors.primary, marginBottom: 12 }}>Richiesta Inviata</h2>
          <p style={{ color: colors.textLight, fontSize: 16, lineHeight: 1.7 }}>
            Abbiamo ricevuto la tua richiesta di valutazione. Ti contatteremo entro 24 ore per fissare un appuntamento.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`, padding: isMobile ? "48px 24px" : "64px 24px", textAlign: "center" }}>
        <h1 style={{ color: colors.white, fontSize: isMobile ? 28 : 36, fontWeight: 300, letterSpacing: 1, margin: 0 }}>Quanto vale il tuo immobile?</h1>
        <div style={{ width: 48, height: 3, background: colors.accent, borderRadius: 2, margin: "16px auto 0" }} />
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: isMobile ? 15 : 17, marginTop: 20, maxWidth: 550, margin: "20px auto 0", lineHeight: 1.7, fontWeight: 300 }}>
          Richiedi una valutazione professionale gratuita e senza impegno. Analizziamo mercato, posizione e caratteristiche per darti una stima precisa.
        </p>
      </div>

      {/* Tre punti di forza */}
      <div style={{ maxWidth: 900, margin: "-32px auto 0", padding: "0 24px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 16 }}>
          {[
            { num: "01", title: "Analisi di mercato", desc: "Studiamo i dati delle compravendite recenti nella tua zona per una stima basata su fatti concreti." },
            { num: "02", title: "Sopralluogo dedicato", desc: "Visitiamo l'immobile per valutare ogni dettaglio che incide sul valore reale della proprieta'." },
            { num: "03", title: "Report dettagliato", desc: "Ricevi un documento professionale con la valutazione completa e le strategie consigliate." },
          ].map((step, i) => (
            <div key={i} style={{ background: colors.white, borderRadius: 12, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: colors.accent, marginBottom: 8 }}>{step.num}</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.primary, marginBottom: 8 }}>{step.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: colors.textLight, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: 680, margin: "48px auto", padding: "0 24px" }}>
        <div style={{ background: colors.white, borderRadius: 16, padding: isMobile ? 24 : 40, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: `1px solid ${colors.border}` }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: colors.primary, marginBottom: 6 }}>Compila il modulo</h2>
          <p style={{ fontSize: 14, color: colors.textLight, marginBottom: 28, lineHeight: 1.6 }}>Ti ricontatteremo entro 24 ore per fissare l'appuntamento di valutazione.</p>
          {valError && <div style={{ background: "#fef2f2", color: colors.danger, padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{valError}</div>}
          <div className="form-row-responsive" style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Nome e Cognome *</label>
              <input style={styles.formInput} placeholder="Il tuo nome" value={valForm.nome} onChange={(e) => setValForm({...valForm, nome: e.target.value})} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Telefono *</label>
              <input style={styles.formInput} placeholder="Il tuo numero" value={valForm.telefono} onChange={(e) => setValForm({...valForm, telefono: e.target.value})} />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Email *</label>
            <input style={styles.formInput} placeholder="La tua email" type="email" value={valForm.email} onChange={(e) => setValForm({...valForm, email: e.target.value})} />
          </div>
          <div className="form-row-responsive" style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Citta'</label>
              <select style={styles.formSelect} value={valForm.citta} onChange={(e) => setValForm({...valForm, citta: e.target.value})}>
                <option value="">Seleziona</option>
                {CITTA_OPTIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Tipo Immobile</label>
              <select style={styles.formSelect} value={valForm.tipo} onChange={(e) => setValForm({...valForm, tipo: e.target.value})}>
                <option value="">Seleziona</option>
                {CATEGORIA_OPTIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Indirizzo dell'immobile *</label>
            <input style={styles.formInput} placeholder="Via, numero civico, citta'" value={valForm.indirizzo} onChange={(e) => setValForm({...valForm, indirizzo: e.target.value})} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Superficie approssimativa (mq)</label>
            <input style={styles.formInput} type="number" placeholder="Es. 80" value={valForm.mq} onChange={(e) => setValForm({...valForm, mq: e.target.value})} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Note aggiuntive</label>
            <textarea style={styles.formTextarea} placeholder="Stato dell'immobile, eventuali ristrutturazioni, particolarita'..." value={valForm.note} onChange={(e) => setValForm({...valForm, note: e.target.value})} />
          </div>
          <button
            style={{ ...styles.formBtn, width: "100%", padding: "14px 24px", fontSize: 16, background: `linear-gradient(135deg, ${colors.accent}, #b89340)`, color: colors.white, borderRadius: 10, marginTop: 8 }}
            onClick={handleValSubmit}
          >
            Richiedi Valutazione Gratuita
          </button>
          <p style={{ fontSize: 12, color: colors.textLight, textAlign: "center", marginTop: 12 }}>
            I tuoi dati saranno trattati nel rispetto della normativa sulla privacy. Non verranno condivisi con terzi.
          </p>
        </div>
      </div>
    </div>
  );
}

function ContattiPage({ isMobile }) {
  const [contactForm, setContactForm] = useState({ nome: "", email: "", telefono: "", messaggio: "" });
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState("");

  const handleContactSubmit = () => {
    if (!contactForm.nome || !contactForm.email || !contactForm.messaggio) {
      setContactError("Compila almeno nome, email e messaggio.");
      return;
    }
    setContactError("");
    const subject = encodeURIComponent("Nuovo contatto dal sito web");
    const body = encodeURIComponent(
      `Nuovo messaggio dal sito\n\nNome: ${contactForm.nome}\nEmail: ${contactForm.email}\nTelefono: ${contactForm.telefono}\n\nMessaggio:\n${contactForm.messaggio}`
    );
    try {
      const mailtoLink = document.createElement("a");
      mailtoLink.href = `mailto:${AZIENDA.email}?subject=${subject}&body=${body}`;
      mailtoLink.click();
    } catch (e) { /* fallback silenzioso */ }
    setContactSent(true);
  };

  return (
    <div style={styles.section}>
      <h2 className="section-title-responsive" style={styles.sectionTitle}>Contatti</h2>
      <div style={styles.sectionAccent} />
      <div className="contact-grid-responsive" style={styles.contactGrid}>
        <div style={styles.contactInfo}>
          <h3 style={styles.contactInfoTitle}>Dove trovarci</h3>
          <div style={styles.contactInfoItem}>
            <IconMapPin /> {AZIENDA.indirizzo}, {AZIENDA.cap} {AZIENDA.citta} ({AZIENDA.provincia})
          </div>
          <div style={styles.contactInfoItem}>
            <IconPhone /> <a href={`tel:+39${AZIENDA.telefono}`} style={{ color: "inherit", textDecoration: "none" }}>+39 {AZIENDA.telefonoDisplay}</a>
          </div>
          <div style={styles.contactInfoItem}>
            <IconMail /> <a href={`mailto:${AZIENDA.email}`} style={{ color: "inherit", textDecoration: "none" }}>{AZIENDA.email}</a>
          </div>
          <div style={{ marginTop: 32 }}>
            <h4 style={{ color: colors.accent, marginBottom: 12, fontWeight: 600 }}>Orari</h4>
            <p style={{ lineHeight: 2, fontSize: 14 }}>
              Lun - Ven: 9:00 - 13:00 / 14:30 - 19:00<br />
              Sabato: 9:00 - 12:30<br />
              Domenica: Su appuntamento
            </p>
          </div>
          <div style={{ marginTop: 24 }}>
            <SocialIcons color={colors.accent} />
          </div>
        </div>
        <div>
          {contactSent ? (
            <div style={{ ...styles.adminCard, textAlign: "center", padding: 48 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: colors.primary, marginBottom: 8 }}>Messaggio inviato</h3>
              <p style={{ color: colors.textLight, fontSize: 14, lineHeight: 1.6 }}>Ti risponderemo il prima possibile.</p>
            </div>
          ) : (
            <div style={styles.adminCard}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: colors.primary, marginBottom: 16 }}>Scrivici</h3>
              {contactError && <div style={{ background: "#fef2f2", color: colors.danger, padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{contactError}</div>}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Nome e Cognome *</label>
                <input style={styles.formInput} placeholder="Il tuo nome" value={contactForm.nome} onChange={(e) => setContactForm({...contactForm, nome: e.target.value})} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Email *</label>
                <input style={styles.formInput} placeholder="La tua email" type="email" value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Telefono</label>
                <input style={styles.formInput} placeholder="Il tuo numero" value={contactForm.telefono} onChange={(e) => setContactForm({...contactForm, telefono: e.target.value})} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Messaggio *</label>
                <textarea style={styles.formTextarea} placeholder="Come possiamo aiutarti?" value={contactForm.messaggio} onChange={(e) => setContactForm({...contactForm, messaggio: e.target.value})} />
              </div>
              <button style={{ ...styles.formBtn, width: "100%" }} onClick={handleContactSubmit}>Invia Messaggio</button>
              <p style={{ fontSize: 12, color: colors.textLight, textAlign: "center", marginTop: 12 }}>
                I tuoi dati saranno trattati nel rispetto della normativa sulla privacy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Social media icons
function IconInstagram() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
  );
}
function IconYoutube() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
  );
}
function IconTiktok() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
  );
}

// Social links data (modifiable from admin in production)
const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/studioarteimmobiliare/",
  youtube: "https://www.youtube.com/@studioarteimmobiliare",
  tiktok: "https://www.tiktok.com/@studioarteimmobiliare",
};

function SocialIcons({ color = "rgba(255,255,255,0.7)", size = "20" }) {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" style={{ color, transition: "opacity 0.2s" }} title="Instagram"><IconInstagram /></a>
      <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" style={{ color, transition: "opacity 0.2s" }} title="YouTube"><IconYoutube /></a>
      <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" style={{ color, transition: "opacity 0.2s" }} title="TikTok"><IconTiktok /></a>
    </div>
  );
}

function Footer({ setPage }) {
  return (
    <footer style={styles.footer}>
      <div className="footer-grid-responsive" style={styles.footerInner}>
        <div>
          <div style={styles.footerTitle}>Studio Arte Immobiliare</div>
          <p style={styles.footerText}>
            L'immobiliare e' come l'arte: richiede sensibilita', tecnica ed esperienza.<br />
            Ogni immobile ha una storia. Noi la valorizziamo.
          </p>
          <div style={{ marginTop: 16 }}>
            <SocialIcons color={colors.accent} />
          </div>
        </div>
        <div>
          <div style={styles.footerTitle}>Navigazione</div>
          <a href="#" style={styles.footerLink} onClick={(e) => { e.preventDefault(); setPage({ name: "home" }); }}>Home</a>
          <a href="#" style={styles.footerLink} onClick={(e) => { e.preventDefault(); setPage({ name: "vendite" }); }}>Immobili in Vendita</a>
          <a href="#" style={styles.footerLink} onClick={(e) => { e.preventDefault(); setPage({ name: "affitti" }); }}>Immobili in Affitto</a>
          <a href="#" style={styles.footerLink} onClick={(e) => { e.preventDefault(); setPage({ name: "chi-siamo" }); }}>Chi Siamo</a>
          <a href="#" style={styles.footerLink} onClick={(e) => { e.preventDefault(); setPage({ name: "valutazione" }); }}>Valutazione Gratuita</a>
          <a href="#" style={styles.footerLink} onClick={(e) => { e.preventDefault(); setPage({ name: "contatti" }); }}>Contatti</a>
        </div>
        <div>
          <div style={styles.footerTitle}>Contatti</div>
          <a href={`https://maps.google.com/?q=${encodeURIComponent(AZIENDA.indirizzo + ', ' + AZIENDA.citta)}`} target="_blank" rel="noopener noreferrer" style={{ ...styles.footerLink, display: "flex", alignItems: "center", gap: 8 }}>
            <IconMapPin /> {AZIENDA.indirizzo}, {AZIENDA.cap} {AZIENDA.citta} ({AZIENDA.provincia})
          </a>
          <a href={`tel:+39${AZIENDA.telefono}`} style={{ ...styles.footerLink, display: "flex", alignItems: "center", gap: 8 }}>
            <IconPhone /> +39 {AZIENDA.telefonoDisplay}
          </a>
          <a href={`mailto:${AZIENDA.email}`} style={{ ...styles.footerLink, display: "flex", alignItems: "center", gap: 8 }}>
            <IconMail /> {AZIENDA.email}
          </a>
          <div style={{ marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
            <strong style={{ color: "rgba(255,255,255,0.6)" }}>Orari</strong><br />
            Lun - Ven: 9:00 - 19:00<br />
            Sab: 9:00 - 12:30
          </div>
        </div>
      </div>
      <div style={styles.footerBottom}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <span>{AZIENDA.nome}</span>
          <span>P.IVA: {AZIENDA.piva}</span>
          <a href="#" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }} onClick={(e) => { e.preventDefault(); setPage({ name: "privacy" }); }}>Privacy Policy</a>
          <a href="#" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }} onClick={(e) => { e.preventDefault(); setPage({ name: "privacy" }); }}>Cookie Policy</a>
        </div>
        <div style={{ marginTop: 8, color: "rgba(255,255,255,0.3)" }}>
          &copy; 2026 Studio Arte Immobiliare - Tutti i diritti riservati
          <span style={{ margin: "0 8px" }}>|</span>
          <a href="#" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none", fontSize: 12 }} onClick={(e) => { e.preventDefault(); setPage({ name: "admin-login" }); }}>Area Riservata</a>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// ADMIN COMPONENTS
// ============================================================

function AdminLogin({ setPage, users, setCurrentUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const user = users.find((u) => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      setPage({ name: "admin-dashboard" });
    } else {
      setError("Email o password non validi");
    }
  };

  return (
    <div style={styles.loginPage}>
      <div style={styles.loginCard}>
        <div style={{ marginBottom: 8 }}>
          <BrandLogo size={70} />
        </div>
        <div style={styles.loginSubtitle}>Accedi all'area di gestione</div>
        {error && <div style={{ background: "#fef2f2", color: colors.danger, padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Email</label>
          <input style={styles.formInput} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="La tua email" />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Password</label>
          <input style={styles.formInput} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="La tua password" onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
        </div>
        <button style={{ ...styles.formBtn, width: "100%" }} onClick={handleLogin}>Accedi</button>
        <button style={{ ...styles.navLink, color: colors.textLight, marginTop: 16, fontSize: 13, padding: 0 }} onClick={() => setPage({ name: "home" })}>
          Torna al sito
        </button>
      </div>
    </div>
  );
}

function AdminSidebar({ adminPage, setAdminPage, currentUser, setPage, setCurrentUser }) {
  const links = [
    { name: "dashboard", label: "Dashboard", icon: <IconDashboard /> },
    { name: "immobili", label: "Immobili", icon: <IconBuilding /> },
  ];
  if (currentUser?.ruolo === "admin") {
    links.push({ name: "utenti", label: "Utenti", icon: <IconUsers /> });
  }
  return (
    <div className="admin-sidebar-responsive" style={styles.adminSidebar}>
      <div style={styles.adminSidebarLogo}>
        <BrandLogo size={55} />
        <span style={{ display: "block", fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Pannello Gestione</span>
      </div>
      <div className="admin-sidebar-links">
        {links.map((link) => (
          <button
            key={link.name}
            style={{ ...styles.adminSidebarLink, ...(adminPage === link.name ? styles.adminSidebarLinkActive : {}) }}
            onClick={() => setAdminPage(link.name)}
          >
            {link.icon} {link.label}
          </button>
        ))}
      </div>
      <div style={{ marginTop: "auto", padding: "24px 20px 0", borderTop: "1px solid rgba(255,255,255,0.1)", marginBlock: 24 }}>
        <button style={{ ...styles.adminSidebarLink }} onClick={() => setPage({ name: "home" })}>
          <IconEye /> Vedi Sito
        </button>
        <button style={{ ...styles.adminSidebarLink, color: "#ef9a9a" }} onClick={() => { setCurrentUser(null); setPage({ name: "home" }); }}>
          <IconLogOut /> Esci
        </button>
      </div>
      <div style={{ padding: "12px 20px", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
        Accesso: {currentUser?.nome}<br />Ruolo: {currentUser?.ruolo}
      </div>
    </div>
  );
}

function AdminDashboard({ properties, heroImage, setHeroImage }) {
  const vendita = properties.filter((p) => p.tipo === "vendita" && p.pubblicato);
  const affitto = properties.filter((p) => p.tipo === "affitto" && p.pubblicato);
  const bozze = properties.filter((p) => !p.pubblicato);
  const [heroInput, setHeroInput] = useState(heroImage || "");
  const [heroPreview, setHeroPreview] = useState(heroImage || "");

  const handleHeroFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setHeroPreview(ev.target.result);
      setHeroInput("");
      setHeroImage(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleHeroUrl = () => {
    if (heroInput.trim()) {
      setHeroPreview(heroInput.trim());
      setHeroImage(heroInput.trim());
    }
  };

  return (
    <div>
      <h2 style={styles.adminTitle}>Dashboard</h2>
      <div className="stat-grid-responsive" style={styles.adminStatGrid}>
        <div style={styles.adminStat}>
          <div style={styles.adminStatNumber}>{properties.length}</div>
          <div style={styles.adminStatLabel}>Immobili totali</div>
        </div>
        <div style={styles.adminStat}>
          <div style={styles.adminStatNumber}>{vendita.length}</div>
          <div style={styles.adminStatLabel}>In vendita</div>
        </div>
        <div style={styles.adminStat}>
          <div style={styles.adminStatNumber}>{affitto.length}</div>
          <div style={styles.adminStatLabel}>In affitto</div>
        </div>
        <div style={styles.adminStat}>
          <div style={{ ...styles.adminStatNumber, color: colors.warning }}>{bozze.length}</div>
          <div style={styles.adminStatLabel}>Bozze</div>
        </div>
      </div>
      {/* Gestione immagine hero */}
      <div style={styles.adminCard}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Immagine principale (Hero)</h3>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 16 }}>
          Carica una foto o inserisci un URL per cambiare lo sfondo della homepage.
        </p>
        {heroPreview && (
          <div style={{ marginBottom: 16, borderRadius: 8, overflow: "hidden", maxHeight: 200 }}>
            <img src={heroPreview} alt="Preview hero" style={{ width: "100%", height: 200, objectFit: "cover" }} />
          </div>
        )}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <label style={{ background: colors.accent, color: "#fff", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-block", textAlign: "center", fontFamily: "inherit" }}>
            Carica foto
            <input type="file" accept="image/*" onChange={handleHeroFile} style={{ display: "none" }} />
          </label>
          {heroPreview && (
            <button style={{ ...styles.formBtnSecondary, color: colors.danger, borderColor: colors.danger }} onClick={() => { setHeroPreview(""); setHeroInput(""); setHeroImage(""); }}>
              Rimuovi
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            style={{ ...styles.formInput, flex: 1 }}
            value={heroInput}
            onChange={(e) => setHeroInput(e.target.value)}
            placeholder="Oppure incolla un URL immagine..."
            onKeyDown={(e) => { if (e.key === "Enter") handleHeroUrl(); }}
          />
          <button style={styles.formBtnSecondary} onClick={handleHeroUrl}>Applica URL</button>
        </div>
      </div>

      <div style={styles.adminCard}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Ultimi immobili inseriti</h3>
        <table className="admin-table-responsive" style={styles.adminTable}>
          <thead>
            <tr>
              <th style={styles.adminTh}>Codice</th>
              <th style={styles.adminTh}>Titolo</th>
              <th style={styles.adminTh}>Tipo</th>
              <th style={styles.adminTh}>Prezzo</th>
              <th style={styles.adminTh}>Stato</th>
            </tr>
          </thead>
          <tbody>
            {properties.slice(0, 5).map((p) => (
              <tr key={p.id}>
                <td style={styles.adminTd}><strong>{p.codice}</strong></td>
                <td style={styles.adminTd}>{p.titolo}</td>
                <td style={styles.adminTd}>
                  <span style={{ ...styles.cardBadge, ...(p.tipo === "vendita" ? styles.cardBadgeVendita : styles.cardBadgeAffitto) }}>
                    {p.tipo}
                  </span>
                </td>
                <td style={styles.adminTd}>{formatPrice(p.prezzo, p.tipo)}</td>
                <td style={styles.adminTd}>
                  <span style={{ ...styles.cardBadge, background: p.pubblicato ? "#e8f5e9" : "#fff3e0", color: p.pubblicato ? "#2e7d32" : "#e65100" }}>
                    {p.pubblicato ? "Pubblicato" : "Bozza"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const EMPTY_PROPERTY = {
  codice: "",
  titolo: "",
  tipo: "vendita",
  categoria: "Appartamento",
  locali: "",
  camere: "",
  bagni: "",
  mq: "",
  prezzo: "",
  citta: "Milano",
  zona: "",
  indirizzo: "",
  piano: "",
  anno: "",
  stato: "Buono",
  classe_energetica: "G",
  riscaldamento: "Autonomo",
  descrizione: "",
  caratteristiche: [],
  immagini: [],
  evidenza: false,
  pubblicato: false,
  data_inserimento: new Date().toISOString().split("T")[0],
};

function PropertyForm({ property, onSave, onCancel }) {
  const [form, setForm] = useState(property || { ...EMPTY_PROPERTY });
  const [newFeature, setNewFeature] = useState("");
  const [newImage, setNewImage] = useState("");
  const [uploading, setUploading] = useState(false);

  const uploadToSupabase = async (files) => {
    setUploading(true);
    try {
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const path = `immobili/${fileName}`;
        const { error } = await supabase.storage.from("foto-immobili").upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) { console.error("Upload error:", error); continue; }
        const publicUrl = `${SUPABASE_STORAGE_URL}/${path}`;
        setForm(prev => ({ ...prev, immagini: [...prev.immagini, publicUrl] }));
      }
    } catch (err) { console.error("Upload failed:", err); }
    setUploading(false);
  };

  const update = (field, value) => setForm({ ...form, [field]: value });

  return (
    <div style={styles.adminCard}>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>{property ? "Modifica Immobile" : "Nuovo Immobile"}</h3>
      <div className="form-row-responsive" style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Codice</label>
          <input style={styles.formInput} value={form.codice} onChange={(e) => update("codice", e.target.value)} placeholder="SAI007" />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Titolo</label>
          <input style={styles.formInput} value={form.titolo} onChange={(e) => update("titolo", e.target.value)} placeholder="Trilocale luminoso..." />
        </div>
      </div>
      <div className="form-row-3col" style={{ ...styles.formRow, gridTemplateColumns: "1fr 1fr 1fr" }}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Tipo</label>
          <select style={styles.formSelect} value={form.tipo} onChange={(e) => update("tipo", e.target.value)}>
            {TIPO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Categoria</label>
          <select style={styles.formSelect} value={form.categoria} onChange={(e) => update("categoria", e.target.value)}>
            {CATEGORIA_OPTIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Prezzo ({form.tipo === "affitto" ? "EUR/mese" : "EUR"})</label>
          <input style={styles.formInput} type="number" value={form.prezzo} onChange={(e) => update("prezzo", Number(e.target.value))} />
        </div>
      </div>
      <div className="form-row-4col" style={{ ...styles.formRow, gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Locali</label>
          <input style={styles.formInput} type="number" value={form.locali} onChange={(e) => update("locali", Number(e.target.value))} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Camere</label>
          <input style={styles.formInput} type="number" value={form.camere} onChange={(e) => update("camere", Number(e.target.value))} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Bagni</label>
          <input style={styles.formInput} type="number" value={form.bagni} onChange={(e) => update("bagni", Number(e.target.value))} />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Superficie (mq)</label>
          <input style={styles.formInput} type="number" value={form.mq} onChange={(e) => update("mq", Number(e.target.value))} />
        </div>
      </div>
      <div className="form-row-responsive" style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Citta'</label>
          <select style={styles.formSelect} value={form.citta} onChange={(e) => update("citta", e.target.value)}>
            {CITTA_OPTIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Zona</label>
          <input style={styles.formInput} value={form.zona} onChange={(e) => update("zona", e.target.value)} placeholder="Navigli, Brera, Centro..." />
        </div>
      </div>
      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Indirizzo</label>
        <input style={styles.formInput} value={form.indirizzo} onChange={(e) => update("indirizzo", e.target.value)} placeholder="Via Roma, 15" />
      </div>
      <div className="form-row-4col" style={{ ...styles.formRow, gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Piano</label>
          <input style={styles.formInput} value={form.piano} onChange={(e) => update("piano", e.target.value)} placeholder="3" />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Anno</label>
          <input style={styles.formInput} type="number" value={form.anno} onChange={(e) => update("anno", Number(e.target.value))} placeholder="2000" />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Classe Energetica</label>
          <select style={styles.formSelect} value={form.classe_energetica} onChange={(e) => update("classe_energetica", e.target.value)}>
            {["A4", "A3", "A2", "A1", "A", "B", "C", "D", "E", "F", "G"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Riscaldamento</label>
          <select style={styles.formSelect} value={form.riscaldamento} onChange={(e) => update("riscaldamento", e.target.value)}>
            {["Autonomo", "Centralizzato", "A pavimento", "Assente"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Stato Immobile</label>
        <select style={styles.formSelect} value={form.stato} onChange={(e) => update("stato", e.target.value)}>
          {["Nuovo", "Ottimo", "Ristrutturato", "Buono", "Da ristrutturare"].map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Descrizione</label>
        <textarea style={{ ...styles.formTextarea, minHeight: 150 }} value={form.descrizione} onChange={(e) => update("descrizione", e.target.value)} placeholder="Descrivi l'immobile nel dettaglio..." />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Caratteristiche</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
          {form.caratteristiche.map((f, i) => (
            <span key={i} style={{ ...styles.detailFeature, display: "flex", alignItems: "center", gap: 6 }}>
              {f}
              <button style={{ background: "none", border: "none", cursor: "pointer", color: colors.danger, fontSize: 16, padding: 0, lineHeight: 1 }} onClick={() => update("caratteristiche", form.caratteristiche.filter((_, j) => j !== i))}>x</button>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input style={{ ...styles.formInput, flex: 1 }} value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="Aggiungi caratteristica" onKeyDown={(e) => { if (e.key === "Enter" && newFeature.trim()) { update("caratteristiche", [...form.caratteristiche, newFeature.trim()]); setNewFeature(""); } }} />
          <button style={styles.formBtnSecondary} onClick={() => { if (newFeature.trim()) { update("caratteristiche", [...form.caratteristiche, newFeature.trim()]); setNewFeature(""); } }}>Aggiungi</button>
        </div>
      </div>
      <div style={styles.formGroup}>
        <label style={styles.formLabel}>Immagini</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {form.immagini.map((img, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img src={img} alt="" style={{ width: 100, height: 75, objectFit: "cover", borderRadius: 6 }} />
              <button style={{ position: "absolute", top: -4, right: -4, background: colors.danger, color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => update("immagini", form.immagini.filter((_, j) => j !== i))}>x</button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
          <label style={{ background: uploading ? colors.textLight : colors.accent, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: uploading ? "wait" : "pointer", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "inherit", opacity: uploading ? 0.7 : 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            {uploading ? "Caricamento..." : "Carica foto"}
            <input type="file" accept="image/*" multiple disabled={uploading} onChange={(e) => {
              const files = Array.from(e.target.files);
              if (!files.length) return;
              uploadToSupabase(files);
              e.target.value = "";
            }} style={{ display: "none" }} />
          </label>
          <span style={{ fontSize: 13, color: colors.textLight }}>oppure</span>
          <div style={{ display: "flex", gap: 8, flex: 1, minWidth: 200 }}>
            <input style={{ ...styles.formInput, flex: 1 }} value={newImage} onChange={(e) => setNewImage(e.target.value)} placeholder="Incolla URL immagine..." />
            <button style={styles.formBtnSecondary} onClick={() => { if (newImage.trim()) { update("immagini", [...form.immagini, newImage.trim()]); setNewImage(""); } }}>Aggiungi</button>
          </div>
        </div>
        <div style={{ fontSize: 12, color: colors.textLight }}>
          Le foto vengono caricate in cloud. Puoi selezionare piu' foto alla volta. Formati: JPG, PNG, WebP.
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8, marginBottom: 24 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
          <input type="checkbox" checked={form.evidenza} onChange={(e) => update("evidenza", e.target.checked)} />
          In evidenza sulla homepage
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
          <input type="checkbox" checked={form.pubblicato} onChange={(e) => update("pubblicato", e.target.checked)} />
          Pubblicato (visibile sul sito)
        </label>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button style={styles.formBtn} onClick={() => onSave(form)}>Salva Immobile</button>
        <button style={styles.formBtnSecondary} onClick={onCancel}>Annulla</button>
      </div>
    </div>
  );
}

function AdminImmobili({ properties, setProperties }) {
  const [editing, setEditing] = useState(null); // null | "new" | property object
  const [search, setSearch] = useState("");

  const filteredProperties = properties.filter(
    (p) => p.titolo.toLowerCase().includes(search.toLowerCase()) || p.codice.toLowerCase().includes(search.toLowerCase()) || p.citta.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (form) => {
    if (editing === "new") {
      setProperties([...properties, { ...form, id: Date.now() }]);
    } else {
      setProperties(properties.map((p) => (p.id === form.id ? form : p)));
    }
    setEditing(null);
  };

  const handleDelete = (id) => {
    if (confirm("Sei sicuro di voler eliminare questo immobile?")) {
      setProperties(properties.filter((p) => p.id !== id));
    }
  };

  if (editing) {
    return <PropertyForm property={editing === "new" ? null : editing} onSave={handleSave} onCancel={() => setEditing(null)} />;
  }

  return (
    <div>
      <div style={styles.adminHeader}>
        <h2 style={styles.adminTitle}>Gestione Immobili</h2>
        <button style={{ ...styles.formBtn, display: "flex", alignItems: "center", gap: 8 }} onClick={() => setEditing("new")}>
          <IconPlus /> Nuovo Immobile
        </button>
      </div>
      <div style={{ ...styles.adminCard, padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <IconSearch />
          <input style={{ ...styles.formInput, border: "none", fontSize: 15 }} placeholder="Cerca per titolo, codice o citta'..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div style={styles.adminCard}>
        <table className="admin-table-responsive" style={styles.adminTable}>
          <thead>
            <tr>
              <th style={styles.adminTh}>Foto</th>
              <th style={styles.adminTh}>Codice</th>
              <th style={styles.adminTh}>Titolo</th>
              <th style={styles.adminTh}>Tipo</th>
              <th style={styles.adminTh}>Citta'</th>
              <th style={styles.adminTh}>Prezzo</th>
              <th style={styles.adminTh}>Stato</th>
              <th style={styles.adminTh}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredProperties.map((p) => (
              <tr key={p.id}>
                <td style={styles.adminTd}>
                  {p.immagini?.[0] ? <img src={p.immagini[0]} alt="" style={{ width: 60, height: 45, objectFit: "cover", borderRadius: 4 }} /> : <div style={{ width: 60, height: 45, background: colors.border, borderRadius: 4 }} />}
                </td>
                <td style={{ ...styles.adminTd, fontWeight: 600 }}>{p.codice}</td>
                <td style={styles.adminTd}>{p.titolo}</td>
                <td style={styles.adminTd}>
                  <span style={{ ...styles.cardBadge, ...(p.tipo === "vendita" ? styles.cardBadgeVendita : styles.cardBadgeAffitto) }}>{p.tipo}</span>
                </td>
                <td style={styles.adminTd}>{p.citta}</td>
                <td style={styles.adminTd}>{formatPrice(p.prezzo, p.tipo)}</td>
                <td style={styles.adminTd}>
                  <span style={{ ...styles.cardBadge, background: p.pubblicato ? "#e8f5e9" : "#fff3e0", color: p.pubblicato ? "#2e7d32" : "#e65100" }}>
                    {p.pubblicato ? "Online" : "Bozza"}
                  </span>
                </td>
                <td style={styles.adminTd}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={{ ...styles.adminBtnSmall, background: "#e3f2fd", color: "#1565c0" }} onClick={() => setEditing(p)}>
                      <IconEdit /> Modifica
                    </button>
                    <button style={{ ...styles.adminBtnSmall, background: "#fef2f2", color: colors.danger }} onClick={() => handleDelete(p.id)}>
                      <IconTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProperties.length === 0 && (
          <div style={{ textAlign: "center", padding: 48, color: colors.textLight }}>
            Nessun immobile trovato.
          </div>
        )}
      </div>
    </div>
  );
}

function AdminUtenti({ users, setUsers }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nome: "", email: "", ruolo: "agente", password: "" });

  const handleSave = () => {
    if (!form.nome || !form.email || !form.password) return;
    if (editing) {
      setUsers(users.map((u) => (u.id === editing.id ? { ...form, id: editing.id } : u)));
    } else {
      setUsers([...users, { ...form, id: Date.now() }]);
    }
    setEditing(null);
    setForm({ nome: "", email: "", ruolo: "agente", password: "" });
  };

  return (
    <div>
      <h2 style={styles.adminTitle}>Gestione Utenti</h2>
      <div style={styles.adminCard}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{editing ? "Modifica Utente" : "Aggiungi Utente"}</h3>
        <div className="form-row-responsive" style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Nome</label>
            <input style={styles.formInput} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Email</label>
            <input style={styles.formInput} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>
        <div className="form-row-responsive" style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Ruolo</label>
            <select style={styles.formSelect} value={form.ruolo} onChange={(e) => setForm({ ...form, ruolo: e.target.value })}>
              <option value="admin">Amministratore</option>
              <option value="agente">Agente</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Password</label>
            <input style={styles.formInput} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={styles.formBtn} onClick={handleSave}>{editing ? "Aggiorna" : "Aggiungi"}</button>
          {editing && <button style={styles.formBtnSecondary} onClick={() => { setEditing(null); setForm({ nome: "", email: "", ruolo: "agente", password: "" }); }}>Annulla</button>}
        </div>
      </div>
      <div style={styles.adminCard}>
        <table className="admin-table-responsive" style={styles.adminTable}>
          <thead>
            <tr>
              <th style={styles.adminTh}>Nome</th>
              <th style={styles.adminTh}>Email</th>
              <th style={styles.adminTh}>Ruolo</th>
              <th style={styles.adminTh}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={styles.adminTd}>{u.nome}</td>
                <td style={styles.adminTd}>{u.email}</td>
                <td style={styles.adminTd}>
                  <span style={{ ...styles.cardBadge, background: u.ruolo === "admin" ? "#f3e8ff" : "#e8f5e9", color: u.ruolo === "admin" ? "#7c3aed" : "#2e7d32" }}>
                    {u.ruolo === "admin" ? "Amministratore" : "Agente"}
                  </span>
                </td>
                <td style={styles.adminTd}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={{ ...styles.adminBtnSmall, background: "#e3f2fd", color: "#1565c0" }} onClick={() => { setEditing(u); setForm(u); }}>
                      <IconEdit /> Modifica
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminPanel({ properties, setProperties, users, setUsers, currentUser, setCurrentUser, setPage, heroImage, setHeroImage }) {
  const [adminPage, setAdminPage] = useState("dashboard");
  return (
    <div className="admin-layout-responsive" style={styles.adminLayout}>
      <AdminSidebar adminPage={adminPage} setAdminPage={setAdminPage} currentUser={currentUser} setPage={setPage} setCurrentUser={setCurrentUser} />
      <div className="admin-main-responsive" style={styles.adminMain}>
        {adminPage === "dashboard" && <AdminDashboard properties={properties} heroImage={heroImage} setHeroImage={setHeroImage} />}
        {adminPage === "immobili" && <AdminImmobili properties={properties} setProperties={setProperties} />}
        {adminPage === "utenti" && <AdminUtenti users={users} setUsers={setUsers} />}
      </div>
    </div>
  );
}

// ============================================================
// GDPR - Cookie Banner + Privacy Policy
// ============================================================

function CookieBanner() {
  const [visible, setVisible] = useState(() => {
    try { return !window.sessionStorage.getItem("cookie_consent"); } catch { return true; }
  });

  if (!visible) return null;

  const accept = () => {
    try { window.sessionStorage.setItem("cookie_consent", "accepted"); } catch {}
    setVisible(false);
  };

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: colors.primary, color: colors.white,
      padding: "16px 24px",
      boxShadow: "0 -4px 20px rgba(0,0,0,0.2)",
      display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 16,
    }}>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, flex: "1 1 400px", maxWidth: 700 }}>
        Questo sito utilizza cookie tecnici necessari al funzionamento. Non utilizziamo cookie di profilazione ne' di terze parti.
        Per maggiori informazioni consulta la nostra <a href="#" onClick={(e) => { e.preventDefault(); }} style={{ color: colors.accent, textDecoration: "underline" }}>Privacy Policy</a>.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={accept} style={{ background: colors.accent, color: colors.primary, border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Ho capito
        </button>
      </div>
    </div>
  );
}

function PrivacyPolicyPage() {
  return (
    <div style={{ ...styles.section, maxWidth: 800 }}>
      <h2 className="section-title-responsive" style={styles.sectionTitle}>Informativa sulla Privacy</h2>
      <div style={styles.sectionAccent} />
      <div style={{ fontSize: 15, lineHeight: 1.8, color: colors.text }}>
        <p><strong>Titolare del trattamento</strong><br />
        {AZIENDA.nome}, con sede in {AZIENDA.indirizzo}, {AZIENDA.cap} {AZIENDA.citta} ({AZIENDA.provincia}), P.IVA {AZIENDA.piva}.<br />
        Email di contatto: {AZIENDA.email}</p>

        <p><strong>Dati raccolti</strong><br />
        Attraverso i moduli presenti sul sito raccogliamo esclusivamente i dati forniti volontariamente dall'utente: nome e cognome, indirizzo email, numero di telefono e il contenuto del messaggio inviato. Non raccogliamo dati in modo automatico, ad eccezione di informazioni tecniche anonime necessarie al funzionamento del sito (log del server).</p>

        <p><strong>Finalita' del trattamento</strong><br />
        I dati personali forniti tramite i moduli di contatto e di richiesta valutazione vengono utilizzati esclusivamente per rispondere alle richieste dell'utente e per fornire il servizio richiesto. Non utilizziamo i dati per attivita' di marketing automatizzato ne' li cediamo a terzi.</p>

        <p><strong>Base giuridica</strong><br />
        Il trattamento si fonda sul consenso dell'interessato, espresso al momento della compilazione e dell'invio del modulo, e sull'esecuzione di misure precontrattuali adottate su richiesta dell'interessato (Art. 6, comma 1, lett. a e b del GDPR).</p>

        <p><strong>Conservazione dei dati</strong><br />
        I dati vengono conservati per il tempo strettamente necessario a evadere la richiesta e, successivamente, per un periodo massimo di 24 mesi, salvo obblighi di legge che ne richiedano una conservazione piu' lunga.</p>

        <p><strong>Diritti dell'interessato</strong><br />
        In conformita' al Regolamento UE 2016/679 (GDPR), l'utente ha diritto di accesso, rettifica, cancellazione, limitazione e portabilita' dei propri dati, nonche' il diritto di opposizione al trattamento. Per esercitare tali diritti e' possibile contattarci all'indirizzo {AZIENDA.email}.</p>

        <p><strong>Cookie</strong><br />
        Questo sito utilizza esclusivamente cookie tecnici necessari al corretto funzionamento. Non vengono utilizzati cookie di profilazione ne' cookie di terze parti per finalita' pubblicitarie.</p>

        <p><strong>Modifiche alla presente informativa</strong><br />
        Il Titolare si riserva il diritto di apportare modifiche alla presente informativa in qualsiasi momento. La versione aggiornata sara' sempre disponibile su questa pagina.</p>

        <p style={{ fontSize: 13, color: colors.textLight, marginTop: 32 }}>Ultimo aggiornamento: Marzo 2026</p>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================

// Hook per rilevare mobile
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < breakpoint : false);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
}

export default function App() {
  const [page, setPage] = useState({ name: "home" });
  const [properties, setProperties] = useState(INITIAL_PROPERTIES);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [filters, setFilters] = useState({ tipo: "", categoria: "", citta: "" });
  const [heroImage, setHeroImage] = useState("");
  const isMobile = useIsMobile();

  // Scroll to top on page change
  useEffect(() => { window.scrollTo(0, 0); }, [page]);
  // Close mobile menu on page change
  useEffect(() => { setShowMobileMenu(false); }, [page]);

  // Admin pages
  if (page.name === "admin-login") {
    return <AdminLogin setPage={setPage} users={users} setCurrentUser={setCurrentUser} />;
  }
  if (page.name === "admin-dashboard" || page.name === "admin-immobili" || page.name === "admin-utenti") {
    if (!currentUser) return <AdminLogin setPage={setPage} users={users} setCurrentUser={setCurrentUser} />;
    return <AdminPanel properties={properties} setProperties={setProperties} users={users} setUsers={setUsers} currentUser={currentUser} setCurrentUser={setCurrentUser} setPage={setPage} heroImage={heroImage} setHeroImage={setHeroImage} />;
  }

  // Property detail
  if (page.name === "dettaglio") {
    const prop = properties.find((p) => p.id === page.id);
    if (!prop) return <div style={styles.section}><p>Immobile non trovato.</p></div>;
    return (
      <div style={styles.page}>
        <Navbar page={page} setPage={setPage} showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu} isMobile={isMobile} />
        {showMobileMenu && <MobileMenu page={page} setPage={setPage} onClose={() => setShowMobileMenu(false)} />}
        <PropertyDetail property={prop} setPage={setPage} isMobile={isMobile} />
        <Footer setPage={setPage} isMobile={isMobile} />
      </div>
    );
  }

  // Public pages
  const renderPage = () => {
    switch (page.name) {
      case "home":
        return <HomePage properties={properties} setPage={setPage} filters={filters} setFilters={setFilters} isMobile={isMobile} heroImage={heroImage} />;
      case "vendite":
        return <ListingsPage properties={properties} tipo="vendita" setPage={setPage} isMobile={isMobile} />;
      case "affitti":
        return <ListingsPage properties={properties} tipo="affitto" setPage={setPage} isMobile={isMobile} />;
      case "chi-siamo":
        return <ChiSiamoPage isMobile={isMobile} setPage={setPage} />;
      case "valutazione":
        return <ValutazionePage isMobile={isMobile} />;
      case "contatti":
        return <ContattiPage isMobile={isMobile} />;
      case "privacy":
        return <PrivacyPolicyPage />;
      default:
        return <HomePage properties={properties} setPage={setPage} filters={filters} setFilters={setFilters} isMobile={isMobile} heroImage={heroImage} />;
    }
  };

  return (
    <div style={styles.page}>
      {/* CSS responsive globale */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; overflow-x: hidden; font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif; }
        @media (min-width: 769px) {
          .form-row-responsive { grid-template-columns: 1fr 1fr !important; }
          .form-row-3col { grid-template-columns: 1fr 1fr 1fr !important; }
          .form-row-4col { grid-template-columns: 1fr 1fr 1fr 1fr !important; }
        }
        @media (max-width: 768px) {
          .card-grid-responsive { grid-template-columns: 1fr !important; }
          .footer-grid-responsive { grid-template-columns: 1fr !important; }
          .detail-info-responsive { grid-template-columns: 1fr !important; }
          .search-row-responsive { flex-direction: column !important; align-items: stretch !important; }
          .search-row-responsive > * { width: 100% !important; flex: none !important; }
          .stat-grid-responsive { grid-template-columns: 1fr 1fr !important; }
          .form-row-responsive { grid-template-columns: 1fr !important; }
          .form-row-3col { grid-template-columns: 1fr !important; }
          .form-row-4col { grid-template-columns: 1fr 1fr !important; }
          .admin-layout-responsive { flex-direction: column !important; }
          .admin-sidebar-responsive { width: 100% !important; padding: 12px 0 !important; }
          .admin-sidebar-responsive > * { display: inline-block; }
          .admin-sidebar-links { display: flex !important; flex-wrap: wrap !important; gap: 4px !important; padding: 0 8px !important; }
          .admin-sidebar-links button { padding: 8px 12px !important; font-size: 13px !important; }
          .admin-main-responsive { padding: 16px !important; }
          .admin-table-responsive { display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .search-bar-responsive { margin-left: 12px !important; margin-right: 12px !important; padding: 16px !important; margin-top: -20px !important; }
          .search-btn-responsive { width: 100% !important; justify-content: center !important; padding: 12px !important; }
          .contact-grid-responsive { grid-template-columns: 1fr !important; gap: 24px !important; }
          .detail-title-responsive { font-size: 22px !important; }
          .detail-price-responsive { font-size: 24px !important; }
          .cta-title-responsive { font-size: 20px !important; }
          .section-title-responsive { font-size: 22px !important; }
        }
      `}</style>
      <Navbar page={page} setPage={setPage} showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu} isMobile={isMobile} />
      {showMobileMenu && <MobileMenu page={page} setPage={setPage} onClose={() => setShowMobileMenu(false)} />}
      {renderPage()}
      <Footer setPage={setPage} isMobile={isMobile} />
      <CookieBanner />
    </div>
  );
}
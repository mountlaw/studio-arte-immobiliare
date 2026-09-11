import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { AZIENDA, SITE_URL } from "@/lib/config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Studio Arte Immobiliare | Agenzia Immobiliare Milano e Como",
    template: "%s | Studio Arte Immobiliare",
  },
  description:
    "Agenzia immobiliare tra Milano, Como e la Brianza. Vendita, acquisto e affitto di appartamenti, ville e immobili di pregio. Valutazioni gratuite e consulenza personalizzata.",
  applicationName: AZIENDA.nome,
  openGraph: {
    type: "website",
    siteName: AZIENDA.nome,
    locale: "it_IT",
    url: SITE_URL,
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: AZIENDA.nome }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1b2a4a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" data-scroll-behavior="smooth" className={`${inter.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

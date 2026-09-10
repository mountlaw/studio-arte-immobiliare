import type { Metadata } from "next";
import Listings from "@/components/site/Listings";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Immobili in affitto a Milano, Como e Brianza",
  description: "Appartamenti e case in affitto selezionati da Studio Arte Immobiliare tra Milano, Como e la Brianza. Foto reali e descrizioni complete.",
  alternates: { canonical: "/affitto" },
};

export default async function AffittoPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  return <Listings tipo="affitto" searchParams={sp} />;
}

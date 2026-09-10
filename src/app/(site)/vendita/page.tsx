import type { Metadata } from "next";
import Listings from "@/components/site/Listings";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Immobili in vendita a Milano, Como e Brianza",
  description: "Appartamenti, ville, attici e rustici in vendita selezionati da Studio Arte Immobiliare tra Milano, Como e la Brianza.",
  alternates: { canonical: "/vendita" },
};

export default async function VenditaPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  return <Listings tipo="vendita" searchParams={sp} />;
}

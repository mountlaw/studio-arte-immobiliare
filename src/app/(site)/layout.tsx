import Footer from "@/components/site/Footer";
import Header from "@/components/site/Header";
import CookieBanner from "@/components/site/CookieBanner";
import { getImpostazioni } from "@/lib/data/impostazioni";

export const revalidate = 300;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const impostazioni = await getImpostazioni();
  return (
    <>
      <Header />
      <main className="flex-1 pt-[72px]">{children}</main>
      <Footer impostazioni={impostazioni} />
      <CookieBanner />
    </>
  );
}

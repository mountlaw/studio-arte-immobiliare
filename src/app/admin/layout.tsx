import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Area riservata", template: "%s · Area riservata" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f3f1ec] text-ink">{children}</div>;
}

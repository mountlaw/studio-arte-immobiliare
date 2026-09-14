"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoMark, Wordmark } from "./Logo";
import { IconMenu, IconPhone, IconX } from "@/components/ui/Icons";
import { AZIENDA } from "@/lib/config";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/vendita", label: "Vendita" },
  { href: "/affitto", label: "Affitto" },
  { href: "/chi-siamo", label: "Chi siamo" },
  { href: "/contatti", label: "Contatti" },
];

export default function Header() {
  const pathname = usePathname();
  const transparent = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [openedAt, setOpenedAt] = useState(pathname);
  // Chiude il menu mobile al cambio pagina (senza setState dentro un effect).
  if (open && openedAt !== pathname) {
    setOpen(false);
    setOpenedAt(pathname);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = !transparent || scrolled || open;
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          solid
            ? "bg-white/90 shadow-[0_1px_0_rgba(27,42,74,0.08)] backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="container-site flex h-[72px] items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Studio Arte Immobiliare - Home"
          >
            <LogoMark size={44} className={solid ? "" : "drop-shadow-lg"} />
            <Wordmark light={!solid} />
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Principale"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-[14px] font-medium transition ${
                  solid
                    ? isActive(item.href)
                      ? "bg-navy/8 text-navy"
                      : "text-ink/75 hover:bg-navy/5 hover:text-navy"
                    : isActive(item.href)
                      ? "bg-white/15 text-white"
                      : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/valuta-casa"
              className={`${solid ? "btn-primary" : "btn-gold"} btn btn-sm ml-2`}
            >
              Valuta casa
            </Link>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <a
              href={`tel:${AZIENDA.telefonoE164}`}
              className={`flex h-10 w-10 items-center justify-center rounded-full ${solid ? "bg-navy/5 text-navy" : "bg-white/15 text-white"}`}
              aria-label="Chiama"
            >
              <IconPhone size={18} />
            </a>
            <button
              type="button"
              onClick={() => {
                setOpenedAt(pathname);
                setOpen((v) => !v);
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-full ${solid ? "bg-navy/5 text-navy" : "bg-white/15 text-white"}`}
              aria-label={open ? "Chiudi menu" : "Apri menu"}
              aria-expanded={open}
            >
              {open ? <IconX size={22} /> : <IconMenu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile: fuori dall'header (il backdrop-filter dell'header romperebbe il position: fixed) */}
      <div
        className={`md:hidden ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"} fixed inset-0 top-[72px] z-40 bg-navy transition-opacity duration-200`}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col justify-between overflow-y-auto px-6 pb-10 pt-6">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {[...NAV, { href: "/valuta-casa", label: "Valuta casa" }].map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-4 py-3.5 font-display text-2xl font-semibold ${isActive(item.href) ? "bg-white/10 text-gold" : "text-white"}`}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
          <div className="space-y-3 text-white/70">
            <a
              href={`tel:${AZIENDA.telefonoE164}`}
              className="flex items-center gap-3 text-lg text-gold"
            >
              <IconPhone size={18} /> +39 {AZIENDA.telefonoDisplay}
            </a>
            <p className="text-sm">
              {AZIENDA.indirizzo}, {AZIENDA.cap} {AZIENDA.citta} (
              {AZIENDA.provincia})
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

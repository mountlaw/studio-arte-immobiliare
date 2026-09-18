"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/admin/actions";
import { LogoMark } from "@/components/site/Logo";
import { IconBuilding, IconExternal, IconGlobe, IconGrid, IconInbox, IconLogOut, IconMenu, IconSettings, IconStar, IconUsers, IconX } from "@/components/ui/Icons";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: IconGrid, exact: true },
  { href: "/admin/immobili", label: "Immobili", Icon: IconBuilding },
  { href: "/admin/richieste", label: "Richieste", Icon: IconInbox, badge: true },
  { href: "/admin/recensioni", label: "Recensioni", Icon: IconStar },
  { href: "/admin/portali", label: "Portali", Icon: IconGlobe },
  { href: "/admin/impostazioni", label: "Impostazioni", Icon: IconSettings },
  { href: "/admin/utenti", label: "Utenti", Icon: IconUsers },
];

export default function AdminShell({ children, email, richiesteNonLette }: { children: React.ReactNode; email: string; richiesteNonLette: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  // Chiude il menu mobile quando si cambia pagina (senza setState dentro un effect).
  if (open && openedAt !== pathname) {
    setOpen(false);
    setOpenedAt(pathname);
  }

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ href, label, Icon, exact, badge }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-medium transition ${
            isActive(href, exact) ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/8 hover:text-white"
          }`}
        >
          <Icon size={18} />
          <span className="flex-1">{label}</span>
          {badge && richiesteNonLette > 0 && (
            <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-navy-deep">{richiesteNonLette}</span>
          )}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col bg-navy-deep p-5 text-white lg:flex">
        <Link href="/admin" className="flex items-center gap-3 px-1">
          <LogoMark size={40} />
          <div className="leading-none">
            <div className="font-display text-xl font-bold tracking-[0.16em] text-gold">ARTE</div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/50">Gestione</div>
          </div>
        </Link>
        <div className="mt-8 flex-1">{nav}</div>
        <div className="mt-6 space-y-2 border-t border-white/10 pt-5">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-[13px] text-white/65 hover:text-white">
            <IconExternal size={16} /> Vedi il sito
          </Link>
          <form action={logout}>
            <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-[13px] text-white/65 hover:text-white">
              <IconLogOut size={16} /> Esci
            </button>
          </form>
          <Link href="/admin/password" className="block truncate px-3.5 pt-2 text-[11px] text-white/40 hover:text-white/80" title={`${email} · cambia password`}>
            {email} · cambia password
          </Link>
        </div>
      </aside>

      {/* Contenuto */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <LogoMark size={32} />
            <span className="font-display text-lg font-bold tracking-[0.12em] text-navy">ARTE</span>
          </Link>
          <button type="button" onClick={() => {
              setOpenedAt(pathname);
              setOpen((v) => !v);
            }} className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/5 text-navy" aria-label="Menu">
            {open ? <IconX size={20} /> : <IconMenu size={20} />}
          </button>
        </header>
        {open && (
          <div className="fixed inset-0 top-14 z-20 bg-navy-deep p-5 text-white lg:hidden">
            {nav}
            <div className="mt-6 space-y-2 border-t border-white/10 pt-5">
              <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-[13px] text-white/65">
                <IconExternal size={16} /> Vedi il sito
              </Link>
              <form action={logout}>
                <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-[13px] text-white/65">
                  <IconLogOut size={16} /> Esci
                </button>
              </form>
            </div>
          </div>
        )}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

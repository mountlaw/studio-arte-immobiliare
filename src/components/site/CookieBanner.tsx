"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // Rimanda al frame successivo: evita il setState sincrono nell'effect e il flash in SSR.
    const id = window.requestAnimationFrame(() => {
      try {
        if (!window.localStorage.getItem("sai_cookie_ok")) setVisible(true);
      } catch {
        setVisible(true);
      }
    });
    return () => window.cancelAnimationFrame(id);
  }, []);
  if (!visible) return null;
  const accept = () => {
    try {
      window.localStorage.setItem("sai_cookie_ok", "1");
    } catch {}
    setVisible(false);
  };
  return (
    <div className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-2xl rounded-2xl bg-navy-deep p-4 text-white shadow-pop sm:flex sm:items-center sm:gap-4 sm:p-5">
      <p className="text-[13.5px] leading-relaxed text-white/85">
        Questo sito usa solo cookie tecnici necessari al funzionamento, nessuna profilazione.{" "}
        <Link href="/privacy" className="text-gold underline underline-offset-2">
          Privacy &amp; cookie
        </Link>
      </p>
      <button type="button" onClick={accept} className="btn btn-gold btn-sm mt-3 w-full sm:mt-0 sm:w-auto">
        Ho capito
      </button>
    </div>
  );
}

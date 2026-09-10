"use client";

import { useState } from "react";
import { IconCheck, IconCopy, IconMail, IconShare, IconWhatsapp } from "@/components/ui/Icons";

/** Condivisione del singolo annuncio: WhatsApp, email, copia link, condivisione nativa. */
export default function ShareBar({ url, title, text }: { url: string; title: string; text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copia il link:", url);
    }
  };

  const native = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        /* annullato */
      }
    }
    copy();
  };

  const wa = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
  const mail = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[12px] font-semibold uppercase tracking-wider text-muted">Condividi</span>
      <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" aria-label="Condividi su WhatsApp">
        <IconWhatsapp size={16} className="text-[#25D366]" /> WhatsApp
      </a>
      <a href={mail} className="btn btn-outline btn-sm" aria-label="Condividi via email">
        <IconMail size={16} /> Email
      </a>
      <button type="button" onClick={copy} className="btn btn-outline btn-sm" aria-label="Copia link">
        {copied ? <IconCheck size={16} className="text-green-600" /> : <IconCopy size={16} />} {copied ? "Copiato!" : "Copia link"}
      </button>
      <button type="button" onClick={native} className="btn btn-ghost btn-sm sm:hidden" aria-label="Altre opzioni di condivisione">
        <IconShare size={16} /> Altro
      </button>
    </div>
  );
}

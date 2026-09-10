"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconCamera, IconChevronLeft, IconChevronRight, IconExpand, IconX } from "@/components/ui/Icons";

/**
 * Galleria foto dell'immobile.
 * - Riquadro principale a proporzione fissa (16:10): le foto verticali o con
 *   proporzioni diverse restano intere, con la stessa foto sfocata sullo sfondo.
 * - Miniature scorrevoli, frecce, tastiera e swipe su mobile.
 * - Lightbox a schermo intero.
 */
export default function Gallery({ images, title, nonDisponibile = false }: { images: string[]; title: string; nonDisponibile?: boolean }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const touchStart = useRef<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const count = images.length;

  const go = useCallback(
    (delta: number) => {
      if (!count) return;
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const el = thumbsRef.current?.children[index] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchStart.current = null;
  };

  if (!count) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl bg-sand text-muted">
        <IconCamera size={40} />
      </div>
    );
  }

  const current = images[index];

  return (
    <div>
      <div
        className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-navy-deep shadow-card"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Sfondo sfocato: riempie il riquadro anche con foto verticali */}
        <Image src={current} alt="" fill sizes="(max-width: 1024px) 100vw, 60vw" className="scale-110 object-cover opacity-60 blur-2xl" aria-hidden />
        <Image
          key={current}
          src={current}
          alt={`${title} - foto ${index + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          priority={index === 0}
          className={`object-contain ${nonDisponibile ? "saturate-[0.4]" : ""}`}
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Foto precedente"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-navy shadow transition hover:bg-white"
            >
              <IconChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Foto successiva"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-navy shadow transition hover:bg-white"
            >
              <IconChevronRight size={22} />
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur transition hover:bg-black/60"
          aria-label="Apri a schermo intero"
        >
          <IconExpand size={14} /> Schermo intero
        </button>
        <div className="absolute bottom-3 right-3 rounded-full bg-black/45 px-3 py-1 text-[12px] font-medium text-white backdrop-blur">
          {index + 1} / {count}
        </div>
      </div>

      {count > 1 && (
        <div ref={thumbsRef} className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIndex(i)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg transition ${
                i === index ? "ring-2 ring-gold ring-offset-2 ring-offset-cream" : "opacity-70 hover:opacity-100"
              }`}
              aria-label={`Vai alla foto ${i + 1}`}
            >
              <Image src={src} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black" role="dialog" aria-modal="true" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <div className="text-sm text-white/80">
              {index + 1} / {count}
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Chiudi" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
              <IconX size={22} />
            </button>
          </div>
          <div className="relative flex-1">
            <Image src={current} alt={`${title} - foto ${index + 1}`} fill sizes="100vw" className="object-contain" quality={85} />
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Foto precedente"
                  className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30"
                >
                  <IconChevronLeft size={26} />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Foto successiva"
                  className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30"
                >
                  <IconChevronRight size={26} />
                </button>
              </>
            )}
          </div>
          {count > 1 && (
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
              {images.map((src, i) => (
                <button key={src + i} type="button" onClick={() => setIndex(i)} className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md ${i === index ? "ring-2 ring-gold" : "opacity-60"}`}>
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

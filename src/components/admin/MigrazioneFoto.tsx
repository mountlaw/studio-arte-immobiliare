"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { copiaFotoVecchioProgetto } from "@/app/admin/actions";
import { IconCheck, IconRefresh } from "@/components/ui/Icons";

export default function MigrazioneFoto({ iniziali, errore }: { iniziali: number; errore?: string }) {
  const router = useRouter();
  const [rimaste, setRimaste] = useState(iniziali);
  const [copiate, setCopiate] = useState(0);
  const [errori, setErrori] = useState<string[]>(errore ? [errore] : []);
  const [running, setRunning] = useState(false);
  const stop = useRef(false);

  const avvia = async () => {
    setRunning(true);
    stop.current = false;
    let tot = 0;
    for (let giro = 0; giro < 200 && !stop.current; giro++) {
      const r = await copiaFotoVecchioProgetto(10);
      if (!r.ok) {
        setErrori((e) => [...e, r.error]);
        break;
      }
      tot += r.data!.copiate;
      setCopiate(tot);
      setRimaste(r.data!.rimaste);
      if (r.data!.errori.length) setErrori((e) => [...e, ...r.data!.errori]);
      if (r.data!.rimaste === 0 || r.data!.copiate === 0) break;
    }
    setRunning(false);
    router.refresh();
  };

  return (
    <div className="card max-w-2xl p-6">
      {rimaste === 0 && !running ? (
        <div className="flex items-center gap-3 text-green-800">
          <IconCheck size={20} /> Tutte le foto sono nel nuovo archivio. Non c&apos;è altro da fare.
        </div>
      ) : (
        <>
          <p className="text-[15px] text-ink">
            Foto ancora da copiare: <strong>{rimaste}</strong>
            {copiate > 0 && <> · copiate in questa sessione: <strong>{copiate}</strong></>}
          </p>
          <p className="mt-1 text-[13px] text-muted">Ci vogliono un paio di minuti. Lascia la pagina aperta finché non compare il segno di spunta.</p>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={avvia} disabled={running} className="btn btn-primary">
              <IconRefresh size={17} className={running ? "animate-spin" : ""} /> {running ? "Copia in corso…" : "Copia le foto"}
            </button>
            {running && (
              <button type="button" onClick={() => (stop.current = true)} className="btn btn-ghost">
                Ferma
              </button>
            )}
          </div>
        </>
      )}
      {errori.length > 0 && (
        <ul className="mt-4 space-y-1 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {errori.slice(-8).map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

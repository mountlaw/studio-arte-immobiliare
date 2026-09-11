"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { sincronizzaPortaliOra } from "@/app/admin/actions";
import { IconRefresh } from "@/components/ui/Icons";

export default function PortaliActions({ abilitato }: { abilitato: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [esito, setEsito] = useState("");
  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        disabled={pending || !abilitato}
        title={abilitato ? "Riallinea subito tutti gli annunci" : "Configura prima almeno un portale"}
        onClick={() =>
          startTransition(async () => {
            const r = await sincronizzaPortaliOra();
            setEsito(r.ok ? `Inviati ${r.data?.inviati ?? 0}, errori ${r.data?.errori ?? 0}. ${(r.data?.messaggi || []).slice(0, 3).join(" · ")}` : r.error);
            router.refresh();
          })
        }
        className="btn btn-primary"
      >
        <IconRefresh size={17} className={pending ? "animate-spin" : ""} /> {pending ? "Sincronizzazione…" : "Sincronizza ora"}
      </button>
      {esito && <p className="max-w-md text-right text-[12.5px] text-muted">{esito}</p>}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { aggiungiUtente, aggiornaUtente, rimuoviUtente } from "@/app/admin/actions";
import { Pill } from "./ui";
import { IconTrash } from "@/components/ui/Icons";
import type { UtenteAdmin } from "@/lib/types";

export default function UtentiManager({ utenti, mioEmail }: { utenti: UtenteAdmin[]; mioEmail: string }) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const [errore, setErrore] = useState("");

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, then?: () => void) =>
    startTransition(async () => {
      setErrore("");
      const r = await fn();
      if (!r.ok) return setErrore(r.error || "Errore");
      then?.();
      router.refresh();
    });

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(() => aggiungiUtente({ nome, email }), () => {
            setNome("");
            setEmail("");
          });
        }}
        className="card h-fit p-5 lg:col-span-2"
      >
        <h2 className="font-display text-2xl font-semibold text-navy">Autorizza una persona</h2>
        <p className="mt-1 text-[13px] text-muted">
          Aggiungi l&apos;email. La persona poi va su <strong>Area riservata → Primo accesso</strong>, sceglie la sua password e conferma l&apos;indirizzo dall&apos;email che riceve.
        </p>
        {errore && <div className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{errore}</div>}
        <div className="mt-4 space-y-3">
          <div>
            <label className="label">Nome</label>
            <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Cristina" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@esempio.it" />
          </div>
        </div>
        <button type="submit" disabled={pending} className="btn btn-primary mt-4">
          Aggiungi alla lista
        </button>
      </form>

      <div className="card divide-y divide-line lg:col-span-3">
        {utenti.map((u) => {
          const isMe = u.email.toLowerCase() === mioEmail.toLowerCase();
          return (
            <div key={u.id} className="flex items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-navy">{u.nome}</span>
                  {isMe && <Pill tone="gold">Tu</Pill>}
                  {!u.attivo && <Pill tone="amber">Disattivato</Pill>}
                </div>
                <div className="truncate text-[13px] text-muted">{u.email}</div>
              </div>
              <button type="button" disabled={pending || isMe} onClick={() => run(() => aggiornaUtente(u.id, { attivo: !u.attivo }))} className="btn btn-ghost btn-sm">
                {u.attivo ? "Disattiva" : "Riattiva"}
              </button>
              <button
                type="button"
                disabled={pending || isMe}
                onClick={() => confirm(`Rimuovere ${u.email} dagli utenti autorizzati?`) && run(() => rimuoviUtente(u.id))}
                className="flex h-9 w-9 items-center justify-center rounded-full text-red-600 hover:bg-red-50 disabled:opacity-30"
                title="Rimuovi"
              >
                <IconTrash size={16} />
              </button>
            </div>
          );
        })}
        {utenti.length === 0 && <div className="p-8 text-center text-muted">Nessun utente in lista.</div>}
      </div>
    </div>
  );
}

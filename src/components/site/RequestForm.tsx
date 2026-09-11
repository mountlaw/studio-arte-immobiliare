"use client";

import Link from "next/link";
import { useActionState } from "react";
import { inviaRichiesta, type RichiestaState } from "@/app/(site)/actions";
import { IconCheck } from "@/components/ui/Icons";
import { CATEGORIE } from "@/lib/config";

type Variant = "info" | "valutazione" | "contatto";

interface Props {
  tipo: Variant;
  hidden?: Record<string, string>;
  citta?: string[];
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  defaultMessage?: string;
  compact?: boolean;
}

export default function RequestForm({ tipo, hidden = {}, citta = [], title, subtitle, submitLabel, defaultMessage, compact = false }: Props) {
  const [state, action, pending] = useActionState<RichiestaState, FormData>(inviaRichiesta, null);

  if (state?.ok) {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
          <IconCheck size={26} />
        </div>
        <h3 className="mt-4 font-display text-2xl font-semibold text-navy">Richiesta inviata</h3>
        <p className="mt-2 text-[15px] text-muted">
          {tipo === "valutazione" ? "Ti ricontatteremo entro 24 ore per fissare il sopralluogo." : "Ti risponderemo il prima possibile. Grazie!"}
        </p>
      </div>
    );
  }

  return (
    <form action={action} className={`card relative ${compact ? "p-5 sm:p-6" : "p-6 sm:p-8"}`}>
      {title && <h3 className="font-display text-2xl font-semibold text-navy">{title}</h3>}
      {subtitle && <p className="mt-1 text-[14px] text-muted">{subtitle}</p>}
      <input type="hidden" name="tipo" value={tipo} />
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      {/* honeypot */}
      <div className="absolute -left-[9999px] top-0" aria-hidden>
        <label>
          Sito web <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state?.error && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>}

      <div className={`${title || subtitle ? "mt-5" : ""} grid gap-4 sm:grid-cols-2`}>
        <div>
          <label className="label" htmlFor={`${tipo}-nome`}>
            Nome e cognome *
          </label>
          <input id={`${tipo}-nome`} name="nome" required className="input" placeholder="Il tuo nome" autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor={`${tipo}-telefono`}>
            Telefono {tipo === "valutazione" ? "*" : ""}
          </label>
          <input id={`${tipo}-telefono`} name="telefono" className="input" placeholder="Il tuo numero" autoComplete="tel" inputMode="tel" required={tipo === "valutazione"} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor={`${tipo}-email`}>
            Email {tipo === "valutazione" ? "*" : ""}
          </label>
          <input id={`${tipo}-email`} name="email" type="email" className="input" placeholder="La tua email" autoComplete="email" required={tipo === "valutazione"} />
        </div>

        {tipo === "valutazione" && (
          <>
            <div>
              <label className="label" htmlFor="val-citta">
                Città
              </label>
              <input id="val-citta" name="citta" className="input" placeholder="Es. Milano" list="val-citta-list" />
              {citta.length > 0 && (
                <datalist id="val-citta-list">
                  {citta.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              )}
            </div>
            <div>
              <label className="label" htmlFor="val-tipologia">
                Tipologia
              </label>
              <select id="val-tipologia" name="tipologia" className="input" defaultValue="">
                <option value="">Seleziona</option>
                {CATEGORIE.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="val-indirizzo">
                Indirizzo dell&apos;immobile *
              </label>
              <input id="val-indirizzo" name="indirizzo" required className="input" placeholder="Via, numero civico, città" autoComplete="street-address" />
            </div>
            <div>
              <label className="label" htmlFor="val-mq">
                Superficie approssimativa (mq)
              </label>
              <input id="val-mq" name="mq" type="number" min={1} className="input" placeholder="Es. 80" inputMode="numeric" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="val-note">
                Note
              </label>
              <textarea id="val-note" name="note" className="input min-h-[90px]" placeholder="Stato dell'immobile, ristrutturazioni, particolarità..." />
            </div>
          </>
        )}

        {tipo !== "valutazione" && (
          <div className="sm:col-span-2">
            <label className="label" htmlFor={`${tipo}-messaggio`}>
              Messaggio {tipo === "contatto" ? "*" : ""}
            </label>
            <textarea
              id={`${tipo}-messaggio`}
              name="messaggio"
              className="input min-h-[110px]"
              placeholder={tipo === "info" ? "Vorrei ricevere informazioni o fissare una visita..." : "Come possiamo aiutarti?"}
              defaultValue={defaultMessage}
              required={tipo === "contatto"}
            />
          </div>
        )}

        <label className="flex items-start gap-3 text-[13px] text-muted sm:col-span-2">
          <input type="checkbox" name="privacy" required className="mt-0.5 h-4 w-4 rounded border-line accent-navy" />
          <span>
            Ho letto l&apos;
            <Link href="/privacy" className="text-navy underline underline-offset-2">
              informativa privacy
            </Link>{" "}
            e acconsento al trattamento dei dati per essere ricontattato. *
          </span>
        </label>
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary mt-5 w-full">
        {pending ? "Invio in corso…" : submitLabel || (tipo === "valutazione" ? "Richiedi la valutazione gratuita" : tipo === "info" ? "Richiedi informazioni" : "Invia messaggio")}
      </button>
    </form>
  );
}

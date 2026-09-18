"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

type Mode = "login" | "primo" | "reset";

const MESSAGGI: Record<string, string> = {
  link: "Il link non è più valido. Richiedi un nuovo link qui sotto.",
  confermato: "Indirizzo confermato! Ora accedi con la tua email e la password che hai scelto.",
  recovery: "Il link è stato aperto in un altro browser: richiedi di nuovo il link e aprilo dallo stesso dispositivo.",
  noadmin: "Questo account non è autorizzato. Chiedi a un amministratore di aggiungere la tua email.",
};
const INFO_KEYS = ["confermato"];

export default function LoginForm({ next, errore }: { next: string; errore?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(errore && !INFO_KEYS.includes(errore) ? MESSAGGI[errore] || "" : "");
  const [info, setInfo] = useState(errore && INFO_KEYS.includes(errore) ? MESSAGGI[errore] : "");

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setPending(true);
    const supabase = supabaseBrowser();
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          setError(error.message.includes("Invalid login") ? "Email o password non corretti." : error.message.includes("not confirmed") ? "Devi prima confermare l'indirizzo email: controlla la posta." : error.message);
          return;
        }
        router.replace(next.startsWith("/admin") ? next : "/admin");
        router.refresh();
      } else if (mode === "primo") {
        if (password.length < 8) {
          setError("La password deve avere almeno 8 caratteri.");
          return;
        }
        if (password !== password2) {
          setError("Le due password non coincidono.");
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${origin}/auth/callback?next=/admin` },
        });
        if (error) {
          setError(error.message.includes("already registered") ? "Esiste già un account con questa email: usa Accedi o Password dimenticata." : error.message);
          return;
        }
        if (data.session) {
          router.replace("/admin");
          router.refresh();
          return;
        }
        setInfo("Ti abbiamo inviato un'email (controlla anche lo spam): clicca il link per confermare l'indirizzo, poi torna qui e accedi con email e password.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${origin}/auth/callback?type=recovery&next=/admin/reset` });
        if (error) {
          setError(error.message);
          return;
        }
        setInfo("Se l'indirizzo è registrato riceverai un'email con il link per impostare una nuova password.");
        setMode("login");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="card p-7 sm:p-8">
      <h1 className="font-display text-3xl font-semibold text-navy">
        {mode === "login" ? "Area riservata" : mode === "primo" ? "Primo accesso" : "Recupera password"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {mode === "login"
          ? "Accedi per gestire annunci, richieste e impostazioni."
          : mode === "primo"
            ? "Crea la password per la tua email autorizzata."
            : "Ti inviamo un link per impostare una nuova password."}
      </p>

      {error && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {info && <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">{info}</div>}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="login-email">
            Email
          </label>
          <input id="login-email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@esempio.it" />
        </div>
        {mode !== "reset" && (
          <div>
            <label className="label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete={mode === "primo" ? "new-password" : "current-password"}
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "primo" ? "Almeno 8 caratteri" : "La tua password"}
            />
          </div>
        )}
        {mode === "primo" && (
          <div>
            <label className="label" htmlFor="login-password2">
              Ripeti password
            </label>
            <input id="login-password2" type="password" required autoComplete="new-password" className="input" value={password2} onChange={(e) => setPassword2(e.target.value)} />
          </div>
        )}
        <button type="submit" disabled={pending} className="btn btn-primary w-full">
          {pending ? "Attendi…" : mode === "login" ? "Accedi" : mode === "primo" ? "Crea la password" : "Invia il link"}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-2 text-center text-[13px] text-muted">
        {mode !== "login" && (
          <button type="button" className="text-navy underline underline-offset-2" onClick={() => setMode("login")}>
            Torna all&apos;accesso
          </button>
        )}
        {mode === "login" && (
          <>
            <button type="button" className="text-navy underline underline-offset-2" onClick={() => setMode("reset")}>
              Password dimenticata?
            </button>
            <button type="button" className="text-navy underline underline-offset-2" onClick={() => setMode("primo")}>
              Primo accesso: crea la password
            </button>
          </>
        )}
        <Link href="/" className="mt-2 hover:text-navy">
          ← Torna al sito
        </Link>
      </div>
    </div>
  );
}

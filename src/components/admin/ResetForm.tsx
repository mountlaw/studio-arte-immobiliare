"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ResetForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("La password deve avere almeno 8 caratteri.");
    if (password !== password2) return setError("Le due password non coincidono.");
    setPending(true);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (error) return setError(error.message.includes("session") ? "Sessione scaduta: richiedi di nuovo il link dalla pagina di accesso." : error.message);
    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="card p-7 sm:p-8">
      <h1 className="font-display text-3xl font-semibold text-navy">Nuova password</h1>
      <p className="mt-1 text-sm text-muted">Scegli la password per l&apos;area riservata.</p>
      {error && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="np1">
            Password
          </label>
          <input id="np1" type="password" required autoComplete="new-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="np2">
            Ripeti password
          </label>
          <input id="np2" type="password" required autoComplete="new-password" className="input" value={password2} onChange={(e) => setPassword2(e.target.value)} />
        </div>
        <button type="submit" disabled={pending} className="btn btn-primary w-full">
          {pending ? "Salvataggio…" : "Salva la password"}
        </button>
      </form>
    </div>
  );
}

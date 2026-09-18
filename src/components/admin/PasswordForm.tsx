"use client";

import { useState } from "react";
import { IconCheck } from "@/components/ui/Icons";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function PasswordForm() {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (password.length < 8) return setMsg({ ok: false, text: "La password deve avere almeno 8 caratteri." });
    if (password !== password2) return setMsg({ ok: false, text: "Le due password non coincidono." });
    setPending(true);
    const { error } = await supabaseBrowser().auth.updateUser({ password });
    setPending(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setPassword("");
    setPassword2("");
    setMsg({ ok: true, text: "Password aggiornata." });
  }

  return (
    <form onSubmit={submit} className="card max-w-md p-6">
      {msg && (
        <div className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${msg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
          {msg.ok && <IconCheck size={16} />} {msg.text}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="pw1">
            Nuova password
          </label>
          <input id="pw1" type="password" autoComplete="new-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Almeno 8 caratteri" required />
        </div>
        <div>
          <label className="label" htmlFor="pw2">
            Ripeti la nuova password
          </label>
          <input id="pw2" type="password" autoComplete="new-password" className="input" value={password2} onChange={(e) => setPassword2(e.target.value)} required />
        </div>
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary mt-5">
        {pending ? "Salvataggio…" : "Salva la nuova password"}
      </button>
    </form>
  );
}

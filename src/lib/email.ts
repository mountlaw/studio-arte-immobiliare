import { AZIENDA, SITE_URL } from "./config";

/**
 * Notifica email delle richieste dal sito tramite Resend.
 * Si attiva solo se RESEND_API_KEY e' impostata; altrimenti la richiesta
 * resta comunque salvata nell'area riservata (sezione Richieste).
 */
export async function inviaNotificaRichiesta(input: {
  tipo: string;
  nome: string;
  email?: string | null;
  telefono?: string | null;
  messaggio?: string | null;
  righe?: Array<[string, string]>;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, reason: "RESEND_API_KEY non impostata" };
  const to = (process.env.NOTIFY_EMAIL || AZIENDA.email).split(",").map((s) => s.trim()).filter(Boolean);
  const from = process.env.RESEND_FROM || `Studio Arte Immobiliare <onboarding@resend.dev>`;

  const titolo = { info: "Richiesta informazioni immobile", valutazione: "Richiesta di valutazione", contatto: "Nuovo messaggio dal sito" }[input.tipo] || "Richiesta dal sito";
  const righe = [
    ["Nome", input.nome],
    ["Email", input.email || "-"],
    ["Telefono", input.telefono || "-"],
    ...(input.righe || []),
  ];
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#1f2430;max-width:560px">
      <h2 style="color:#1b2a4a;margin:0 0 16px">${titolo}</h2>
      <table style="border-collapse:collapse;width:100%">
        ${righe.map(([k, v]) => `<tr><td style="padding:6px 8px;color:#6b7280;width:130px;vertical-align:top">${k}</td><td style="padding:6px 8px"><strong>${escapeHtml(String(v))}</strong></td></tr>`).join("")}
      </table>
      ${input.messaggio ? `<p style="margin:16px 0 0;padding:12px;background:#f6f3ee;border-radius:8px;white-space:pre-wrap">${escapeHtml(input.messaggio)}</p>` : ""}
      <p style="margin-top:20px;font-size:12px;color:#6b7280">Gestisci le richieste dall'<a href="${SITE_URL}/admin/richieste">area riservata</a>.</p>
    </div>`;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: input.email || undefined,
      subject: `${titolo} - ${input.nome}`,
      html,
    });
    if (error) return { sent: false, reason: error.message };
    return { sent: true };
  } catch (e) {
    return { sent: false, reason: e instanceof Error ? e.message : "errore invio" };
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

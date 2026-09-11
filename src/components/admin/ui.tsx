import Link from "next/link";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-4xl font-semibold text-navy">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Pill({ tone = "neutral", children }: { tone?: "neutral" | "green" | "amber" | "red" | "navy" | "gold"; children: React.ReactNode }) {
  const tones = {
    neutral: "bg-sand text-navy",
    green: "bg-green-100 text-green-800",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-700",
    navy: "bg-navy text-white",
    gold: "bg-gold/25 text-gold-deep",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${tones[tone]}`}>{children}</span>;
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="card p-10 text-center">
      <p className="font-display text-2xl text-navy">{title}</p>
      {text && <p className="mt-2 text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, href, tone = "navy" }: { label: string; value: string | number; href?: string; tone?: "navy" | "gold" | "amber" | "muted" }) {
  const color = { navy: "text-navy", gold: "text-gold-deep", amber: "text-amber-600", muted: "text-muted" }[tone];
  const body = (
    <div className="card p-5 transition hover:shadow-card-hover">
      <div className={`font-display text-4xl font-semibold ${color}`}>{value}</div>
      <div className="mt-1 text-[12px] font-semibold uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export function Section({ title, description, children, className = "" }: { title: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card p-5 sm:p-6 ${className}`}>
      <h2 className="font-display text-2xl font-semibold text-navy">{title}</h2>
      {description && <p className="mt-1 text-[13.5px] text-muted">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

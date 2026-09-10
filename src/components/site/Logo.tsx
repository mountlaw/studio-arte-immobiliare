// Logo: blob organico con la casa + testo oro (riproduzione del marchio originale).

export function LogoMark({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <path
        d="M50 4C68 1 85 10 93 25c7 13 7 27 3 41-4 14-11 24-24 30-14 6-30 4-42-4C18 84 8 72 4 58 0 44 4 28 14 18 26 6 38 4 50 4Z"
        fill="#1b2a4a"
      />
      <path d="M50 22 30 38v20h40V38Z" stroke="#c9a54c" strokeWidth="3" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M42 46v12h16V46c0-6-8-11-8-11s-8 5-8 11Z" stroke="#c9a54c" strokeWidth="2" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

export function BrandLogo({ size = 140, className = "" }: { size?: number; className?: string }) {
  const h = size * 1.3;
  return (
    <svg width={size} height={h} viewBox="0 0 260 338" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Studio Arte Immobiliare">
      <path
        d="M130 10c40-8 85 10 110 45 18 25 20 55 12 87-6 24-17 43-20 66-4 27 6 52 13 77 5 20-7 37-35 47-30 13-62 6-92-2-33-8-63-20-83-45-17-21-25-45-23-70 2-23 10-43 8-67-2-28-15-53-8-80 8-26 33-46 68-56 15-4 30-2 50-2Z"
        fill="#1b2a4a"
      />
      <path d="M130 52 95 82v33h70V82Z" stroke="#c9a54c" strokeWidth="4" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M118 98v17h24V98c0-8-12-14-12-14s-12 6-12 14Z" stroke="#c9a54c" strokeWidth="3" fill="none" strokeLinejoin="round" />
      <text x="130" y="152" textAnchor="middle" fill="#c9a54c" fontSize="20" fontFamily="Georgia, 'Times New Roman', serif" letterSpacing="5">
        STUDIO
      </text>
      <text x="130" y="200" textAnchor="middle" fill="#c9a54c" fontSize="58" fontFamily="Georgia, 'Times New Roman', serif" letterSpacing="6" fontWeight="700">
        ARTE
      </text>
      <text x="130" y="235" textAnchor="middle" fill="#c9a54c" fontSize="20" fontFamily="Georgia, 'Times New Roman', serif" letterSpacing="4">
        IMMOBILIARE
      </text>
    </svg>
  );
}

export function Wordmark({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <span className={`flex flex-col leading-none ${className}`}>
      <span className={`font-display text-[22px] font-bold tracking-[0.18em] ${light ? "text-gold" : "text-navy"}`}>ARTE</span>
      <span className={`text-[9px] font-semibold uppercase tracking-[0.32em] ${light ? "text-white/70" : "text-muted"}`}>Studio Immobiliare</span>
    </span>
  );
}

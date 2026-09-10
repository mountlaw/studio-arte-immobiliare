import { IconFacebook, IconInstagram, IconLinkedin, IconTiktok, IconYoutube } from "@/components/ui/Icons";
import { socialLinks } from "@/lib/data/impostazioni";
import type { Impostazioni } from "@/lib/types";

export default function SocialLinks({ impostazioni, className = "" }: { impostazioni: Impostazioni; className?: string }) {
  const s = socialLinks(impostazioni);
  const items = [
    { href: s.instagram, label: "Instagram", Icon: IconInstagram },
    { href: s.youtube, label: "YouTube", Icon: IconYoutube },
    { href: s.tiktok, label: "TikTok", Icon: IconTiktok },
    { href: s.facebook, label: "Facebook", Icon: IconFacebook },
    { href: s.linkedin, label: "LinkedIn", Icon: IconLinkedin },
  ].filter((i) => i.href);
  if (!items.length) return null;
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {items.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={label}
          aria-label={label}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-current/20 transition hover:border-gold hover:text-gold"
        >
          <Icon size={18} />
        </a>
      ))}
    </div>
  );
}

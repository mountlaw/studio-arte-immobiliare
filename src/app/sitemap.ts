import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
import { getImmobiliPubblicati } from "@/lib/data/immobili";
import { immobileHref } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const immobili = await getImmobiliPubblicati();
  const statiche: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/vendita`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/affitto`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/chi-siamo`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/valuta-casa`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/contatti`, changeFrequency: "monthly", priority: 0.6 },
  ];
  const annunci: MetadataRoute.Sitemap = immobili
    .filter((p) => p.disponibile)
    .map((p) => ({
      url: `${SITE_URL}${immobileHref(p)}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  return [...statiche, ...annunci];
}

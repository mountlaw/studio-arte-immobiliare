-- Le foto sono state copiate nel bucket del nuovo progetto (cartella immobili/), tutte in JPEG.
-- Qui gli URL degli annunci e della copertina passano al nuovo host.
UPDATE public.immobili SET immagini = (
  SELECT array_agg(regexp_replace(replace(u, 'https://tcoeolazrlitiyxtyful.supabase.co/', 'https://efldhensgxzvgawgxzwz.supabase.co/'), '\.(PNG|png|HEIC|heic|JPG|JPEG|jpeg)$', '.jpg') ORDER BY ord)
  FROM unnest(immagini) WITH ORDINALITY AS t(u, ord)
) WHERE immagini::text LIKE '%tcoeolazrlitiyxtyful%';
UPDATE public.impostazioni SET valore = regexp_replace(replace(valore, 'https://tcoeolazrlitiyxtyful.supabase.co/', 'https://efldhensgxzvgawgxzwz.supabase.co/'), '\.(PNG|png|HEIC|heic)$', '.jpg') WHERE chiave = 'hero_image';
SELECT count(*) AS annunci, count(*) FILTER (WHERE immagini::text LIKE '%tcoeolazrlitiyxtyful%') AS ancora_sul_vecchio, (SELECT valore FROM public.impostazioni WHERE chiave = 'hero_image') AS copertina FROM public.immobili;

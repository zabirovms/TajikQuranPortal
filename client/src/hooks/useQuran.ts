import { useQuery } from '@tanstack/react-query';
import { Surah, Verse } from '@shared/schema';

export function useSurahs() {
  return useQuery<Surah[]>({
    queryKey: ['/api/surahs'],
    staleTime: Infinity, // This data doesn't change often
  });
}

export function useSurah(surahNumber: number) {
  return useQuery<Surah>({
    queryKey: [`/api/surahs/${surahNumber}`],
    enabled: !!surahNumber && surahNumber > 0,
  });
}

export function useVerses(surahNumber: number) {
  return useQuery<Verse[]>({
    queryKey: [`/api/surahs/${surahNumber}/verses`],
    enabled: !!surahNumber && surahNumber > 0,
  });
}

export function useVerse(key: string) {
  return useQuery<Verse>({
    queryKey: [`/api/verses/${key}`],
    enabled: !!key && /^\d+:\d+$/.test(key),
  });
}

export function useSearchVerses(query: string, language?: 'arabic' | 'tajik' | 'both', surahId?: number) {
  const queryParams = new URLSearchParams();
  if (query) queryParams.append('q', query);
  if (language) queryParams.append('language', language);
  if (surahId) queryParams.append('surah', surahId.toString());

  return useQuery<Verse[]>({
    queryKey: [`/api/search?${queryParams.toString()}`],
    enabled: !!query, // Only run query when we have a search term
  });
}

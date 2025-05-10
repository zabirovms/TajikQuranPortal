import { useQuery } from '@tanstack/react-query';

// Types for Quran Foundation API responses
export interface QuranFoundationTranslation {
  id: string;
  name: string;
  author_name: string;
  language_name: string;
}

export interface QuranFoundationVerse {
  id: number;
  verse_key: string;
  verse_number: number;
  chapter_number: number;
  text: string;
  translations?: {
    [translationId: string]: {
      id: number;
      text: string;
      resource_id: string;
      language_name: string;
    }
  };
}

// Function to fetch all available Tajik translations
export async function fetchTajikTranslations(): Promise<QuranFoundationTranslation[]> {
  try {
    const response = await fetch('/api/quran-foundation/translations');
    
    if (!response.ok) {
      throw new Error(`Error fetching translations: ${response.status}`);
    }
    
    const responseData = await response.json();
    
    // Process the response based on its structure
    if (responseData.translations) {
      return responseData.translations;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      return responseData.data.map((item: any) => ({
        id: item.id || item.resource_id,
        name: item.name || item.author_name,
        author_name: item.author_name || 'Unknown',
        language_name: item.language_name || 'Tajik'
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching Quran Foundation translations:', error);
    return [];
  }
}

// Function to fetch verses by surah with a specific translation
export async function fetchVersesBySurah(
  surahNumber: number, 
  translationId: string
): Promise<QuranFoundationVerse[]> {
  try {
    const response = await fetch(
      `/api/quran-foundation/surahs/${surahNumber}/verses?translation_id=${translationId}`
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching verses: ${response.status}`);
    }
    
    const responseData = await response.json();
    
    // Process the response based on its structure
    if (responseData.verses) {
      return responseData.verses;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      return responseData.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching Quran Foundation verses:', error);
    return [];
  }
}

// Hook to fetch Tajik translations
export function useQuranFoundationTranslations() {
  return useQuery({
    queryKey: ['quran-foundation-translations'],
    queryFn: fetchTajikTranslations,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

// Hook to fetch verses with a specific translation
export function useQuranFoundationVerses(
  surahNumber: number,
  translationId: string
) {
  return useQuery({
    queryKey: ['quran-foundation-verses', surahNumber, translationId],
    queryFn: () => fetchVersesBySurah(surahNumber, translationId),
    enabled: !!translationId && !!surahNumber && translationId !== 'default',
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
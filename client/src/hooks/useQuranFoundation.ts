import { useState, useEffect } from 'react';

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
  text: string;
}

// Function to fetch all available Tajik translations
export async function fetchTajikTranslations(): Promise<QuranFoundationTranslation[]> {
  try {
    // This would use the correct OAuth token once we have it
    const response = await fetch('/api/quran-foundation/translations');
    
    if (!response.ok) {
      throw new Error(`Error fetching translations: ${response.status}`);
    }
    
    const data = await response.json();
    return data.translations || [];
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
    // This would use the correct OAuth token once we have it
    const response = await fetch(`/api/quran-foundation/surahs/${surahNumber}/verses?translation_id=${translationId}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching verses: ${response.status}`);
    }
    
    const data = await response.json();
    return data.verses || [];
  } catch (error) {
    console.error('Error fetching Quran Foundation verses:', error);
    return [];
  }
}

// Hook to fetch verses with a specific translation
export function useQuranFoundationVerses(
  surahNumber: number,
  translationId: string
) {
  const [verses, setVerses] = useState<QuranFoundationVerse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadVerses = async () => {
      if (translationId !== 'quran_foundation') {
        setVerses([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const data = await fetchVersesBySurah(surahNumber, translationId);
        setVerses(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    loadVerses();
  }, [surahNumber, translationId]);

  return { verses, isLoading, error };
}
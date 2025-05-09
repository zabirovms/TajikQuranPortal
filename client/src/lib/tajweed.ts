/**
 * Tajweed text parser for Al Quran Cloud API
 * Based on documentation from: https://github.com/meezaan/alquran-tools
 */

// Tajweed types and their CSS classes and descriptions
interface TajweedTypeInfo {
  cssClass: string;
  type: string;
  description: string;
}

// Define the type of the tajweedTypes object
const tajweedTypes: Record<string, TajweedTypeInfo> = {
  'h': { cssClass: 'ham_wasl', type: 'hamza-wasl', description: 'Hamzat ul Wasl' },
  's': { cssClass: 'slnt', type: 'silent', description: 'Silent' },
  'l': { cssClass: 'slnt', type: 'laam-shamsiyah', description: 'Lam Shamsiyyah' },
  'n': { cssClass: 'madda_normal', type: 'madda-normal', description: 'Normal Prolongation: 2 Vowels' },
  'p': { cssClass: 'madda_permissible', type: 'madda-permissible', description: 'Permissible Prolongation: 2, 4, 6 Vowels' },
  'm': { cssClass: 'madda_necessary', type: 'madda-necessary', description: 'Necessary Prolongation: 6 Vowels' },
  'q': { cssClass: 'qlq', type: 'qalaqah', description: 'Qalqalah' },
  'o': { cssClass: 'madda_obligatory', type: 'madda-obligatory', description: 'Obligatory Prolongation: 4-5 Vowels' },
  'c': { cssClass: 'ikhf_shfw', type: 'ikhafa-shafawi', description: 'Ikhafa Shafawi - With Meem' },
  'f': { cssClass: 'ikhf', type: 'ikhafa', description: 'Ikhafa' },
  'w': { cssClass: 'idghm_shfw', type: 'idgham-shafawi', description: 'Idgham Shafawi - With Meem' },
  'i': { cssClass: 'iqlb', type: 'iqlab', description: 'Iqlab' },
  'a': { cssClass: 'idgh_ghn', type: 'idgham-with-ghunnah', description: 'Idgham - With Ghunnah' },
  'u': { cssClass: 'idgh_w_ghn', type: 'idgham-without-ghunnah', description: 'Idgham - Without Ghunnah' },
  'd': { cssClass: 'idgh_mus', type: 'idgham-mutajanisayn', description: 'Idgham - Mutajanisayn' },
  'b': { cssClass: 'idgh_mut', type: 'idgham-mutaqaribayn', description: 'Idgham - Mutaqaribayn' },
  'g': { cssClass: 'ghn', type: 'ghunnah', description: 'Ghunnah: 2 Vowels' }
};

/**
 * Parses Tajweed text from Al Quran Cloud API and converts it to HTML
 */
export function parseTajweed(text: string): string {
  if (!text) return '';

  // Check if the text has any tajweed markup
  if (!text.includes('[')) return text;

  // Regular expression to match Tajweed markup
  // Example: [h:9421[ٱ] or [l[ل]
  const regex = /\[(h|s|l|n|p|m|q|o|c|f|w|i|a|u|d|b|g)(?::(\d+))?\[(.*?)\]/g;

  // Replace each occurrence with HTML markup
  return text.replace(regex, (match, type, tajweedId, content) => {
    const typeKey = type as string;
    if (!tajweedTypes[typeKey]) {
      console.warn(`Unknown tajweed type: ${typeKey}`);
      return content;
    }

    const { cssClass, type: tajweedType, description } = tajweedTypes[typeKey];
    
    // Create a tajweed element with appropriate class and data attributes
    return `<tajweed class="${cssClass}" data-type="${tajweedType}" data-description="${description}" data-tajweed="${tajweedId ? ':' + tajweedId : ''}">${content}</tajweed>`;
  });
}

/**
 * Fetches ayah with Tajweed from Al Quran Cloud API (through our proxy)
 */
export async function fetchTajweedAyah(surahNumber: number, ayahNumber: number): Promise<string> {
  try {
    // Use our proxy endpoint instead of calling the API directly
    const response = await fetch(`/api/tajweed/ayah/${surahNumber}:${ayahNumber}`);
    const data = await response.json();
    
    if (data.code === 200 && data.data && data.data.text) {
      return data.data.text;
    } else {
      console.error('Error fetching tajweed ayah:', data);
      throw new Error(`Failed to fetch tajweed ayah ${surahNumber}:${ayahNumber}`);
    }
  } catch (error) {
    console.error('Error fetching tajweed ayah:', error);
    throw error;
  }
}

/**
 * Fetches an entire surah with Tajweed from Al Quran Cloud API (through our proxy)
 */
export async function fetchTajweedSurah(surahNumber: number): Promise<string[]> {
  try {
    // Use our proxy endpoint instead of calling the API directly
    const response = await fetch(`/api/tajweed/surah/${surahNumber}`);
    const data = await response.json();
    
    if (data.code === 200 && data.data && data.data.ayahs) {
      return data.data.ayahs.map((ayah: any) => ayah.text);
    } else {
      console.error('Error fetching tajweed surah:', data);
      throw new Error(`Failed to fetch tajweed surah ${surahNumber}`);
    }
  } catch (error) {
    console.error('Error fetching tajweed surah:', error);
    throw error;
  }
}
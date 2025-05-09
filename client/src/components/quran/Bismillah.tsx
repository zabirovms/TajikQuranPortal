import { getArabicFontClass } from '@/lib/fonts';

interface BismillahProps {
  surahNumber: number;
  className?: string;
}

/**
 * Bismillah should ONLY be shown as part of the first verse of Surah Al-Fatiha
 * For all other surahs, it should not be displayed anywhere
 */
export default function Bismillah({ 
  surahNumber, 
  className = '' 
}: BismillahProps) {
  // We no longer display Bismillah as a separate component
  // It should only appear as part of the first verse of Al-Fatiha
  return null;
}
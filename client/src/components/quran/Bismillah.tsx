import { getArabicFontClass } from '@/lib/fonts';

interface BismillahProps {
  surahNumber: number;
  className?: string;
  showTranslation?: boolean;
}

export default function Bismillah({ 
  surahNumber, 
  className = '', 
  showTranslation = false 
}: BismillahProps) {
  // Surah At-Tawbah (9) is the only surah that doesn't start with Bismillah
  if (surahNumber === 9) {
    return null;
  }
  
  // For Al-Fatiha, Bismillah is already included as verse 1, so we don't need to show it separately
  if (surahNumber === 1) {
    return null;
  }
  
  return (
    <div className={`text-center py-4 mb-6 ${className}`}>
      <div className={`${getArabicFontClass('lg')} text-center text-primary dark:text-accent`}>
        بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
      </div>
      {/* Only show the translation if explicitly requested */}
      {showTranslation === false ? null : (
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Ба номи Худованди бахшояндаи меҳрубон
        </div>
      )}
    </div>
  );
}
import { getArabicFontClass } from '@/lib/fonts';

interface BismillahProps {
  surahNumber: number;
  className?: string;
}

export default function Bismillah({ surahNumber, className = '' }: BismillahProps) {
  // Surah At-Tawbah (9) is the only surah that doesn't start with Bismillah
  if (surahNumber === 9) {
    return null;
  }
  
  // Only display Bismillah as a header for surahs other than Al-Fatiha
  // since in Al-Fatiha it's already the first verse
  if (surahNumber === 1) {
    return null;
  }
  
  return (
    <div className={`text-center py-4 mb-6 ${className}`}>
      <div className={`${getArabicFontClass('lg')} text-center text-primary dark:text-accent`}>
        بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        Ба номи Худованди бахшояндаи меҳрубон
      </div>
    </div>
  );
}
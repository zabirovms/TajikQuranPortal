import { Button } from '@/components/ui/button';
import { Surah } from '@shared/schema';
import { getArabicFontClass } from '@/lib/fonts';
import { Play, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

interface SurahHeaderProps {
  surah: Surah;
  onPlaySurah: () => void;
  isLoading?: boolean;
}

export default function SurahHeader({ surah, onPlaySurah, isLoading = false }: SurahHeaderProps) {
  const [showDetails, setShowDetails] = useState(false);
  if (isLoading) {
    return (
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 text-center">
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-12 w-64 mx-auto mb-2" />
        <Skeleton className="h-4 w-80 mx-auto mb-3" />
        
        <div className="flex justify-center mb-4">
          <Skeleton className="h-8 w-28" />
        </div>
        
        <Skeleton className="h-12 w-full mx-auto" />
      </div>
    );
  }
  
  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 text-center">
      {/* Mobile view */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-primary dark:text-accent">
            {surah.number}. {surah.name_tajik}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-500 hover:text-primary dark:hover:text-accent"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
        
        <div className={`${getArabicFontClass('md')} mb-2`}>
          {surah.name_arabic}
        </div>
        
        {showDetails && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            {surah.name_english} • {surah.verses_count} оят • 
            {surah.revelation_type === "Meccan" ? " Нозилшуда дар Макка" : " Нозилшуда дар Мадина"}
          </p>
        )}
        
        <div className="flex justify-center mb-4">
          <Button 
            onClick={onPlaySurah}
            className="flex items-center justify-center bg-primary dark:bg-accent text-white rounded-full px-4 py-1 text-sm hover:bg-primary/90 dark:hover:bg-accent/90"
          >
            <Play className="mr-2 h-4 w-4" /> Тиловати сура
          </Button>
        </div>
        
        <div className={`${getArabicFontClass('md')} text-gray-800 dark:text-gray-200 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50`}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
      </div>
      
      {/* Desktop view */}
      <div className="hidden md:block">
        <h2 className="text-2xl font-bold text-primary dark:text-accent mb-2">
          Сураи {surah.name_tajik}
        </h2>
        <div className={`${getArabicFontClass('lg')} mb-2`}>
          {surah.name_arabic}
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
          {surah.name_english} • {surah.verses_count} оят • 
          {surah.revelation_type === "Meccan" ? " Нозилшуда дар Макка" : " Нозилшуда дар Мадина"}
        </p>
        
        <div className="flex justify-center mb-4">
          <Button 
            onClick={onPlaySurah}
            className="flex items-center justify-center bg-primary dark:bg-accent text-white rounded-full px-4 py-1 text-sm hover:bg-primary/90 dark:hover:bg-accent/90"
          >
            <Play className="mr-2 h-4 w-4" /> Тиловати сура
          </Button>
        </div>
        
        <div className={`${getArabicFontClass('lg')} text-gray-800 dark:text-gray-200 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50`}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
      </div>
    </div>
  );
}

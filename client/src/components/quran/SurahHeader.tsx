import { Button } from '@/components/ui/button';
import { Surah } from '@shared/schema';
import { getArabicFontClass } from '@/lib/fonts';
import { Play, Pause, X, RotateCcw, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect, useCallback } from 'react';
import { useAudioPlayer } from '@/hooks/useAudio';
import { useToast } from '@/hooks/use-toast';

interface SurahHeaderProps {
  surah: Surah;
  onPlaySurah: () => void;
  isLoading?: boolean;
}

export default function SurahHeader({ surah, onPlaySurah, isLoading = false }: SurahHeaderProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { audioState, togglePlayPause, stopAudio } = useAudioPlayer();
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();
  
  // Check if this surah is currently playing
  const isSurahPlaying = useCallback(() => {
    return audioState.playingEntireSurah?.surahNumber === surah.number && audioState.isPlaying;
  }, [audioState, surah.number]);
  
  // Update isPlaying state when audioState changes
  useEffect(() => {
    setIsPlaying(isSurahPlaying());
    
    // For debugging
    if (audioState.playingEntireSurah) {
      console.log("Current playing surah:", audioState.playingEntireSurah.surahNumber);
      console.log("Current surah:", surah.number);
      console.log("Is playing:", audioState.isPlaying);
    }
  }, [audioState, isSurahPlaying, surah.number]);
  
  // Show Bismillah except for Surah 9 (Tawbah) or Surah 1 (Fatiha)
  const shouldShowBismillah = surah.number !== 9 && surah.number !== 1;
  
  // Handle playing or pausing audio
  const handlePlayButton = () => {
    if (isPlaying) {
      togglePlayPause();
      toast({
        title: "Audio Paused",
        description: `Paused Сураи ${surah.name_tajik}`,
      });
    } else {
      onPlaySurah();
    }
  };
  
  if (isLoading) {
    return (
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 text-center">
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-12 w-64 mx-auto mb-2" />
        <Skeleton className="h-4 w-80 mx-auto mb-3" />
        
        <div className="flex justify-center space-x-2 mb-4">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
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
        
        <div className="flex justify-center space-x-2 mb-4">
          <Button 
            onClick={handlePlayButton}
            className="flex items-center justify-center bg-primary dark:bg-accent text-white rounded-full px-4 py-1 text-sm hover:bg-primary/90 dark:hover:bg-accent/90"
          >
            {isPlaying ? (
              <>
                <Pause className="mr-2 h-4 w-4" /> Таваққуф
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" /> Тиловати сура
              </>
            )}
          </Button>
          
          {isPlaying && (
            <>
              <Button 
                onClick={stopAudio}
                variant="outline"
                className="flex items-center justify-center text-gray-600 dark:text-gray-300 rounded-full px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Хомӯш кардан"
              >
                <X className="h-4 w-4" />
              </Button>
              
              <Button 
                onClick={() => {
                  stopAudio();
                  setTimeout(onPlaySurah, 300);
                }}
                variant="outline"
                className="flex items-center justify-center text-gray-600 dark:text-gray-300 rounded-full px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Аз аввал"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        
        {shouldShowBismillah && (
          <div className={`${getArabicFontClass('md')} bismillah text-gray-800 dark:text-gray-200`}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        )}
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
        
        <div className="flex justify-center space-x-3 mb-4">
          <Button 
            onClick={handlePlayButton}
            className="flex items-center justify-center bg-primary dark:bg-accent text-white rounded-full px-6 py-2 hover:bg-primary/90 dark:hover:bg-accent/90"
          >
            {isPlaying ? (
              <>
                <Pause className="mr-2 h-5 w-5" /> Таваққуф
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" /> Тиловати сура
              </>
            )}
          </Button>
          
          {isPlaying && (
            <>
              <Button 
                onClick={stopAudio}
                variant="outline"
                className="flex items-center justify-center text-gray-600 dark:text-gray-300 rounded-full px-4"
                title="Хомӯш кардан"
              >
                <X className="mr-1 h-5 w-5" /> Хомӯш
              </Button>
              
              <Button 
                onClick={() => {
                  stopAudio();
                  setTimeout(onPlaySurah, 300);
                }}
                variant="outline"
                className="flex items-center justify-center text-gray-600 dark:text-gray-300 rounded-full px-4"
                title="Аз аввал"
              >
                <RotateCcw className="mr-1 h-5 w-5" /> Аз аввал
              </Button>
            </>
          )}
        </div>
        
        {shouldShowBismillah && (
          <div className={`${getArabicFontClass('lg')} bismillah text-gray-800 dark:text-gray-200`}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        )}
      </div>
    </div>
  );
}

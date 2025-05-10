import { Button } from '@/components/ui/button';
import { Surah } from '@shared/schema';
import { getArabicFontClass } from '@/lib/fonts';
import { Play, Pause, X, RotateCcw, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
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
  const { toast } = useToast();
  
  // Local audio state
  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  const [localIsPaused, setLocalIsPaused] = useState(false);
  
  // Update local state based on audio state changes
  useEffect(() => {
    // Get the audio element
    const audio = document.querySelector('audio');
    const isCurrentSurah = audioState.playingEntireSurah?.surahNumber === surah.number;
    
    console.log("Audio state update:", {
      surahNumber: surah.number,
      playingSurah: audioState.playingEntireSurah?.surahNumber,
      isPlaying: audioState.isPlaying,
      currentTime: audioState.currentTime,
      audioSrc: audio?.src || 'none'
    });
    
    // Determine local state
    if (isCurrentSurah && audioState.isPlaying) {
      setLocalIsPlaying(true);
      setLocalIsPaused(false);
    } else if (isCurrentSurah && !audioState.isPlaying && audioState.currentTime > 0) {
      setLocalIsPlaying(false);
      setLocalIsPaused(true);
    } else if (!isCurrentSurah) {
      setLocalIsPlaying(false);
      setLocalIsPaused(false);
    }
  }, [audioState, surah.number]);
  
  // Show Bismillah except for Surah 9 (Tawbah) or Surah 1 (Fatiha)
  const shouldShowBismillah = surah.number !== 9 && surah.number !== 1;
  
  // Play from beginning
  const handlePlay = () => {
    onPlaySurah();
  };
  
  // Pause currently playing audio
  const handlePause = () => {
    togglePlayPause();
    toast({
      title: "Audio Paused",
      description: `Paused Сураи ${surah.name_tajik}`,
    });
  };
  
  // Resume paused audio
  const handleResume = () => {
    togglePlayPause();
    toast({
      title: "Audio Resumed",
      description: `Resumed playing Сураи ${surah.name_tajik}`,
    });
  };
  
  // Stop audio completely
  const handleStop = () => {
    stopAudio();
    toast({
      title: "Audio Stopped",
      description: `Stopped playing Сураи ${surah.name_tajik}`,
    });
  };
  
  // Restart audio from beginning
  const handleRestart = () => {
    stopAudio();
    setTimeout(onPlaySurah, 300);
    toast({
      title: "Audio Restarted",
      description: `Restarted Сураи ${surah.name_tajik} from beginning`,
    });
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
        
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {/* Debug info */}
          <div className="w-full text-xs text-red-500 mb-2">
            Debug: isPlaying={String(localIsPlaying)}, isPaused={String(localIsPaused)}, 
            surah={surah.number}, playing={audioState.playingEntireSurah?.surahNumber || "none"}
          </div>
        
          {/* Play button */}
          {!localIsPlaying && !localIsPaused && (
            <Button 
              onClick={handlePlay}
              className="flex items-center justify-center bg-primary dark:bg-accent text-white rounded-full px-4 py-1 text-sm hover:bg-primary/90 dark:hover:bg-accent/90"
              title="Тиловати сура"
            >
              <Play className="mr-2 h-4 w-4" /> Тиловати сура
            </Button>
          )}
          
          {/* Pause button */}
          {localIsPlaying && (
            <Button 
              onClick={handlePause}
              className="flex items-center justify-center bg-amber-500 text-white rounded-full px-4 py-1 text-sm hover:bg-amber-600"
              title="Таваққуф"
            >
              <Pause className="mr-2 h-4 w-4" /> Таваққуф
            </Button>
          )}
          
          {/* Resume button */}
          {localIsPaused && (
            <Button 
              onClick={handleResume}
              className="flex items-center justify-center bg-green-500 text-white rounded-full px-4 py-1 text-sm hover:bg-green-600"
              title="Идома додан"
            >
              <Play className="mr-2 h-4 w-4" /> Идома додан
            </Button>
          )}
          
          {/* Stop button */}
          {(localIsPlaying || localIsPaused) && (
            <Button 
              onClick={handleStop}
              variant="outline"
              className="flex items-center justify-center text-gray-600 dark:text-gray-300 rounded-full px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Хомӯш кардан"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {/* Restart button */}
          {(localIsPlaying || localIsPaused) && (
            <Button 
              onClick={handleRestart}
              variant="outline"
              className="flex items-center justify-center text-gray-600 dark:text-gray-300 rounded-full px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Аз аввал"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
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
        
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          {/* Debug info */}
          <div className="w-full text-xs text-red-500 mb-2">
            Debug: isPlaying={String(localIsPlaying)}, isPaused={String(localIsPaused)}, 
            surah={surah.number}, playing={audioState.playingEntireSurah?.surahNumber || "none"}
          </div>
        
          {/* Play button */}
          {!localIsPlaying && !localIsPaused && (
            <Button 
              onClick={handlePlay}
              className="flex items-center justify-center bg-primary dark:bg-accent text-white rounded-full px-6 py-2 hover:bg-primary/90 dark:hover:bg-accent/90"
              title="Тиловати сура"
            >
              <Play className="mr-2 h-5 w-5" /> Тиловати сура
            </Button>
          )}
          
          {/* Pause button */}
          {localIsPlaying && (
            <Button 
              onClick={handlePause}
              className="flex items-center justify-center bg-amber-500 text-white rounded-full px-6 py-2 hover:bg-amber-600"
              title="Таваққуф"
            >
              <Pause className="mr-2 h-5 w-5" /> Таваққуф
            </Button>
          )}
          
          {/* Resume button */}
          {localIsPaused && (
            <Button 
              onClick={handleResume}
              className="flex items-center justify-center bg-green-500 text-white rounded-full px-6 py-2 hover:bg-green-600"
              title="Идома додан"
            >
              <Play className="mr-2 h-5 w-5" /> Идома додан
            </Button>
          )}
          
          {/* Stop button */}
          {(localIsPlaying || localIsPaused) && (
            <Button 
              onClick={handleStop}
              variant="outline"
              className="flex items-center justify-center text-gray-600 dark:text-gray-300 rounded-full px-4"
              title="Хомӯш кардан"
            >
              <X className="mr-1 h-5 w-5" /> Хомӯш
            </Button>
          )}
          
          {/* Restart button */}
          {(localIsPlaying || localIsPaused) && (
            <Button 
              onClick={handleRestart}
              variant="outline"
              className="flex items-center justify-center text-gray-600 dark:text-gray-300 rounded-full px-4"
              title="Аз аввал"
            >
              <RotateCcw className="mr-1 h-5 w-5" /> Аз аввал
            </Button>
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
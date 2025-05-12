import { Button } from '@/components/ui/button';
import { Surah } from '@shared/schema';
import { getArabicFontClass } from '@/lib/fonts';
import { Play, Pause, X, RotateCcw, Info, ChevronUp, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { useAudioPlayer } from '@/hooks/useAudio';
import { useToast } from '@/hooks/use-toast';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from '@/components/ui/collapsible';

interface SurahHeaderProps {
  surah: Surah;
  onPlaySurah: () => void;
  isLoading?: boolean;
}

export default function SurahHeader({ surah, onPlaySurah, isLoading = false }: SurahHeaderProps) {
  // SEO optimization - Hidden div with semantic content for search engines
  const seoDescription = `Сураи ${surah.name_tajik} ояти ${surah.verses_count} — Тафсири Осонбаён — Қуръон. Сураи ${surah.revelation_type === "Meccan" ? "Маккӣ" : "Маданӣ"}.`;
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
  
  // Track collapsible state for surah info
  const [isSurahInfoOpen, setIsSurahInfoOpen] = useState(false);
  
  // Render the information button and collapsible content if description is available
  const renderSurahInfo = () => {
    if (!surah.description) return null;
    
    return (
      <Collapsible 
        open={isSurahInfoOpen} 
        onOpenChange={setIsSurahInfoOpen}
        className="w-full mt-4 border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden"
      >
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost"
            className="flex items-center justify-between w-full py-4 px-6"
            title="Дар бораи сура"
          >
            <div className="flex items-center">
              <Info className="mr-2 h-5 w-5" /> 
              <span className="font-medium">Дар бораи сураи {surah.name_tajik}</span>
            </div>
            {isSurahInfoOpen ? 
              <ChevronUp className="h-5 w-5" /> : 
              <ChevronDown className="h-5 w-5" />
            }
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-6 pt-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 whitespace-pre-line">
            {surah.description}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
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
      {/* Hidden SEO content */}
      <div className="sr-only">
        <h1>{seoDescription}</h1>
        <p>Тарчумаи Куръони Карим — Тафсири Осонбаён. Сураи {surah.name_tajik} ({surah.number}), ояти {surah.verses_count}.</p>
      </div>
      {/* Mobile view */}
      <div className="md:hidden">
        <h2 className="text-xl font-bold text-primary dark:text-accent mb-2">
          Сураи {surah.name_tajik}
        </h2>
        
        <div className={`${getArabicFontClass('md')} mb-2`}>
          {surah.name_arabic}
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
          {surah.name_english} • {surah.verses_count} оят • 
          {surah.revelation_type === "Meccan" ? " Нозилшуда дар Макка" : " Нозилшуда дар Мадина"}
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          {/* Main button - Play/Pause toggle */}
          <Button 
            onClick={localIsPlaying ? handlePause : handlePlay}
            className="flex items-center justify-center bg-primary dark:bg-accent text-white rounded-full px-6 py-2 hover:bg-primary/90 dark:hover:bg-accent/90"
            title={localIsPlaying ? "Таваққуф" : "Тиловати сура"}
          >
            {localIsPlaying ? (
              <><Pause className="mr-2 h-5 w-5" /> Таваққуф</>
            ) : (
              <><Play className="mr-2 h-5 w-5" /> Тиловати сура</>
            )}
          </Button>
          
          {/* We'll add any mobile specific buttons here if needed */}
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
          {/* Main button - Play/Pause toggle */}
          <Button 
            onClick={localIsPlaying ? handlePause : handlePlay}
            className="flex items-center justify-center bg-primary dark:bg-accent text-white rounded-full px-6 py-2 hover:bg-primary/90 dark:hover:bg-accent/90"
            title={localIsPlaying ? "Таваққуф" : "Тиловати сура"}
          >
            {localIsPlaying ? (
              <><Pause className="mr-2 h-5 w-5" /> Таваққуф</>
            ) : (
              <><Play className="mr-2 h-5 w-5" /> Тиловати сура</>
            )}
          </Button>
          
          {/* We'll add any desktop specific buttons here if needed */}
        </div>
        
        {shouldShowBismillah && (
          <div className={`${getArabicFontClass('lg')} bismillah text-gray-800 dark:text-gray-200`}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        )}
      </div>
      
      {/* Render collapsible surah info section */}
      {renderSurahInfo()}
    </div>
  );
}
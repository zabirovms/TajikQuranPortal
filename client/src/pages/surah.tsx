import { useState, useEffect } from 'react';
import { useSurahs, useSurah, useVerses } from '@/hooks/useQuran';
import { useAudioPlayer } from '@/hooks/useAudio';
import { GlobalOverlayType } from '@/App';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import AudioPlayer from '@/components/layout/AudioPlayer';
import SurahHeader from '@/components/quran/SurahHeader';
import VerseItem from '@/components/quran/VerseItem';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import SeoHead from '@/components/shared/SeoHead';
import { FloatingHeader } from '@/components/layout/FloatingHeader';

interface SurahProps {
  surahNumber: number;
  onOpenOverlay: (type: GlobalOverlayType) => void;
}

export default function Surah({ surahNumber, onOpenOverlay }: SurahProps) {
  const { data: surahs, isLoading: isSurahsLoading } = useSurahs();
  const { data: surah, isLoading: isSurahLoading } = useSurah(surahNumber);
  const { data: verses, isLoading: isVersesLoading } = useVerses(surahNumber);
  const { playAudio, playSurah, audioState } = useAudioPlayer();
  const { toast } = useToast();
  
  // Save the last read position
  useEffect(() => {
    if (surah && surahNumber > 0) {
      const lastReadPosition = {
        surahNumber: surah.number,
        surahName: surah.name_tajik,
        verseNumber: 1, // Default to first verse
        verseKey: `${surah.number}:1`
      };
      
      localStorage.setItem('lastReadPosition', JSON.stringify(lastReadPosition));
    }
  }, [surah, surahNumber]);
  
  // Handle playing the entire surah
  const handlePlaySurah = () => {
    if (!surah) {
      toast({
        title: "Play error",
        description: "Surah information not available",
        variant: "destructive"
      });
      return;
    }
    
    // Use the playSurah function from the top-level hook
    playSurah(surah.number, surah.name_tajik);
    
    // Log for debugging
    console.log(`Playing surah ${surah.number}: ${surah.name_tajik}`);
    
    toast({
      title: "Playing Surah",
      description: `Now playing Сураи ${surah.name_tajik}`,
    });
  };
  
  // Handle pagination
  const getPreviousSurahNumber = () => {
    return surahNumber > 1 ? surahNumber - 1 : null;
  };
  
  const getNextSurahNumber = () => {
    return surahNumber < 114 ? surahNumber + 1 : null;
  };
  
  const previousSurah = getPreviousSurahNumber();
  const nextSurah = getNextSurahNumber();
  
  const isLoading = isSurahsLoading || isSurahLoading || isVersesLoading;
  
  return (
    <div className="min-h-screen flex flex-col">
      {surah && (
        <SeoHead
          title={`Сураи ${surah.name_tajik} (${surah.name_arabic})`}
          description={`Хондани Сураи ${surah.name_tajik} бо тарҷумаи тоҷикӣ. ${surah.verses_count} оят, нозил шуда дар ${surah.revelation_type === 'Meccan' ? 'Макка' : 'Мадина'}.`}
          structuredData={{
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": `Сураи ${surah.name_tajik} - Қуръон бо тарҷумаи тоҷикӣ. Тафсири Осонбаён`,
            "name": surah.name_tajik,
            "alternativeHeadline": surah.name_arabic,
            "author": {
              "@type": "Organization",
              "name": "Қуръони Тоҷикӣ"
            },
            "inLanguage": "tg",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Қуръони Тоҷикӣ",
              "url": window.location.origin
            }
          }}
        />
      )}
      
      {/* Floating header that appears when scrolling up */}
      {surah && (
        <FloatingHeader>
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-primary dark:text-accent mr-4">
                {surah.name_tajik}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {surah.verses_count} оят
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center" 
                onClick={handlePlaySurah}
              >
                <PlayCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">Тиловат</span>
              </Button>
              
              {previousSurah && (
                <Link href={`/surah/${previousSurah}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              
              {nextSurah && (
                <Link href={`/surah/${nextSurah}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </FloatingHeader>
      )}
      
      <Header 
        surahs={surahs as any}
        currentSurah={surah} 
        versesCount={surah?.verses_count}
        onOpenOverlay={onOpenOverlay}
        isLoading={isLoading}
      />
      
      <div className="container mx-auto px-4 py-6 md:flex flex-1">
        <Sidebar 
          surahs={surahs as any || []} 
          isLoading={isSurahsLoading} 
          currentSurahNumber={surah?.number}
        />
        
        <main className="flex-1">
          {surah && (
            <SurahHeader 
              surah={surah} 
              onPlaySurah={handlePlaySurah}
              isLoading={isSurahLoading}
            />
          )}
          
          {isSurahLoading && (
            <SurahHeader 
              surah={{
                id: 0,
                number: 0,
                name_arabic: "",
                name_tajik: "",
                name_english: "",
                revelation_type: "Meccan",
                verses_count: 0
              }} 
              onPlaySurah={() => {}}
              isLoading={true}
            />
          )}
          
          {/* Bismillah is now handled directly in SurahHeader component */}
          
          <div className="space-y-6 mb-8">
            {isVersesLoading && (
              // Show loading skeletons for verses
              Array.from({ length: 5 }).map((_, index) => (
                <VerseItem 
                  key={index}
                  verse={{
                    id: 0,
                    surah_id: 0,
                    verse_number: 0,
                    arabic_text: "",
                    tajik_text: "",
                    page: 0,
                    juz: 0,
                    audio_url: "",
                    unique_key: ""
                  }}
                  surahName=""
                  isLoading={true}
                />
              ))
            )}
            
            {verses && verses.map(verse => (
              <VerseItem 
                key={verse.id}
                verse={verse}
                surahName={surah?.name_tajik || ""}
              />
            ))}
          </div>
          
          {/* Pagination */}
          <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-8">
            {previousSurah ? (
              <Link href={`/surah/${previousSurah}`}>
                <Button variant="link" className="flex items-center space-x-2 text-primary dark:text-accent">
                  <ChevronLeft className="h-4 w-4" />
                  <span>Сураи қаблӣ</span>
                </Button>
              </Link>
            ) : (
              <div /> // Empty div to maintain flex spacing
            )}
            
            <div className="text-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {surah ? `Сураи ${surah.number} аз 114` : ""}
              </span>
            </div>
            
            {nextSurah ? (
              <Link href={`/surah/${nextSurah}`}>
                <Button variant="link" className="flex items-center space-x-2 text-primary dark:text-accent">
                  <span>Сураи баъдӣ</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <div /> // Empty div to maintain flex spacing
            )}
          </div>
        </main>
      </div>
      
      {/* Audio player */}
      <AudioPlayer />
    </div>
  );
}

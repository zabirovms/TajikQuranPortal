import { useState, useEffect, useRef } from 'react';
import { useSurahs, useSurah, useVerses } from '@/hooks/useQuran';
import { useAudioPlayer } from '@/hooks/useAudio';
import { GlobalOverlayType } from '@/App';
import AudioPlayer from '@/components/layout/AudioPlayer';
import VerseItem from '@/components/quran/VerseItem';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  PlayCircle, 
  Search, 
  Bookmark, 
  Book, 
  Info,
  Home,
  Menu,
  X,
  ArrowUp,
  List,
  Volume2,
  MoreHorizontal,
  Settings
} from 'lucide-react';
import { Link } from 'wouter';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import SeoHead from '@/components/shared/SeoHead';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useDisplaySettings } from '@/hooks/useDisplaySettings';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SettingsDrawer } from "@/components/layout/SettingsDrawer";

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
  const { contentViewMode } = useDisplaySettings();
  
  // Refs for scroll handling
  const scrollTopRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Mobile drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSurahInfoOpen, setIsSurahInfoOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  
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
  
  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
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
    
    toast({
      title: "Playing Surah",
      description: `Now playing Сураи ${surah.name_tajik}`,
    });
  };
  
  // Handle scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
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
      
      {/* New Header - Fixed at the top */}
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="flex w-full justify-between space-x-2 md:space-x-4">
            <div className="flex items-center gap-2">
              {/* Mobile Menu Button */}
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              
              <Link href="/">
                <Button variant="ghost" size="sm" className="hidden md:flex gap-2 items-center">
                  <Home className="h-4 w-4" />
                  <span>Хона</span>
                </Button>
              </Link>
              
              {surah && (
                <div className="flex items-center">
                  <div className="text-xs md:text-sm h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary-foreground flex items-center justify-center border border-primary mx-2">
                    {surahNumber}
                  </div>
                  <div>
                    <h1 className="text-sm md:text-base font-medium">{surah.name_tajik}</h1>
                    <p className="text-xs text-muted-foreground">{surah.name_arabic}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {/* Search Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden md:flex items-center" 
                onClick={() => onOpenOverlay('search')}
              >
                <Search className="h-4 w-4 mr-1" />
                <span className="text-sm">Ҷустуҷӯ</span>
              </Button>
              
              {/* Bookmarks Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden md:flex items-center" 
                onClick={() => onOpenOverlay('bookmarks')}
              >
                <Bookmark className="h-4 w-4 mr-1" />
                <span className="text-sm">Хатчӯбҳо</span>
              </Button>
              
              {/* Mobile Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onOpenOverlay('search')}>
                    <Search className="h-4 w-4 mr-2" />
                    <span>Ҷустуҷӯ</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onOpenOverlay('bookmarks')}>
                    <Bookmark className="h-4 w-4 mr-2" />
                    <span>Хатчӯбҳо</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Танзимот</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Settings Button (Desktop) */}
              <div className="hidden md:block">
                <SettingsDrawer />
              </div>
              
              {/* Play Button */}
              {surah && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2" 
                  onClick={handlePlaySurah}
                >
                  <Volume2 className="h-4 w-4" />
                  <span className="text-sm hidden md:inline">Тиловат</span>
                </Button>
              )}
              
              {/* Surah Info Button */}
              {surah && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="flex md:hidden"
                  onClick={() => setIsSurahInfoOpen(true)}
                >
                  <Info className="h-4 w-4" />
                </Button>
              )}
              
              {/* Navigation Buttons */}
              <div className="hidden md:flex items-center gap-1 ml-2">
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
          </div>
        </div>
      </header>
      
      {/* Mobile Surah List Drawer */}
      <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DrawerContent className="h-[80vh]">
          <div className="p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Сураҳо</h2>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
            
            {isSurahsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-y-auto h-[90%] space-y-1 pr-2 pb-4">
                {surahs && surahs.map((item: any) => (
                  <Link 
                    key={item.number} 
                    href={`/surah/${item.number}`}
                  >
                    <Button
                      variant={item.number === surahNumber ? "secondary" : "ghost"}
                      className="w-full justify-start text-left mb-1 h-auto py-3"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <span className="inline-flex justify-center items-center h-8 w-8 rounded-full bg-muted mr-3 text-sm">
                          {item.number}
                        </span>
                        <div>
                          <div className="font-medium">
                            {item.name_tajik}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.verses_count} оят • {item.revelation_type === 'Meccan' ? 'Макка' : 'Мадина'}
                          </div>
                        </div>
                      </div>
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
      
      {/* Mobile Settings Sheet */}
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Танзимот</SheetTitle>
          </SheetHeader>
          <div className="flex-1 mt-4">
            <SettingsDrawer />
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Mobile Surah Info Drawer */}
      <Drawer open={isSurahInfoOpen} onOpenChange={setIsSurahInfoOpen}>
        <DrawerContent>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Маълумот</h2>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
            
            {surah && (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Номи суръа</p>
                    <h3 className="text-xl font-medium">{surah.name_tajik}</h3>
                    <p className="text-sm text-muted-foreground">{surah.name_arabic}</p>
                  </div>
                  <div className="flex items-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center" 
                      onClick={handlePlaySurah}
                    >
                      <PlayCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Тиловат</span>
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Шумора</p>
                    <p className="text-lg">{surah.number}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Оятҳо</p>
                    <p className="text-lg">{surah.verses_count}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Нозил шуда</p>
                    <p className="text-lg">{surah.revelation_type === 'Meccan' ? 'Макка' : 'Мадина'}</p>
                  </div>
                </div>
                
                {surah.description && (
                  <div className="mt-4 bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 p-4 rounded-lg">
                    <h4 className="font-medium text-primary dark:text-accent mb-2">Дар бораи сура</h4>
                    <p className="text-sm">{surah.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
      
      {/* Scroll to top button */}
      {showScrollToTop && (
        <Button 
          variant="secondary" 
          size="icon" 
          className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
      
      <div className="flex-1 flex">
        {/* Left sidebar (desktop) */}
        <aside className="hidden md:block w-56 lg:w-64 h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto border-r border-border/40 py-4 px-2">
          <div className="mb-4 px-2">
            <h2 className="font-medium text-sm text-muted-foreground">СУРАҲО</h2>
          </div>
          
          {isSurahsLoading ? (
            <div className="space-y-2 px-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-1 pr-2">
              {surahs && surahs.map((item: any) => (
                <Link 
                  key={item.number} 
                  href={`/surah/${item.number}`}
                >
                  <Button
                    variant={item.number === surahNumber ? "secondary" : "ghost"}
                    className="w-full justify-start text-left mb-1"
                  >
                    <div className="flex items-center">
                      <span className="inline-flex justify-center items-center h-6 w-6 rounded-full bg-muted mr-2 text-xs">
                        {item.number}
                      </span>
                      <span className="truncate">{item.name_tajik}</span>
                    </div>
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </aside>
        
        {/* Main content area */}
        <main className="flex-1 max-w-4xl mx-auto w-full p-3 md:p-6" ref={contentRef}>
          <div ref={scrollTopRef}></div>
          
          {/* Surah Information Card (desktop) */}
          {surah && !isSurahLoading && (
            <Card className="mb-6 overflow-hidden bg-gradient-to-b from-white to-white/20 dark:from-gray-800 dark:to-gray-800/20 shadow-md md:shadow-lg">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-6">
                  <div className="mb-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-primary dark:text-accent">{surah.name_tajik}</h1>
                    <h2 className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 font-arabic mt-1">
                      {surah.name_arabic}
                    </h2>
                    <div className="text-sm text-muted-foreground mt-2 flex items-center">
                      <span>Сураи {surah.number}</span>
                      <span className="mx-2">•</span>
                      <span>{surah.verses_count} оят</span>
                      <span className="mx-2">•</span>
                      <span>{surah.revelation_type === 'Meccan' ? 'Макка' : 'Мадина'}</span>
                    </div>
                  </div>
                  
                  {/* Add reading info as an option */}
                  <div className="flex items-center gap-4 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={handlePlaySurah}
                    >
                      <Volume2 className="h-4 w-4" />
                      <span>Тиловат</span>
                    </Button>
                    
                    {/* Info button that opens the drawer on mobile and shows the info directly on desktop */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2" // removed md:hidden
                      onClick={() => setIsSurahInfoOpen(prev => !prev)}
                    >
                      <Info className="h-4 w-4" />
                      <span>Маълумот</span>
                    </Button>
                  </div>
                  
                  {/* Description paragraph - only shown on desktop and when exists */}
                  {surah.description && isSurahInfoOpen && (
                    <div className="prose prose-sm dark:prose-invert max-w-none mt-4">
                      <p>{surah.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
          
          {/* Surah Header Skeleton */}
          {isSurahLoading && (
            <Card className="mb-6 overflow-hidden">
              <div className="p-6">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
          )}
          
          {/* Bismillah for the verses */}
          {surah && surah.number !== 1 && surah.number !== 9 && (
            <div className="bismillah text-center py-6 px-8 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary/5 dark:to-accent/10 mb-8 shadow-sm">
              <p className="font-arabic text-3xl md:text-4xl leading-relaxed tracking-wider">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            </div>
          )}
          
          {/* Verses */}
          <div className={cn("space-y-6 mb-8", `content-${contentViewMode}`)}>
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
                    transliteration: null,
                    tajik_text: "",
                    alternative_translation: null,
                    tafsir: null,
                    page: null,
                    juz: null,
                    audio_url: null,
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
          
          {/* New Pagination */}
          {surah && (
            <div className="grid grid-cols-2 gap-4 mb-10">
              {previousSurah ? (
                <Link href={`/surah/${previousSurah}`} className="w-full">
                  <Card className="h-full overflow-hidden transition-all hover:shadow-md">
                    <div className="p-4 flex items-center">
                      <ChevronLeft className="h-5 w-5 mr-2 text-primary dark:text-accent" />
                      <div>
                        <p className="text-sm text-muted-foreground">Сураи қаблӣ</p>
                        <p className="font-medium">
                          {surahs && surahs.find((s: any) => s.number === previousSurah)?.name_tajik || `Сураи ${previousSurah}`}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ) : (
                <div></div>
              )}
              
              {nextSurah ? (
                <Link href={`/surah/${nextSurah}`} className="w-full">
                  <Card className="h-full overflow-hidden transition-all hover:shadow-md">
                    <div className="p-4 flex items-center justify-between">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Сураи баъдӣ</p>
                        <p className="font-medium">
                          {surahs && surahs.find((s: any) => s.number === nextSurah)?.name_tajik || `Сураи ${nextSurah}`}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 ml-2 text-primary dark:text-accent" />
                    </div>
                  </Card>
                </Link>
              ) : (
                <div></div>
              )}
            </div>
          )}
        </main>
      </div>
      
      {/* Audio player */}
      <AudioPlayer />
    </div>
  );
}

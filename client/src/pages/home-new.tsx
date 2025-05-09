import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSurahs } from '@/hooks/useQuran';
import { getArabicFontClass } from '@/lib/fonts';
import Header from '@/components/layout/Header';
import { GlobalOverlayType } from '@/App';
import { 
  Search, BookOpen, ChevronRight, ArrowUp, ArrowDown,
  Home, Menu, X, Facebook, Instagram
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Surah } from '@shared/schema';

interface LastReadSection {
  surahNumber: number;
  surahName: string;
  verseNumber: number;
  verseKey: string;
}

interface HomePageProps {
  onOpenOverlay: (type: GlobalOverlayType) => void;
}

// Popular Surahs for quick access
interface PopularSurah {
  number: number;
  name_tajik: string;
  name_english: string;
  name_arabic: string;
}

const popularSurahs: PopularSurah[] = [
  { number: 36, name_tajik: "Ёсин", name_english: "Ya-Sin", name_arabic: "يس" },
  { number: 67, name_tajik: "Мулк", name_english: "Al-Mulk", name_arabic: "الملك" },
  { number: 55, name_tajik: "Раҳмон", name_english: "Ar-Rahman", name_arabic: "الرحمن" },
  { number: 18, name_tajik: "Каҳф", name_english: "Al-Kahf", name_arabic: "الكهف" },
];

export default function HomePage({ onOpenOverlay }: HomePageProps) {
  const { data: surahs = [], isLoading } = useSurahs();
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRead, setLastRead] = useState<LastReadSection | null>(null);
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'top' | 'bottom'>('top');
  
  // Function to scroll to top or bottom
  const scrollToPosition = (direction: 'top' | 'bottom') => {
    if (direction === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
    setScrollDirection(direction === 'top' ? 'bottom' : 'top');
  };

  // Filter surahs based on search term
  useEffect(() => {
    if (!surahs) return;
    
    if (!searchTerm) {
      setFilteredSurahs(surahs);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = surahs.filter(
      surah => 
        surah.name_tajik.toLowerCase().includes(term) ||
        surah.name_english.toLowerCase().includes(term) ||
        surah.number.toString().includes(term)
    );
    
    setFilteredSurahs(filtered);
  }, [surahs, searchTerm]);
  
  // Check local storage for last read position
  useEffect(() => {
    const storedPosition = localStorage.getItem('lastReadPosition');
    if (storedPosition) {
      try {
        const position = JSON.parse(storedPosition) as LastReadSection;
        setLastRead(position);
      } catch (error) {
        console.error("Error parsing lastReadPosition:", error);
      }
    }
  }, []);
  
  // Render surah list item for mobile
  const renderSurahItem = (surah: Surah) => (
    <Link 
      key={surah.id} 
      href={`/surah/${surah.number}`}
      className="block"
    >
      <Card className="mb-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary dark:bg-accent text-white font-medium">
                {surah.number}
              </div>
              <div>
                <h3 className="font-medium">{surah.name_tajik}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {surah.name_english} • {surah.verses_count} оят
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={getArabicFontClass('sm')}>{surah.name_arabic}</span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
  
  // Render popular surah link
  const renderPopularSurahLink = (surah: PopularSurah) => (
    <Link 
      key={surah.number} 
      href={`/surah/${surah.number}`}
      className="block p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
      onClick={() => setIsMainMenuOpen(false)}
    >
      <div className="flex justify-between items-center">
        <div>
          <span className="font-medium">{surah.name_tajik}</span>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {surah.name_english}
          </p>
        </div>
        <span className={getArabicFontClass('sm')}>{surah.name_arabic}</span>
      </div>
    </Link>
  );
  
  // Render loading skeleton for surah list
  const renderSkeletonItem = (index: number) => (
    <Card key={index} className="mb-2">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div>
              <Skeleton className="h-5 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="w-16 h-6" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenOverlay={onOpenOverlay} />
      
      {/* Scroll to top/bottom button */}
      <Button 
        variant="outline" 
        size="icon" 
        className="fixed bottom-5 right-5 z-30 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg w-10 h-10 flex items-center justify-center border border-gray-200 dark:border-gray-700"
        onClick={() => scrollToPosition(scrollDirection)}
      >
        {scrollDirection === 'top' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
      </Button>
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <Drawer open={isMainMenuOpen} onOpenChange={setIsMainMenuOpen}>
            <div className="mb-8 flex items-center justify-center gap-4">
              <DrawerTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full bg-primary dark:bg-accent text-white shadow-sm w-10 h-10 flex items-center justify-center"
                >
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Open main menu</span>
                </Button>
              </DrawerTrigger>
              
              <div className="text-center">
                <h1 className="text-3xl font-bold text-primary dark:text-accent mb-2">
                  Қуръон бо тарҷумаи тоҷикӣ
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Қуръони шариф бо тарҷума ва тафсири тоҷикӣ
                </p>
              </div>
            </div>
            
            <DrawerContent className="h-[80vh] px-0 pt-0 pb-0 bg-white dark:bg-gray-800">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-primary dark:text-accent">Меню</h2>
                  <DrawerTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-5 w-5" />
                    </Button>
                  </DrawerTrigger>
                </div>
                
                <div className="pr-3 space-y-4">
                  {/* Main Menu - Only two items as requested */}
                  <div className="mb-4">
                    <Link 
                      href="/"
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsMainMenuOpen(false)}
                    >
                      <Home className="h-4 w-4" />
                      <span>Асосӣ</span>
                    </Link>
                    <Link 
                      href="/projects"
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsMainMenuOpen(false)}
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span>Лоиҳаҳои мо</span>
                    </Link>
                  </div>

                  <Separator className="my-2" />
                  
                  {/* Popular Surahs */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Сураҳои маъмул</h3>
                    <div className="space-y-1">
                      {popularSurahs.map(surah => renderPopularSurahLink(surah))}
                    </div>
                  </div>

                  <Separator className="my-4" />
                  
                  {/* Social Media Links */}
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Шабакаҳои иҷтимоӣ</h3>
                    <div className="flex items-center space-x-4 p-2">
                      <a 
                        href="https://www.instagram.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-accent"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                      <a 
                        href="https://t.me" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-accent"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.568 7.382c-.12.55-.45.678-.913.422l-2.53-1.862-1.219 1.175c-.138.134-.253.247-.516.247l.181-2.572 4.693-4.237c.203-.18-.044-.282-.316-.101L9.36 12.756l-2.532-.806c-.55-.172-.56-.557.128-.825l9.873-3.8c.42-.167.789.106.586.897z" />
                        </svg>
                      </a>
                      <a 
                        href="https://www.facebook.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-accent"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
          
          {lastRead && (
            <Card className="mb-6 bg-primary/10 dark:bg-accent/10 border-primary dark:border-accent">
              <CardHeader>
                <CardTitle className="text-primary dark:text-accent flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Саҳифаи охирон хондашуда
                </CardTitle>
                <CardDescription>
                  Аз ҳамон ҷое, ки қатъ карда будед хонданро идома диҳед.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Сураи {lastRead.surahName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ояти {lastRead.verseNumber}</p>
                  </div>
                  <Link href={`/surah/${lastRead.surahNumber}#verse-${lastRead.verseKey.replace(':', '-')}`}>
                    <Button>
                      Идома додан
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="mb-6 relative">
            <Input
              type="text"
              placeholder="Ҷустуҷӯи сура"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-4 text-primary dark:text-accent">Рӯйхати сураҳо</h2>
            
            {isLoading ? (
              // Show loading skeletons
              Array.from({ length: 10 }).map((_, index) => renderSkeletonItem(index))
            ) : filteredSurahs && filteredSurahs.length > 0 ? (
              // Show filtered surahs in a 3-column grid on larger screens
              <div className="hidden md:grid md:grid-cols-3 md:gap-3">
                {filteredSurahs.map(surah => (
                  <Link 
                    key={surah.id} 
                    href={`/surah/${surah.number}`}
                    className="block"
                  >
                    <Card className="mb-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors h-full">
                      <CardContent className="p-3">
                        <div className="flex flex-col items-center text-center">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary dark:bg-accent text-white font-medium mb-2">
                            {surah.number}
                          </div>
                          <span className={`${getArabicFontClass('sm')} mb-1`}>{surah.name_arabic}</span>
                          <h3 className="font-medium text-sm">{surah.name_tajik}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {surah.verses_count} оят
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              // Show "no results" message
              <Card className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-2">Ягон сура ёфт нашуд</p>
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Тоза кардани ҷустуҷӯ
                </Button>
              </Card>
            )}
            
            {/* Mobile surah list view */}
            {!isLoading && filteredSurahs && filteredSurahs.length > 0 && (
              <div className="md:hidden">
                {filteredSurahs.map(surah => renderSurahItem(surah))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Қуръон бо тарҷумаи тоҷикӣ &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
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
  Search, BookOpen, ChevronRight, ArrowUp, ArrowDown
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LastReadSection {
  surahNumber: number;
  surahName: string;
  verseNumber: number;
  verseKey: string;
}

interface HomeProps {
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

export default function Home({ onOpenOverlay }: HomeProps) {
  const { data: surahs = [], isLoading } = useSurahs();
  const [filteredSurahs, setFilteredSurahs] = useState<typeof surahs>(surahs);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRead, setLastRead] = useState<LastReadSection | null>(null);
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
      const position = JSON.parse(storedPosition) as LastReadSection;
      setLastRead(position);
    }
  }, []);
  
  // Render surah list item
  const renderSurahItem = (surah: typeof surahs[0]) => (
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
  
  // Render popular surah link
  const renderPopularSurahLink = (surah: PopularSurah) => {
    const baseLinkClass = "block p-2 rounded-md";
    const inactiveLinkClass = `${baseLinkClass} hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`;
    
    return (
      <Link 
        key={surah.number} 
        href={`/surah/${surah.number}`}
        className={inactiveLinkClass}
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
  };

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
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary dark:text-accent mb-2">
              Қуръон бо тарҷумаи тоҷикӣ
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Қуръони шариф бо тарҷума ва тафсири тоҷикӣ
            </p>
          </div>
          
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
              // On mobile, show the original list view
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

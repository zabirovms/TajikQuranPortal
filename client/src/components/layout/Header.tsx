import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { GlobalOverlayType } from '@/App';
import { Surah } from '@shared/schema';
import { Link, useLocation } from 'wouter';
import { Sun, Moon, Search, BookmarkIcon, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { 
  Drawer, 
  DrawerContent, 
  DrawerTrigger,
  DrawerClose,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter
} from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';

interface HeaderProps {
  surahs?: Surah[];
  currentSurah?: Surah;
  versesCount?: number;
  onOpenOverlay: (type: GlobalOverlayType) => void;
  isLoading?: boolean;
}

export default function Header({ 
  surahs = [], 
  currentSurah, 
  versesCount = 0, 
  onOpenOverlay,
  isLoading = false 
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [location, navigate] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Navigate to the previous/next surah if available
  const goToPreviousSurah = () => {
    if (!currentSurah || currentSurah.number <= 1) return;
    navigate(`/surah/${currentSurah.number - 1}`);
  };

  const goToNextSurah = () => {
    if (!currentSurah || currentSurah.number >= 114) return;
    navigate(`/surah/${currentSurah.number + 1}`);
  };

  // Handle surah selection
  const handleSurahChange = (value: string) => {
    navigate(`/surah/${value}`);
  };

  // Handle verse selection
  const handleVerseChange = (value: string) => {
    if (!currentSurah) return;
    const verseElement = document.getElementById(`verse-${currentSurah.number}-${value}`);
    if (verseElement) {
      verseElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Only show the hamburger menu on the home page */}
          {!currentSurah && (
            <Drawer open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DrawerTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 dark:text-gray-300"
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Меню</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 space-y-3">
                  <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                    <div className="h-5 w-5" />
                    <span>Асосӣ</span>
                  </Link>
                  <Link href="/projects" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                    <div className="h-5 w-5" />
                    <span>Лоиҳаҳои мо</span>
                  </Link>
                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline">Пӯшидан</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}
          
          <Link href="/">
            <h1 className="text-xl font-bold text-primary dark:text-accent cursor-pointer">
              Қуръон <span className="text-secondary dark:text-white text-sm">бо тарҷумаи тоҷикӣ</span>
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenOverlay('search')}
            aria-label="Search"
          >
            <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenOverlay('bookmarks')}
            aria-label="Bookmarks"
          >
            <BookmarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-yellow-300" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </Button>
        </div>
      </div>
      
      {currentSurah && (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 py-2">
            {/* Mobile layout - stacked */}
            <div className="md:hidden space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 w-3/4">
                  <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Сура:</span>
                  <Select 
                    value={currentSurah.number.toString()} 
                    onValueChange={handleSurahChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select Surah" />
                    </SelectTrigger>
                    <SelectContent>
                      {surahs.map(surah => (
                        <SelectItem key={surah.id} value={surah.number.toString()}>
                          {surah.number}. {surah.name_tajik}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToPreviousSurah}
                    disabled={!currentSurah || currentSurah.number <= 1}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToNextSurah}
                    disabled={!currentSurah || currentSurah.number >= 114}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Оят:</span>
                <Select 
                  onValueChange={handleVerseChange}
                  disabled={isLoading || !versesCount}
                >
                  <SelectTrigger className="w-[80px] h-8">
                    <SelectValue placeholder="#" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: versesCount }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Desktop layout - side by side */}
            <div className="hidden md:flex md:items-center md:justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Сура:</span>
                  <Select 
                    value={currentSurah.number.toString()} 
                    onValueChange={handleSurahChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-[180px] h-8">
                      <SelectValue placeholder="Select Surah" />
                    </SelectTrigger>
                    <SelectContent>
                      {surahs.map(surah => (
                        <SelectItem key={surah.id} value={surah.number.toString()}>
                          {surah.number}. {surah.name_tajik}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Оят:</span>
                  <Select 
                    onValueChange={handleVerseChange}
                    disabled={isLoading || !versesCount}
                  >
                    <SelectTrigger className="w-[80px] h-8">
                      <SelectValue placeholder="#" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: versesCount }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPreviousSurah}
                  disabled={!currentSurah || currentSurah.number <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNextSurah}
                  disabled={!currentSurah || currentSurah.number >= 114}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

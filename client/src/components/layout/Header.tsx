import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { GlobalOverlayType } from '@/App';
import { Surah } from '@shared/schema';
import { Link, useLocation } from 'wouter';
import { Sun, Moon, Search, BookmarkIcon, Menu, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, navigate] = useLocation();
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden" 
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5 text-primary dark:text-accent" />
          </Button>
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
          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
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
      )}
    </header>
  );
}

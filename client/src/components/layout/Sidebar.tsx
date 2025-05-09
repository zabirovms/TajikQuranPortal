import { Link, useLocation } from 'wouter';
import { Surah } from '@shared/schema';
import { getArabicFontClass } from '@/lib/fonts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useEffect, useState } from 'react';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Menu, ChevronRight, X, Home, ArrowUp, ArrowDown, Facebook, Instagram } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  surahs: Surah[];
  isLoading: boolean;
  currentSurahNumber?: number;
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

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  surahs: Surah[];
  currentSurahNumber?: number;
  isLoading: boolean;
}

function MobileSidebar({ isOpen, onClose, surahs, currentSurahNumber, isLoading }: MobileSidebarProps) {
  // Render a single surah link item for mobile
  const renderSurahLink = (surah: Surah) => {
    const isActive = currentSurahNumber === surah.number;
    const baseLinkClass = "block p-2 rounded-md";
    const activeLinkClass = `${baseLinkClass} bg-gray-100 dark:bg-gray-700 text-primary dark:text-accent`;
    const inactiveLinkClass = `${baseLinkClass} hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`;
    
    return (
      <Link 
        key={surah.id} 
        href={`/surah/${surah.number}`}
        className={isActive ? activeLinkClass : inactiveLinkClass}
        onClick={onClose} // Close drawer on click
      >
        <div className="flex justify-between items-center">
          <div>
            <span className="font-medium">{surah.number}. {surah.name_tajik}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {surah.name_english} • {surah.verses_count} Оятҳо
            </p>
          </div>
          <span className={getArabicFontClass('sm')}>{surah.name_arabic}</span>
        </div>
      </Link>
    );
  };

  // Render popular surah link
  const renderPopularSurahLink = (surah: PopularSurah) => {
    const isActive = currentSurahNumber === surah.number;
    const baseLinkClass = "block p-2 rounded-md";
    const activeLinkClass = `${baseLinkClass} bg-gray-100 dark:bg-gray-700 text-primary dark:text-accent`;
    const inactiveLinkClass = `${baseLinkClass} hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`;
    
    return (
      <Link 
        key={surah.number} 
        href={`/surah/${surah.number}`}
        className={isActive ? activeLinkClass : inactiveLinkClass}
        onClick={onClose} // Close drawer on click
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
  
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-primary dark:text-accent">Меню</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-2">
              <div className="flex justify-between items-center">
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-primary dark:text-accent">Меню</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <ScrollArea className="h-[70vh]">
        <div className="pr-3 space-y-2">
          {/* Main Menu */}
          <div className="mb-4">
            <Link 
              href="/"
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={onClose}
            >
              <Home className="h-4 w-4" />
              <span>Асосӣ</span>
            </Link>
            <Link 
              href="/projects"
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={onClose}
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

          <Separator className="my-2" />
          
          {/* All Surahs */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Ҳамаи сураҳо</h3>
            <div className="space-y-1">
              {surahs.map(surah => renderSurahLink(surah))}
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
      </ScrollArea>
    </div>
  );
}

export default function Sidebar({ surahs, isLoading, currentSurahNumber }: SidebarProps) {
  const [location] = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
  
  if (isLoading) {
    return (
      <aside className="md:w-72 md:pr-6 hidden md:block">
        <div className="sticky top-32 overflow-auto max-h-[calc(100vh-8rem)] rounded-lg bg-white dark:bg-gray-800 shadow-md p-4 custom-scrollbar">
          <h2 className="text-lg font-bold mb-4 text-primary dark:text-accent border-b border-gray-200 dark:border-gray-700 pb-2">Рӯйхати сураҳо</h2>
          
          <div className="space-y-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="p-2">
                <div className="flex justify-between items-center">
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }
  
  // Render a single surah link item
  const renderSurahLink = (surah: Surah) => {
    const isActive = currentSurahNumber === surah.number;
    const baseLinkClass = "block p-2 rounded-md";
    const activeLinkClass = `${baseLinkClass} bg-gray-100 dark:bg-gray-700 text-primary dark:text-accent`;
    const inactiveLinkClass = `${baseLinkClass} hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`;
    
    return (
      <Link 
        key={surah.id} 
        href={`/surah/${surah.number}`}
        className={isActive ? activeLinkClass : inactiveLinkClass}
      >
        <div className="flex justify-between items-center">
          <div>
            <span className="font-medium">{surah.number}. {surah.name_tajik}</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {surah.name_english} • {surah.verses_count} Оятҳо
            </p>
          </div>
          <span className={getArabicFontClass('sm')}>{surah.name_arabic}</span>
        </div>
      </Link>
    );
  };
  
  // Render popular surah link
  const renderPopularSurahLink = (surah: PopularSurah) => {
    const isActive = currentSurahNumber === surah.number;
    const baseLinkClass = "block p-2 rounded-md";
    const activeLinkClass = `${baseLinkClass} bg-gray-100 dark:bg-gray-700 text-primary dark:text-accent`;
    const inactiveLinkClass = `${baseLinkClass} hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`;
    
    return (
      <Link 
        key={surah.number} 
        href={`/surah/${surah.number}`}
        className={isActive ? activeLinkClass : inactiveLinkClass}
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
    <>
      {/* Mobile sidebar drawer */}
      <div className="block md:hidden">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="fixed bottom-5 left-5 z-30 rounded-full bg-primary dark:bg-accent text-white shadow-lg w-12 h-12 flex items-center justify-center"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open navigation menu</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[85vh] px-0 pt-0 pb-0 bg-white dark:bg-gray-800">
            <MobileSidebar 
              isOpen={isDrawerOpen} 
              onClose={() => setIsDrawerOpen(false)} 
              surahs={surahs} 
              currentSurahNumber={currentSurahNumber} 
              isLoading={isLoading} 
            />
          </DrawerContent>
        </Drawer>
      </div>
      
      {/* Hamburger menu at top-left (desktop) */}
      <div className="fixed top-5 left-5 z-30 hidden md:block">
        <Drawer>
          <DrawerTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-primary dark:bg-accent text-white shadow-lg w-10 h-10 flex items-center justify-center"
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Open main menu</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[50vh] px-0 pt-0 pb-0 bg-white dark:bg-gray-800">
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
                {/* Main Menu */}
                <div className="mb-4">
                  <Link 
                    href="/"
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Home className="h-4 w-4" />
                    <span>Асосӣ</span>
                  </Link>
                  <Link 
                    href="/projects"
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span>Лоиҳаҳои мо</span>
                  </Link>
                </div>

                <Separator className="my-2" />
                
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
      </div>
      
      {/* Scroll to top/bottom button */}
      <Button 
        variant="outline" 
        size="icon" 
        className="fixed bottom-5 right-5 z-30 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg w-10 h-10 flex items-center justify-center border border-gray-200 dark:border-gray-700"
        onClick={() => scrollToPosition(scrollDirection)}
      >
        {scrollDirection === 'top' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
      </Button>
      
      {/* Desktop sidebar */}
      <aside className="md:w-72 md:pr-6 hidden md:block">
        <div className="sticky top-32 overflow-auto max-h-[calc(100vh-8rem)] rounded-lg bg-white dark:bg-gray-800 shadow-md p-4 custom-scrollbar">
          <h2 className="text-lg font-bold mb-4 text-primary dark:text-accent border-b border-gray-200 dark:border-gray-700 pb-2">Рӯйхати сураҳо</h2>
          
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Сураҳои маъмул</h3>
            <div className="space-y-1">
              {popularSurahs.map(surah => renderPopularSurahLink(surah))}
            </div>
          </div>

          <Separator className="my-4" />

          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="pr-3">
              {/* 3-column grid for surahs */}
              <div className="grid grid-cols-3 gap-1">
                {surahs.map(surah => (
                  <Link 
                    key={surah.id} 
                    href={`/surah/${surah.number}`}
                    className={`block p-2 rounded-md text-center ${
                      currentSurahNumber === surah.number 
                        ? 'bg-gray-100 dark:bg-gray-700 text-primary dark:text-accent' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-medium text-sm">{surah.number}</span>
                      <span className={`${getArabicFontClass('sm')} text-xs`}>{surah.name_arabic}</span>
                      <span className="text-xs truncate w-full">{surah.name_tajik}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </ScrollArea>
          
          <Separator className="my-4" />
          
          {/* Social Media Links */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Шабакаҳои иҷтимоӣ</h3>
            <div className="flex items-center justify-center space-x-6 p-2">
              <a 
                href="https://www.instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-accent"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://t.me" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-accent"
                aria-label="Telegram"
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
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
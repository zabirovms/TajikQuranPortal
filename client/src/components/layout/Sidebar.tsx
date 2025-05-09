import { Link, useLocation } from 'wouter';
import { Surah } from '@shared/schema';
import { getArabicFontClass } from '@/lib/fonts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface SidebarProps {
  surahs: Surah[];
  isLoading: boolean;
  currentSurahNumber?: number;
}

export default function Sidebar({ surahs, isLoading, currentSurahNumber }: SidebarProps) {
  const [location] = useLocation();
  
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
  
  return (
    <aside className="md:w-72 md:pr-6 hidden md:block">
      <div className="sticky top-32 overflow-auto max-h-[calc(100vh-8rem)] rounded-lg bg-white dark:bg-gray-800 shadow-md p-4 custom-scrollbar">
        <h2 className="text-lg font-bold mb-4 text-primary dark:text-accent border-b border-gray-200 dark:border-gray-700 pb-2">Рӯйхати сураҳо</h2>
        
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-1 pr-3">
            {surahs.map(surah => {
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
            })}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}

import { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  Moon, 
  Sun, 
  BookOpen, 
  Type, 
  AlignJustify
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { useDisplaySettings } from '@/hooks/useDisplaySettings';
import { cn } from '@/lib/utils';

export function SettingsDrawer() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { 
    tajweedMode, 
    toggleTajweedMode,
    wordByWordMode,
    toggleWordByWordMode,
    showTransliteration,
    toggleTransliteration
  } = useDisplaySettings();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          aria-label="Танзимот"
          title="Танзимот"
          className="fixed top-4 right-4 z-50 rounded-full bg-primary/10 dark:bg-accent/10 backdrop-blur"
        >
          <Settings className="h-5 w-5 text-primary dark:text-accent" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-primary dark:text-accent">Танзимот</SheetTitle>
        </SheetHeader>
        
        <div className="mt-8 space-y-6">
          {/* Display Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Намоиш</h3>
            
            {/* Word by Word mode */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="word-by-word" className="flex items-center gap-2">
                  <AlignJustify className="h-4 w-4" />
                  <span>Калима ба калима</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Намоиши оятҳо дар ҳолати калима ба калима
                </p>
              </div>
              <Switch 
                id="word-by-word" 
                checked={wordByWordMode}
                onCheckedChange={toggleWordByWordMode}
              />
            </div>
            
            {/* Tajweed mode */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="tajweed-mode" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Ҳолати таҷвид</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Намоиши матни Қуръон бо аломатҳои таҷвид
                </p>
              </div>
              <Switch 
                id="tajweed-mode" 
                checked={tajweedMode}
                onCheckedChange={toggleTajweedMode}
              />
            </div>
            
            {/* Transliteration */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="transliteration" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  <span>Талаффуз</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Намоиши талаффузи оятҳо
                </p>
              </div>
              <Switch 
                id="transliteration" 
                checked={showTransliteration}
                onCheckedChange={toggleTransliteration}
              />
            </div>
          </div>
          
          {/* Theme Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Мавзӯъ</h3>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setTheme('light')}
                className={cn(
                  "flex-1",
                  theme === 'light' && "bg-primary/10 text-primary dark:bg-accent/10 dark:text-accent"
                )}
              >
                <Sun className="h-4 w-4 mr-2" />
                Равшан
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setTheme('dark')}
                className={cn(
                  "flex-1",
                  theme === 'dark' && "bg-primary/10 text-primary dark:bg-accent/10 dark:text-accent"
                )}
              >
                <Moon className="h-4 w-4 mr-2" />
                Торик
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setTheme('system')}
                className={cn(
                  "flex-1",
                  theme === 'system' && "bg-primary/10 text-primary dark:bg-accent/10 dark:text-accent"
                )}
              >
                Ҳудкор
              </Button>
            </div>
          </div>
        </div>
        
        <SheetFooter className="mt-8">
          <p className="text-xs text-muted-foreground text-center w-full">
            Нусхаи 1.0.0 | Барномасозӣ: Qurantaj
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
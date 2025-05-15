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
import { Slider } from '@/components/ui/slider';
import { 
  Settings, 
  Moon, 
  Sun, 
  BookOpen, 
  Type, 
  AlignJustify,
  TextSelect,
  LayoutGrid,
  ArrowUpDown,
  Maximize,
  Minimize
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { useDisplaySettings, TextSizeType, ContentViewType } from '@/hooks/useDisplaySettings';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export function SettingsDrawer() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { 
    // Display modes
    tajweedMode, 
    toggleTajweedMode,
    wordByWordMode,
    toggleWordByWordMode,
    showTransliteration,
    toggleTransliteration,
    
    // Text size settings
    arabicTextSize,
    setArabicTextSize,
    translationTextSize,
    setTranslationTextSize,
    tafsirTextSize,
    setTafsirTextSize,
    
    // Content layout
    contentViewMode,
    setContentViewMode,
    
    // Line spacing
    lineSpacing,
    setLineSpacing
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
        
        <div className="mt-8 space-y-6 overflow-y-auto max-h-[80vh] pr-2 custom-scrollbar">
          {/* Display Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Ҳолати намоиш</h3>
            
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
          
          {/* Text Size Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <TextSelect className="h-5 w-5" />
              Андозаи матн
            </h3>
            
            {/* Arabic Text Size */}
            <div className="space-y-2">
              <Label htmlFor="arabic-text-size" className="text-sm">
                Матни арабӣ
              </Label>
              <Select 
                value={arabicTextSize} 
                onValueChange={(value) => setArabicTextSize(value as TextSizeType)}
              >
                <SelectTrigger id="arabic-text-size">
                  <SelectValue placeholder="Интихоб кунед" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Хурд</SelectItem>
                  <SelectItem value="medium">Миёна</SelectItem>
                  <SelectItem value="large">Калон</SelectItem>
                  <SelectItem value="extra-large">Хеле калон</SelectItem>
                </SelectContent>
              </Select>
              <div className="pt-2 flex items-center space-x-2">
                <Minimize className="h-4 w-4 text-muted-foreground" />
                <Slider 
                  id="arabic-text-size-slider"
                  defaultValue={[
                    arabicTextSize === 'small' ? 25 : 
                    arabicTextSize === 'medium' ? 50 : 
                    arabicTextSize === 'large' ? 75 : 100
                  ]}
                  max={100}
                  step={25}
                  onValueChange={(value) => {
                    const size = 
                      value[0] <= 25 ? 'small' : 
                      value[0] <= 50 ? 'medium' : 
                      value[0] <= 75 ? 'large' : 'extra-large';
                    setArabicTextSize(size as TextSizeType);
                  }}
                  className="flex-1"
                />
                <Maximize className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            {/* Translation Text Size */}
            <div className="space-y-2">
              <Label htmlFor="translation-text-size" className="text-sm">
                Тарҷумаи тоҷикӣ
              </Label>
              <Select 
                value={translationTextSize} 
                onValueChange={(value) => setTranslationTextSize(value as TextSizeType)}
              >
                <SelectTrigger id="translation-text-size">
                  <SelectValue placeholder="Интихоб кунед" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Хурд</SelectItem>
                  <SelectItem value="medium">Миёна</SelectItem>
                  <SelectItem value="large">Калон</SelectItem>
                  <SelectItem value="extra-large">Хеле калон</SelectItem>
                </SelectContent>
              </Select>
              <div className="pt-2 flex items-center space-x-2">
                <Minimize className="h-4 w-4 text-muted-foreground" />
                <Slider 
                  id="translation-text-size-slider"
                  defaultValue={[
                    translationTextSize === 'small' ? 25 : 
                    translationTextSize === 'medium' ? 50 : 
                    translationTextSize === 'large' ? 75 : 100
                  ]}
                  max={100}
                  step={25}
                  onValueChange={(value) => {
                    const size = 
                      value[0] <= 25 ? 'small' : 
                      value[0] <= 50 ? 'medium' : 
                      value[0] <= 75 ? 'large' : 'extra-large';
                    setTranslationTextSize(size as TextSizeType);
                  }}
                  className="flex-1"
                />
                <Maximize className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            {/* Tafsir Text Size */}
            <div className="space-y-2">
              <Label htmlFor="tafsir-text-size" className="text-sm">
                Тафсир
              </Label>
              <Select 
                value={tafsirTextSize} 
                onValueChange={(value) => setTafsirTextSize(value as TextSizeType)}
              >
                <SelectTrigger id="tafsir-text-size">
                  <SelectValue placeholder="Интихоб кунед" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Хурд</SelectItem>
                  <SelectItem value="medium">Миёна</SelectItem>
                  <SelectItem value="large">Калон</SelectItem>
                  <SelectItem value="extra-large">Хеле калон</SelectItem>
                </SelectContent>
              </Select>
              <div className="pt-2 flex items-center space-x-2">
                <Minimize className="h-4 w-4 text-muted-foreground" />
                <Slider 
                  id="tafsir-text-size-slider"
                  defaultValue={[
                    tafsirTextSize === 'small' ? 25 : 
                    tafsirTextSize === 'medium' ? 50 : 
                    tafsirTextSize === 'large' ? 75 : 100
                  ]}
                  max={100}
                  step={25}
                  onValueChange={(value) => {
                    const size = 
                      value[0] <= 25 ? 'small' : 
                      value[0] <= 50 ? 'medium' : 
                      value[0] <= 75 ? 'large' : 'extra-large';
                    setTafsirTextSize(size as TextSizeType);
                  }}
                  className="flex-1"
                />
                <Maximize className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          
          {/* Layout Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <LayoutGrid className="h-5 w-5" />
              Тартиби намоиш
            </h3>
            
            {/* Content View Mode */}
            <div className="space-y-2">
              <Label htmlFor="content-view-mode" className="text-sm">
                Намуди намоиши матн
              </Label>
              <Select 
                value={contentViewMode} 
                onValueChange={(value) => setContentViewMode(value as ContentViewType)}
              >
                <SelectTrigger id="content-view-mode">
                  <SelectValue placeholder="Интихоб кунед" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Фишурда</SelectItem>
                  <SelectItem value="comfortable">Мувофиқ</SelectItem>
                  <SelectItem value="expanded">Васеъ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Line Spacing */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Фосилаи сатрҳо
              </Label>
              <div className="pt-2 flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">Кам</span>
                <Slider 
                  defaultValue={[lineSpacing * 50]}
                  min={60}
                  max={100}
                  step={10}
                  onValueChange={(value) => {
                    const spacing = value[0] / 50;
                    setLineSpacing(spacing);
                  }}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground">Зиёд</span>
              </div>
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
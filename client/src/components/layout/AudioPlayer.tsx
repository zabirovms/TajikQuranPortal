import { useAudioPlayer, availableReciters } from '@/hooks/useAudio';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat } from 'lucide-react';
import { useEffect, useState } from 'react';

// Format time in MM:SS format
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function AudioPlayer() {
  const { audioState, togglePlayPause, seekTo, setReciter } = useAudioPlayer();
  const [progressPercentage, setProgressPercentage] = useState(0);

  // Update the progress bar as audio plays
  useEffect(() => {
    if (audioState.duration > 0) {
      setProgressPercentage((audioState.currentTime / audioState.duration) * 100);
    } else {
      setProgressPercentage(0);
    }
  }, [audioState.currentTime, audioState.duration]);

  // Handler for reciter change
  const handleReciterChange = (value: string) => {
    setReciter(value);
  };

  // If there's no current verse, don't render the player
  if (!audioState.currentVerse) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center">
          <div className="w-24 text-sm text-gray-600 dark:text-gray-400">
            <div className="font-medium">{audioState.currentVerse.key}</div>
            <div className="text-xs">{audioState.currentVerse.surahName}</div>
          </div>
          
          <div className="flex-1 flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-accent"
              disabled={true} // Disabled for now, can be implemented later
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              className="w-10 h-10 rounded-full bg-primary dark:bg-accent text-white hover:bg-primary/90 dark:hover:bg-accent/90 flex items-center justify-center"
              onClick={togglePlayPause}
              disabled={audioState.loading}
            >
              {audioState.loading ? (
                <span className="h-5 w-5 animate-pulse">...</span>
              ) : audioState.isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-accent"
              disabled={true} // Disabled for now, can be implemented later
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <div className="hidden sm:flex flex-1 items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(audioState.currentTime)}
              </span>
              
              <Slider
                className="h-1.5"
                value={[progressPercentage]}
                onValueChange={(values) => {
                  const newTime = (values[0] / 100) * audioState.duration;
                  seekTo(newTime);
                }}
                disabled={audioState.duration === 0}
              />
              
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(audioState.duration)}
              </span>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-accent"
              disabled={true} // Volume control to be implemented later
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-accent"
              disabled={true} // Repeat to be implemented later
            >
              <Repeat className="h-4 w-4" />
            </Button>
            
            <Select 
              value={audioState.reciterId} 
              onValueChange={handleReciterChange}
            >
              <SelectTrigger className="bg-gray-100 dark:bg-gray-700 border-none text-sm h-8 w-40">
                <SelectValue placeholder="Select reciter" />
              </SelectTrigger>
              <SelectContent>
                {availableReciters.map(reciter => (
                  <SelectItem key={reciter.id} value={reciter.id}>
                    {reciter.englishName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

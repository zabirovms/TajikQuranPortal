import { useAudioPlayer, availableReciters } from '@/hooks/useAudio';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, StopCircle, Square } from 'lucide-react';
import { useEffect, useState } from 'react';

// Format time in MM:SS format
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function AudioPlayer() {
  const { audioState, togglePlayPause, seekTo, setReciter, stopAudio } = useAudioPlayer();
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

  // Don't render the player if there's nothing playing
  const isPlaying = Boolean(audioState.currentVerse || audioState.playingEntireSurah);
  if (!isPlaying) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center">
          <div className="w-24 text-sm text-gray-600 dark:text-gray-400">
            {audioState.currentVerse ? (
              <>
                <div className="font-medium">{audioState.currentVerse.key}</div>
                <div className="text-xs">{audioState.currentVerse.surahName}</div>
              </>
            ) : audioState.playingEntireSurah ? (
              <>
                <div className="font-medium">Сураи {audioState.playingEntireSurah.surahNumber}</div>
                <div className="text-xs">{audioState.playingEntireSurah.surahName}</div>
              </>
            ) : null}
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
            
            {/* Show different controls based on what's playing */}
            {audioState.playingEntireSurah ? (
              // Stop button for surah playback
              <Button
                className="w-8 h-8 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center"
                onClick={stopAudio}
                disabled={audioState.loading}
                title="Stop playback"
              >
                <Square className="h-3.5 w-3.5" />
              </Button>
            ) : (
              // Regular forward button (disabled for now)
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-accent"
                disabled={true}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            )}
            
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

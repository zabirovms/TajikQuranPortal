import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  loading: boolean;
  currentVerse?: {
    key: string;
    surahName: string;
    verseNumber: number;
  };
  playingEntireSurah?: {
    surahNumber: number;
    surahName: string;
  };
  reciterId: string;
}

// Available Qari (reciters) from AlQuran.Cloud API
export interface Reciter {
  id: string;
  name: string;
  englishName: string;
}

export const availableReciters: Reciter[] = [
  { id: 'ar.alafasy', name: 'مشاري العفاسي', englishName: 'Mishary Rashid Alafasy' },
  { id: 'ar.abdullahbasfar', name: 'عبد الله بصفر', englishName: 'Abdullah Basfar' },
  { id: 'ar.abdurrahmaansudais', name: 'عبدالرحمن السديس', englishName: 'Abdurrahmaan As-Sudais' },
  { id: 'ar.mahermuaiqly', name: 'ماهر المعيقلي', englishName: 'Maher Al Muaiqly' },
  { id: 'ar.muhammadayyoub', name: 'محمد أيوب', englishName: 'Muhammad Ayyoub' },
];

export function useAudioPlayer() {
  const { toast } = useToast();
  const [audioState, setAudioState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    loading: false,
    currentVerse: undefined,
    reciterId: 'ar.alafasy', // Default reciter
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);
  
  // Set up audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      audioRef.current.addEventListener('loadstart', () => {
        setAudioState(prev => ({ ...prev, loading: true }));
      });
      
      audioRef.current.addEventListener('loadeddata', () => {
        setAudioState(prev => ({ 
          ...prev, 
          loading: false,
          duration: audioRef.current?.duration || 0 
        }));
      });
      
      audioRef.current.addEventListener('ended', () => {
        setAudioState(prev => ({ ...prev, isPlaying: false }));
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      });
      
      audioRef.current.addEventListener('error', () => {
        setAudioState(prev => ({ ...prev, loading: false, isPlaying: false }));
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      });
    }
  }, []);
  
  // Set reciter
  const setReciter = useCallback((reciterId: string) => {
    setAudioState(prev => ({ ...prev, reciterId }));
    
    // Save preference to localStorage
    localStorage.setItem('preferredReciter', reciterId);
    
    // Show toast notification
    const reciter = availableReciters.find(r => r.id === reciterId);
    if (reciter) {
      toast({
        title: "Reciter changed",
        description: `Now playing audio from ${reciter.englishName}`,
      });
    }
  }, [toast]);
  
  // Load stored reciter preference
  useEffect(() => {
    const storedReciter = localStorage.getItem('preferredReciter');
    if (storedReciter && availableReciters.some(r => r.id === storedReciter)) {
      setAudioState(prev => ({ ...prev, reciterId: storedReciter }));
    }
  }, []);
  
  // Get audio URL - Try direct URL first, then fallback to API
  const getAudioUrl = useCallback(async (verseKey: string): Promise<string> => {
    try {
      // Direct URL approach - format the verse key from "1:1" to "1_1" for the URL
      const formattedKey = verseKey.replace(':', '_');
      
      // Audio URL format: https://cdn.islamic.network/quran/audio/128/ar.alafasy/1_1.mp3
      const directUrl = `https://cdn.islamic.network/quran/audio/128/${audioState.reciterId}/${formattedKey}.mp3`;
      
      console.log('Trying direct URL:', directUrl);
      
      // Try a HEAD request first to verify the file exists
      try {
        const response = await fetch(directUrl, { method: 'HEAD' });
        
        if (response.ok) {
          return directUrl;
        }
      } catch (e) {
        console.warn('HEAD request failed, will try API fallback', e);
      }
      
      // Fallback to API method if direct URL fails
      console.log('Using API fallback for audio URL');
      const apiResponse = await fetch(`https://api.alquran.cloud/v1/ayah/${verseKey}/${audioState.reciterId}`);
      const data = await apiResponse.json();
      
      if (data.code === 200 && data.data && data.data.audio) {
        return data.data.audio;
      } else {
        throw new Error('Audio URL not found');
      }
    } catch (error) {
      console.error('Error fetching audio URL:', error);
      throw error;
    }
  }, [audioState.reciterId]);
  
  // Play audio function
  const playAudio = useCallback((verseKey: string, verseInfo?: { surahName: string; verseNumber: number }) => {
    if (!audioRef.current) return;
    
    // Stop current audio if playing
    if (audioState.isPlaying) {
      audioRef.current.pause();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    // Show loading state immediately
    setAudioState(prev => ({ ...prev, loading: true }));
    
    // Get audio URL from AlQuran Cloud API (async)
    getAudioUrl(verseKey)
      .then(audioUrl => {
        if (!audioRef.current) return;
        
        // Set new audio source
        audioRef.current.src = audioUrl;
        audioRef.current.currentTime = 0;
        
        // Play the audio
        return audioRef.current.play();
      })
      .then(() => {
        setAudioState(prev => ({ 
          ...prev, 
          isPlaying: true,
          loading: false,
          currentVerse: verseInfo ? { ...verseInfo, key: verseKey } : undefined
        }));
        
        // Start interval for tracking current time
        intervalRef.current = setInterval(() => {
          if (audioRef.current) {
            setAudioState(prev => ({ 
              ...prev, 
              currentTime: audioRef.current?.currentTime || 0 
            }));
          }
        }, 1000);
      })
      .catch(err => {
        console.error('Error playing audio:', err);
        
        // Show more detailed error message
        let errorMessage = "Could not play audio. ";
        
        if (err instanceof DOMException && err.name === 'NotSupportedError') {
          errorMessage += "Audio format not supported.";
        } else if (err instanceof DOMException && err.name === 'NotAllowedError') {
          errorMessage += "Autoplay blocked by browser.";
        } else if (err instanceof DOMException && err.name === 'AbortError') {
          errorMessage += "Playback was aborted.";
        } else if (err.message) {
          errorMessage += err.message;
        } else {
          errorMessage += "Try again or select another reciter.";
        }
        
        toast({
          title: "Playback Error",
          description: errorMessage,
          variant: "destructive"
        });
        
        setAudioState(prev => ({ ...prev, loading: false, isPlaying: false }));
      });
  }, [audioState.isPlaying, getAudioUrl, toast]);
  
  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !audioRef.current.src) return;
    
    if (audioState.isPlaying) {
      audioRef.current.pause();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    } else {
      audioRef.current.play().then(() => {
        setAudioState(prev => ({ ...prev, isPlaying: true }));
        
        intervalRef.current = setInterval(() => {
          if (audioRef.current) {
            setAudioState(prev => ({ 
              ...prev, 
              currentTime: audioRef.current?.currentTime || 0 
            }));
          }
        }, 1000);
      }).catch(err => {
        console.error('Error resuming audio playback:', err);
        
        // Show more detailed error message for resume playback
        let errorMessage = "Could not resume audio playback. ";
        
        if (err instanceof DOMException && err.name === 'NotSupportedError') {
          errorMessage += "Audio format not supported.";
        } else if (err instanceof DOMException && err.name === 'NotAllowedError') {
          errorMessage += "Autoplay blocked by browser.";
        } else if (err instanceof DOMException && err.name === 'AbortError') {
          errorMessage += "Playback was aborted.";
        } else if (err.message) {
          errorMessage += err.message;
        }
        
        toast({
          title: "Playback Error",
          description: errorMessage,
          variant: "destructive"
        });
      });
    }
  }, [audioState.isPlaying, toast]);
  
  // Seek to a specific time
  const seekTo = useCallback((time: number) => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = time;
    setAudioState(prev => ({ ...prev, currentTime: time }));
  }, []);
  
  // Play entire surah audio
  const playSurah = useCallback((surahNumber: number, surahName: string) => {
    if (!audioRef.current) return;
    
    // Stop current audio if playing
    if (audioState.isPlaying) {
      audioRef.current.pause();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    // Show loading state immediately
    setAudioState(prev => ({ 
      ...prev, 
      loading: true,
      currentVerse: undefined // Clear current verse since we're playing a full surah
    }));
    
    // Construct the URL for entire surah audio
    // Format: https://cdn.islamic.network/quran/audio-surah/128/{edition}/{number}.mp3
    const surahAudioUrl = `https://cdn.islamic.network/quran/audio-surah/128/${audioState.reciterId}/${surahNumber}.mp3`;
    
    console.log('Trying to play surah audio from:', surahAudioUrl);
    
    try {
      if (!audioRef.current) return;
      
      // Set new audio source
      audioRef.current.src = surahAudioUrl;
      audioRef.current.currentTime = 0;
      
      // Play the audio
      audioRef.current.play()
        .then(() => {
          setAudioState(prev => ({ 
            ...prev, 
            isPlaying: true,
            loading: false,
            playingEntireSurah: { 
              surahNumber, 
              surahName 
            }
          }));
          
          // Start interval for tracking current time
          intervalRef.current = setInterval(() => {
            if (audioRef.current) {
              setAudioState(prev => ({ 
                ...prev, 
                currentTime: audioRef.current?.currentTime || 0 
              }));
            }
          }, 1000);
        })
        .catch(err => {
          console.error('Error playing surah audio:', err);
          
          // Show more detailed error message
          let errorMessage = "Could not play surah audio. ";
          
          if (err instanceof DOMException && err.name === 'NotSupportedError') {
            errorMessage += "Audio format not supported.";
          } else if (err instanceof DOMException && err.name === 'NotAllowedError') {
            errorMessage += "Autoplay blocked by browser.";
          } else if (err instanceof DOMException && err.name === 'AbortError') {
            errorMessage += "Playback was aborted.";
          } else if (err.message) {
            errorMessage += err.message;
          } else {
            errorMessage += "Try again or select another reciter.";
          }
          
          toast({
            title: "Playback Error",
            description: errorMessage,
            variant: "destructive"
          });
          
          setAudioState(prev => ({ 
            ...prev, 
            loading: false, 
            isPlaying: false,
            playingEntireSurah: undefined
          }));
        });
    } catch (error) {
      console.error('Error setting up surah audio:', error);
      toast({
        title: "Playback Error",
        description: "Could not access surah audio. Please try again later.",
        variant: "destructive"
      });
      setAudioState(prev => ({ 
        ...prev, 
        loading: false, 
        isPlaying: false,
        playingEntireSurah: undefined
      }));
    }
  }, [audioState.isPlaying, audioState.reciterId, toast]);

  // Stop audio
  const stopAudio = useCallback(() => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setAudioState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
      currentVerse: undefined,
      playingEntireSurah: undefined
    }));
  }, []);
  
  return {
    audioState,
    playAudio,
    playSurah,
    togglePlayPause,
    seekTo,
    stopAudio,
    setReciter,
    availableReciters
  };
}

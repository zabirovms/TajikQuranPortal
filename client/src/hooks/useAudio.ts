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
  
  // Get audio URL from AlQuran Cloud API
  const getAudioUrl = useCallback((verseKey: string): string => {
    const [surahNum, verseNum] = verseKey.split(':');
    return `https://cdn.islamic.network/quran/audio/128/${audioState.reciterId}/${verseNum}.mp3?surah=${surahNum}`;
  }, [audioState.reciterId]);
  
  // Play audio function
  const playAudio = useCallback((verseKey: string, verseInfo?: Omit<AudioPlayerState['currentVerse'], 'key'>) => {
    if (!audioRef.current) return;
    
    // Stop current audio if playing
    if (audioState.isPlaying) {
      audioRef.current.pause();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    // Get audio URL from AlQuran Cloud API
    const audioUrl = getAudioUrl(verseKey);
    
    // Set new audio source
    audioRef.current.src = audioUrl;
    audioRef.current.currentTime = 0;
    
    setAudioState(prev => ({ ...prev, loading: true }));
    
    // Play the audio
    audioRef.current.play().then(() => {
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
    }).catch(err => {
      console.error('Error playing audio:', err);
      toast({
        title: "Playback Error",
        description: "Could not play audio. Please try again or select another reciter.",
        variant: "destructive"
      });
      setAudioState(prev => ({ ...prev, loading: false, isPlaying: false }));
    });
  }, [audioState.isPlaying, audioState.reciterId, getAudioUrl, toast]);
  
  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    
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
        console.error('Error playing audio:', err);
      });
    }
  }, [audioState.isPlaying]);
  
  // Seek to a specific time
  const seekTo = useCallback((time: number) => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = time;
    setAudioState(prev => ({ ...prev, currentTime: time }));
  }, []);
  
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
      currentVerse: undefined
    }));
  }, []);
  
  return {
    audioState,
    playAudio,
    togglePlayPause,
    seekTo,
    stopAudio
  };
}

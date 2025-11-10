import { useState, useCallback, useEffect, useRef } from 'react';

interface UseSpeechSynthesisOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isMountedRef = useRef(true);
  const isCleaningUpRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    setIsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        if (isMountedRef.current) {
          const availableVoices = window.speechSynthesis.getVoices();
          setVoices(availableVoices);
        }
      };

      loadVoices();
      
      // Handle voices loaded event
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }

      return () => {
        isMountedRef.current = false;
        
        // Cancel any ongoing speech on unmount
        if (window.speechSynthesis && utteranceRef.current) {
          isCleaningUpRef.current = true;
          try {
            window.speechSynthesis.cancel();
          } catch (error) {
            console.warn('Error canceling speech on unmount:', error);
          }
        }
        
        if (window.speechSynthesis) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      // Check if supported and component is still mounted
      if (!isSupported || !isMountedRef.current) {
        console.warn('Speech synthesis not available');
        return;
      }
      
      // Prevent duplicate speech
      if (isSpeaking && utteranceRef.current) {
        console.log('[Speech] Prevented duplicate - already speaking');
        return;
      }

      try {
        // Cancel any ongoing speech before starting new one
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          
          // Small delay to ensure cancellation completes
          setTimeout(() => {
            if (!isMountedRef.current || isCleaningUpRef.current) return;
            
            const utterance = new SpeechSynthesisUtterance(text);
            utteranceRef.current = utterance;

            // Configure utterance
            utterance.rate = options.rate ?? 0.95;
            utterance.pitch = options.pitch ?? 1.0;
            utterance.volume = options.volume ?? 1.0;

            // Select voice - prefer female voices for Luna
            if (options.voice) {
              utterance.voice = options.voice;
            } else {
              const femaleVoice = voices.find(
                (v) => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Zira')
              ) || voices.find((v) => v.lang.startsWith('en')) || voices[0];
              
              if (femaleVoice) {
                utterance.voice = femaleVoice;
              }
            }

            // Event handlers
            utterance.onstart = () => {
              if (!isMountedRef.current) return;
              setIsSpeaking(true);
              options.onStart?.();
            };

            utterance.onend = () => {
              if (!isMountedRef.current) return;
              setIsSpeaking(false);
              utteranceRef.current = null;
              options.onEnd?.();
            };

            utterance.onerror = (event) => {
              if (!isMountedRef.current || isCleaningUpRef.current) {
                // Ignore errors during cleanup or after unmount
                console.log('[Speech] Ignoring error during cleanup:', event.error);
                return;
              }
              
              setIsSpeaking(false);
              utteranceRef.current = null;
              
              // Handle specific error types
              let errorMessage = 'Speech synthesis error';
              switch (event.error) {
                case 'interrupted':
                  // Don't report interrupted as error if we're cleaning up
                  if (isCleaningUpRef.current) {
                    console.log('[Speech] Speech interrupted during cleanup (expected)');
                    return;
                  }
                  errorMessage = 'Speech was interrupted';
                  break;
                case 'audio-busy':
                  errorMessage = 'Audio device is busy';
                  break;
                case 'audio-hardware':
                  errorMessage = 'Audio hardware error';
                  break;
                case 'network':
                  errorMessage = 'Network error occurred';
                  break;
                case 'synthesis-unavailable':
                  errorMessage = 'Speech synthesis unavailable';
                  break;
                case 'synthesis-failed':
                  errorMessage = 'Speech synthesis failed';
                  break;
                case 'language-unavailable':
                  errorMessage = 'Language unavailable';
                  break;
                case 'voice-unavailable':
                  errorMessage = 'Voice unavailable';
                  break;
                case 'text-too-long':
                  errorMessage = 'Text too long for synthesis';
                  break;
                default:
                  errorMessage = `Speech synthesis error: ${event.error}`;
              }
              
              const error = new Error(errorMessage);
              console.error('[Speech]', errorMessage);
              options.onError?.(error);
            };

            // Speak with error handling
            try {
              window.speechSynthesis.speak(utterance);
            } catch (error) {
              console.error('[Speech] Failed to speak:', error);
              setIsSpeaking(false);
              utteranceRef.current = null;
              options.onError?.(error as Error);
            }
          }, 50); // Small delay to prevent interruption errors
        }
      } catch (error) {
        console.error('[Speech] Error in speak function:', error);
        setIsSpeaking(false);
        utteranceRef.current = null;
        options.onError?.(error as Error);
      }
    },
    [isSupported, voices, options, isSpeaking]
  );

  const cancel = useCallback(() => {
    if (!isSupported || typeof window === 'undefined') return;
    
    isCleaningUpRef.current = true;
    
    try {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      utteranceRef.current = null;
    } catch (error) {
      console.warn('[Speech] Error during cancel:', error);
    } finally {
      // Reset cleanup flag after a delay
      setTimeout(() => {
        isCleaningUpRef.current = false;
      }, 100);
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && typeof window !== 'undefined') {
      try {
        window.speechSynthesis.pause();
      } catch (error) {
        console.warn('[Speech] Error during pause:', error);
      }
    }
  }, [isSupported]);

  const resume = useCallback(() => {
    if (isSupported && typeof window !== 'undefined') {
      try {
        window.speechSynthesis.resume();
      } catch (error) {
        console.warn('[Speech] Error during resume:', error);
      }
    }
  }, [isSupported]);

  return {
    speak,
    cancel,
    pause,
    resume,
    isSpeaking,
    isSupported,
    voices,
  };
}

import { useState, useCallback, useEffect, useRef } from 'react';

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string, isFinal: boolean) => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
  lang?: string;
}

/**
 * useSpeechRecognition (Whisper-backed)
 *
 * Records audio from the user's microphone, sends it to the
 * `/api/luna/whisper` endpoint, and returns the transcribed text.
 *
 * This replaces the previous Web Speech API implementation so that
 * voice input is consistently routed through OpenAI Whisper and then
 * handled like a normal chat message.
 */
export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    if (typeof window !== 'undefined') {
      const hasMediaDevices =
        typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
      const hasMediaRecorder = typeof window.MediaRecorder !== 'undefined';
      setIsSupported(hasMediaDevices && hasMediaRecorder);
    }

    return () => {
      isMountedRef.current = false;
      // Cleanup any active recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      console.warn('Whisper recording not supported in this browser');
      options.onError?.(new Error('Microphone recording is not supported in this browser.'));
      return;
    }

    if (isListening) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.onstart = () => {
        if (!isMountedRef.current) return;
        setIsListening(true);
        setTranscript('');
      };

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        if (!isMountedRef.current) return;
        setIsListening(false);
        options.onError?.(new Error(`Recording error: ${event.error?.name || 'unknown'}`));
      };

      recorder.onstop = async () => {
        if (!isMountedRef.current) return;

        setIsListening(false);

        // Stop all tracks so the mic is released
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];

        if (audioBlob.size === 0) {
          options.onEnd?.();
          return;
        }

        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');
          if (options.lang) {
            formData.append('lang', options.lang);
          }

          const response = await fetch('/api/luna/whisper', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Whisper API error: ${response.status} ${response.statusText} - ${errorText}`
            );
          }

          const data = (await response.json()) as { text?: string };
          const text = data.text?.trim();

          if (text && isMountedRef.current) {
            setTranscript(text);
            options.onResult?.(text, true);
          }
        } catch (error) {
          console.error('Failed to transcribe audio with Whisper:', error);
          if (isMountedRef.current) {
            options.onError?.(
              error instanceof Error
                ? error
                : new Error('Failed to transcribe audio with Whisper.')
            );
          }
        } finally {
          if (isMountedRef.current) {
            options.onEnd?.();
          }
        }
      };

      recorder.start();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      if (!isMountedRef.current) return;
      setIsListening(false);
      options.onError?.(
        error instanceof Error
          ? error
          : new Error('Unable to access microphone for recording.')
      );
    }
  }, [isSupported, isListening, options]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.warn('Error stopping recorder:', error);
      }
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    startListening,
    stopListening,
    resetTranscript,
    isListening,
    isSupported,
    transcript,
  };
}


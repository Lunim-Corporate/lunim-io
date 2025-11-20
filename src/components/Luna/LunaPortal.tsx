'use client';

import { useReducer, useCallback, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Download, Play, Settings } from 'lucide-react';
import Image from 'next/image';
import lunaImage from '@/assets/luna.png';
import { lunaReducer, initialLunaState } from './lunaReducer';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { LunaPortrait } from './components/LunaPortrait';
import { VoiceControls } from './components/VoiceControls';
import { LunaCaption } from './components/LunaCaption';
import { SpeechErrorBoundary } from './components/SpeechErrorBoundary';
import { PrivacyMode } from './types';
import { lunaAnalytics } from './utils/analytics';
import { generatePlanPDF, downloadPDF } from './utils/pdf';
import { speechManager } from './utils/speechManager';

interface LunaPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

function LunaPortalContent({ isOpen, onClose }: LunaPortalProps) {
  const [state, dispatch] = useReducer(lunaReducer, initialLunaState);
  const [textInput, setTextInput] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [ttsRate, setTtsRate] = useState(0.95);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [reduceMotionManual, setReduceMotionManual] = useState(false);
  const reduceMotion = prefersReducedMotion || reduceMotionManual;
  const wasOpenRef = useRef(isOpen);

  // Speech synthesis for Luna's voice
  // Ref to track if speech is in progress to prevent duplicates
  const speechQueueRef = useRef<string | null>(null);
  
  // Refs to access latest state in callbacks without triggering re-renders
  const stateRef = useRef(state);
  const listeningCallbacksRef = useRef<{
    start: (() => void) | null;
    stop: (() => void) | null;
    isListening: boolean;
  }>({ start: null, stop: null, isListening: false });
  
  // Update refs when state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Detect when the portal is closed to end the analytics session
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      console.log('[Luna] Portal closed, ending analytics session');
      lunaAnalytics.endSession();
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  // Auto-hide confetti after a short duration
  useEffect(() => {
    if (!showConfetti) return;
    const timeout = setTimeout(
      () => setShowConfetti(false),
      reduceMotion ? 500 : 1500
    );
    return () => clearTimeout(timeout);
  }, [showConfetti, reduceMotion]);
  
  const { speak: speakRaw, cancel: cancelSpeech, isSpeaking } = useSpeechSynthesis({
    onStart: () => {
      console.log('[Luna] Speech started');
      dispatch({ type: 'SET_SPEAKING', payload: true });
      // Stop listening when Luna starts speaking
      if (listeningCallbacksRef.current.isListening && listeningCallbacksRef.current.stop) {
        console.log('[Luna] Stopping listening because Luna is speaking');
        listeningCallbacksRef.current.stop();
      }
    },
    onEnd: () => {
      console.log('[Luna] Speech ended');
      dispatch({ type: 'SET_SPEAKING', payload: false });
      speechQueueRef.current = null;
      
      // Auto-enable microphone after Luna finishes speaking (only in voice mode)
      setTimeout(() => {
        const currentState = stateRef.current;
        if (currentState.interactionMode === 'voice' && 
            currentState.session && 
            !listeningCallbacksRef.current.isListening && 
            currentState.state !== 'plan-ready' &&
            listeningCallbacksRef.current.start) {
          console.log('[Luna] Auto-starting listening after speech ended');
          listeningCallbacksRef.current.start();
        }
      }, 500);
    },
    onError: (error) => {
      console.error('Speech synthesis error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      speechQueueRef.current = null;
    },
    rate: ttsRate,
  });
  
  // Wrap speak function to prevent duplicates
  const speak = useCallback((text: string) => {
    // Only prevent if currently speaking (not based on text content)
    if (isSpeaking) {
      console.log('[Luna] Prevented speech - already speaking');
      return;
    }
    
    // Prevent duplicate speech requests in quick succession
    if (speechQueueRef.current === text) {
      console.log('[Luna] Prevented duplicate speech request:', text.substring(0, 50));
      return;
    }
    
    console.log('[Luna] Speaking:', text.substring(0, 100));
    speechQueueRef.current = text;
    speakRaw(text);
  }, [speakRaw, isSpeaking]);

  // Speech recognition for user input
  const processedInputRef = useRef<Set<string>>(new Set());
  
  const { startListening, stopListening, isListening, resetTranscript } = 
    useSpeechRecognition({
      onResult: (text, isFinal) => {
        dispatch({ type: 'SET_CAPTION', payload: text });
        if (isFinal && text.trim()) {
          // Prevent processing the same input multiple times
          const inputKey = text.trim().toLowerCase();
          if (!processedInputRef.current.has(inputKey)) {
            processedInputRef.current.add(inputKey);
            console.log('[Luna] Processing user input:', text.substring(0, 50));
            handleUserInput(text);
            
            // Clear processed inputs after a delay
            setTimeout(() => {
              processedInputRef.current.delete(inputKey);
            }, 10000);
          } else {
            console.log('[Luna] Skipped duplicate input:', text.substring(0, 50));
          }
        }
      },
      onError: (error) => {
        console.error('Speech recognition error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Could not hear you. Please try again.' });
      },
    });

  // Update listening callbacks ref
  useEffect(() => {
    listeningCallbacksRef.current = {
      start: startListening,
      stop: stopListening,
      isListening,
    };
  }, [startListening, stopListening, isListening]);
  
  // Sync listening state
  useEffect(() => {
    dispatch({ type: 'SET_LISTENING', payload: isListening });
  }, [isListening]);

  // Sync speaking state
  useEffect(() => {
    dispatch({ type: 'SET_SPEAKING', payload: isSpeaking });
  }, [isSpeaking]);
  
  // Cleanup on unmount and route changes
  useEffect(() => {
    // Handle route changes in Next.js
    const handleRouteChange = () => {
      console.log('[Luna] Route change detected, cleaning up speech');
      cancelSpeech();
      speechManager.cancel();
    };

    // Listen for Next.js route changes
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleRouteChange);
      // For Next.js app router
      window.addEventListener('popstate', handleRouteChange);
    }

    return () => {
      console.log('[Luna] Component unmounting, cleaning up');
      cancelSpeech();
      speechManager.cancel();
      if (isListening) {
        stopListening();
      }
      // End analytics session
      lunaAnalytics.endSession();
      
      // Remove event listeners
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleRouteChange);
        window.removeEventListener('popstate', handleRouteChange);
      }
    };
  }, [cancelSpeech, isListening, stopListening]);

  // Initialize session with greeting
  const startSession = useCallback((privacyMode: PrivacyMode) => {
    console.log('[Luna] Starting session with privacy mode:', privacyMode);
    
    dispatch({ type: 'START_SESSION', payload: privacyMode });
    
    // Start analytics tracking
    const sessionId = `session-${Date.now()}`;
    lunaAnalytics.startSession(sessionId, privacyMode);
    
    const greeting = "Hi! I'm Luna, your guide at Lunim Studio. Tell me about your project and I'll help you find the perfect next steps.";
    
    dispatch({ type: 'ADD_MESSAGE', payload: { role: 'luna', content: greeting } });
    dispatch({ type: 'SET_CAPTION', payload: greeting });
    lunaAnalytics.trackMessage('luna', greeting);
    
    // Delay speaking slightly to ensure state is updated
    // Use stateRef to get the current interaction mode
    setTimeout(() => {
      const currentMode = stateRef.current.interactionMode;
      console.log('[Luna] Current interaction mode:', currentMode);
      if (currentMode === 'voice') {
        speak(greeting);
      }
    }, 100);
  }, [speak]);

  // Handle user input from voice or text
  const handleUserInput = useCallback(async (input: string) => {
    if (!input.trim() || !state.session) return;

    dispatch({ type: 'ADD_MESSAGE', payload: { role: 'user', content: input } });
    dispatch({ type: 'SET_STATE', payload: 'thinking' });
    dispatch({ type: 'SET_CAPTION', payload: '' });
    resetTranscript();
    
    // Track user message
    lunaAnalytics.trackMessage('user', input);

    try {
      // Phase 1: Get clarifying questions
      if (!state.session.clarify) {
        const response = await fetch('/api/luna/clarify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userMessage: input,
            privacyMode: state.session.privacyMode,
          }),
        });

        const { data } = await response.json();
        dispatch({ type: 'SET_CLARIFY', payload: data });
        
        const firstQuestion = data.understanding + ' ' + data.questions[0];
        dispatch({ type: 'ADD_MESSAGE', payload: { role: 'luna', content: firstQuestion } });
        dispatch({ type: 'SET_CAPTION', payload: firstQuestion });
        lunaAnalytics.trackMessage('luna', firstQuestion);
        lunaAnalytics.trackClarifyPhase(1);
        
        // Use stateRef to get current mode to avoid stale closure
        const currentMode = stateRef.current.interactionMode;
        console.log('[Luna] Speaking clarify question, mode:', currentMode);
        if (currentMode === 'voice') {
          speak(firstQuestion);
        }
        
        setCurrentQuestionIndex(0);
      } 
      // Continue with clarifying questions
      else if (state.session.clarify && currentQuestionIndex < state.session.clarify.questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        const nextQuestion = state.session.clarify.questions[nextIndex];
        
        dispatch({ type: 'ADD_MESSAGE', payload: { role: 'luna', content: nextQuestion } });
        dispatch({ type: 'SET_CAPTION', payload: nextQuestion });
        dispatch({ type: 'SET_STATE', payload: 'clarify' });
        lunaAnalytics.trackMessage('luna', nextQuestion);
        lunaAnalytics.trackClarifyPhase(nextIndex + 1);
        
        // Use stateRef to get current mode to avoid stale closure
        const currentMode = stateRef.current.interactionMode;
        console.log('[Luna] Speaking follow-up question, mode:', currentMode);
        if (currentMode === 'voice') {
          speak(nextQuestion);
        }
        
        setCurrentQuestionIndex(nextIndex);
      }
      // Phase 2: Generate plan
      else {
        const response = await fetch('/api/luna/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation: state.session.messages,
            privacyMode: state.session.privacyMode,
          }),
        });

        const { data } = await response.json();
        dispatch({ type: 'SET_PLAN', payload: data });
        
        const planMessage = `Great! ${data.summary}`;
        dispatch({ type: 'ADD_MESSAGE', payload: { role: 'luna', content: planMessage } });
        dispatch({ type: 'SET_CAPTION', payload: planMessage });
        lunaAnalytics.trackMessage('luna', planMessage);
        lunaAnalytics.trackPlanGenerated({
          summary: data.summary,
          nextStepsCount: data.nextSteps.length,
          estimatedScope: data.estimatedScope,
          tags: data.tags,
        });
        
        // Use stateRef to get current mode to avoid stale closure
        const currentMode = stateRef.current.interactionMode;
        console.log('[Luna] Speaking plan message, mode:', currentMode);
        if (currentMode === 'voice') {
          speak(planMessage);
        }
      }
    } catch (error) {
      console.error('Error processing input:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Something went wrong. Please try again.' });
    }
  }, [state, speak, resetTranscript, currentQuestionIndex]);

  // Handle microphone click
  const handleMicClick = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Handle text input submit
  const handleTextSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleUserInput(textInput);
      setTextInput('');
    }
  }, [textInput, handleUserInput]);

  // Handle mode changes
  const handleModeChange = useCallback((mode: 'voice' | 'text') => {
    dispatch({ type: 'SET_MODE', payload: mode });
    lunaAnalytics.trackModeChange(mode);
    if (mode === 'text' && isListening) {
      stopListening();
    }
    if (isSpeaking) {
      cancelSpeech();
    }
  }, [isListening, isSpeaking, stopListening, cancelSpeech]);

  const handlePrivacyChange = useCallback((mode: PrivacyMode) => {
    if (state.session) {
      // Update existing session privacy
      dispatch({ type: 'START_SESSION', payload: mode });
    }
  }, [state.session]);

  // Read summary aloud
  const handleReadSummary = useCallback(() => {
    if (state.session?.plan) {
      const fullSummary = `${state.session.plan.summary} Here are your next steps: ${
        state.session.plan.nextSteps.map((step, i) => 
          `${i + 1}. ${step.title}: ${step.description}`
        ).join(' ')
      }`;
      speak(fullSummary);
      lunaAnalytics.trackSummaryRead();
    }
  }, [state.session?.plan, speak]);

  // Download PDF
  const handleDownloadPDF = useCallback(async () => {
    if (!state.session?.plan) return;
    
    try {
      dispatch({ type: 'SET_STATE', payload: 'thinking' });
      
      const blob = await generatePlanPDF(
        state.session.plan,
        state.session.privacyMode
      );
      
      downloadPDF(blob);
      lunaAnalytics.trackPDFDownload();
      
      dispatch({ type: 'SET_STATE', payload: 'plan-ready' });
      setShowConfetti(true);
    } catch (error) {
      console.error('PDF generation error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate PDF. Please try again.' });
    }
  }, [state.session]);

  if (!isOpen) return null;

  return (
    <SpeechErrorBoundary>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.1 : 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{
              type: "spring",
              damping: reduceMotion ? 40 : 25,
              stiffness: reduceMotion ? 200 : 300,
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[90vh] bg-black border border-zinc-800/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            style={{
              boxShadow:
                '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            }}
          >
            {/* Confetti on PDF ready (disabled in reduced-motion) */}
            {showConfetti && !reduceMotion && (
              <div className="pointer-events-none absolute inset-0 flex justify-center items-start">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    className="text-yellow-200"
                    initial={{ y: 0, opacity: 0, x: (i - 2.5) * 24 }}
                    animate={{ y: 80, opacity: [0, 1, 0] }}
                    transition={{
                      duration: 1.2,
                      delay: i * 0.05,
                      ease: 'easeOut',
                    }}
                  >
                    ✦
                  </motion.div>
                ))}
              </div>
            )}

            {/* Header with gradient accent */}
            <div className="relative flex items-center justify-between p-6 border-b border-zinc-800/50 bg-gradient-to-r from-zinc-900 via-black to-zinc-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                  <Image
                    src={lunaImage}
                    alt="Luna"
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Luna
                </h2>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen((open) => !open)}
                  className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 group"
                  aria-label="Open Luna settings"
                >
                  <Settings
                    size={18}
                    className="text-gray-400 group-hover:text-white transition-colors"
                  />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 group"
                  aria-label="Close"
                >
                  <X
                    size={20}
                    className="text-gray-400 group-hover:text-white transition-colors"
                  />
                </button>
              </div>

              {/* Settings panel */}
              {isSettingsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: reduceMotion ? 0.1 : 0.2 }}
                  className="absolute right-4 top-16 w-72 rounded-2xl border border-zinc-800 bg-black/95 shadow-xl p-4 space-y-4 z-20"
                >
                  <h3 className="text-sm font-semibold text-white">
                    Luna Settings
                  </h3>
                  <div className="space-y-3 text-xs text-gray-300">
                    {/* Speech speed */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Speech speed</span>
                        <span className="tabular-nums">
                          {ttsRate.toFixed(2)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.75}
                        max={1.25}
                        step={0.05}
                        value={ttsRate}
                        onChange={(e) => setTtsRate(Number(e.target.value))}
                        className="w-full accent-white"
                        aria-label="Adjust Luna speech speed"
                      />
                    </div>

                    {/* Reduced motion */}
                    <button
                      type="button"
                      onClick={() =>
                        setReduceMotionManual((current) => !current)
                      }
                      className="mt-1 inline-flex items-center justify-between w-full px-3 py-2 rounded-xl border border-zinc-700 text-[11px] text-gray-200 hover:bg-zinc-800/70 transition-colors"
                      aria-pressed={reduceMotion}
                    >
                      <span className="flex flex-col text-left">
                        <span className="font-medium">Reduced motion</span>
                        <span className="text-[10px] text-gray-400">
                          {prefersReducedMotion
                            ? 'Following system preference'
                            : 'Limit animations in Luna'}
                        </span>
                      </span>
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] ${
                          reduceMotion ? 'bg-emerald-400 text-black' : 'bg-zinc-700 text-gray-300'
                        }`}
                      >
                        {reduceMotion ? 'On' : 'Off'}
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

          {/* Main Content with subtle gradient background */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-zinc-950 to-black">
            {/* Luna Portrait */}
            <div className="flex justify-center">
              <LunaPortrait
                state={state.state}
                isListening={state.isListening}
                isSpeaking={state.isSpeaking}
              />
            </div>

            {/* Caption Display */}
            {state.caption && (
              <LunaCaption
                caption={state.caption}
                role={state.isListening ? 'user' : 'luna'}
              />
            )}

            {/* Error Display */}
            {state.error && (
              <div className="p-4 bg-red-950 border border-red-800 rounded-lg">
                <p className="text-sm text-red-300">{state.error}</p>
              </div>
            )}

            {/* Session not started */}
            {!state.session && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6 py-8"
              >
                <div className="space-y-2">
                  <p className="text-gray-400 text-lg">
                    Choose your privacy preference
                  </p>
                  <p className="text-gray-500 text-sm">
                    Select how you&apos;d like to interact with Luna
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <button
                    onClick={() => startSession('on-the-record')}
                    className="group flex-1 px-6 py-4 bg-white hover:bg-gray-100 text-black rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <span className="block font-semibold">On-the-record</span>
                    <span className="block text-xs text-gray-600 mt-1">Save conversation history</span>
                  </button>
                  <button
                    onClick={() => startSession('confidential')}
                    className="group flex-1 px-6 py-4 bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-700 hover:border-zinc-600 text-white rounded-xl font-medium transition-all duration-200 hover:scale-105"
                  >
                    <span className="block font-semibold">Confidential</span>
                    <span className="block text-xs text-gray-400 mt-1">Private session</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Voice Controls */}
            {state.session && (
              <VoiceControls
                interactionMode={state.interactionMode}
                privacyMode={state.session.privacyMode}
                isListening={state.isListening}
                isSpeaking={state.isSpeaking}
                onModeChange={handleModeChange}
                onPrivacyChange={handlePrivacyChange}
                onMicClick={handleMicClick}
                disabled={state.state === 'thinking'}
              />
            )}

            {/* Text Input */}
            {state.session && state.interactionMode === 'text' && (
              <form onSubmit={handleTextSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-zinc-700 rounded-lg bg-zinc-800 text-white placeholder-gray-500"
                  disabled={state.state === 'thinking'}
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || state.state === 'thinking'}
                  className="px-6 py-2 bg-white hover:bg-gray-200 disabled:bg-gray-600 text-black rounded-lg font-medium transition-colors"
                >
                  Send
                </button>
              </form>
            )}

            {/* Plan Display */}
            {state.session?.plan && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-5 p-6 bg-gradient-to-br from-zinc-900 to-black border border-zinc-800/50 rounded-2xl shadow-xl"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/50">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                    <Image
                      src={lunaImage}
                      alt="Luna"
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Your Personalized Plan
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {state.session.plan.nextSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group p-5 bg-zinc-950 border border-zinc-800/50 hover:border-zinc-700 rounded-xl transition-all duration-200 hover:shadow-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-2 group-hover:text-gray-100">
                            {step.title}
                          </h4>
                          <p className="text-sm text-gray-400 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <button
                    onClick={handleReadSummary}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-100 text-black rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Play size={16} />
                    <span>Read Summary</span>
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-white rounded-xl transition-all duration-200 font-medium hover:scale-105"
                  >
                    <Download size={16} />
                    <span>Download PDF</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
      </AnimatePresence>
    </SpeechErrorBoundary>
  );
}

// Export wrapped component
export function LunaPortal(props: LunaPortalProps) {
  return <LunaPortalContent {...props} />;
}

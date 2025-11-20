'use client';

import { motion } from 'framer-motion';
import { Mic, MicOff, MessageSquare, Volume2 } from 'lucide-react';
import { InteractionMode, PrivacyMode } from '../types';

interface VoiceControlsProps {
  interactionMode: InteractionMode;
  privacyMode: PrivacyMode;
  isListening: boolean;
  isSpeaking: boolean;
  onModeChange: (mode: InteractionMode) => void;
  onPrivacyChange: (mode: PrivacyMode) => void;
  onMicClick: () => void;
  disabled?: boolean;
}

export function VoiceControls({
  interactionMode,
  privacyMode,
  isListening,
  isSpeaking,
  onModeChange,
  onPrivacyChange,
  onMicClick,
  disabled = false,
}: VoiceControlsProps) {
  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Mode Toggle - Voice/Text */}
      <div className="inline-flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-[0.18em] text-gray-500">
          Interaction mode
        </span>
        <div className="inline-flex items-center justify-center gap-1 rounded-full border border-white/10 bg-white/5 px-1 py-1 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-md">
          <button
            onClick={() => onModeChange('voice')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              interactionMode === 'voice'
                ? 'bg-white text-black shadow-lg shadow-white/30'
                : 'text-gray-300/70 hover:bg-white/5'
            }`}
            disabled={disabled}
          >
            <Volume2 size={16} />
            <span>Voice</span>
          </button>
          <button
            onClick={() => onModeChange('text')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              interactionMode === 'text'
                ? 'bg-white text-black shadow-lg shadow-white/30'
                : 'text-gray-300/70 hover:bg-white/5'
            }`}
            disabled={disabled}
          >
            <MessageSquare size={16} />
            <span>Text</span>
          </button>
        </div>
      </div>

      {/* Privacy Toggle */}
      <div className="inline-flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-[0.18em] text-gray-500">
          Privacy
        </span>
        <div className="inline-flex items-center justify-center gap-1 rounded-2xl border border-zinc-700/80 bg-zinc-900/70 px-1 py-1 shadow-[0_10px_40px_rgba(0,0,0,0.7)] backdrop-blur">
          <button
            onClick={() => onPrivacyChange('on-the-record')}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-medium transition-all ${
              privacyMode === 'on-the-record'
                ? 'bg-white text-black shadow-lg shadow-white/30'
                : 'text-gray-300/70 hover:bg-white/5'
            }`}
            disabled={disabled}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1" />
            On-the-record
          </button>
          <button
            onClick={() => onPrivacyChange('confidential')}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-medium transition-all ${
              privacyMode === 'confidential'
                ? 'bg-zinc-100 text-black shadow-lg shadow-cyan-400/30'
                : 'text-gray-300/70 hover:bg-white/5'
            }`}
            disabled={disabled}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1" />
            Confidential
          </button>
        </div>
      </div>

      {/* Microphone Button (only show in voice mode) */}
      {interactionMode === 'voice' && (
        <div className="flex justify-center">
          <motion.button
            onClick={onMicClick}
            disabled={disabled || isSpeaking}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500 shadow-lg shadow-red-500/50'
                : 'bg-white hover:bg-gray-200 shadow-lg'
            } ${disabled || isSpeaking ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            whileTap={!disabled && !isSpeaking ? { scale: 0.95 } : {}}
            whileHover={!disabled && !isSpeaking ? { scale: 1.05 } : {}}
          >
            {/* Pulsing ring when listening */}
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-full bg-red-400"
                initial={{ scale: 1, opacity: 0.7 }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 0, 0.7],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            )}

            {isListening ? (
              <MicOff className="relative z-10 text-white" size={24} />
            ) : (
              <Mic className="relative z-10 text-black" size={24} />
            )}
          </motion.button>
        </div>
      )}

      {/* Status text */}
      <div className="text-center text-sm text-gray-400">
        {isListening && 'Listening...'}
        {isSpeaking && 'Luna is speaking...'}
        {!isListening && !isSpeaking && interactionMode === 'voice' && 'Click mic to speak'}
        {!isListening && !isSpeaking && interactionMode === 'text' && 'Type your message below'}
      </div>
    </div>
  );
}

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
    <div className="flex flex-col gap-4 w-full max-w-md">
      {/* Mode Toggle - Voice/Text */}
      <div className="flex items-center justify-center gap-2 p-1 bg-zinc-800 rounded-lg">
        <button
          onClick={() => onModeChange('voice')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
            interactionMode === 'voice'
              ? 'bg-white text-black shadow-md'
              : 'text-gray-400 hover:bg-zinc-700'
          }`}
          disabled={disabled}
        >
          <Volume2 size={18} />
          <span className="text-sm font-medium">Voice</span>
        </button>
        <button
          onClick={() => onModeChange('text')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
            interactionMode === 'text'
              ? 'bg-white text-black shadow-md'
              : 'text-gray-400 hover:bg-zinc-700'
          }`}
          disabled={disabled}
        >
          <MessageSquare size={18} />
          <span className="text-sm font-medium">Text</span>
        </button>
      </div>

      {/* Privacy Toggle */}
      <div className="flex items-center justify-center gap-2 p-1 bg-zinc-800 rounded-lg">
        <button
          onClick={() => onPrivacyChange('on-the-record')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            privacyMode === 'on-the-record'
              ? 'bg-white text-black shadow-md'
              : 'text-gray-400 hover:bg-zinc-700'
          }`}
          disabled={disabled}
        >
          On-the-record
        </button>
        <button
          onClick={() => onPrivacyChange('confidential')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            privacyMode === 'confidential'
              ? 'bg-zinc-700 text-white border border-zinc-600 shadow-md'
              : 'text-gray-400 hover:bg-zinc-700'
          }`}
          disabled={disabled}
        >
          Confidential
        </button>
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

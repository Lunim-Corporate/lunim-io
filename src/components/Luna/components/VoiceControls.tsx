'use client';

import { motion } from 'framer-motion';
import { Mic, MicOff, MessageSquare, Volume2, Lock, Shield } from 'lucide-react';
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
    <div className="w-full max-w-xl mx-auto rounded-2xl border border-zinc-800/70 bg-gradient-to-b from-zinc-900/60 via-black/70 to-black/90 px-5 py-4 shadow-[0_18px_45px_rgba(0,0,0,0.85)] backdrop-blur-md flex flex-col items-center gap-6">
      {/* Mode Toggle - Voice/Text */}
      <div className="inline-flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gray-400">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
            <Volume2 size={12} />
          </span>
          <span>Interaction mode</span>
        </div>
        <div className="inline-flex items-center justify-center gap-1 rounded-full border border-white/10 bg-white/5/50 px-1 py-1 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-md">
          <button
            onClick={() => onModeChange('voice')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              interactionMode === 'voice'
                ? 'bg-white text-black shadow-lg shadow-white/40'
                : 'text-gray-200/80 hover:bg-white/5'
            }`}
            disabled={disabled}
          >
            <Volume2 size={16} className={interactionMode === 'voice' ? 'text-black' : 'text-gray-300'} />
            <span>Voice</span>
          </button>
          <button
            onClick={() => onModeChange('text')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              interactionMode === 'text'
                ? 'bg-white text-black shadow-lg shadow-white/40'
                : 'text-gray-200/80 hover:bg-white/5'
            }`}
            disabled={disabled}
          >
            <MessageSquare size={16} className={interactionMode === 'text' ? 'text-black' : 'text-gray-300'} />
            <span>Text</span>
          </button>
        </div>
      </div>

      {/* Privacy Toggle */}
      <div className="inline-flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gray-400">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
            <Shield size={12} />
          </span>
          <span>Privacy</span>
        </div>
        <div className="inline-flex items-center justify-center gap-1 rounded-2xl border border-zinc-700/80 bg-zinc-950/80 px-1 py-1 shadow-[0_10px_40px_rgba(0,0,0,0.85)] backdrop-blur">
          <button
            onClick={() => onPrivacyChange('on-the-record')}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-medium transition-all ${
              privacyMode === 'on-the-record'
                ? 'bg-white text-black shadow-lg shadow-white/40'
                : 'text-gray-200/80 hover:bg-white/5'
            }`}
            disabled={disabled}
          >
            <span className="inline-flex w-4 h-4 items-center justify-center rounded-full bg-emerald-400/20 mr-1">
              <Lock size={10} className="text-emerald-300" />
            </span>
            On-the-record
          </button>
          <button
            onClick={() => onPrivacyChange('confidential')}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-medium transition-all ${
              privacyMode === 'confidential'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-400/40'
                : 'text-gray-200/80 hover:bg-white/5'
            }`}
            disabled={disabled}
          >
            <span className="inline-flex w-4 h-4 items-center justify-center rounded-full bg-black/20 mr-1">
              <Shield size={10} className={privacyMode === 'confidential' ? 'text-black' : 'text-cyan-300'} />
            </span>
            Confidential
          </button>
        </div>
        <p className="text-[10px] text-gray-500 mt-1 text-center max-w-sm">
          On-the-record sessions help us learn from anonymised patterns. Confidential keeps this chat just between you and Luna.
        </p>
      </div>

      {/* Microphone Button (only show in voice mode) */}
      {interactionMode === 'voice' && (
        <div className="flex justify-center">
          <motion.button
            onClick={onMicClick}
            disabled={disabled || isSpeaking}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.75)]'
                : 'bg-white/95 hover:bg-gray-100 shadow-[0_14px_40px_rgba(0,0,0,0.65)]'
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
      <div className="text-center text-sm text-gray-300/80">
        {isListening && 'Listening...'}
        {isSpeaking && 'Luna is speaking...'}
        {!isListening && !isSpeaking && interactionMode === 'voice' && 'Click the mic to start speaking'}
        {!isListening && !isSpeaking && interactionMode === 'text' && 'Type your message below to chat with Luna'}
      </div>
    </div>
  );
}

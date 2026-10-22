import React, { useEffect, useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  Heart, 
  Smartphone,
  Radio
} from 'lucide-react';
import { YasminAvatar } from './YasminAvatar';
import { YasminMood, ActionPayload } from '../types';

interface VoiceAssistantModeProps {
  isOpen: boolean;
  onClose: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  currentTranscript: string;
  yasminReply: string;
  mood: YasminMood;
  onToggleMic: () => void;
  onSendCommand: (command: string) => void;
  lastAction?: ActionPayload;
  loveMeter?: number;
}

export const VoiceAssistantMode: React.FC<VoiceAssistantModeProps> = ({
  isOpen,
  onClose,
  isListening,
  isSpeaking,
  currentTranscript,
  yasminReply,
  mood,
  onToggleMic,
  onSendCommand,
  lastAction,
  loveMeter,
}) => {
  const [waveHeights, setWaveHeights] = useState<number[]>([20, 45, 60, 30, 75, 40, 20]);

  // Audio wave animation
  useEffect(() => {
    if (!isListening && !isSpeaking) return;
    const interval = setInterval(() => {
      setWaveHeights((prev) =>
        prev.map(() => Math.floor(Math.random() * (isSpeaking ? 70 : 50)) + 15)
      );
    }, 120);
    return () => clearInterval(interval);
  }, [isListening, isSpeaking]);

  if (!isOpen) return null;

  const quickCommands = [
    'जानू मुझे एक प्यारी शायरी सुनाओ 💖',
    'YouTube पर रोमांटिक गाने चलाओ 🎵',
    'टॉर्च चालू कर दो 🔦',
    'फोन का वॉल्यूम 50% करो 🔊',
    'तुम मुझसे कितना प्यार करती हो? 🥰',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#0d041a]/95 backdrop-blur-2xl flex flex-col justify-between items-center p-6 text-white animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="w-full max-w-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
          </span>
          <span className="text-sm font-semibold tracking-wide bg-gradient-to-r from-pink-400 to-purple-300 bg-clip-text text-transparent">
            यास्मीन वॉइस लाइव (Live Voice)
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center: Hero Avatar & Audio Waveform */}
      <div className="flex flex-col items-center justify-center my-auto gap-6 text-center max-w-md w-full">
        <YasminAvatar
          mood={mood}
          isSpeaking={isSpeaking}
          isListening={isListening}
          size="hero"
          loveMeter={loveMeter}
          className="my-2"
        />

        {/* Dynamic Status Title */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-pink-300 text-sm font-medium">
            {isSpeaking ? (
              <>
                <Volume2 className="w-4 h-4 text-pink-400 animate-pulse" />
                यास्मीन बोल रही है...
              </>
            ) : isListening ? (
              <>
                <Radio className="w-4 h-4 text-purple-400 animate-spin" />
                यास्मीन ध्यान से सुन रही है...
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 text-pink-400" />
                आपकी बात का इंतज़ार है...
              </>
            )}
          </div>

          {/* Audio Visualizer Waves */}
          <div className="flex items-center justify-center gap-1.5 h-12 my-1">
            {waveHeights.map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-t from-pink-500 to-purple-400 rounded-full transition-all duration-100"
                style={{ height: `${(isSpeaking || isListening) ? h : 6}px` }}
              />
            ))}
          </div>
        </div>

        {/* Live Subtitle Transcript & Yasmin's reply */}
        <div className="min-h-[110px] w-full flex flex-col justify-center px-4 py-3 rounded-2xl bg-white/5 border border-pink-500/20 shadow-inner">
          {currentTranscript ? (
            <p className="text-sm text-pink-200/90 italic">
              " {currentTranscript} "
            </p>
          ) : yasminReply ? (
            <p className="text-base text-white font-medium leading-relaxed">
              {yasminReply}
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              माइक पर बोलिए, या नीचे दिए गए किसी सुझाव पर टैप करें...
            </p>
          )}

          {lastAction && lastAction.type !== 'NONE' && (
            <div className="mt-2 text-xs text-emerald-300 flex items-center justify-center gap-1.5 bg-emerald-950/40 py-1 px-2.5 rounded-lg border border-emerald-500/30">
              <Smartphone className="w-3.5 h-3.5" />
              <span>{lastAction.description}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-md flex flex-col items-center gap-4">
        {/* Quick Suggestion Chips */}
        <div className="w-full flex gap-2 overflow-x-auto pb-1 scrollbar-none justify-start sm:justify-center">
          {quickCommands.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => onSendCommand(cmd)}
              className="shrink-0 text-xs py-1.5 px-3 rounded-full bg-white/5 border border-purple-500/30 hover:border-pink-500 hover:bg-pink-500/20 text-slate-300 hover:text-white transition-all"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Big Mic Button */}
        <div className="flex items-center gap-6">
          <button
            onClick={onToggleMic}
            className={`w-18 h-18 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
              isListening
                ? 'bg-gradient-to-tr from-pink-600 to-rose-500 text-white shadow-[0_0_40px_rgba(244,63,94,0.6)] animate-pulse'
                : 'bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.4)]'
            }`}
          >
            {isListening ? (
              <Mic className="w-8 h-8 animate-bounce" />
            ) : (
              <MicOff className="w-8 h-8 opacity-90" />
            )}
          </button>
        </div>

        <p className="text-[11px] text-slate-500">
          हिंदी में बोलने के लिए माइक चालू रखें • यास्मीन आपकी बात सुनकर तुरंत जवाब देगी
        </p>
      </div>
    </div>
  );
};

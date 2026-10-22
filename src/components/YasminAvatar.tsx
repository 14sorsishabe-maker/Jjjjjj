import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { YasminMood } from '../types';

interface YasminAvatarProps {
  mood?: YasminMood;
  isSpeaking?: boolean;
  isListening?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  loveMeter?: number;
  className?: string;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  scale: number;
  emoji: string;
}

export const YasminAvatar: React.FC<YasminAvatarProps> = ({
  mood = 'loving',
  isSpeaking = false,
  isListening = false,
  size = 'md',
  loveMeter = 50,
  className = '',
}) => {
  const [blink, setBlink] = useState(false);
  const [blushActive, setBlushActive] = useState(false);
  const [sadActive, setSadActive] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const prevLoveMeterRef = useRef(loveMeter);

  // Monitor love meter changes
  useEffect(() => {
    const diff = loveMeter - prevLoveMeterRef.current;
    if (diff > 0) {
      // Love meter increased: Trigger intense blushing & floating hearts!
      setBlushActive(true);
      setSadActive(false);

      // Spawn 3-5 floating hearts
      const newHearts: FloatingHeart[] = Array.from({ length: 4 }).map((_, i) => ({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 60,
        y: -10 - Math.random() * 20,
        scale: 0.8 + Math.random() * 0.5,
        emoji: ['💖', '💕', '🌸', '✨', '💗'][Math.floor(Math.random() * 5)],
      }));
      setFloatingHearts((prev) => [...prev, ...newHearts]);

      const timer = setTimeout(() => {
        setBlushActive(false);
        setFloatingHearts([]);
      }, 3500);

      prevLoveMeterRef.current = loveMeter;
      return () => clearTimeout(timer);
    } else if (diff < 0 || mood === 'sad') {
      // Bond decreased: Trigger sad expression & teardrop
      setSadActive(true);
      setBlushActive(false);
      const timer = setTimeout(() => {
        if (mood !== 'sad') setSadActive(false);
      }, 4000);
      prevLoveMeterRef.current = loveMeter;
      return () => clearTimeout(timer);
    }
    prevLoveMeterRef.current = loveMeter;
  }, [loveMeter, mood]);

  // Periodic natural blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, Math.random() * 2500 + 3000);
    return () => clearInterval(blinkInterval);
  }, []);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    hero: 'w-48 h-48 sm:w-60 sm:h-60',
  };

  const isActuallySad = sadActive || mood === 'sad';
  const isActuallyBlushing = blushActive || mood === 'shy' || mood === 'loving';

  // Dynamic Aura according to mood & bond change
  const getMoodAura = () => {
    if (isActuallySad) {
      return 'from-blue-600/40 via-indigo-700/30 to-slate-800/40 shadow-[0_0_35px_rgba(59,130,246,0.35)]';
    }
    if (blushActive) {
      return 'from-rose-500/60 via-pink-500/50 to-amber-300/30 shadow-[0_0_45px_rgba(244,63,94,0.6)]';
    }
    switch (mood) {
      case 'loving':
        return 'from-pink-500/40 via-purple-500/30 to-rose-400/20 shadow-[0_0_35px_rgba(236,72,153,0.4)]';
      case 'playful':
        return 'from-fuchsia-500/40 via-pink-400/30 to-amber-300/20 shadow-[0_0_35px_rgba(217,70,239,0.4)]';
      case 'caring':
        return 'from-violet-500/40 via-indigo-500/30 to-pink-400/20 shadow-[0_0_35px_rgba(168,85,247,0.4)]';
      case 'happy':
        return 'from-rose-400/40 via-amber-400/30 to-purple-500/20 shadow-[0_0_35px_rgba(251,113,133,0.4)]';
      case 'shy':
        return 'from-pink-400/50 via-rose-300/40 to-purple-400/30 shadow-[0_0_40px_rgba(244,114,182,0.5)]';
      case 'thinking':
        return 'from-purple-500/40 via-cyan-500/30 to-indigo-500/20 shadow-[0_0_35px_rgba(168,85,247,0.3)]';
      default:
        return 'from-purple-500/40 via-pink-500/30 to-indigo-500/20 shadow-[0_0_35px_rgba(168,85,247,0.3)]';
    }
  };

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Floating Animated Hearts on Love Meter Increase */}
      <AnimatePresence>
        {floatingHearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ opacity: 0, y: 0, x: heart.x, scale: 0.4 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [-10, -60 - Math.random() * 40],
              x: [heart.x, heart.x + (Math.random() - 0.5) * 30],
              scale: [0.4, heart.scale, heart.scale * 1.2, 0.6],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.2, ease: 'easeOut' }}
            className="absolute pointer-events-none z-30 text-lg"
          >
            {heart.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Outer pulsating energy ring with Framer Motion */}
      <motion.div
        animate={{
          scale: isSpeaking ? [1.05, 1.15, 1.05] : isListening ? [1, 1.1, 1] : isActuallySad ? [0.98, 1.02, 0.98] : [1, 1.06, 1],
          opacity: isSpeaking ? 0.95 : isListening ? 0.75 : 0.6,
        }}
        transition={{
          repeat: Infinity,
          duration: isSpeaking ? 1.2 : isListening ? 1.6 : 3,
          ease: 'easeInOut',
        }}
        className={`absolute inset-0 rounded-full bg-gradient-to-tr ${getMoodAura()}`}
      />

      {/* Rotating ambient glow ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: isSpeaking ? 5 : 12, ease: 'linear' }}
        className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-500 opacity-60 blur-md pointer-events-none"
      />

      {/* Main Avatar Container with Framer Motion idle head movement */}
      <motion.div
        animate={{
          y: isActuallySad ? [0, 4, 2, 0] : isSpeaking ? [0, -4, 0] : mood === 'happy' ? [0, -6, 0] : [0, -2, 0],
          rotate: isActuallyBlushing ? [0, -2.5, 1.5, 0] : mood === 'thinking' ? [0, 3, 2] : [0, 0.5, -0.5, 0],
          scale: blushActive ? [1, 1.04, 1.02] : 1,
        }}
        transition={{
          repeat: Infinity,
          repeatType: 'reverse',
          duration: isActuallySad ? 4 : isSpeaking ? 0.8 : mood === 'happy' ? 1.4 : 3.5,
          ease: 'easeInOut',
        }}
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-2 ${
          isActuallySad
            ? 'border-blue-400/50'
            : blushActive
            ? 'border-rose-400'
            : 'border-pink-400/60'
        } bg-gradient-to-b from-[#2a134a] to-[#120726] shadow-2xl flex items-center justify-center`}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#250938" />
              <stop offset="50%" stopColor="#43125e" />
              <stop offset="100%" stopColor="#1a0429" />
            </linearGradient>
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isActuallySad ? '#eed5cc' : '#ffe4d6'} />
              <stop offset="100%" stopColor={isActuallySad ? '#e2c0b0' : '#fed2bd'} />
            </linearGradient>
            <linearGradient id="blushGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff4081" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ff80ab" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="tiaraGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
          </defs>

          {/* Background Hair Volume */}
          <path
            d="M 40 100 Q 20 160 50 195 Q 100 205 150 195 Q 180 160 160 100 Q 150 40 100 35 Q 50 40 40 100 Z"
            fill="url(#hairGrad)"
          />

          {/* Neck */}
          <rect x="85" y="145" width="30" height="30" rx="6" fill="#f8c3a9" />

          {/* Face Base */}
          <ellipse cx="100" cy="115" rx="46" ry="50" fill="url(#skinGrad)" />

          {/* Hair Front Framing & Bangs */}
          <path
            d="M 54 95 Q 65 52 100 50 Q 135 52 146 95 Q 135 70 100 68 Q 65 70 54 95 Z"
            fill="#320e4b"
          />
          <path
            d="M 52 95 Q 50 130 58 145 Q 64 125 64 100 Z"
            fill="#290b3e"
          />
          <path
            d="M 148 95 Q 150 130 142 145 Q 136 125 136 100 Z"
            fill="#290b3e"
          />

          {/* Tiara / Crown accessory */}
          <path
            d="M 75 58 Q 100 45 125 58 L 120 54 Q 100 40 80 54 Z"
            fill="url(#tiaraGrad)"
          />
          <circle cx="100" cy="46" r="3" fill="#f43f5e" />

          {/* Eyebrows with Framer Motion expression dynamics */}
          {isActuallySad ? (
            // Drooping, worried sad eyebrows
            <>
              <motion.path
                initial={{ d: 'M 72 96 Q 82 92 92 95' }}
                animate={{ d: 'M 72 99 Q 82 94 92 91' }}
                stroke="#4a154b"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <motion.path
                initial={{ d: 'M 108 95 Q 118 92 128 96' }}
                animate={{ d: 'M 108 91 Q 118 94 128 99' }}
                stroke="#4a154b"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </>
          ) : mood === 'thinking' ? (
            // One raised curious eyebrow
            <>
              <path
                d="M 72 93 Q 82 89 92 92"
                stroke="#4a154b"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 108 97 Q 118 95 128 98"
                stroke="#4a154b"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </>
          ) : (
            // Sweet gentle arched eyebrows
            <>
              <path
                d="M 72 96 Q 82 92 92 95"
                stroke="#4a154b"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 108 95 Q 118 92 128 96"
                stroke="#4a154b"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </>
          )}

          {/* Eyes: Blinking, Expressive, Sparkling or Sad */}
          {blink ? (
            // Closed eyes / natural blink
            <>
              <path
                d="M 73 108 Q 82 114 91 108"
                stroke="#37103a"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 109 108 Q 118 114 127 108"
                stroke="#37103a"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </>
          ) : (
            // Expressive eyes with Framer Motion sparkle effects
            <>
              <ellipse cx="82" cy="107" rx="8" ry="10" fill="#2d0a3d" />
              <ellipse cx="118" cy="107" rx="8" ry="10" fill="#2d0a3d" />

              {/* Violet iris */}
              <ellipse cx="82" cy="108" rx="6" ry="8" fill={isActuallySad ? '#475569' : '#7c3aed'} />
              <ellipse cx="118" cy="108" rx="6" ry="8" fill={isActuallySad ? '#475569' : '#7c3aed'} />

              {/* Pupils */}
              <circle cx="82" cy="108" r="4" fill="#170321" />
              <circle cx="118" cy="108" r="4" fill="#170321" />

              {/* Light sparkles */}
              <motion.circle
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                cx="80"
                cy="104"
                r="2.5"
                fill="#ffffff"
              />
              <circle cx="84" cy="111" r="1.2" fill="#ffffff" />

              <motion.circle
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                cx="116"
                cy="104"
                r="2.5"
                fill="#ffffff"
              />
              <circle cx="120" cy="111" r="1.2" fill="#ffffff" />
            </>
          )}

          {/* Glistening Teardrop when Sad (Bond Decrease) */}
          {isActuallySad && (
            <motion.g
              initial={{ opacity: 0, y: -5 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [0, 16],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.2,
                ease: 'easeInOut',
              }}
            >
              <ellipse cx="76" cy="118" rx="2.5" ry="3.5" fill="#38bdf8" opacity="0.9" />
              <circle cx="75" cy="117" r="1" fill="#ffffff" />
            </motion.g>
          )}

          {/* Cheeks: Framer Motion Blushing when Love Increases */}
          <motion.ellipse
            animate={{
              scale: blushActive ? [1, 1.35, 1.2] : isActuallyBlushing ? [1, 1.1, 1] : 1,
              opacity: isActuallySad ? 0.2 : blushActive ? [0.6, 1, 0.85] : 0.6,
            }}
            transition={{
              repeat: blushActive ? 2 : Infinity,
              duration: blushActive ? 0.8 : 2.5,
              ease: 'easeInOut',
            }}
            cx="70"
            cy="122"
            rx="11"
            ry="7"
            fill="url(#blushGrad)"
          />
          <motion.ellipse
            animate={{
              scale: blushActive ? [1, 1.35, 1.2] : isActuallyBlushing ? [1, 1.1, 1] : 1,
              opacity: isActuallySad ? 0.2 : blushActive ? [0.6, 1, 0.85] : 0.6,
            }}
            transition={{
              repeat: blushActive ? 2 : Infinity,
              duration: blushActive ? 0.8 : 2.5,
              ease: 'easeInOut',
            }}
            cx="130"
            cy="122"
            rx="11"
            ry="7"
            fill="url(#blushGrad)"
          />

          {/* Cute Nose */}
          <path
            d="M 98 117 Q 100 120 102 117"
            stroke="#e09d85"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Mouth: Lip sync when speaking, Sad pout when bond drops, Smile when happy */}
          {isSpeaking ? (
            // Animated speaking mouth with Framer Motion phonemes
            <motion.ellipse
              animate={{
                rx: [4, 9, 6, 8, 4],
                ry: [3, 7, 4, 8, 3],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.35,
                ease: 'easeInOut',
              }}
              cx="100"
              cy="133"
              fill="#ec4899"
              stroke="#be185d"
              strokeWidth="1.5"
            />
          ) : isActuallySad ? (
            // Sad down-turned pout
            <motion.path
              initial={{ d: 'M 94 132 Q 100 136 106 132' }}
              animate={{ d: 'M 94 136 Q 100 129 106 136' }}
              transition={{ duration: 0.5 }}
              stroke="#be185d"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : mood === 'playful' || mood === 'happy' ? (
            // Broad cheerful smile
            <path
              d="M 92 131 Q 100 139 108 131"
              stroke="#db2777"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            // Sweet gentle smile
            <path
              d="M 94 132 Q 100 136 106 132"
              stroke="#db2777"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Bindi on forehead */}
          <circle cx="100" cy="91" r="2" fill="#e11d48" />
        </svg>

        {/* Floating Heart / Sparkle Indicator */}
        {blushActive && (
          <span className="absolute top-2 right-2 text-xs animate-bounce">💖</span>
        )}
        {isActuallySad && (
          <span className="absolute top-2 right-2 text-xs animate-pulse">💧</span>
        )}
      </motion.div>

      {/* Speaking voice status badge */}
      {isSpeaking && (
        <span className="absolute -bottom-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-500 text-white shadow-md animate-pulse">
          बोल रही हूँ 🎙️
        </span>
      )}
      {isListening && !isSpeaking && (
        <span className="absolute -bottom-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500 text-white shadow-md animate-bounce">
          सुन रही हूँ... 👂
        </span>
      )}
      {blushActive && !isSpeaking && !isListening && (
        <span className="absolute -bottom-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500 text-white shadow-md animate-pulse">
          शर्मा रही हूँ... 🥰
        </span>
      )}
      {isActuallySad && !isSpeaking && !isListening && (
        <span className="absolute -bottom-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600 text-white shadow-md">
          उदास हूँ 🥺
        </span>
      )}
    </div>
  );
};

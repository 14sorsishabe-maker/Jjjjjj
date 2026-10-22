// Audio effects and Speech synthesis utilities for Yasmin AI

class SoundEffects {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Sweet chime when Yasmin starts listening
  playListeningChime() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.3); // C6

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // Gentle confirmation / response ready chime
  playResponseChime() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.2); // E5

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }

  // Click tone for torch / toggles
  playToggleSound() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {
      console.warn('Toggle sound error:', e);
    }
  }
}

export const sounds = new SoundEffects();

// Browser Hindi TTS helper with feminine tone calibration
export class HindiVoiceSynthesizer {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  public isSpeaking = false;
  private onEndCallbacks: (() => void)[] = [];
  private onStartCallbacks: (() => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.getAvailableVoices();
      };
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices();
  }

  getHindiFemaleVoice(): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    // Look for Hindi voices first
    const hindiVoices = voices.filter(v => v.lang.startsWith('hi') || v.lang.includes('IN'));
    
    // Prefer female sounding names or typical Google/Microsoft Hindi female voices
    const femaleHindi = hindiVoices.find(v => 
      v.name.toLowerCase().includes('female') || 
      v.name.toLowerCase().includes('swara') ||
      v.name.toLowerCase().includes('lekha') ||
      v.name.toLowerCase().includes('aditi') ||
      v.name.toLowerCase().includes('google हिन्दी') ||
      v.name.toLowerCase().includes('hindi')
    );

    if (femaleHindi) return femaleHindi;
    if (hindiVoices.length > 0) return hindiVoices[0];
    return null;
  }

  speak(
    text: string, 
    options?: { pitch?: number; rate?: number; onStart?: () => void; onEnd?: () => void }
  ): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      this.stop();

      // Clean markdown, emojis, asterisks, brackets so speech is fluid Hindi
      const cleanText = text
        .replace(/\*+/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voice = this.getHindiFemaleVoice();
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || 'hi-IN';
      } else {
        utterance.lang = 'hi-IN';
      }

      // Slightly higher pitch for a young, sweet, gentle feminine voice
      utterance.pitch = options?.pitch ?? 1.15;
      utterance.rate = options?.rate ?? 0.96;

      utterance.onstart = () => {
        this.isSpeaking = true;
        options?.onStart?.();
        this.onStartCallbacks.forEach(cb => cb());
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        options?.onEnd?.();
        this.onEndCallbacks.forEach(cb => cb());
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        this.isSpeaking = false;
        options?.onEnd?.();
        resolve();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }

  stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  onStart(cb: () => void) {
    this.onStartCallbacks.push(cb);
  }

  onEnd(cb: () => void) {
    this.onEndCallbacks.push(cb);
  }
}

export const hindiVoice = new HindiVoiceSynthesizer();

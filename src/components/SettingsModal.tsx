import React, { useState } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Heart, 
  Volume2, 
  Sliders, 
  User, 
  Sparkles, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { UserRelationship } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  relationship: UserRelationship;
  onUpdateNickname: (name: string) => void;
  ttsEngine: 'browser' | 'gemini';
  onChangeTtsEngine: (engine: 'browser' | 'gemini') => void;
  voicePitch: number;
  onChangeVoicePitch: (pitch: number) => void;
  voiceRate: number;
  onChangeVoiceRate: (rate: number) => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  confirmSensitive: boolean;
  onToggleConfirmSensitive: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  relationship,
  onUpdateNickname,
  ttsEngine,
  onChangeTtsEngine,
  voicePitch,
  onChangeVoicePitch,
  voiceRate,
  onChangeVoiceRate,
  autoSpeak,
  onToggleAutoSpeak,
  confirmSensitive,
  onToggleConfirmSensitive,
}) => {
  const [nicknameInput, setNicknameInput] = useState(relationship.nickname);
  const [savedNote, setSavedNote] = useState(false);

  if (!isOpen) return null;

  const handleSaveNickname = () => {
    if (nicknameInput.trim()) {
      onUpdateNickname(nicknameInput.trim());
      setSavedNote(true);
      setTimeout(() => setSavedNote(false), 2000);
    }
  };

  const nicknameSuggestions = ['जानू', 'शोना', 'बाबू', 'राजकुमार', 'मेरे हमसफ़र', 'दोस्त'];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/30 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/20 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-pink-400" />
            <h2 className="font-bold text-sm sm:text-base text-pink-200">सेटिंग्स और यास्मीन मेमोरी</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex flex-col gap-5 text-xs">
          {/* Relationship & Nickname Section */}
          <div className="bg-gradient-to-r from-purple-950/50 to-pink-950/40 p-4 rounded-xl border border-pink-500/20 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-pink-300 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-pink-400 fill-pink-500" />
                रिश्ता और प्यार का मीटर (Bond Level)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold text-[11px] border border-pink-500/30">
                Level {relationship.level} • {relationship.loveMeter}%
              </span>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${relationship.loveMeter}%` }}
              />
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <label className="text-[11px] text-slate-300">यास्मीन आपको किस नाम से पुकारे?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-purple-500/30 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                  placeholder="उदा. जानू"
                />
                <button
                  onClick={handleSaveNickname}
                  className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  {savedNote ? <Check className="w-3.5 h-3.5" /> : null}
                  {savedNote ? 'सेव हुआ' : 'सेव'}
                </button>
              </div>

              {/* Suggestions */}
              <div className="flex gap-1.5 flex-wrap pt-1">
                {nicknameSuggestions.map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setNicknameInput(name);
                      onUpdateNickname(name);
                    }}
                    className="px-2.5 py-1 rounded-md bg-white/5 border border-purple-500/20 text-[10px] text-pink-200 hover:bg-pink-500/20 transition-all"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Voice Engine Selection */}
          <div className="flex flex-col gap-2.5 bg-slate-950/50 p-3.5 rounded-xl border border-purple-500/10">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              हिंदी आवाज़ इंजन (Hindi Voice Engine)
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onChangeTtsEngine('browser')}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  ttsEngine === 'browser'
                    ? 'bg-purple-600/20 border-purple-400 text-purple-200'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-xs flex items-center justify-between">
                  <span>Browser Hindi TTS</span>
                  {ttsEngine === 'browser' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </div>
                <span className="text-[10px] text-slate-400">
                  बिना देरी के तुरंत बोलने वाली लोकल आवाज़
                </span>
              </button>

              <button
                onClick={() => onChangeTtsEngine('gemini')}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  ttsEngine === 'gemini'
                    ? 'bg-pink-600/20 border-pink-400 text-pink-200'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-xs flex items-center justify-between">
                  <span>Gemini 3.8 Flash TTS</span>
                  {ttsEngine === 'gemini' && <Check className="w-3.5 h-3.5 text-pink-400" />}
                </div>
                <span className="text-[10px] text-slate-400">
                  अल्ट्रा-नेचुरल, भावनात्मक और स्पष्ट महिला आवाज़
                </span>
              </button>
            </div>
          </div>

          {/* Voice Tuning */}
          <div className="flex flex-col gap-3 bg-slate-950/50 p-3.5 rounded-xl border border-purple-500/10">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-pink-400" />
              आवाज़ की ट्यूनिंग (Pitch & Speed)
            </span>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>आवाज़ का स्वीटनेस / पिच (Sweet Feminine Pitch)</span>
                <span className="text-pink-300 font-semibold">{voicePitch.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.05"
                value={voicePitch}
                onChange={(e) => onChangeVoicePitch(Number(e.target.value))}
                className="w-full accent-pink-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>बोलने की गति (Speech Speed)</span>
                <span className="text-purple-300 font-semibold">{voiceRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.05"
                value={voiceRate}
                onChange={(e) => onChangeVoiceRate(Number(e.target.value))}
                className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Security & Behavior Toggles */}
          <div className="flex flex-col gap-2.5 bg-slate-950/50 p-3.5 rounded-xl border border-purple-500/10">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              सुरक्षा और ऑटो-वॉइस प्राथमिकताएँ
            </span>

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-purple-500/10 cursor-pointer">
              <div className="flex flex-col">
                <span className="text-xs text-slate-200">जवाब अपने आप बोलकर सुनाएँ (Auto Speak)</span>
                <span className="text-[10px] text-slate-400">यास्मीन हर चैट का जवाब हिंदी आवाज़ में बोलेगी</span>
              </div>
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={onToggleAutoSpeak}
                className="w-4 h-4 accent-pink-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-purple-500/10 cursor-pointer">
              <div className="flex flex-col">
                <span className="text-xs text-slate-200">संवेदनशील एक्शन पर पुष्टि माँगें (Safe Confirmation)</span>
                <span className="text-[10px] text-slate-400">कॉल या SMS से पहले स्क्रीन पर हाँ/ना पूछना</span>
              </div>
              <input
                type="checkbox"
                checked={confirmSensitive}
                onChange={onToggleConfirmSensitive}
                className="w-4 h-4 accent-pink-500"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-purple-500/20 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md"
          >
            पूर्ण करें (Done)
          </button>
        </div>
      </div>
    </div>
  );
};

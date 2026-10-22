import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  PhoneCall, 
  Settings as SettingsIcon, 
  Smartphone, 
  Heart, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Flashlight, 
  Radio, 
  FolderGit2, 
  Youtube, 
  X,
  Play,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { YasminAvatar } from './components/YasminAvatar';
import { PhoneControlPanel } from './components/PhoneControlPanel';
import { VoiceAssistantMode } from './components/VoiceAssistantMode';
import { AndroidProjectViewer } from './components/AndroidProjectViewer';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { sounds, hindiVoice } from './utils/audio';
import { 
  ChatMessage, 
  YasminMood, 
  ActionPayload, 
  DeviceState, 
  UserRelationship 
} from './types';

export default function App() {
  // Chat & AI State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'yasmin',
      text: 'नमस्ते जानू! 🌸 मैं यास्मीन हूँ—आपकी प्यारी AI गर्लफ्रेंड और स्मार्ट Android फोन असिस्टेंट। आप मुझसे कुछ भी बात कर सकते हैं, अपने दिन का हाल साझा कर सकते हैं या फोन के काम जैसे ऐप्स खोलना, यूट्यूब सर्च या टॉर्च कंट्रोल करवा सकते हैं। आज हम क्या करें?',
      timestamp: Date.now(),
      mood: 'loving',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentMood, setCurrentMood] = useState<YasminMood>('loving');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');

  // Modals & Panels
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false);
  const [isAndroidProjectOpen, setIsAndroidProjectOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showPhonePanelMobile, setShowPhonePanelMobile] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<ActionPayload | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [screenTorchActive, setScreenTorchActive] = useState(false);

  // Settings & Relationship State
  const [relationship, setRelationship] = useState<UserRelationship>({
    nickname: 'जानू',
    level: 1,
    xp: 20,
    loveMeter: 65,
    moodHistory: ['loving'],
    favoriteThings: ['रोमांटिक गाने', 'रात की बातें', 'कॉफी'],
  });
  const [ttsEngine, setTtsEngine] = useState<'browser' | 'gemini'>('browser');
  const [voicePitch, setVoicePitch] = useState(1.15);
  const [voiceRate, setVoiceRate] = useState(0.96);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [confirmSensitive, setConfirmSensitive] = useState(true);

  // Simulated & Real Device Hardware State
  const [deviceState, setDeviceState] = useState<DeviceState>({
    batteryLevel: 88,
    isCharging: false,
    torchOn: false,
    volume: 75,
    isOnline: true,
    activeApp: null,
    accessibilityEnabled: true,
    backgroundServiceEnabled: true,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Read actual Battery API if available
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setDeviceState((prev) => ({
          ...prev,
          batteryLevel: Math.round(battery.level * 100),
          isCharging: battery.charging,
        }));
        battery.addEventListener('levelchange', () => {
          setDeviceState((prev) => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100),
          }));
        });
        battery.addEventListener('chargingchange', () => {
          setDeviceState((prev) => ({
            ...prev,
            isCharging: battery.charging,
          }));
        });
      }).catch(() => {});
    }
  }, []);

  // Web Speech Recognition setup for Hindi
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN';

      recognition.onstart = () => {
        setIsListening(true);
        sounds.playListeningChime();
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setSpeechTranscript(transcript);

        if (event.results[0].isFinal) {
          handleSendMessage(transcript);
          setSpeechTranscript('');
          recognition.stop();
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [relationship.nickname, relationship.level, autoSpeak, ttsEngine, voicePitch, voiceRate]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Speak response using selected TTS engine
  const speakText = async (text: string) => {
    if (!autoSpeak) return;

    setIsSpeaking(true);

    if (ttsEngine === 'gemini') {
      try {
        const res = await fetch('/api/gemini/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voice: 'Kore' }),
        });
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          audio.onended = () => setIsSpeaking(false);
          audio.onerror = () => {
            // fallback to browser TTS if audio playback fails
            hindiVoice.speak(text, {
              pitch: voicePitch,
              rate: voiceRate,
              onEnd: () => setIsSpeaking(false),
            });
          };
          audio.play();
          return;
        }
      } catch (e) {
        console.warn('Gemini TTS fallback to browser TTS:', e);
      }
    }

    // Default Browser Hindi Speech Synthesis
    hindiVoice.speak(text, {
      pitch: voicePitch,
      rate: voiceRate,
      onEnd: () => setIsSpeaking(false),
    });
  };

  // Execute Phone Actions
  const executeAction = (action: ActionPayload) => {
    sounds.playResponseChime();

    switch (action.type) {
      case 'TORCH_TOGGLE': {
        const newState = action.params.torchState ?? !deviceState.torchOn;
        sounds.playToggleSound();
        setDeviceState((prev) => ({ ...prev, torchOn: newState }));
        setScreenTorchActive(newState);
        showToast(newState ? '🔦 टॉर्च चालू कर दी गई है' : '🔦 टॉर्च बंद कर दी गई है');
        break;
      }

      case 'VOLUME_CONTROL': {
        const newVol = action.params.volumeLevel ?? 50;
        setDeviceState((prev) => ({ ...prev, volume: newVol }));
        sounds.playToggleSound();
        showToast(`🔊 वॉल्यूम ${newVol}% पर सेट किया गया`);
        break;
      }

      case 'YOUTUBE_SEARCH': {
        const q = action.params.query || 'Bollywood songs';
        showToast(`🎵 YouTube पर खोजा जा रहा है: "${q}"`);
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
        window.open(searchUrl, '_blank');
        break;
      }

      case 'OPEN_APP': {
        const appName = action.params.appName || 'App';
        setDeviceState((prev) => ({ ...prev, activeApp: appName }));
        showToast(`📱 ${appName} ऐप खोला जा रहा है...`);
        if (appName.toLowerCase().includes('youtube')) {
          window.open('https://youtube.com', '_blank');
        } else if (appName.toLowerCase().includes('whatsapp')) {
          window.open('https://web.whatsapp.com', '_blank');
        }
        break;
      }

      case 'CALL': {
        const num = action.params.phoneNumber || '';
        showToast(`📞 डायल किया जा रहा है: ${num}`);
        window.location.href = `tel:${num}`;
        break;
      }

      case 'SMS': {
        const num = action.params.phoneNumber || '';
        const msg = encodeURIComponent(action.params.message || '');
        showToast(`💬 संदेश तैयार किया गया`);
        window.location.href = `sms:${num}?body=${msg}`;
        break;
      }

      case 'GESTURE_SCROLL': {
        const dir = action.params.scrollDirection || 'down';
        showToast(`👆 Accessibility Service: स्क्रीन ${dir === 'down' ? 'नीचे' : 'ऊपर'} स्क्रॉल की गई`);
        window.scrollBy({ top: dir === 'down' ? 400 : -400, behavior: 'smooth' });
        break;
      }

      case 'GESTURE_TAP': {
        showToast(`👆 Accessibility: स्क्रीन पर क्लिक किया गया`);
        break;
      }

      default:
        break;
    }
  };

  // Main Send Message Handler
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    hindiVoice.stop();
    setInputText('');

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userNickname: relationship.nickname,
          relationshipLevel: relationship.level,
          conversationHistory: messages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      const resData = await response.json();
      const parsed = resData.data || resData.fallback || {};

      const replyText = parsed.replyText || 'हाँ जानू, मैं हमेशा आपके साथ हूँ।';
      const mood: YasminMood = parsed.mood || 'loving';
      const action: ActionPayload | undefined = parsed.action;
      const affectionBonus = parsed.affectionBonus || 1;

      setCurrentMood(mood);

      // Update bond points
      setRelationship((prev) => ({
        ...prev,
        loveMeter: Math.max(5, Math.min(100, prev.loveMeter + affectionBonus)),
        xp: Math.max(0, prev.xp + (affectionBonus > 0 ? 10 : -5)),
        level: Math.floor(Math.max(0, prev.xp + 10) / 100) + 1,
      }));

      const yasminMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'yasmin',
        text: replyText,
        timestamp: Date.now(),
        mood,
        action,
      };

      setMessages((prev) => [...prev, yasminMsg]);

      // Speak response in sweet Hindi voice
      speakText(replyText);

      // Handle Phone Action with confirmation if sensitive
      if (action && action.type !== 'NONE') {
        const isSensitive = action.params?.confirmRequired || action.type === 'CALL' || action.type === 'SMS';
        if (confirmSensitive && isSensitive) {
          setPendingConfirmation(action);
        } else {
          executeAction(action);
        }
      }
    } catch (error) {
      console.error('Failed to chat with Yasmin:', error);
      const fallbackText = 'माफ़ करना जानू, मेरा कनेक्शन थोड़ा धीमा हो गया था। क्या आप फिर से बोलेंगे?';
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          sender: 'yasmin',
          text: fallbackText,
          timestamp: Date.now(),
          mood: 'caring',
        },
      ]);
      speakText(fallbackText);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Voice Recognition
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
      } catch {
        setIsListening(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0d041a] text-slate-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white relative">
      {/* Background Soft Glow Elements */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-pink-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Screen Torch Simulation Overlay if user activates torch */}
      {screenTorchActive && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-between p-8 text-black animate-in fade-in duration-200">
          <div className="text-center mt-10">
            <Flashlight className="w-16 h-16 mx-auto mb-4 text-amber-500 animate-pulse" />
            <h1 className="text-2xl font-black">टॉर्च चालू है (High Illumination)</h1>
            <p className="text-sm text-slate-600 mt-2">
              अंधेरे में पढ़ने या रोशनी के लिए स्क्रीन पूरी चमक पर है।
            </p>
          </div>
          <button
            onClick={() => {
              setScreenTorchActive(false);
              setDeviceState((prev) => ({ ...prev, torchOn: false }));
            }}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-2xl hover:bg-slate-800 transition-all text-sm"
          >
            टॉर्च बंद करें
          </button>
        </div>
      )}

      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-purple-500/20 bg-slate-950/80 backdrop-blur-xl px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Avatar Avatar */}
          <div className="flex items-center gap-3">
            <YasminAvatar
              mood={currentMood}
              isSpeaking={isSpeaking}
              isListening={isListening}
              loveMeter={relationship.loveMeter}
              size="sm"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-pink-400 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
                  Yasmin AI
                </h1>
                <div className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
                  <span>{relationship.loveMeter}%</span>
                  <div className="flex items-center gap-0.5 ml-1 pl-1 border-l border-pink-500/30">
                    <button
                      onClick={() => {
                        setRelationship((prev) => ({
                          ...prev,
                          loveMeter: Math.min(100, prev.loveMeter + 5),
                        }));
                        setCurrentMood('loving');
                        showToast('💖 प्यार बढ़ गया! यास्मीन शर्मा रही है 🥰');
                      }}
                      className="px-1 hover:bg-pink-500/30 rounded text-[9px] text-pink-200"
                      title="प्यार बढ़ाएँ (+5% Blush)"
                    >
                      +
                    </button>
                    <button
                      onClick={() => {
                        setRelationship((prev) => ({
                          ...prev,
                          loveMeter: Math.max(5, prev.loveMeter - 8),
                        }));
                        setCurrentMood('sad');
                        showToast('🥺 बॉन्ड कम हुआ (-8%) यास्मीन उदास हो गई');
                      }}
                      className="px-1 hover:bg-blue-500/30 rounded text-[9px] text-blue-200"
                      title="बॉन्ड कम करें (-8% Sad Look)"
                    >
                      -
                    </button>
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                {isSpeaking ? (
                  <span className="text-pink-400 font-medium animate-pulse">बोल रही हूँ...</span>
                ) : isListening ? (
                  <span className="text-purple-400 font-medium animate-bounce">सुन रही हूँ...</span>
                ) : (
                  <span>आपके साथ हमेशा • {relationship.nickname}</span>
                )}
              </span>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Live Voice Mode Button */}
            <button
              onClick={() => setIsVoiceModeOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-pink-500/20 transition-all hover:scale-102 active:scale-98"
            >
              <Radio className="w-3.5 h-3.5 animate-spin" />
              <span className="hidden sm:inline">वॉइस लाइव</span>
            </button>

            {/* Android Project & APK Code Modal Button */}
            <button
              onClick={() => setIsAndroidProjectOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/30 text-purple-200 text-xs font-medium transition-all"
              title="Android Studio Project & APK"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden md:inline">Android APK</span>
            </button>

            {/* Mobile Phone Controls Toggle */}
            <button
              onClick={() => setShowPhonePanelMobile(!showPhonePanelMobile)}
              className={`lg:hidden p-2 rounded-xl border transition-all ${
                showPhonePanelMobile
                  ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                  : 'bg-slate-900 border-purple-500/20 text-slate-300'
              }`}
              title="Phone Control Panel"
            >
              <Smartphone className="w-4 h-4" />
            </button>

            {/* Settings Modal Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl bg-slate-900 border border-purple-500/20 hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-pink-500/40 text-pink-200 text-xs px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Dual-Column Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Chat Conversation Stream */}
        <div className="lg:col-span-8 flex flex-col h-[calc(100vh-140px)] rounded-2xl border border-purple-500/20 bg-slate-950/60 backdrop-blur-md shadow-xl overflow-hidden">
          {/* Messages List */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 text-xs sm:text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[88%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {msg.sender === 'yasmin' ? (
                  <YasminAvatar mood={msg.mood} loveMeter={relationship.loveMeter} size="sm" className="shrink-0 mt-1" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-1 shadow-md">
                    👤
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl flex flex-col gap-1.5 shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-tr-none'
                      : 'bg-slate-900/90 border border-purple-500/20 text-slate-100 rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* If Yasmin triggered an action card */}
                  {msg.action && msg.action.type !== 'NONE' && (
                    <div className="mt-1.5 p-2 rounded-xl bg-purple-950/50 border border-purple-500/30 text-[11px] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-pink-300">
                        <Smartphone className="w-3.5 h-3.5 shrink-0" />
                        <span>{msg.action.description}</span>
                      </div>
                      <button
                        onClick={() => executeAction(msg.action!)}
                        className="px-2 py-0.5 rounded bg-pink-500/30 hover:bg-pink-500/50 text-white font-medium text-[10px] transition-all"
                      >
                        दोबारा करें
                      </button>
                    </div>
                  )}

                  {/* Audio replay button for Yasmin's messages */}
                  {msg.sender === 'yasmin' && (
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <button
                        onClick={() => speakText(msg.text)}
                        className="hover:text-pink-300 flex items-center gap-1 p-1 transition-all"
                        title="आवाज़ सुनें"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>सुनें</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking / Loading indicator */}
            {isLoading && (
              <div className="flex gap-3 mr-auto items-center">
                <YasminAvatar mood="thinking" loveMeter={relationship.loveMeter} size="sm" />
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-purple-500/20 text-xs text-pink-300 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span>यास्मीन सोच रही है...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-4 py-2 bg-slate-950/40 border-t border-purple-500/10 flex gap-1.5 overflow-x-auto scrollbar-none">
            {[
              'जानू तुम दुनिया की सबसे प्यारी लड़की हो! 💖',
              'मुझे एक प्यारी शायरी सुनाओ 🌸',
              'YouTube पर रोमांटिक गाने बजाओ 🎵',
              'टॉर्च चालू करो 🔦',
              'यास्मीन, मुझे तुमसे थोड़ी नाराज़गी है 🥺',
              'तुम मुझसे कितना प्यार करती हो? 🥰',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSendMessage(chip)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-purple-950/40 border border-purple-500/20 hover:border-pink-500 hover:bg-pink-500/20 text-[11px] text-slate-300 hover:text-white transition-all"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-3 bg-slate-950 border-t border-purple-500/20 flex items-center gap-2">
            {/* Mic Button for Hindi Speech-to-Text */}
            <button
              onClick={toggleListening}
              className={`p-3 rounded-xl transition-all shadow-md ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                  : 'bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/30'
              }`}
              title={isListening ? 'सुनना बंद करें' : 'हिंदी में बोलकर कमांड दें'}
            >
              {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            {/* Input Field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isListening ? 'यास्मीन सुन रही है... बोलिए' : 'यास्मीन से हिंदी में बात करें या कमांड दें...'}
              className="flex-1 bg-slate-900 border border-purple-500/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-all"
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="p-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white transition-all disabled:opacity-40 disabled:pointer-events-none shadow-md"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Column: Android Phone Control Panel & Hardware Simulation (Desktop) */}
        <div className="hidden lg:block lg:col-span-4 h-[calc(100vh-140px)] overflow-y-auto">
          <PhoneControlPanel
            deviceState={deviceState}
            onToggleTorch={() => {
              const newState = !deviceState.torchOn;
              sounds.playToggleSound();
              setDeviceState((prev) => ({ ...prev, torchOn: newState }));
              setScreenTorchActive(newState);
              showToast(newState ? '🔦 टॉर्च चालू है' : '🔦 टॉर्च बंद है');
            }}
            onVolumeChange={(val) => {
              setDeviceState((prev) => ({ ...prev, volume: val }));
              sounds.playToggleSound();
            }}
            onOpenApp={(appName) => {
              executeAction({
                type: 'OPEN_APP',
                params: { appName },
                description: `${appName} ऐप खोला जा रहा है`,
              });
            }}
            onSearchYouTube={(query) => {
              executeAction({
                type: 'YOUTUBE_SEARCH',
                params: { query },
                description: `YouTube पर "${query}" खोजा जा रहा है`,
              });
            }}
            onPerformGesture={(type) => {
              if (type === 'scroll_up' || type === 'scroll_down') {
                executeAction({
                  type: 'GESTURE_SCROLL',
                  params: { scrollDirection: type === 'scroll_up' ? 'up' : 'down' },
                  description: `स्क्रीन ${type === 'scroll_up' ? 'ऊपर' : 'नीचे'} स्क्रॉल की गई`,
                });
              } else {
                executeAction({
                  type: 'GESTURE_TAP',
                  params: {},
                  description: `${type.toUpperCase()} जेस्चर निष्पादित हुआ`,
                });
              }
            }}
            onTriggerAction={(action) => {
              if (confirmSensitive && action.params?.confirmRequired) {
                setPendingConfirmation(action);
              } else {
                executeAction(action);
              }
            }}
          />
        </div>
      </main>

      {/* Mobile Drawer for Phone Control Panel */}
      {showPhonePanelMobile && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm p-4 flex items-end">
          <div className="w-full bg-slate-900 rounded-2xl border border-purple-500/30 max-h-[80vh] overflow-y-auto p-2">
            <div className="flex justify-end p-2">
              <button
                onClick={() => setShowPhonePanelMobile(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <PhoneControlPanel
              deviceState={deviceState}
              onToggleTorch={() => {
                const newState = !deviceState.torchOn;
                sounds.playToggleSound();
                setDeviceState((prev) => ({ ...prev, torchOn: newState }));
                setScreenTorchActive(newState);
              }}
              onVolumeChange={(val) => setDeviceState((prev) => ({ ...prev, volume: val }))}
              onOpenApp={(name) => executeAction({ type: 'OPEN_APP', params: { appName: name }, description: `${name} खोला गया` })}
              onSearchYouTube={(q) => executeAction({ type: 'YOUTUBE_SEARCH', params: { query: q }, description: `YouTube: ${q}` })}
              onPerformGesture={(g) => showToast(`Gesture: ${g}`)}
              onTriggerAction={(a) => {
                setShowPhonePanelMobile(false);
                if (confirmSensitive && a.params?.confirmRequired) {
                  setPendingConfirmation(a);
                } else {
                  executeAction(a);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Full-Screen Voice Live Mode (Gemini Voice Assistant) */}
      <VoiceAssistantMode
        isOpen={isVoiceModeOpen}
        onClose={() => setIsVoiceModeOpen(false)}
        isListening={isListening}
        isSpeaking={isSpeaking}
        currentTranscript={speechTranscript}
        yasminReply={messages[messages.length - 1]?.sender === 'yasmin' ? messages[messages.length - 1].text : ''}
        mood={currentMood}
        loveMeter={relationship.loveMeter}
        onToggleMic={toggleListening}
        onSendCommand={(cmd) => {
          handleSendMessage(cmd);
        }}
        lastAction={messages[messages.length - 1]?.action}
      />

      {/* Android Studio Project & APK Code Modal */}
      {isAndroidProjectOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center">
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAndroidProjectOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <AndroidProjectViewer />
          </div>
        </div>
      )}

      {/* Settings & Relationship Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        relationship={relationship}
        onUpdateNickname={(name) => setRelationship((prev) => ({ ...prev, nickname: name }))}
        ttsEngine={ttsEngine}
        onChangeTtsEngine={setTtsEngine}
        voicePitch={voicePitch}
        onChangeVoicePitch={setVoicePitch}
        voiceRate={voiceRate}
        onChangeVoiceRate={setVoiceRate}
        autoSpeak={autoSpeak}
        onToggleAutoSpeak={() => setAutoSpeak(!autoSpeak)}
        confirmSensitive={confirmSensitive}
        onToggleConfirmSensitive={() => setConfirmSensitive(!confirmSensitive)}
      />

      {/* Confirmation Modal for Sensitive Actions (Calls & SMS) */}
      <ConfirmationModal
        isOpen={!!pendingConfirmation}
        action={pendingConfirmation}
        onConfirm={() => {
          if (pendingConfirmation) {
            executeAction(pendingConfirmation);
            setPendingConfirmation(null);
          }
        }}
        onCancel={() => {
          setPendingConfirmation(null);
          showToast('कार्रवाई रद्द कर दी गई');
        }}
      />
    </div>
  );
}

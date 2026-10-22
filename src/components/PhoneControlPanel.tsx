import React, { useState } from 'react';
import { 
  Flashlight, 
  Volume2, 
  VolumeX, 
  BatteryCharging, 
  Smartphone, 
  Youtube, 
  MessageSquare, 
  PhoneCall, 
  Camera, 
  Sliders, 
  ChevronUp, 
  ChevronDown, 
  HandMetal, 
  CheckCircle,
  ExternalLink,
  ShieldAlert,
  Search
} from 'lucide-react';
import { DeviceState, ActionPayload } from '../types';

interface PhoneControlPanelProps {
  deviceState: DeviceState;
  onToggleTorch: () => void;
  onVolumeChange: (val: number) => void;
  onOpenApp: (appName: string) => void;
  onSearchYouTube: (query: string) => void;
  onPerformGesture: (type: 'scroll_up' | 'scroll_down' | 'tap' | 'home' | 'back') => void;
  onTriggerAction: (action: ActionPayload) => void;
  className?: string;
}

export const PhoneControlPanel: React.FC<PhoneControlPanelProps> = ({
  deviceState,
  onToggleTorch,
  onVolumeChange,
  onOpenApp,
  onSearchYouTube,
  onPerformGesture,
  onTriggerAction,
  className = '',
}) => {
  const [ytQuery, setYtQuery] = useState('');
  const [quickPhoneNum, setQuickPhoneNum] = useState('');
  const [quickMessage, setQuickMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'quick' | 'apps' | 'gestures' | 'actions'>('quick');

  const apps = [
    { name: 'YouTube', icon: Youtube, color: 'text-red-400 bg-red-500/10 border-red-500/30' },
    { name: 'WhatsApp', icon: MessageSquare, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    { name: 'Camera', icon: Camera, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
    { name: 'Phone', icon: PhoneCall, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    { name: 'Settings', icon: Sliders, color: 'text-slate-300 bg-slate-500/10 border-slate-500/30' },
    { name: 'Browser', icon: ExternalLink, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  ];

  return (
    <div className={`rounded-2xl border border-purple-500/20 bg-slate-900/80 backdrop-blur-xl p-4 shadow-xl flex flex-col gap-4 text-slate-200 ${className}`}>
      {/* Header with Device Status bar */}
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-pink-400" />
          <span className="font-semibold text-sm text-pink-200">Android फोन कंट्रोलर</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Active
          </span>
        </div>

        {/* Live Device Hardware status pills */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <BatteryCharging className={`w-4 h-4 ${deviceState.batteryLevel < 20 ? 'text-red-400' : 'text-emerald-400'}`} />
            <span>{deviceState.batteryLevel}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>{deviceState.volume}%</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-slate-950/60 p-1 rounded-xl text-xs font-medium">
        <button
          onClick={() => setActiveTab('quick')}
          className={`py-1.5 rounded-lg transition-all ${
            activeTab === 'quick' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          क्विक टूल्स
        </button>
        <button
          onClick={() => setActiveTab('apps')}
          className={`py-1.5 rounded-lg transition-all ${
            activeTab === 'apps' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ऐप्स
        </button>
        <button
          onClick={() => setActiveTab('gestures')}
          className={`py-1.5 rounded-lg transition-all ${
            activeTab === 'gestures' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          जेस्चर्स
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`py-1.5 rounded-lg transition-all ${
            activeTab === 'actions' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          कॉल/SMS
        </button>
      </div>

      {/* Tab: Quick Hardware Tools */}
      {activeTab === 'quick' && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            {/* Torch Toggle */}
            <button
              onClick={onToggleTorch}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                deviceState.torchOn
                  ? 'bg-amber-400/20 border-amber-400 text-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                  : 'bg-slate-800/50 border-purple-500/20 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Flashlight className={`w-5 h-5 ${deviceState.torchOn ? 'text-amber-300 animate-pulse' : 'text-slate-400'}`} />
              <div className="text-left">
                <div className="text-xs font-semibold">टॉर्च (Flashlight)</div>
                <div className="text-[10px] text-slate-400">{deviceState.torchOn ? 'चालू है' : 'बंद है'}</div>
              </div>
            </button>

            {/* Volume Quick Mute/Toggle */}
            <button
              onClick={() => onVolumeChange(deviceState.volume === 0 ? 80 : 0)}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-purple-500/20 hover:bg-slate-800 transition-all text-slate-300"
            >
              {deviceState.volume === 0 ? (
                <VolumeX className="w-5 h-5 text-rose-400" />
              ) : (
                <Volume2 className="w-5 h-5 text-cyan-400" />
              )}
              <div className="text-left">
                <div className="text-xs font-semibold">वॉल्यूम कंट्रोल</div>
                <div className="text-[10px] text-slate-400">{deviceState.volume === 0 ? 'म्यूट' : `${deviceState.volume}%`}</div>
              </div>
            </button>
          </div>

          {/* Volume Slider */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-purple-500/10 flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>आवाज़ का स्तर (Volume Slider)</span>
              <span className="text-cyan-300 font-semibold">{deviceState.volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={deviceState.volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-full accent-pink-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* YouTube Fast Search Bar */}
          <div className="bg-slate-950/40 p-3 rounded-xl border border-purple-500/10 flex flex-col gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Youtube className="w-4 h-4 text-red-400" />
              YouTube पर गाना या वीडियो खोजें
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="उदा. अरिजीत सिंह के रोमांटिक गाने..."
                value={ytQuery}
                onChange={(e) => setYtQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && ytQuery.trim()) {
                    onSearchYouTube(ytQuery);
                    setYtQuery('');
                  }
                }}
                className="flex-1 bg-slate-900 border border-purple-500/20 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
              <button
                onClick={() => {
                  if (ytQuery.trim()) {
                    onSearchYouTube(ytQuery);
                    setYtQuery('');
                  }
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                खोजें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Apps Launcher */}
      {activeTab === 'apps' && (
        <div className="grid grid-cols-3 gap-2">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.name}
                onClick={() => onOpenApp(app.name)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all hover:scale-105 active:scale-95 ${app.color}`}
              >
                <Icon className="w-6 h-6 mb-1.5" />
                <span className="text-xs font-semibold text-slate-200">{app.name}</span>
                <span className="text-[9px] text-slate-400 mt-0.5">खोलें</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Tab: Accessibility Gestures */}
      {activeTab === 'gestures' && (
        <div className="flex flex-col gap-2">
          <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-300 flex items-center gap-2">
            <HandMetal className="w-4 h-4 text-pink-400 shrink-0" />
            <span>Android Accessibility Service स्क्रीन स्वाइप और ऑटो-स्क्रॉल सिमुलेशन</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onPerformGesture('scroll_up')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800/60 border border-purple-500/20 hover:bg-slate-800 text-xs text-slate-200"
            >
              <ChevronUp className="w-4 h-4 text-pink-400" />
              ऊपर स्क्रॉल करें
            </button>
            <button
              onClick={() => onPerformGesture('scroll_down')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800/60 border border-purple-500/20 hover:bg-slate-800 text-xs text-slate-200"
            >
              <ChevronDown className="w-4 h-4 text-pink-400" />
              नीचे स्क्रॉल करें
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => onPerformGesture('back')}
              className="p-2 rounded-lg bg-slate-900 border border-purple-500/20 hover:bg-slate-800 text-[11px] text-slate-300"
            >
              ◀ Back बटन
            </button>
            <button
              onClick={() => onPerformGesture('home')}
              className="p-2 rounded-lg bg-slate-900 border border-purple-500/20 hover:bg-slate-800 text-[11px] text-slate-300"
            >
              ● Home बटन
            </button>
            <button
              onClick={() => onPerformGesture('tap')}
              className="p-2 rounded-lg bg-slate-900 border border-purple-500/20 hover:bg-slate-800 text-[11px] text-slate-300"
            >
              👆 ऑटो-टैप
            </button>
          </div>
        </div>
      )}

      {/* Tab: Calls & SMS with Confirmation Protection */}
      {activeTab === 'actions' && (
        <div className="flex flex-col gap-2.5">
          <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>संवेदनशील काम (कॉल/मैसेज) करने से पहले पुष्टि अनिवार्य है</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-slate-400">फ़ोन नंबर</label>
            <input
              type="tel"
              placeholder="+91 9876543210"
              value={quickPhoneNum}
              onChange={(e) => setQuickPhoneNum(e.target.value)}
              className="bg-slate-900 border border-purple-500/20 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-slate-400">संदेश (SMS)</label>
            <input
              type="text"
              placeholder="नमस्ते, क्या आप फ्री हैं?"
              value={quickMessage}
              onChange={(e) => setQuickMessage(e.target.value)}
              className="bg-slate-900 border border-purple-500/20 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                if (quickPhoneNum.trim()) {
                  onTriggerAction({
                    type: 'CALL',
                    params: { phoneNumber: quickPhoneNum, confirmRequired: true },
                    description: `फ़ोन नंबर ${quickPhoneNum} पर कॉल करें`,
                  });
                }
              }}
              className="p-2.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              कॉल करें
            </button>
            <button
              onClick={() => {
                if (quickPhoneNum.trim() && quickMessage.trim()) {
                  onTriggerAction({
                    type: 'SMS',
                    params: { phoneNumber: quickPhoneNum, message: quickMessage, confirmRequired: true },
                    description: `${quickPhoneNum} को संदेश भेजें: "${quickMessage}"`,
                  });
                }
              }}
              className="p-2.5 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              SMS भेजें
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

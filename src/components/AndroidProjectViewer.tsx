import React, { useState } from 'react';
import JSZip from 'jszip';
import { 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  Layers, 
  Terminal, 
  Smartphone, 
  ShieldCheck, 
  HelpCircle,
  FolderOpen,
  Code2
} from 'lucide-react';
import { ANDROID_PROJECT_FILES } from '../utils/androidProjectData';

export const AndroidProjectViewer: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'gradle' | 'guide' | 'permissions'>('gradle');
  const [gradleFlavor, setGradleFlavor] = useState<'groovy' | 'kotlin'>('groovy');

  const selectedFile = ANDROID_PROJECT_FILES[selectedFileIndex] || ANDROID_PROJECT_FILES[0];

  const handleCopyCode = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Populate files into zip structure
      ANDROID_PROJECT_FILES.forEach((file) => {
        zip.file(file.path, file.content);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'YasminAI-Android-Studio-Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to create project ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const appBuildGradleFile = ANDROID_PROJECT_FILES.find((f) => 
    gradleFlavor === 'groovy' ? f.path === 'app/build.gradle' : f.path === 'app/build.gradle.kts'
  );

  const rootBuildGradleFile = ANDROID_PROJECT_FILES.find((f) => 
    gradleFlavor === 'groovy' ? f.path === 'build.gradle' : f.path === 'build.gradle.kts'
  );

  const gradlePropsFile = ANDROID_PROJECT_FILES.find((f) => f.path === 'gradle.properties');

  return (
    <div className="flex flex-col gap-4 text-slate-100">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-900/60 via-pink-900/40 to-slate-900/90 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Yasmin AI – Android Studio Project & build.gradle
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Ready to Build
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              पूरा Android Studio प्रोजेक्ट तैयार है। यहाँ से आप सीधे <code className="text-pink-300 font-mono">build.gradle</code> कॉपी कर सकते हैं या पूरी ज़िप डाउनलोड कर सकते हैं।
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium text-xs shadow-lg shadow-pink-500/25 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
        >
          {isZipping ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>ज़िप फाइल तैयार हो रही है...</span>
            </>
          ) : zipSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>डाउनलोड हो गया!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>पूरा प्रोजेक्ट डाउनलोड करें (.ZIP)</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-purple-500/20 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('gradle')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'gradle'
              ? 'bg-pink-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Code2 className="w-4 h-4" />
          build.gradle (क्विक कॉपी)
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'files'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileCode className="w-4 h-4" />
          सभी फाइल्स ({ANDROID_PROJECT_FILES.length})
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'guide'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          APK बिल्ड गाइड
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'permissions'
              ? 'bg-purple-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          सुरक्षा और परमिशन
        </button>
      </div>

      {/* Tab: Direct build.gradle copy */}
      {activeTab === 'gradle' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-900/90 rounded-xl border border-purple-500/20">
            <span className="text-xs text-slate-300">
              फॉर्मेट चुनें (Format):
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setGradleFlavor('groovy')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  gradleFlavor === 'groovy'
                    ? 'bg-pink-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Groovy DSL (build.gradle) - स्टैंडर्ड
              </button>
              <button
                onClick={() => setGradleFlavor('kotlin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  gradleFlavor === 'kotlin'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Kotlin DSL (build.gradle.kts)
              </button>
            </div>
          </div>

          {/* Module App build.gradle */}
          <div className="bg-slate-950 rounded-xl border border-purple-500/20 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-pink-300 font-bold">
                  {gradleFlavor === 'groovy' ? 'app/build.gradle' : 'app/build.gradle.kts'}
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">(Module-level)</span>
              </div>
              <button
                onClick={() => handleCopyCode('app-gradle', appBuildGradleFile?.content || '')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-pink-600/80 hover:bg-pink-600 text-xs font-medium text-white transition-all shadow"
              >
                {copiedKey === 'app-gradle' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'app-gradle' ? 'कॉपी हुआ!' : 'app/build.gradle कॉपी करें'}</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[300px] leading-relaxed selection:bg-pink-500/30">
              <code>{appBuildGradleFile?.content}</code>
            </pre>
          </div>

          {/* Root Project build.gradle */}
          <div className="bg-slate-950 rounded-xl border border-purple-500/20 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-purple-300 font-bold">
                  {gradleFlavor === 'groovy' ? 'build.gradle' : 'build.gradle.kts'}
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">(Project-level Root)</span>
              </div>
              <button
                onClick={() => handleCopyCode('root-gradle', rootBuildGradleFile?.content || '')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-xs font-medium text-white transition-all shadow"
              >
                {copiedKey === 'root-gradle' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'root-gradle' ? 'कॉपी हुआ!' : 'Root build.gradle कॉपी करें'}</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[220px] leading-relaxed selection:bg-pink-500/30">
              <code>{rootBuildGradleFile?.content}</code>
            </pre>
          </div>

          {/* gradle.properties */}
          <div className="bg-slate-950 rounded-xl border border-purple-500/20 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-cyan-300 font-bold">gradle.properties</span>
              </div>
              <button
                onClick={() => handleCopyCode('props', gradlePropsFile?.content || '')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-all"
              >
                {copiedKey === 'props' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'props' ? 'कॉपी हुआ!' : 'gradle.properties कॉपी करें'}</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[140px] leading-relaxed">
              <code>{gradlePropsFile?.content}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Tab: All files browser */}
      {activeTab === 'files' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 min-h-[460px]">
          {/* File Tree / Sidebar */}
          <div className="md:col-span-4 bg-slate-900/90 rounded-xl border border-purple-500/20 p-2.5 flex flex-col gap-1 max-h-[500px] overflow-y-auto">
            <span className="text-[11px] font-semibold text-purple-300 px-2 py-1 uppercase tracking-wider flex items-center gap-1">
              <FolderOpen className="w-3.5 h-3.5" />
              प्रोजेक्ट फाइल्स
            </span>

            {ANDROID_PROJECT_FILES.map((file, idx) => (
              <button
                key={file.path}
                onClick={() => setSelectedFileIndex(idx)}
                className={`w-full text-left p-2 rounded-lg text-xs transition-all flex flex-col gap-0.5 ${
                  selectedFileIndex === idx
                    ? 'bg-pink-500/20 border border-pink-500/40 text-pink-200'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="font-mono font-medium truncate">{file.filename}</div>
                <div className="text-[10px] text-slate-400 truncate">{file.path}</div>
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="md:col-span-8 bg-slate-950 rounded-xl border border-purple-500/20 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-purple-500/20">
              <div className="flex flex-col">
                <span className="font-mono text-xs text-pink-300 font-semibold">{selectedFile.filename}</span>
                <span className="text-[10px] text-slate-400">{selectedFile.description}</span>
              </div>
              <button
                onClick={() => handleCopyCode('viewer', selectedFile.content)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-all"
              >
                {copiedKey === 'viewer' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'viewer' ? 'कॉपी हो गया' : 'कोड कॉपी करें'}</span>
              </button>
            </div>

            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto overflow-y-auto max-h-[460px] leading-relaxed selection:bg-pink-500/30">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Tab: Build Guide */}
      {activeTab === 'guide' && (
        <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-purple-500/20 flex flex-col gap-4 text-slate-200 text-xs leading-relaxed">
          <h3 className="text-sm font-bold text-pink-300">Android Studio में APK बनाने के 4 आसान चरण:</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-purple-500/20 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-pink-400 font-semibold text-xs">
                <span className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center text-[11px]">1</span>
                Android Studio में प्रोजेक्ट खोलें
              </div>
              <p className="text-slate-400 text-[11px]">
                ऊपर दिए गए <b>"पूरा प्रोजेक्ट डाउनलोड करें (.ZIP)"</b> बटन से ज़िप डाउनलोड करें और उसे अनज़िप करें। Android Studio खोलकर <b>File &gt; Open</b> चुनें।
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-purple-500/20 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-pink-400 font-semibold text-xs">
                <span className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center text-[11px]">2</span>
                Gradle Sync पूरा होने दें
              </div>
              <p className="text-slate-400 text-[11px]">
                प्रोजेक्ट खुलने पर Android Studio आवश्यक लाइब्रेरी (OkHttp, Jetpack Core, AndroidX) अपने आप डाउनलोड करेगा।
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-purple-500/20 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-pink-400 font-semibold text-xs">
                <span className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center text-[11px]">3</span>
                APK कमांड चलाएँ
              </div>
              <p className="text-slate-400 text-[11px]">
                Android Studio के Terminal में यह कमांड टाइप करें:
              </p>
              <div className="p-2 rounded bg-slate-900 font-mono text-[11px] text-pink-300 flex items-center justify-between">
                <span>./gradlew assembleDebug</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-purple-500/20 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-pink-400 font-semibold text-xs">
                <span className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center text-[11px]">4</span>
                फ़ोन में इनस्टॉल करें
              </div>
              <p className="text-slate-400 text-[11px]">
                बिल्ड पूरा होते ही APK इस पाथ पर मिलेगा: <br />
                <code className="text-cyan-300 font-mono text-[10px]">app/build/outputs/apk/debug/app-debug.apk</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Permissions & Security */}
      {activeTab === 'permissions' && (
        <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-purple-500/20 flex flex-col gap-3 text-xs text-slate-300">
          <h3 className="text-sm font-bold text-pink-300">Android सुरक्षा और अनुमतियों का स्पष्ट विवरण:</h3>

          <div className="flex flex-col gap-2">
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Accessibility Service (स्क्रीन टच और स्क्रॉल):</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Android नियमों के अनुसार, किसी भी ऐप को स्क्रीन पर ऑटो-टैप या स्क्रॉल करने के लिए यूज़र द्वारा फोन सेटिंग्स में जाकर "Accessibility &gt; Yasmin AI" को मैन्युअली ऑन करना आवश्यक है। यह यूज़र की अनुमति के बिना चालू नहीं हो सकता।
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">संवेदनशील कार्यों पर पूर्व-पुष्टि (Pre-confirmation):</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  कॉल करने या SMS भेजने से पहले यास्मीन आपसे स्क्रीन पर "हाँ" या "नहीं" की पुष्टि लेती है, ताकि कोई भी गलत नंबर या गलती से मैसेज न जाए।
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">बैकग्राउंड वॉइस लिसनिंग और बैटरी सीमाएँ:</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Android 14 में बैकग्राउंड में आवाज़ सुनने के लिए <code className="text-pink-300 font-mono">FOREGROUND_SERVICE_MICROPHONE</code> और परसिस्टेंट नोटिफिकेशन दिया गया है, ताकि Android OS इसे बैटरी सेवर द्वारा किल न करे।
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

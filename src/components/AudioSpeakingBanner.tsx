import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Language } from '../types';

interface AudioSpeakingBannerProps {
  isSpeaking: boolean;
  language: Language;
  onStop: () => void;
  speechRate: number;
  onToggleRate: () => void;
  activeSnippet?: string;
}

export const AudioSpeakingBanner: React.FC<AudioSpeakingBannerProps> = ({
  isSpeaking,
  language,
  onStop,
  speechRate,
  onToggleRate,
  activeSnippet,
}) => {
  if (!isSpeaking) return null;

  const isHi = language === 'hi';
  const isMr = language === 'mr';

  return (
    <aside
      aria-label={isMr ? 'ऑडिओ नियंत्रक' : isHi ? 'ऑडियो वाचन नियंत्रक' : 'Audio Player'}
      className="fixed bottom-6 left-4 sm:left-6 z-40 w-[88%] sm:w-auto sm:max-w-md bg-stone-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 ring-4 ring-emerald-500/15"
    >
      {/* Left: Animated Speaking Indicator & Equalizer Bars */}
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Pulsing Speaker Halo Icon */}
        <div className="relative w-11 h-11 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 shadow-lg ring-4 ring-emerald-400/30">
          <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" />
          <div className="absolute inset-0 rounded-full bg-emerald-500 animate-pulse opacity-75" />
          <Volume2 className="w-5 h-5 text-white relative z-10 animate-bounce" />
        </div>

        {/* 5 Animated Equalizer Wave Bars */}
        <div className="flex items-end gap-1 h-7 shrink-0 py-1" aria-hidden="true">
          <span className="w-1.5 bg-emerald-400 rounded-full animate-wave-1" />
          <span className="w-1.5 bg-emerald-300 rounded-full animate-wave-2" />
          <span className="w-1.5 bg-teal-300 rounded-full animate-wave-3" />
          <span className="w-1.5 bg-emerald-400 rounded-full animate-wave-4" />
          <span className="w-1.5 bg-emerald-200 rounded-full animate-wave-2" />
        </div>

        {/* Status Text & Truncated Snippet */}
        <div className="min-w-0">
          <span className="text-xs font-bold text-emerald-300 block tracking-wide uppercase">
            {isMr
              ? 'NIRBHAR बोलत आहे...'
              : isHi
              ? 'NIRBHAR बोल रहा है...'
              : 'NIRBHAR is speaking...'}
          </span>
          <p className="text-xs text-stone-300 truncate font-medium">
            {activeSnippet ||
              (isMr
                ? 'सूचना स्पष्ट आवाजात वाचल्या जात आहेत'
                : isHi
                ? 'निर्देश स्पष्ट आवाज़ में सुने जा रहे हैं'
                : 'Reading aloud with clear pronunciation')}
          </p>
        </div>
      </div>

      {/* Right: Senior Pace Toggle & Stop Button */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Speed Toggle */}
        <button
          onClick={onToggleRate}
          className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
          title={isMr ? 'गती बदला' : isHi ? 'गति बदलें' : 'Change voice speed'}
        >
          {speechRate <= 0.85 ? (isMr ? '🐢 हळू' : isHi ? '🐢 धीमी' : '🐢 0.85x') : '1.0x'}
        </button>

        {/* Stop Audio Button */}
        <button
          onClick={onStop}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm active:scale-95"
          title={isMr ? 'आवाज थांबवा' : isHi ? 'आवाज़ रोकें' : 'Stop audio'}
        >
          <VolumeX className="w-4 h-4" />
          <span>{isMr ? 'थांबा' : isHi ? 'रोकें' : 'Stop'}</span>
        </button>
      </div>
    </aside>
  );
};

import React from 'react';
import { VolumeX, Languages, Type, Eye, WifiOff, FileText, Sparkles } from 'lucide-react';
import { AccessibilitySettings, Language } from '../types';

interface AccessibilityBarProps {
  settings: AccessibilitySettings;
  onUpdateSettings: (updater: (prev: AccessibilitySettings) => AccessibilitySettings) => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  onOpenCheatSheet: () => void;
  onOpenGuidedTour: () => void;
}

export const AccessibilityBar: React.FC<AccessibilityBarProps> = ({
  settings,
  onUpdateSettings,
  isSpeaking,
  onStopSpeaking,
  onOpenCheatSheet,
  onOpenGuidedTour,
}) => {
  const isHi = settings.language === 'hi';
  const isMr = settings.language === 'mr';

  const setLanguage = (lang: Language) => {
    onUpdateSettings((prev) => ({
      ...prev,
      language: lang,
    }));
  };

  const cycleTextScale = () => {
    onUpdateSettings((prev) => {
      const nextScale =
        prev.textScale === 'normal'
          ? 'large'
          : prev.textScale === 'large'
          ? 'xl'
          : 'normal';
      return { ...prev, textScale: nextScale };
    });
  };

  const toggleHighContrast = () => {
    onUpdateSettings((prev) => ({
      ...prev,
      highContrast: !prev.highContrast,
    }));
  };

  const toggleLowBandwidth = () => {
    onUpdateSettings((prev) => ({
      ...prev,
      lowBandwidth: !prev.lowBandwidth,
    }));
  };

  return (
    <div className="bg-[#f4f1ea] border-b border-[#e5dec9] py-1.5 px-4 text-xs text-stone-700">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Accessibility Toggles */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Language Switcher */}
          <div
            className="flex items-center gap-1 bg-white border border-stone-300 rounded-lg p-0.5 shadow-2xs"
            role="group"
            aria-label="Select Language / भाषा चुनें"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-700 ml-1.5 mr-0.5 shrink-0" />
            {(
              [
                { id: 'en', label: 'English' },
                { id: 'hi', label: 'हिंदी' },
                { id: 'mr', label: 'मराठी' },
              ] as { id: Language; label: string }[]
            ).map((langItem) => (
              <button
                key={langItem.id}
                onClick={() => setLanguage(langItem.id)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  settings.language === langItem.id
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                {langItem.label}
              </button>
            ))}
          </div>

          {/* Text Size Scale */}
          <button
            onClick={cycleTextScale}
            className="flex items-center gap-1 px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-stone-800 font-medium hover:bg-stone-100 transition-colors cursor-pointer"
            title="Increase or decrease text size"
          >
            <Type className="w-3.5 h-3.5 text-emerald-700" />
            <span>
              {isMr ? 'अक्षर आकार: ' : isHi ? 'अक्षर आकार: ' : 'Text: '}
              <strong className="text-emerald-900">
                {settings.textScale === 'normal'
                  ? 'A'
                  : settings.textScale === 'large'
                  ? 'A+'
                  : 'A++'}
              </strong>
            </span>
          </button>

          {/* High Contrast */}
          <button
            onClick={toggleHighContrast}
            className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-lg transition-colors cursor-pointer ${
              settings.highContrast
                ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                : 'bg-white border-stone-300 text-stone-800 hover:bg-stone-100'
            }`}
            title="High contrast for bright sunlight or weak eyesight"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isMr ? 'हाय कॉन्ट्रास्ट' : isHi ? 'उच्च कंट्रास्ट' : 'High Contrast'}</span>
          </button>

          {/* Low Internet / Text Mode */}
          <button
            onClick={toggleLowBandwidth}
            className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-lg transition-colors cursor-pointer ${
              settings.lowBandwidth
                ? 'bg-emerald-800 text-white border-emerald-900 font-semibold'
                : 'bg-white border-stone-300 text-stone-800 hover:bg-stone-100'
            }`}
            title="Low-bandwidth / Simple text mode"
          >
            <WifiOff className="w-3.5 h-3.5" />
            <span>{isMr ? 'कमी इंटरनेट मोड' : isHi ? 'कम इंटरनेट मोड' : '2G / Low Internet'}</span>
          </button>
        </div>

        {/* Right Quick Tools: Stop Speech & Printable Rules */}
        <div className="flex items-center gap-2">
          {isSpeaking && (
            <button
              onClick={onStopSpeaking}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-800 border border-red-300 rounded-lg font-medium hover:bg-red-200 transition-colors cursor-pointer animate-pulse"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>{isMr ? 'आवाज बंद करा' : isHi ? 'आवाज़ बंद करें' : 'Stop Speaking'}</span>
            </button>
          )}

          <button
            onClick={onOpenGuidedTour}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
            title="Start Guided Tour / मार्गदर्शन टूर"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isMr ? 'मार्गदर्शन टूर' : isHi ? 'मार्गदर्शन टूर (Guide)' : 'Quick Tour'}</span>
          </button>

          <button
            onClick={onOpenCheatSheet}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-stone-300 rounded-lg text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isMr ? '१० सुरक्षा नियम' : isHi ? '10 सुरक्षा नियम (प्रिंट)' : '10 Safety Rules'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

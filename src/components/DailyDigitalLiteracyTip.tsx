import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Volume2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Mic,
  Camera,
  ShieldAlert,
  QrCode,
  Award,
} from 'lucide-react';
import { Language } from '../types';
import {
  DAILY_LITERACY_TIPS,
  DailyTip,
  SkillPillar,
  getTodaysTipIndex,
  getLearningProfile,
  markDailyTipLearned,
  getTipForPillar,
} from '../utils/learningTracker';
import { playSuccessChime, playKeypadClick } from '../utils/audioEffects';

interface DailyDigitalLiteracyTipProps {
  language: Language;
  onSpeak: (text: string, customRate?: number) => void;
  isSpeaking?: boolean;
  onSelectTab?: (tab: string) => void;
  onAskQuestion?: (questionText: string) => void;
}

export const DailyDigitalLiteracyTip: React.FC<DailyDigitalLiteracyTipProps> = ({
  language,
  onSpeak,
  isSpeaking,
  onSelectTab,
  onAskQuestion,
}) => {
  const isHi = language === 'hi';
  const isMr = language === 'mr';
  const isIndic = isHi || isMr;
  const [currentIndex, setCurrentIndex] = useState<number>(() => getTodaysTipIndex());
  const [completedTips, setCompletedTips] = useState<string[]>(() => getLearningProfile().completedTipIds);
  const [showSteps, setShowSteps] = useState<boolean>(true);

  useEffect(() => {
    const syncProfile = () => {
      setCompletedTips(getLearningProfile().completedTipIds);
    };
    window.addEventListener('saathi-learning-updated', syncProfile);
    return () => window.removeEventListener('saathi-learning-updated', syncProfile);
  }, []);

  const tip: DailyTip = DAILY_LITERACY_TIPS[currentIndex] || DAILY_LITERACY_TIPS[0];
  const isLearned = completedTips.includes(tip.id);
  const isTodaysFeatured = currentIndex === getTodaysTipIndex();

  const handlePrevTip = () => {
    playKeypadClick();
    setCurrentIndex((prev) => (prev - 1 + DAILY_LITERACY_TIPS.length) % DAILY_LITERACY_TIPS.length);
  };

  const handleNextTip = () => {
    playKeypadClick();
    setCurrentIndex((prev) => (prev + 1) % DAILY_LITERACY_TIPS.length);
  };

  const handleListenTip = () => {
    playKeypadClick();
    const title = isIndic ? tip.titleHi : tip.titleEn;
    const summary = isIndic ? tip.summaryHi : tip.summaryEn;
    const steps = (isIndic ? tip.microStepsHi : tip.microStepsEn).join('. ');
    const rule = isIndic ? tip.goldenRuleHi : tip.goldenRuleEn;
    onSpeak(`${title}. ${summary}. ${steps}. ${rule}`);
  };

  const handleMarkLearned = () => {
    playSuccessChime();
    const updated = markDailyTipLearned(tip.id);
    setCompletedTips(updated.completedTipIds);
  };

  const handlePracticeSkill = () => {
    playKeypadClick();
    if (tip.targetTab === 'assistant' && onAskQuestion) {
      onAskQuestion(isIndic ? tip.practicePromptHi : tip.practicePromptEn);
    } else if (onSelectTab) {
      onSelectTab(tip.targetTab);
    }
  };

  const getPillarIcon = (pillar: SkillPillar) => {
    switch (pillar) {
      case 'voice-assistant':
        return <Mic className="w-4 h-4 text-indigo-600" />;
      case 'screenshot-camera':
        return <Camera className="w-4 h-4 text-blue-600" />;
      case 'scam-analyzer':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'upi-simulator':
        return <QrCode className="w-4 h-4 text-purple-600" />;
      case 'personalized-learning':
        return <Award className="w-4 h-4 text-emerald-600" />;
    }
  };

  const pillarTabs: { id: SkillPillar; labelEn: string; labelHi: string; labelMr: string }[] = [
    { id: 'voice-assistant', labelEn: '1. Voice & Phone', labelHi: '1. फोन व आवाज़', labelMr: '1. फोन व आवाज' },
    { id: 'screenshot-camera', labelEn: '2. Screenshot Help', labelHi: '2. स्क्रीनशॉट जांच', labelMr: '2. स्क्रीनशॉट मदत' },
    { id: 'scam-analyzer', labelEn: '3. Scam SMS', labelHi: '3. धोखाधड़ी बचाव', labelMr: '3. फसवणूक मेसेज' },
    { id: 'upi-simulator', labelEn: '4. Safe UPI', labelHi: '4. सुरक्षित UPI', labelMr: '4. सुरक्षित UPI' },
    { id: 'personalized-learning', labelEn: '5. Mastery', labelHi: '5. अभ्यास व प्रगति', labelMr: '5. प्रगती व सराव' },
  ];

  return (
    <section
      aria-label={isMr ? 'आजचा डिजिटल साक्षरता नियम' : isHi ? 'आज का डिजिटल साक्षरता टिप' : 'Daily Digital Literacy Tip'}
      className="bg-white border border-indigo-100 rounded-2xl p-5 sm:p-6 shadow-sm transition-all"
    >
      {/* Top Row: Clean Kicker Metadata & Day Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-indigo-50">
        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium flex-wrap">
          <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <span className="font-extrabold text-indigo-900 uppercase tracking-wider">
            {isMr ? 'दैनिक डिजिटल साक्षरता नियम' : isHi ? 'दैनिक डिजिटल साक्षरता टिप' : 'Daily Digital Literacy Tip'}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>
            {isMr
              ? `दिवस ${tip.dayNumber}/${DAILY_LITERACY_TIPS.length}`
              : isHi
              ? `दिन ${tip.dayNumber}/${DAILY_LITERACY_TIPS.length}`
              : `Day ${tip.dayNumber} of ${DAILY_LITERACY_TIPS.length}`}
          </span>
          {isTodaysFeatured && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                {isMr ? 'आजचे विशेष' : isHi ? 'आज का विशेष' : "Today's Tip"}
              </span>
            </>
          )}
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="text-indigo-700 font-bold">
            {completedTips.length}/{DAILY_LITERACY_TIPS.length} {isMr ? 'पूर्ण' : isHi ? 'सीखे गए' : 'Learned'}
          </span>
        </div>

        {/* Day Stepper Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePrevTip}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title={isMr ? 'मागील नियम' : isHi ? 'पिछली टिप' : 'Previous Tip'}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>{isMr ? 'मागील' : isHi ? 'पिछला' : 'Prev'}</span>
          </button>

          <button
            type="button"
            onClick={handleNextTip}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title={isMr ? 'पुढील नियम' : isHi ? 'अगली टिप' : 'Next Tip'}
          >
            <span>{isMr ? 'पुढील' : isHi ? 'अगला टिप' : 'Next Tip'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5-Pillar Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 scrollbar-none">
        {pillarTabs.map((p) => {
          const isActive = tip.pillar === p.id;
          const label = isMr ? p.labelMr : isHi ? p.labelHi : p.labelEn;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                playKeypadClick();
                const matchIdx = DAILY_LITERACY_TIPS.findIndex((t) => t.pillar === p.id);
                if (matchIdx >= 0) setCurrentIndex(matchIdx);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 border border-slate-200 hover:border-indigo-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Main Tip Content */}
      <div className="mt-2 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-indigo-700 font-bold">
              {getPillarIcon(tip.pillar)}
              <span>{isIndic ? tip.categoryHi : tip.categoryEn}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              {isIndic ? tip.titleHi : tip.titleEn}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {isIndic ? tip.summaryHi : tip.summaryEn}
            </p>
          </div>

          {/* Listen Aloud Button with Pulse Animation */}
          <button
            type="button"
            onClick={handleListenTip}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 cursor-pointer transition-all touch-target-senior ${
              isSpeaking
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white ring-4 ring-indigo-200 shadow-md animate-speaking-halo'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs'
            }`}
          >
            <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : ''}`} />
            <span>{isMr ? 'बोलून ऐका' : isHi ? 'बोलकर सुनें' : 'Listen to Tip'}</span>
          </button>
        </div>

        {/* Simplified 3-Step Micro Guide */}
        {showSteps && (
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                {isMr ? 'कसे करावे (३ सोप्या पायऱ्या):' : isHi ? 'इसे कैसे करें (3 आसान कदम):' : 'How to Do It (3 Simple Steps):'}
              </span>
              <button
                type="button"
                onClick={() => setShowSteps(false)}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer font-medium"
              >
                {isMr ? 'लपवा' : isHi ? 'छुपाएं' : 'Hide'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {(isIndic ? tip.microStepsHi : tip.microStepsEn).map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white border border-indigo-100/80 flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 shadow-2xs"
                >
                  <span className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed font-medium">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!showSteps && (
          <button
            type="button"
            onClick={() => setShowSteps(true)}
            className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
          >
            {isMr ? '+ ३ सोप्या पायऱ्या दाखवा' : isHi ? '+ 3 आसान कदम दिखाएं' : '+ Show 3 simple steps'}
          </button>
        )}

        {/* Golden Safety Takeaway & Interactive Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-950 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-semibold">{isIndic ? tip.goldenRuleHi : tip.goldenRuleEn}</span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Mark as Learned Button */}
            <button
              type="button"
              onClick={handleMarkLearned}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isLearned
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-white hover:bg-indigo-50 text-slate-800 border border-slate-200'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isLearned ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>
                {isLearned
                  ? isMr ? 'शिकले ✓' : isHi ? 'सीख लिया ✓' : 'Learned ✓'
                  : isMr ? 'मी शिकलो' : isHi ? 'मैंने सीख लिया' : 'Mark Learned'}
              </span>
            </button>

            {/* Practice This Skill Action */}
            <button
              type="button"
              onClick={handlePracticeSkill}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <span>
                {tip.targetTab === 'assistant'
                  ? isMr
                    ? 'साथीला विचारा'
                    : isHi
                    ? 'साथी से पूछें'
                    : 'Ask Assistant'
                  : isMr
                  ? 'सराव करा'
                  : isHi
                  ? 'अभी अभ्यास करें'
                  : 'Practice Now'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

interface ContextualPillarTipBannerProps {
  pillar: SkillPillar;
  language: Language;
  onSpeak: (text: string) => void;
  actionLabelEn?: string;
  actionLabelHi?: string;
  actionLabelMr?: string;
  onAction?: () => void;
}

export const ContextualPillarTipBanner: React.FC<ContextualPillarTipBannerProps> = ({
  pillar,
  language,
  onSpeak,
  actionLabelEn,
  actionLabelHi,
  actionLabelMr,
  onAction,
}) => {
  const isHi = language === 'hi';
  const isMr = language === 'mr';
  const isIndic = isHi || isMr;
  const tip = getTipForPillar(pillar);
  const [learned, setLearned] = useState<boolean>(() =>
    getLearningProfile().completedTipIds.includes(tip.id)
  );

  const handleListen = () => {
    const title = isIndic ? tip.titleHi : tip.titleEn;
    const summary = isIndic ? tip.summaryHi : tip.summaryEn;
    const rule = isIndic ? tip.goldenRuleHi : tip.goldenRuleEn;
    onSpeak(`${title}. ${summary}. ${rule}`);
  };

  const handleLearn = () => {
    playSuccessChime();
    markDailyTipLearned(tip.id);
    setLearned(true);
  };

  return (
    <div className="bg-white border border-indigo-100 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
      <div className="space-y-1 flex-1">
        <div className="flex items-center gap-2 text-xs text-indigo-700 font-bold">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-extrabold uppercase tracking-wider">
            {isMr ? 'आजचा कौशल्य नियम' : isHi ? 'आज का कौशल टिप' : 'Daily Skill Tip'}
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{isIndic ? tip.categoryHi : tip.categoryEn}</span>
        </div>
        <h3 className="text-base font-bold text-slate-900">
          {isIndic ? tip.titleHi : tip.titleEn}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {isIndic ? tip.summaryHi : tip.summaryEn}{' '}
          <strong className="text-indigo-950 font-bold">
            {isIndic ? tip.goldenRuleHi : tip.goldenRuleEn}
          </strong>
        </p>
      </div>

      <div className="flex items-center flex-wrap gap-2 shrink-0">
        <button
          type="button"
          onClick={handleListen}
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>{isMr ? 'ऐका' : isHi ? 'सुनें' : 'Listen'}</span>
        </button>

        <button
          type="button"
          onClick={handleLearn}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
            learned
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-white hover:bg-indigo-50 text-slate-800 border border-slate-200'
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${learned ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span>
            {learned
              ? isMr ? 'शिकले ✓' : isHi ? 'सीखा ✓' : 'Learned ✓'
              : isMr ? 'समजले' : isHi ? 'समझ गया' : 'Got It'}
          </span>
        </button>

        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>
              {isMr
                ? actionLabelMr || 'सराव करा'
                : isHi
                ? actionLabelHi || 'आजमाएं'
                : actionLabelEn || 'Try Now'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

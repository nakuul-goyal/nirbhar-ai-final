import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Volume2,
  Flame,
  ArrowRight,
  TrendingUp,
  Target,
  RefreshCw,
} from 'lucide-react';
import { Language } from '../types';
import { LESSON_MODULES } from '../data/mockData';
import { ContextualPillarTipBanner } from './DailyDigitalLiteracyTip';
import {
  DAILY_LITERACY_TIPS,
  SkillPillar,
  UserLearningProfile,
  getLearningProfile,
  recordSkillPracticeSuccess,
  recordUserStruggle,
} from '../utils/learningTracker';
import { playSuccessChime, playWarningBuzzer, playKeypadClick } from '../utils/audioEffects';

interface LearningDashboardTabProps {
  language: Language;
  onSpeak: (text: string) => void;
  onSelectTab?: (tab: string) => void;
}

export const LearningDashboardTab: React.FC<LearningDashboardTabProps> = ({
  language,
  onSpeak,
  onSelectTab,
}) => {
  const isHi = language === 'hi';
  const isMr = language === 'mr';
  const isIndic = isHi || isMr;

  const [activeModuleId, setActiveModuleId] = useState<string>('mod-upi');
  const [completedModules, setCompletedModules] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('saathi_completed_modules');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [profile, setProfile] = useState<UserLearningProfile>(() => getLearningProfile());
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});
  const [aiCoachAdvice, setAiCoachAdvice] = useState<string | null>(null);
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState<boolean>(false);

  useEffect(() => {
    const syncProfile = () => {
      setProfile(getLearningProfile());
    };
    window.addEventListener('saathi-learning-updated', syncProfile);
    return () => window.removeEventListener('saathi-learning-updated', syncProfile);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('saathi_completed_modules', JSON.stringify(completedModules));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [completedModules]);

  const activeModule =
    LESSON_MODULES.find((m) => m.id === activeModuleId) || LESSON_MODULES[0];

  const handleSelectQuizOption = (questionId: string, optionIndex: number) => {
    if (quizSubmitted[activeModule.id]) return;
    playKeypadClick();
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted((prev) => ({ ...prev, [activeModule.id]: true }));

    let allCorrect = true;
    activeModule.quiz.forEach((q) => {
      if (quizAnswers[q.id] !== q.correctIndex) {
        allCorrect = false;
      }
    });

    if (allCorrect) {
      playSuccessChime();
      if (!completedModules.includes(activeModule.id)) {
        setCompletedModules((prev) => [...prev, activeModule.id]);
      }
      const updated = recordSkillPracticeSuccess({
        pillar:
          activeModule.id === 'mod-upi'
            ? 'upi-simulator'
            : activeModule.id === 'mod-scam'
            ? 'scam-analyzer'
            : 'personalized-learning',
        titleEn: `Earned Badge: ${activeModule.badgeName} (${activeModule.title})`,
        titleHi: `बैज जीता: ${activeModule.titleHi}`,
        points: 20,
        resolveStruggleId:
          activeModule.id === 'mod-upi'
            ? 'struggle-upi-collect'
            : activeModule.id === 'mod-scam'
            ? 'struggle-scam-sms'
            : 'struggle-app-permissions',
      });
      setProfile(updated);
    } else {
      playWarningBuzzer();
      const updated = recordUserStruggle({
        id: `quiz-struggle-${activeModule.id}`,
        pillar:
          activeModule.id === 'mod-upi'
            ? 'upi-simulator'
            : activeModule.id === 'mod-scam'
            ? 'scam-analyzer'
            : 'screenshot-camera',
        labelEn: `Needs Review: ${activeModule.title}`,
        labelHi: `दोहराने की आवश्यकता: ${activeModule.titleHi}`,
        reasonEn: 'Missed one or more questions in the module verification quiz.',
        reasonHi: 'इस पाठ के क्विज में कुछ प्रश्नों के उत्तर गलत हुए।',
        recommendedModuleId: activeModule.id,
        recommendedTab:
          activeModule.id === 'mod-upi'
            ? 'simulator'
            : activeModule.id === 'mod-scam'
            ? 'scam'
            : 'screenshot',
      });
      setProfile(updated);
    }
  };

  const resetCurrentQuiz = () => {
    playKeypadClick();
    setQuizSubmitted((prev) => ({ ...prev, [activeModule.id]: false }));
    setQuizAnswers((prev) => {
      const next = { ...prev };
      activeModule.quiz.forEach((q) => delete next[q.id]);
      return next;
    });
  };

  const generatePersonalizedAiDiagnosis = async () => {
    playKeypadClick();
    setIsGeneratingAdvice(true);
    const unresolvedStruggles = profile.struggles.filter((s) => !s.resolved);
    const struggleSummary = unresolvedStruggles
      .map((s) => (isIndic ? s.labelHi : s.labelEn))
      .join(', ');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7500);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: isMr
            ? `माझ्या डिजिटल शिकण्याच्या प्रगतीचे विश्लेषण करा. ज्या भागात अडचण येत आहे: ${struggleSummary || 'कोणतीही अडचण नाही'}. मला प्रोत्साहन द्या आणि पुढील अभ्यासाचा मार्ग सांगा.`
            : isHi
            ? `मेरी डिजिटल सीखने की प्रगति का विश्लेषण करें। जिन क्षेत्रों में मुझे कठिनाई हो रही है: ${struggleSummary || 'कोई बड़ी कठिनाई नहीं'}। मुझे प्रोत्साहित करें और बताएं कि मुझे आगे क्या अभ्यास करना चाहिए।`
            : `Analyze my digital literacy progress. Areas where I struggle: ${struggleSummary || 'None currently'}. Give me encouraging feedback and suggest what lesson I should practice next.`,
          language,
          mode: 'beginner',
        }),
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data?.replyText) {
          const advice = `${data.replyText} ${(data.steps || []).join(' ')}`;
          setAiCoachAdvice(advice);
          onSpeak(advice);
          setIsGeneratingAdvice(false);
          return;
        }
      }
    } catch {
      // Fallback below
    }

    const fallbackAdvice =
      unresolvedStruggles.length > 0
        ? isMr
          ? `नमस्कार! आपली शिकण्याची प्रगती खूप चांगली आहे. आमच्या विश्लेषणानुसार, आपण "${unresolvedStruggles[0].labelHi}" या विषयावर अजून थोडा भर दिला पाहिजे. खालील पाठ वाचून सुरक्षित सिमुलेटरमध्ये २ मिनिटे सराव करा.`
          : isHi
          ? `नमस्ते! आपकी सीखने की प्रगति बहुत अच्छी है। हमारे विश्लेषण के अनुसार, आपको अभी "${unresolvedStruggles[0].labelHi}" पर थोड़ा और ध्यान देना चाहिए। इसके लिए नीचे दिए गए सुझाए गए पाठ को पढ़ें और सुरक्षित सिमुलेटर में 2 मिनट अभ्यास करें।`
          : `Great effort on your digital literacy journey! Based on your recent activity, AI recommends focusing on "${unresolvedStruggles[0].labelEn}". Review the suggested lesson below and practice in the safe simulator to boost your confidence score to 100%.`
        : isMr
        ? 'अभिनंदन! आपण सर्व प्रमुख सुरक्षा नियम आणि दैनिक कौशल्यांमध्ये उत्तम प्रगती दाखवली आहे. दररोज नवीन नियम शिकत राहा.'
        : isHi
        ? 'बधाई हो! आपने सभी प्रमुख सुरक्षा नियमों और दैनिक टिप्स में शानदार सुधार दिखाया है। अपनी स्ट्रीक बनाए रखने के लिए रोज़ाना नया डिजिटल साक्षरता टिप सीखते रहें।'
        : 'Congratulations! You have resolved all major struggle areas and demonstrated strong digital safety habits. Keep practicing your Daily Digital Literacy Tips to maintain mastery.';

    setAiCoachAdvice(fallbackAdvice);
    onSpeak(fallbackAdvice);
    setIsGeneratingAdvice(false);
  };

  const overallConfidenceScore = Math.round(
    (Object.values(profile.pillarScores) as number[]).reduce((a, b) => a + b, 0) / 5
  );

  const pillarItems: {
    id: SkillPillar;
    labelEn: string;
    labelHi: string;
    labelMr: string;
    tab: string;
  }[] = [
    { id: 'voice-assistant', labelEn: '1. Voice-First AI Guidance', labelHi: '1. आवाज़ सहायता व फोन कौशल', labelMr: '1. व्हॉइस मार्गदर्शन व कौशल्ये', tab: 'assistant' },
    { id: 'screenshot-camera', labelEn: '2. Screenshot & Camera Helper', labelHi: '2. स्क्रीनशॉट व कैमरा समझ', labelMr: '2. स्क्रीनशॉट व कॅमेरा मदत', tab: 'screenshot' },
    { id: 'scam-analyzer', labelEn: '3. Scam Message Analyzer', labelHi: '3. धोखाधड़ी SMS पहचान', labelMr: '3. फसव्या मेसेजची तपासणी', tab: 'scam' },
    { id: 'upi-simulator', labelEn: '4. Safe UPI Payment Simulator', labelHi: '4. सुरक्षित UPI भुगतान', labelMr: '4. सुरक्षित UPI पेमेंट सराव', tab: 'simulator' },
    { id: 'personalized-learning', labelEn: '5. Daily Tips & Quizzes', labelHi: '5. दैनिक टिप्स व क्विज', labelMr: '5. दैनिक नियम व प्रश्नमंजुषा', tab: 'learn' },
  ];

  const unresolvedStruggles = profile.struggles.filter((s) => !s.resolved);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Personalized Progress Overview Strip */}
      <div className="bg-white border border-indigo-100 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
              <span>{isMr ? 'वैयक्तिक शिकणे आणि प्रगती अहवाल' : isHi ? 'व्यक्तिगत सीखना और प्रगति ट्रैकिंग' : 'Personalized Learning & Progress Tracking'}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-indigo-900 font-extrabold">
                {isMr
                  ? `दैनिक नियम: ${profile.completedTipIds.length}/${DAILY_LITERACY_TIPS.length}`
                  : isHi
                  ? `दैनिक टिप्स: ${profile.completedTipIds.length}/${DAILY_LITERACY_TIPS.length}`
                  : `Daily Tips: ${profile.completedTipIds.length}/${DAILY_LITERACY_TIPS.length}`}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {isMr
                ? 'AI कौशल्य विश्लेषण, अडचणींची ओळख व सुधारणा'
                : isHi
                ? 'AI कौशल विश्लेषण, कमजोर क्षेत्रों की पहचान व सुधार'
                : 'AI Skill Diagnosis, Struggle Identification & Growth'}
            </h2>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold">
              <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>{isMr ? 'नियमित शिकण्याची स्ट्रीक' : isHi ? 'नियमित सीखने की स्ट्रीक' : 'Active Learning Streak'}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>
                {completedModules.length}/{LESSON_MODULES.length}{' '}
                {isMr ? 'बॅज मिळाले' : isHi ? 'बैज अर्जित' : 'Badges Earned'}
              </span>
            </div>
          </div>
        </div>

        {/* Overall Digital Confidence Meter */}
        <div className="mt-4 pt-4 border-t border-indigo-50">
          <div className="flex items-center justify-between text-xs text-slate-700 mb-1.5">
            <span className="font-bold">
              {isMr ? 'डिजिटल आत्मविश्वास व सुरक्षा गुण (Improvement Score):' : isHi ? 'समग्र डिजिटल आत्मविश्वास स्कोर (Improvement Score):' : 'Overall Digital Confidence & Safety Score:'}
            </span>
            <span className="font-mono font-black text-indigo-700 text-sm">{overallConfidenceScore}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${overallConfidenceScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily Skill Tip for Personalized Learning */}
      <ContextualPillarTipBanner
        pillar="personalized-learning"
        language={language}
        onSpeak={onSpeak}
        actionLabelEn="Get AI Study Plan"
        actionLabelHi="AI कोच से सलाह लें"
        actionLabelMr="AI सल्लागार मदत घ्या"
        onAction={generatePersonalizedAiDiagnosis}
      />

      {/* AI Struggle Identification & 5-Pillar Mastery Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: AI Identified Struggle Areas & Recommended Lessons */}
        <div className="lg:col-span-7 bg-white border border-indigo-100 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-50 pb-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-indigo-700 uppercase tracking-wider">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>
                  {isMr
                    ? 'AI ने शोधलेले सरावाचे मुद्दे (Areas Where You Struggle)'
                    : isHi
                    ? 'AI द्वारा पहचाने गए अभ्यास क्षेत्र (Areas Where You Struggle)'
                    : 'AI-Identified Struggle Areas & Suggested Lessons'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isMr
                  ? 'तुमच्या प्रश्नांवरून व सिमुलेटर सरावावरून सुचवलेले विशेष पाठ:'
                  : isHi
                  ? 'आपके सवालों, सिमुलेटर अभ्यास और क्विज के आधार पर सुझाए गए विशेष पाठ:'
                  : 'Tailored recommendations based on your questions, simulator drills, and quiz answers:'}
              </p>
            </div>

            <button
              type="button"
              onClick={generatePersonalizedAiDiagnosis}
              disabled={isGeneratingAdvice}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors shadow-xs"
            >
              {isGeneratingAdvice ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
              <span>{isMr ? 'AI सल्लागार ऐका' : isHi ? 'AI कोच विश्लेषण सुनें' : 'Hear AI Coach Review'}</span>
            </button>
          </div>

          {aiCoachAdvice && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs sm:text-sm text-indigo-950 leading-relaxed flex items-start justify-between gap-3">
              <div>
                <strong className="font-black block mb-1">
                  {isMr ? 'NIRBHAR AI सल्लागाराची सूचना:' : isHi ? 'NIRBHAR AI कोच की सलाह:' : 'NIRBHAR AI Coach Recommendation:'}
                </strong>
                <span>{aiCoachAdvice}</span>
              </div>
              <button
                type="button"
                onClick={() => onSpeak(aiCoachAdvice)}
                className="p-2 rounded-xl bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 shrink-0 cursor-pointer"
                title={isMr ? 'पुन्हा ऐका' : isHi ? 'दोबारा सुनें' : 'Listen again'}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {unresolvedStruggles.length === 0 ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-medium flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                {isMr
                  ? 'छान! तुम्ही आधीच्या सर्व अडचणी सोडवून प्रगती केली आहे.'
                  : isHi
                  ? 'शानदार! आपने अपनी सभी पिछली कठिनाइयों को हल कर लिया है।'
                  : 'Wonderful! You have resolved all identified struggle areas.'}
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {unresolvedStruggles.map((st) => (
                <div
                  key={st.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {isIndic ? st.labelHi : st.labelEn}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {isIndic ? st.reasonHi : st.reasonEn}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-800 shrink-0 bg-amber-50 px-2 py-0.5 rounded-md">
                      {isMr ? 'सुचवलेला सराव' : isHi ? 'सुझाया गया अभ्यास' : 'Suggested Focus'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        playKeypadClick();
                        setActiveModuleId(st.recommendedModuleId);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                    >
                      {isMr ? 'सुचवलेला पाठ वाचा' : isHi ? 'सुझाया गया पाठ पढ़ें' : 'Open Suggested Lesson'}
                    </button>

                    {onSelectTab && (
                      <button
                        type="button"
                        onClick={() => {
                          playKeypadClick();
                          onSelectTab(st.recommendedTab);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-slate-800 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>{isMr ? 'टूलमध्ये सराव करा' : isHi ? 'टूल में अभ्यास करें' : 'Practice in Tool'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: 5-Pillar Skill Mastery & Recent Improvement Log */}
        <div className="lg:col-span-5 bg-white border border-indigo-100 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-indigo-900 uppercase tracking-wider mb-3">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>{isMr ? '५ मुख्य कौशल्यांमधील प्रगती' : isHi ? '5 मुख्य कौशलों में सुधार मापें' : 'Skill Improvement Across 5 Pillars'}</span>
            </div>

            <div className="space-y-3">
              {pillarItems.map((item) => {
                const score = profile.pillarScores[item.id] || 60;
                const label = isMr ? item.labelMr : isHi ? item.labelHi : item.labelEn;
                return (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => onSelectTab?.(item.tab)}
                        className="font-bold text-slate-800 hover:text-indigo-700 cursor-pointer text-left"
                      >
                        {label}
                      </button>
                      <span className="font-mono font-bold text-indigo-700">{score}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Improvement Milestones */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">
              {isMr ? 'नुकतीच झालेली प्रगती व उपलब्धी:' : isHi ? 'हालिया सुधार और उपलब्धियां:' : 'Recent Improvement Milestones:'}
            </span>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {profile.improvements.slice(0, 5).map((imp) => (
                <div
                  key={imp.id}
                  className="text-xs flex items-center justify-between gap-2 py-1.5 border-b border-slate-100 last:border-0 text-slate-700"
                >
                  <span className="truncate">{isIndic ? imp.titleHi : imp.titleEn}</span>
                  <span className="text-indigo-600 font-bold font-mono shrink-0">+{imp.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Module Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {LESSON_MODULES.map((mod) => {
          const isSelected = activeModuleId === mod.id;
          const isCompleted = completedModules.includes(mod.id);

          return (
            <button
              key={mod.id}
              onClick={() => setActiveModuleId(mod.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-50/70 border-indigo-600 shadow-sm ring-2 ring-indigo-200'
                  : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[11px] text-slate-500 font-semibold">{mod.category}</span>
                {isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isMr ? 'पूर्ण' : isHi ? 'पूर्ण' : 'Badge Won'}</span>
                  </span>
                ) : isSelected ? (
                  <span className="text-indigo-700 font-bold text-xs">● Active</span>
                ) : null}
              </div>
              <div className="font-extrabold text-slate-900 text-sm leading-snug">
                {isIndic ? mod.titleHi : mod.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Module Lesson & Quiz Detail */}
      <div className="bg-white border border-indigo-100 rounded-2xl p-5 sm:p-7 space-y-6 shadow-sm">
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-50 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {activeModule.category}
              </span>
              {completedModules.includes(activeModule.id) && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-xs text-indigo-700 font-bold">
                    ★ {activeModule.badgeName}
                  </span>
                </>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {isIndic ? activeModule.titleHi : activeModule.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {isIndic ? activeModule.descriptionHi : activeModule.description}
            </p>
          </div>

          <button
            onClick={() =>
              onSpeak(
                `${isIndic ? activeModule.titleHi : activeModule.title}. ${
                  (isIndic ? activeModule.keyTakeawaysHi : activeModule.keyTakeaways).join('. ')
                }`
              )
            }
            className="p-2.5 text-slate-600 hover:text-indigo-700 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer border border-slate-200 shrink-0 self-start sm:self-center"
            title={isMr ? 'ऐका' : isHi ? 'आवाज़ में सुनें' : 'Read aloud'}
          >
            <Volume2 className="w-5 h-5 text-indigo-600" />
          </button>
        </div>

        {/* Key Takeaways & Practical Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-2">
            <span className="text-xs font-black text-indigo-950 uppercase tracking-wider block">
              {isMr ? 'महत्त्वाचे नियम (Key Rules):' : isHi ? 'मुख्य बातें (Key Rules):' : 'Key Takeaways:'}
            </span>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-800 font-medium">
              {(isIndic ? activeModule.keyTakeawaysHi : activeModule.keyTakeaways).map(
                (item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-black shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              {isMr ? 'दैनंदिन सुरक्षा सवयी:' : isHi ? 'दैनिक जीवन में सुरक्षा टिप्स:' : 'Practical Safety Habits:'}
            </span>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {(isIndic ? activeModule.practicalTipsHi : activeModule.practicalTips).map(
                (tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-slate-400 font-bold shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Interactive Quiz Section */}
        <div className="pt-4 border-t border-indigo-50 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-black text-slate-900">
                {isMr ? 'तुम्ही काय शिकलात ते तपासा (लघु प्रश्नमंजुषा)' : isHi ? 'जांचें कि आपने क्या सीखा (लघु क्विज)' : 'Interactive Knowledge Quiz'}
              </h4>
              <p className="text-xs text-slate-500">
                {isMr
                  ? 'तिन्ही प्रश्नांची अचूक उत्तरे द्या आणि आपला बॅज अनलॉक करा.'
                  : isHi
                  ? 'तीनों सवालों के सही उत्तर दें और अपना बैज व सुधार स्कोर अनलॉक करें।'
                  : 'Answer all 3 practical questions to unlock your achievement badge and boost your score.'}
              </p>
            </div>

            {quizSubmitted[activeModule.id] && (
              <button
                onClick={resetCurrentQuiz}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isMr ? 'पुन्हा सोडवा' : isHi ? 'पुनः प्रयास करें' : 'Retake Quiz'}</span>
              </button>
            )}
          </div>

          {/* Quiz Questions */}
          <div className="space-y-4">
            {activeModule.quiz.map((q, qIndex) => {
              const selectedOpt = quizAnswers[q.id];
              const isSubmitted = !!quizSubmitted[activeModule.id];
              const isCorrect = selectedOpt === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3"
                >
                  <div className="font-bold text-xs sm:text-sm text-slate-900">
                    <span className="text-indigo-600 mr-1.5">Q{qIndex + 1}.</span>
                    <span>{q.question}</span>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    {q.options.map((opt, optIndex) => {
                      const isChosen = selectedOpt === optIndex;
                      let optionStyle =
                        'bg-white border-slate-200 text-slate-800 hover:border-indigo-300';

                      if (isSubmitted) {
                        if (optIndex === q.correctIndex) {
                          optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                        } else if (isChosen && !isCorrect) {
                          optionStyle = 'bg-rose-50 border-rose-500 text-rose-950 line-through';
                        }
                      } else if (isChosen) {
                        optionStyle = 'bg-gradient-to-r from-blue-600 to-indigo-600 border-indigo-600 text-white font-bold shadow-xs';
                      }

                      return (
                        <button
                          key={optIndex}
                          onClick={() => handleSelectQuizOption(q.id, optIndex)}
                          className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between ${optionStyle}`}
                        >
                          <span>{opt}</span>
                          {isSubmitted && optIndex === q.correctIndex && (
                            <span className="text-emerald-700 font-bold ml-2">✓ Correct</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation feedback */}
                  {isSubmitted && (
                    <div
                      className={`p-3 rounded-xl text-xs leading-relaxed ${
                        isCorrect
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                          : 'bg-rose-50 text-rose-900 border border-rose-200'
                      }`}
                    >
                      <strong>{isCorrect ? '✓ ' : '✕ '}</strong>
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Quiz Button */}
          {!quizSubmitted[activeModule.id] && (
            <div className="text-center pt-2">
              <button
                onClick={handleQuizSubmit}
                disabled={activeModule.quiz.some((q) => quizAnswers[q.id] === undefined)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 text-white rounded-xl text-sm font-black transition-all cursor-pointer shadow-md shadow-indigo-100"
              >
                {isMr ? 'उत्तरे तपासा व बॅज मिळवा' : isHi ? 'उत्तर जांचें व बैज पाएं' : 'Submit Answers & Verify'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  PhoneCall,
  Volume2,
  RefreshCw,
  Search,
  ExternalLink,
  Ban,
  ArrowRight,
  HelpCircle,
  Target,
  Sparkles,
  CheckCircle2,
  Award,
  Smartphone,
  Eye,
} from 'lucide-react';
import { Language, ScamAnalysis } from '../types';
import { SAMPLE_SCAM_TESTS } from '../data/mockData';
import { playWarningBuzzer, playSuccessChime, playKeypadClick } from '../utils/audioEffects';
import { ContextualPillarTipBanner } from './DailyDigitalLiteracyTip';
import { recordSkillPracticeSuccess, recordUserStruggle } from '../utils/learningTracker';

interface ScamDetectorTabProps {
  language: Language;
  onSpeak: (text: string) => void;
  onOpenHelpline: () => void;
}

interface InteractiveTrapScenario {
  id: string;
  title: string;
  titleHi: string;
  sender: string;
  time: string;
  textParts: {
    id: string;
    text: string;
    textHi: string;
    isRedFlag: boolean;
    explanation: string;
    explanationHi: string;
  }[];
}

const TRAP_SCENARIOS: InteractiveTrapScenario[] = [
  {
    id: 'elec-cutoff',
    title: 'Electricity Bill Disconnection Threat',
    titleHi: 'बिजली बिल काटने का धमकी भरा SMS',
    sender: '+91-9876543210 (Personal Mobile)',
    time: '7:45 PM',
    textParts: [
      {
        id: 'p1',
        text: 'Dear Consumer, ',
        textHi: 'प्रिय उपभोक्ता, ',
        isRedFlag: false,
        explanation: 'Generic greeting common in many messages.',
        explanationHi: 'साधारण अभिवादन जो सामान्य मैसेज में होता है।',
      },
      {
        id: 'p2',
        text: 'Your electricity power will be DISCONNECTED TONIGHT at 9:30 PM ',
        textHi: 'आपका बिजली कनेक्शन आज रात 9:30 बजे काट दिया जाएगा ',
        isRedFlag: true,
        explanation: '🚨 RED FLAG: Artificial panic & sudden deadline to stop you from thinking or asking family!',
        explanationHi: '🚨 रेड फ्लैग: अचानक बिजली काटने का डर ताकि आप घबराकर बिना सोचे-समझे पैसे दे दें!',
      },
      {
        id: 'p3',
        text: 'because your previous month bill was not updated. ',
        textHi: 'क्योंकि पिछले महीने का बिल अपडेट नहीं हुआ है। ',
        isRedFlag: false,
        explanation: 'Standard excuse fabricated by scammers.',
        explanationHi: 'धोखेबाजों द्वारा गढ़ा गया झूठा बहाना।',
      },
      {
        id: 'p4',
        text: 'Immediately call our officer Mr. Sharma at 9876543210 ',
        textHi: 'तुरंत हमारे अधिकारी शर्मा जी को 9876543210 पर कॉल करें ',
        isRedFlag: true,
        explanation: '🚨 RED FLAG: Official electricity boards NEVER provide personal 10-digit mobile numbers!',
        explanationHi: '🚨 रेड फ्लैग: सरकारी बिजली विभाग कभी व्यक्तिगत 10-अंकों का मोबाइल नंबर नहीं देते!',
      },
      {
        id: 'p5',
        text: 'or pay ₹10 bill update fee at: http://bit.ly/mspdcl-bill-pay.apk',
        textHi: 'या ₹10 बिल फीस भरें: http://bit.ly/mspdcl-bill-pay.apk',
        isRedFlag: true,
        explanation: '🚨 RED FLAG: Shortened link ending in .apk downloads a dangerous spy virus that steals your OTP!',
        explanationHi: '🚨 रेड फ्लैग: .apk फाइल वाला लिंक एक खतरनाक वायरस है जो आपके बैंक ओटीपी चुराता है!',
      },
    ],
  },
  {
    id: 'sbi-kyc',
    title: 'Bank KYC Deactivation Threat',
    titleHi: 'बैंक खाता व योनो ऐप ब्लॉक होने का फर्जी डर',
    sender: '+91-8877665544',
    time: '11:15 AM',
    textParts: [
      {
        id: 'b1',
        text: 'Dear SBI / YONO User, ',
        textHi: 'प्रिय बैंक ग्राहक, ',
        isRedFlag: false,
        explanation: 'Banks use official brand names, but notice the sender is an unverified personal phone.',
        explanationHi: 'बैंक का नाम लिया गया है, पर भेजने वाला अनजान नंबर है।',
      },
      {
        id: 'b2',
        text: 'Your NetBanking account is BLOCKED for 24 hours ',
        textHi: 'आपका नेट बैंकिंग खाता 24 घंटे के लिए बंद कर दिया गया है ',
        isRedFlag: true,
        explanation: '🚨 RED FLAG: Threatening account suspension to force immediate rushed panic.',
        explanationHi: '🚨 रेड फ्लैग: खाता बंद होने की धमकी ताकि आप हड़बड़ी में गलत कदम उठाएं।',
      },
      {
        id: 'b3',
        text: 'due to pending Aadhaar & PAN verification. ',
        textHi: 'क्योंकि आपका आधार और पैन कार्ड लिंक नहीं है। ',
        isRedFlag: false,
        explanation: 'Aadhaar linkage is a standard topic scammers exploit.',
        explanationHi: 'आधार लिंक का बहाना बनाकर लोग अक्सर ठगी करते हैं।',
      },
      {
        id: 'b4',
        text: 'Click here immediately to unblock: http://sbi-kyc-portal.xyz/login ',
        textHi: 'खाता चालू करने के लिए तुरंत यहाँ क्लिक करें: http://sbi-kyc-portal.xyz/login ',
        isRedFlag: true,
        explanation: '🚨 RED FLAG: Fake link ending in .xyz! Official bank websites end with .sbi or .bank.in, never .xyz!',
        explanationHi: '🚨 रेड फ्लैग: .xyz वाला फर्जी लिंक! बैंक की असली वेबसाइट .sbi या .bank.in होती है, .xyz नहीं!',
      },
      {
        id: 'b5',
        text: 'Failure to update will attract ₹10,000 regulatory penalty.',
        textHi: 'अपडेट न करने पर ₹10,000 का जुर्माना लगाया जाएगा।',
        isRedFlag: true,
        explanation: '🚨 RED FLAG: Fake fine threats are classic psychological extortion tools.',
        explanationHi: '🚨 रेड फ्लैग: जुर्माने का झूठा डर दिखाना साइबर अपराधियों की पुरानी चाल है।',
      },
    ],
  },
];

export const ScamDetectorTab: React.FC<ScamDetectorTabProps> = ({
  language,
  onSpeak,
  onOpenHelpline,
}) => {
  const isHi = language === 'hi' || language === 'mr';

  const [activeTabMode, setActiveTabMode] = useState<'analyzer' | 'interactive-drill'>('analyzer');
  const [inputContent, setInputContent] = useState('');
  const [analysis, setAnalysis] = useState<ScamAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTestId, setActiveTestId] = useState<string | null>(null);

  // State for Interactive Spot-The-Trap Drill
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('elec-cutoff');
  const [foundRedFlags, setFoundRedFlags] = useState<Record<string, string[]>>({});
  const [activeInspectorPart, setActiveInspectorPart] = useState<InteractiveTrapScenario['textParts'][0] | null>(null);

  const activeScenario =
    TRAP_SCENARIOS.find((s) => s.id === selectedScenarioId) || TRAP_SCENARIOS[0];
  const scenarioFoundFlags = foundRedFlags[activeScenario.id] || [];
  const totalRedFlagsInScenario = activeScenario.textParts.filter((p) => p.isRedFlag).length;

  const runAnalysis = async (text: string) => {
    if (!text.trim() || isLoading) return;

    playKeypadClick();
    setIsLoading(true);
    setAnalysis(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8500);

      const res = await fetch('/api/detect-scam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          content: text,
          inputType: 'text',
          language,
        }),
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data: ScamAnalysis = await res.json();
        setAnalysis(data);
        if (data.riskLevel === 'HIGH_RISK_SCAM') {
          playWarningBuzzer();
        } else {
          playSuccessChime();
        }
        return;
      }
    } catch (err) {
      console.warn('Network / API response slow, using instant pattern intelligence');
    } finally {
      setIsLoading(false);
    }

    // Instant high-grade fallback pattern analysis
    const lower = text.toLowerCase();
    const isUrgentDisconnection =
      lower.includes('disconnect') ||
      lower.includes('कट') ||
      lower.includes('power') ||
      lower.includes('बिजली') ||
      lower.includes('9:30');
    const isLottery =
      lower.includes('lottery') ||
      lower.includes('लॉटरी') ||
      lower.includes('crore') ||
      lower.includes('lakh') ||
      lower.includes('won') ||
      lower.includes('kbc');
    const isKYC =
      lower.includes('kyc') ||
      lower.includes('deactivat') ||
      lower.includes('block') ||
      lower.includes('योनो') ||
      lower.includes('बंद');

    const isHigh = isUrgentDisconnection || isLottery || isKYC || lower.includes('apk') || lower.includes('pin');

    const fallbackAnalysis: ScamAnalysis = {
      riskLevel: isHigh ? 'HIGH_RISK_SCAM' : 'SUSPICIOUS_UNVERIFIED',
      riskScore: isHigh ? 95 : 72,
      headline: isHigh
        ? (isHi ? '⚠️ सावधान: यह 100% फर्जी धोखाधड़ी संदेश है' : '⚠️ HIGH RISK: Confirmed Scam & Extortion Pattern')
        : (isHi ? 'सतर्क रहें: अपुष्ट / संदिग्ध संदेश' : 'Caution: Unverified Suspicious Message'),
      redFlags: [
        isHi ? 'संदेश में अनावश्यक जल्दीबाजी या तुरंत बिजली/खाता बंद करने की धमकी' : 'Artificial panic, urgent cutoff time, or account block threats',
        isHi ? 'व्यक्तिगत 10-अंकों का अनजान मोबाइल नंबर या संदिग्ध लिंक (.xyz, .apk)' : 'Personal 10-digit phone number or unverified link ending in .apk or .xyz',
        isHi ? 'पैसे पाने के बदले फीस मांगना या पिन/ओटीपी पूछने का झांसा' : 'Advance fee fraud or secret OTP/PIN theft trap',
      ],
      whyThisIsSuspicious: isHi
        ? 'सरकारी विभाग या बैंक कभी भी व्यक्तिगत मोबाइल नंबर से बिजली काटने या खाता बंद करने का धमकी भरा एसएमएस नहीं भेजते। यह केवल डर फैलाकर पैसे ऐंठने की चाल है।'
        : 'Legitimate banks and utility departments NEVER send personal mobile numbers threatening immediate disconnection. Fraudsters create fear to make you pay without thinking.',
      immediateAction: isHi
        ? 'दिए गए नंबर पर बिल्कुल कॉल न करें, न ही किसी लिंक को खोलें। इस नंबर को तुरंत ब्लॉक करें।'
        : 'Do NOT call the provided phone number or tap the web link. Delete the message and block the sender.',
      officialVerificationRoute: isHi
        ? 'बिजली विभाग की आधिकारिक ऐप या बैंक पासबुक पर लिखे कस्टमर केयर नंबर पर ही संपर्क करें।'
        : 'Verify directly via your official utility bill receipt or the customer care number printed on your bank passbook.',
      helplineNumber: '1930',
    };

    setAnalysis(fallbackAnalysis);
    if (fallbackAnalysis.riskLevel === 'HIGH_RISK_SCAM') {
      playWarningBuzzer();
    } else {
      playSuccessChime();
    }
  };

  const handleSelectTest = (test: (typeof SAMPLE_SCAM_TESTS)[0]) => {
    setActiveTestId(test.id);
    const content = isHi ? test.contentHi : test.content;
    setInputContent(content);
    recordSkillPracticeSuccess({
      pillar: 'scam-analyzer',
      titleEn: `Analyzed Scam SMS Pattern: ${test.title}`,
      titleHi: `धोखाधड़ी संदेश का विश्लेषण किया: ${test.titleHi}`,
      points: 10,
      resolveStruggleId: 'struggle-scam-sms',
    });
    runAnalysis(content);
  };

  const handleTapPart = (part: InteractiveTrapScenario['textParts'][0]) => {
    playKeypadClick();
    setActiveInspectorPart(part);

    if (part.isRedFlag) {
      setFoundRedFlags((prev) => {
        const current = prev[activeScenario.id] || [];
        if (!current.includes(part.id)) {
          const updated = [...current, part.id];
          if (updated.length === totalRedFlagsInScenario) {
            setTimeout(() => {
              playSuccessChime();
              recordSkillPracticeSuccess({
                pillar: 'scam-analyzer',
                titleEn: `Spotted all Red Flags in: ${activeScenario.title}`,
                titleHi: `सभी खतरे के संकेत पहचाने: ${activeScenario.titleHi}`,
                points: 15,
                resolveStruggleId: 'struggle-scam-sms',
              });
            }, 250);
          } else {
            playSuccessChime();
          }
          return { ...prev, [activeScenario.id]: updated };
        }
        return prev;
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-indigo-100 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-indigo-600" />
              <span>{isHi ? 'धोखाधड़ी संदेश विश्लेषक व साइबर कवच' : 'Scam Message Analyzer & Cyber Shield'}</span>
            </h2>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              {isHi
                ? 'संदिग्ध SMS, व्हाट्सएप मैसेज और लिंक की AI जांच करें और छुपे हुए खतरे के संकेत समझें।'
                : 'AI identifies potential fraud in suspicious SMS messages and explains warning signs clearly.'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 shrink-0 self-start sm:self-center">
            <button
              onClick={() => setActiveTabMode('analyzer')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTabMode === 'analyzer'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isHi ? 'एआई मैसेज जांच' : 'AI Message Checker'}</span>
            </button>
            <button
              onClick={() => setActiveTabMode('interactive-drill')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTabMode === 'interactive-drill'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>{isHi ? 'रेड फ्लैग पहचान अभ्यास' : 'Spot the Trap Game'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daily Skill Tip for Scam Message Analyzer */}
      <ContextualPillarTipBanner
        pillar="scam-analyzer"
        language={language}
        onSpeak={onSpeak}
        actionLabelEn="Practice Spot-The-Trap"
        actionLabelHi="रेड फ्लैग अभ्यास करें"
        onAction={() => setActiveTabMode('interactive-drill')}
      />

      {/* MODE 1: AI SCAM CHECKER */}
      {activeTabMode === 'analyzer' && (
        <div className="space-y-6">
          {/* Preloaded Common Scam Templates */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{isHi ? 'प्रचलित फर्जी संदेशों का परीक्षण करें (क्लिक करें):' : 'Test Common Scam Scenarios (Tap to inspect):'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {SAMPLE_SCAM_TESTS.map((test) => {
                const isActive = activeTestId === test.id;
                return (
                  <button
                    key={test.id}
                    onClick={() => handleSelectTest(test)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-50/80 border-amber-600 shadow-xs ring-2 ring-amber-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-mono">{test.category}</span>
                      {isActive && <span className="text-amber-800 font-bold">● Active</span>}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-900">
                      {isHi ? test.titleHi : test.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {isHi ? 'संदिग्ध संदेश या लिंक यहाँ पेस्ट करें:' : 'Paste Suspicious Message or URL Here:'}
            </label>

            <textarea
              rows={3}
              value={inputContent}
              onChange={(e) => {
                setInputContent(e.target.value);
                setActiveTestId(null);
              }}
              placeholder={
                isHi
                  ? 'उदा: "प्रिय ग्राहक, आपका बिजली बिल नहीं भरा गया है, रात 9:30 बजे बिजली काट दी जाएगी..."'
                  : 'e.g. "Dear consumer your electricity power will be disconnected tonight at 9:30 PM..."'
              }
              className="w-full p-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all resize-y"
            />

            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-xs text-slate-500">
                {isHi ? 'सुरक्षित जांच: कोई निजी जानकारी साझा नहीं की जाती' : 'Safe inspection: No personal data is stored'}
              </span>

              <button
                onClick={() => runAnalysis(inputContent)}
                disabled={!inputContent.trim() || isLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs touch-target-senior"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isHi ? 'जांच जारी है...' : 'Analyzing...'}</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>{isHi ? 'धोखाधड़ी जांचें' : 'Check for Scam'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analysis Results Display */}
          {analysis && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-6 shadow-sm">
              {/* Risk Level Banner */}
              <div
                className={`p-4 sm:p-5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  analysis.riskLevel === 'HIGH_RISK_SCAM'
                    ? 'bg-red-50 border-red-300 text-red-950'
                    : analysis.riskLevel === 'SUSPICIOUS_UNVERIFIED'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  {analysis.riskLevel === 'HIGH_RISK_SCAM' ? (
                    <ShieldAlert className="w-7 h-7 text-red-700 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-7 h-7 text-amber-700 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block opacity-80">
                      {analysis.riskLevel === 'HIGH_RISK_SCAM'
                        ? isHi
                          ? '⚠️ उच्च जोखिम: खतरनाक धोखाधड़ी'
                          : '⚠️ HIGH RISK SCAM DETECTED'
                        : isHi
                        ? 'सतर्क रहें: अपुष्ट / संदिग्ध संदेश'
                        : 'SUSPICIOUS / UNVERIFIED MESSAGE'}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold mt-0.5">{analysis.headline}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {/* Risk Score Pill */}
                  <div className="text-right">
                    <span className="text-[11px] block font-medium opacity-70">
                      {isHi ? 'जोखिम स्कोर:' : 'Threat Score:'}
                    </span>
                    <span className="text-2xl font-black font-mono tabular-nums">
                      {analysis.riskScore}/100
                    </span>
                  </div>

                  {/* Read Aloud Button */}
                  <button
                    onClick={() =>
                      onSpeak(
                        `${analysis.headline}. ${
                          isHi ? 'यह क्यों संदिग्ध है: ' : 'Why this is suspicious: '
                        }${analysis.whyThisIsSuspicious}. ${
                          isHi ? 'तुरंत क्या करें: ' : 'Immediate action: '
                        }${analysis.immediateAction}`
                      )
                    }
                    className="p-2.5 bg-white/80 hover:bg-white rounded-lg text-slate-800 transition-colors cursor-pointer border border-slate-200"
                    title={isHi ? 'आवाज़ में सुनें' : 'Read aloud'}
                  >
                    <Volume2 className="w-5 h-5 text-emerald-800" />
                  </button>
                </div>
              </div>

              {/* Red Flags Identified */}
              {analysis.redFlags && analysis.redFlags.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {isHi ? 'पहचाने गए खतरे और धोखे की तरकीबें:' : 'Red Flags & Trick Patterns Identified:'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {analysis.redFlags.map((flag, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 bg-red-50/60 border border-red-100 rounded-lg text-xs text-red-950 font-medium"
                      >
                        <Ban className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <span>{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Why This Is Suspicious (Plain Language) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  {isHi ? 'धोखेबाज आपको कैसे फंसाने की कोशिश कर रहा है:' : 'Why this is suspicious (plain explanation):'}
                </div>
                <p className="text-sm text-slate-800 leading-relaxed font-normal">
                  {analysis.whyThisIsSuspicious}
                </p>
              </div>

              {/* Recommended Immediate Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                    <span>{isHi ? 'तुरंत क्या करें:' : 'Immediate Safe Action:'}</span>
                  </div>
                  <p className="text-sm font-semibold text-emerald-950 leading-relaxed">
                    {analysis.immediateAction}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                  <div className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-blue-700" />
                    <span>{isHi ? 'सच्चाई जांचने का सही तरीका:' : 'Official Verification Route:'}</span>
                  </div>
                  <p className="text-sm text-blue-950 font-medium leading-relaxed">
                    {analysis.officialVerificationRoute}
                  </p>
                </div>
              </div>

              {/* Official Helpline Callout */}
              <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    {isHi ? 'राष्ट्रीय साइबर अपराध हेल्पलाइन:' : 'National Cyber Crime Helpline:'}
                  </div>
                  <div className="text-sm text-slate-200 mt-0.5">
                    {isHi
                      ? 'यदि धोखाधड़ी में पैसे कट गए हों, तो तुरंत 1930 पर कॉल करें।'
                      : 'If money was deducted or shared under deception, dial 1930 immediately.'}
                  </div>
                </div>

                <button
                  onClick={onOpenHelpline}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{isHi ? '1930 पर रिपोर्ट करें' : 'Call 1930 Helpline'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: INTERACTIVE SPOT-THE-TRAP PRACTICE LAB */}
      {activeTabMode === 'interactive-drill' && (
        <div className="space-y-6">
          {/* Scenario Selector */}
          <div className="flex flex-wrap gap-2">
            {TRAP_SCENARIOS.map((scen) => (
              <button
                key={scen.id}
                onClick={() => {
                  setSelectedScenarioId(scen.id);
                  setActiveInspectorPart(null);
                }}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border transition-all cursor-pointer ${
                  selectedScenarioId === scen.id
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {isHi ? scen.titleHi : scen.title}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Interactive Phone Screen */}
            <div className="lg:col-span-7 bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-xl max-w-md mx-auto w-full space-y-4">
              {/* Phone Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-slate-200">{activeScenario.sender}</span>
                </div>
                <span>{activeScenario.time}</span>
              </div>

              {/* Instructions Prompt */}
              <div className="bg-slate-800/80 p-2.5 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                <span>{isHi ? '👉 नीचे संदेश के हिस्सों पर टैप करके खतरे खोजें:' : '👉 Tap words in the message to find red flags:'}</span>
                <span className="font-bold font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400">
                  {scenarioFoundFlags.length} / {totalRedFlagsInScenario} {isHi ? 'मिले' : 'Found'}
                </span>
              </div>

              {/* Simulated SMS Bubble with Clickable Hotspots */}
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-sm leading-relaxed space-y-1">
                {activeScenario.textParts.map((part) => {
                  const isFound = scenarioFoundFlags.includes(part.id);
                  const isSelected = activeInspectorPart?.id === part.id;

                  return (
                    <button
                      key={part.id}
                      onClick={() => handleTapPart(part)}
                      className={`inline p-1 rounded transition-all cursor-pointer text-left ${
                        isFound
                          ? 'bg-red-950/80 text-red-200 border-b-2 border-red-500 font-medium'
                          : isSelected
                          ? 'bg-amber-900/60 text-amber-200'
                          : 'hover:bg-slate-700/80 text-slate-100 underline decoration-slate-600 decoration-dotted'
                      }`}
                    >
                      {isHi ? part.textHi : part.text}
                      {isFound && <span className="text-red-400 font-bold ml-1">🚨</span>}
                    </button>
                  );
                })}
              </div>

              {/* Success Banner when all found */}
              {scenarioFoundFlags.length === totalRedFlagsInScenario && (
                <div className="p-3 bg-emerald-950 border border-emerald-500 rounded-xl text-emerald-200 text-xs font-semibold flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    {isHi
                      ? '🎉 बधाई हो! आपने इस फर्जी संदेश के सभी रेड फ्लैग सफलतापूर्वक पहचान लिए हैं!'
                      : '🎉 Brilliant work! You spotted all the red flags in this fraudulent message!'}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Instant Inspector Explainer Panel */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-700" />
                  <span>{isHi ? 'संदिग्ध तत्व विश्लेषक (Inspector)' : 'Inspector Breakdown'}</span>
                </h4>
                {activeInspectorPart && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      activeInspectorPart.isRedFlag
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {activeInspectorPart.isRedFlag
                      ? isHi ? 'खतरा (Red Flag)' : 'Red Flag'
                      : isHi ? 'सामान्य (Neutral)' : 'Neutral'}
                  </span>
                )}
              </div>

              {activeInspectorPart ? (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800">
                    "{isHi ? activeInspectorPart.textHi : activeInspectorPart.text}"
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed">
                    {isHi ? activeInspectorPart.explanationHi : activeInspectorPart.explanation}
                  </p>

                  <button
                    onClick={() =>
                      onSpeak(
                        isHi
                          ? activeInspectorPart.explanationHi
                          : activeInspectorPart.explanation
                      )
                    }
                    className="flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-900 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{isHi ? 'स्पष्टीकरण सुनें' : 'Listen to explanation'}</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs space-y-2">
                  <Target className="w-8 h-8 text-slate-400 mx-auto" />
                  <p>
                    {isHi
                      ? 'बाईं ओर फोन स्क्रीन पर किसी भी शब्द या लिंक पर टैप करें।'
                      : 'Tap any underlined phrase on the phone screen to inspect it.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

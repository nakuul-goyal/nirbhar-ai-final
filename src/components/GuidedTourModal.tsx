import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Sparkles,
  Camera,
  ShieldAlert,
  CreditCard,
  Building2,
  PhoneCall,
  CheckCircle,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { Language } from '../types';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSpeak: (text: string) => void;
  onNavigateToTab: (tabId: string) => void;
}

interface TourStep {
  id: string;
  tabTarget: string;
  title: string;
  titleHi: string;
  tag: string;
  tagHi: string;
  description: string;
  descriptionHi: string;
  highlights: string[];
  highlightsHi: string[];
  ctaLabel: string;
  ctaLabelHi: string;
  icon: React.ReactNode;
  accentBg: string;
}

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  onClose,
  language,
  onSpeak,
  onNavigateToTab,
}) => {
  const isHi = language === 'hi' || language === 'mr';
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      tabTarget: 'assistant',
      tag: 'Welcome Guide',
      tagHi: 'स्वागत व परिचय',
      title: 'Welcome to NIRBHAR',
      titleHi: 'NIRBHAR में आपका स्वागत है',
      description:
        'Your patient, multilingual digital companion with Rishi voice assistant—designed for seniors, rural citizens, and first-time smartphone users.',
      descriptionHi:
        'स्मार्टफोन चलाने, व्हाट्सएप, ऑनलाइन पेमेंट और सरकारी योजनाओं को आसानी से समझने के लिए आपका अपना सुरक्षित साथी (ऋषि - Rishi बहुभाषी आवाज़ सहायक के साथ)।',
      highlights: [
        'Tap the floating "Rishi" voice assistant at the bottom-right corner anytime to speak in 12 Indian languages or Hinglish.',
        'Speak or type questions with step-by-step interactive checklists.',
        'Listen aloud to any instruction with one tap on the speaker icon.',
      ],
      highlightsHi: [
        'नीचे दाईं ओर "Rishi (ऋषि)" आवाज़ सहायक पर टैप करके 12 भारतीय भाषाओं या Hinglish में बोलकर मदद लें।',
        'बोलकर सवाल पूछें और कदम-दर-कदम आसान निर्देश पाएं।',
        'स्पीकर आइकन दबाकर किसी भी जानकारी को स्पष्ट आवाज़ में सुनें।',
      ],
      ctaLabel: 'Try NIRBHAR Assistant',
      ctaLabelHi: 'NIRBHAR सहायक से बात करें',
      icon: (
        <img
          src="/assets/aistudio/NIRBHAR_AI__Empowerment_in_Motion_d7e82865.png"
          alt="NIRBHAR Logo"
          className="w-10 h-10 object-contain rounded-lg"
        />
      ),
      accentBg: 'bg-emerald-50 border-emerald-200',
    },
    {
      id: 'screenshot',
      tabTarget: 'screenshot',
      tag: 'Visual Inspector',
      tagHi: 'स्क्रीनशॉट जांच',
      title: 'AI Screenshot Understanding',
      titleHi: 'स्क्रीनशॉट जांच — क्या दबाना सुरक्षित है?',
      description:
        'Confused by a popup, an unfamiliar app screen, or a strange SMS? Upload a photo or screenshot, and NIRBHAR will explain every button and field in plain language.',
      descriptionHi:
        'फोन स्क्रीन पर कोई अजीब मैसेज, ऐप का पॉपअप या बैंक का फॉर्म समझ न आए तो उसकी फोटो या स्क्रीनशॉट अपलोड करें। NIRBHAR सरल शब्दों में समझाएगा कि क्या करना सुरक्षित है।',
      highlights: [
        'Identifies what screen you are looking at and highlights visible buttons.',
        'Issues a bold red alert if a screen is secretly asking for OTP or UPI PIN.',
        'Recommends the exact next safe step, and clearly warns what NEVER to do.',
      ],
      highlightsHi: [
        'स्क्रीन पर दिख रहे हर बटन और विकल्प को पहचान कर उसकी सच्चाई बताता है।',
        'यदि स्क्रीन पर धोखे से OTP या UPI पिन मांगा जा रहा हो, तो तुरंत लाल चेतावनी देता है।',
        'बताता है कि सुरक्षित रहने के लिए अगला कदम क्या होना चाहिए और क्या बिल्कुल न करें।',
      ],
      ctaLabel: 'Open Screenshot Tool',
      ctaLabelHi: 'स्क्रीनशॉट जांच खोलें',
      icon: <Camera className="w-8 h-8 text-blue-600" />,
      accentBg: 'bg-blue-50 border-blue-200',
    },
    {
      id: 'scam',
      tabTarget: 'scam',
      tag: 'Cyber Fraud Protection',
      tagHi: 'धोखाधड़ी से सुरक्षा',
      title: 'AI Scam & Phishing Detector',
      titleHi: 'धोखाधड़ी और फर्जी मैसेज जांच (Scam Detector)',
      description:
        'Scammers use fake electricity bills, lottery claims, or bank deactivation threats. Paste any message or link here to immediately expose the fraud before losing money.',
      descriptionHi:
        'धोखेबाज बिजली काटने की धमकी, लॉटरी का लालच या बैंक खाता बंद होने का डर दिखाते हैं। किसी भी मैसेज या लिंक को यहाँ जांचें और नुकसान होने से पहले सच जानें।',
      highlights: [
        'Calculates a threat risk score (0-100) and highlights psychological pressure tactics.',
        'Explains why the message is suspicious (e.g. personal 10-digit number, fake web address).',
        'Provides immediate safety checklist and direct link to the 1930 Cyber Helpline.',
      ],
      highlightsHi: [
        'संदेश का खतरा स्कोर (0-100) बताता है और धोखेबाजों के दबाव की पहचान करता है।',
        'समझाता है कि संदेश फर्जी क्यों है (जैसे व्यक्तिगत मोबाइल नंबर, नकली वेबसाइट लिंक)।',
        'तुरंत क्या करना चाहिए (ब्लॉक, डिलीट) बताता है और राष्ट्रीय हेल्पलाइन 1930 का नंबर देता है।',
      ],
      ctaLabel: 'Test Scam Detector',
      ctaLabelHi: 'धोखाधड़ी जांच खोलें',
      icon: <ShieldAlert className="w-8 h-8 text-red-600" />,
      accentBg: 'bg-red-50 border-red-200',
    },
    {
      id: 'simulator',
      tabTarget: 'simulator',
      tag: 'Safe Sandbox',
      tagHi: 'सुरक्षित अभ्यास',
      title: 'Digital Payment Learning Simulator',
      titleHi: 'डिजिटल पेमेंट लर्निंग सिमुलेटर (सुरक्षित अभ्यास)',
      description:
        'Practice making UPI payments in a 100% fictional environment with ₹0 real money. Learn how QR codes work and master the golden rule of online transactions.',
      descriptionHi:
        'बिना किसी असली पैसे के जोखिम के फोनपे और गूगलपे जैसी यूपीआई पेमेंट का अभ्यास करें। दुकान पर क्यूआर कोड स्कैन करना और पेमेंट का नियम सीखें।',
      highlights: [
        'Practice authentic shopkeeper QR code payments safely with zero financial risk.',
        'Experience the infamous "Enter PIN to receive money" fraud trap and learn how to avoid it.',
        'Understand the vital difference between your UPI PIN, Bank SMS OTP, and Screen Lock.',
      ],
      highlightsHi: [
        'दुकान पर क्यूआर कोड से ₹150 भुगतान करने का चरणबद्ध सुरक्षित अभ्यास करें।',
        '"पैसे पाने के लिए पिन डालें" वाले सबसे बड़े धोखे का लाइव अभ्यास करके खुद को बचाएं।',
        'यूपीआई पिन, बैंक ओटीपी और स्क्रीन लॉक के अंतर को हमेशा के लिए समझें।',
      ],
      ctaLabel: 'Open Payment Sandbox',
      ctaLabelHi: 'पेमेंट अभ्यास शुरू करें',
      icon: <CreditCard className="w-8 h-8 text-amber-600" />,
      accentBg: 'bg-amber-50 border-amber-200',
    },
    {
      id: 'govt-helpline',
      tabTarget: 'govt',
      tag: 'Official Schemes & Help',
      tagHi: 'सरकारी सेवाएं व मदद',
      title: 'Government Portals & 24x7 Helplines',
      titleHi: 'सरकारी सेवाएं व 24x7 राष्ट्रीय हेल्पलाइन',
      description:
        'Official guides for PM-Kisan Samman Nidhi, myAadhaar, Ayushman Bharat health card, and DigiLocker, plus direct access to emergency human helplines.',
      descriptionHi:
        'पीएम किसान, आधार, आयुष्मान भारत और डिजिलॉकर के लिए आधिकारिक गाइड, जरूरी कागजातों की चेकलिस्ट, और साइबर अपराध होने पर राष्ट्रीय हेल्पलाइन 1930 की सुविधा।',
      highlights: [
        'Interactive document checklists: tick the papers you have ready before applying.',
        'Avoid unauthorized cyber cafe brokers charging illegal fees for free government schemes.',
        'One-tap access to 1930 (Cyber Crime) and 14567 (Senior Citizens Elderline).',
      ],
      highlightsHi: [
        'दस्तावेज चेकलिस्ट: फॉर्म भरने से पहले देखें कि आपके पास कौन से कागजात तैयार हैं।',
        'मुफ्त सरकारी सेवाओं के लिए दलालों द्वारा मांगे जाने वाले भारी शुल्कों से बचें।',
        'एक क्लिक में साइबर हेल्पलाइन 1930 और वरिष्ठ नागरिक हेल्पलाइन 14567 तक पहुंच।',
      ],
      ctaLabel: 'View Govt Services',
      ctaLabelHi: 'सरकारी सेवाएं देखें',
      icon: <Building2 className="w-8 h-8 text-purple-600" />,
      accentBg: 'bg-purple-50 border-purple-200',
    },
  ];

  const currentStep = tourSteps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < tourSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('saathi_tour_completed', 'true');
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    onClose();
  };

  const handleJumpToTab = (tabId: string) => {
    handleComplete();
    onNavigateToTab(tabId);
  };

  const handleListenStep = () => {
    const textToSpeak = `${isHi ? currentStep.titleHi : currentStep.title}. ${
      isHi ? currentStep.descriptionHi : currentStep.description
    }. ${(isHi ? currentStep.highlightsHi : currentStep.highlights).join('. ')}`;
    onSpeak(textToSpeak);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Top Progress & Close Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800">
              {isHi ? currentStep.tagHi : currentStep.tag}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {isHi
                ? `कदम ${currentStepIndex + 1} / ${tourSteps.length}`
                : `Step ${currentStepIndex + 1} of ${tourSteps.length}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleListenStep}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg font-semibold transition-colors cursor-pointer border border-emerald-200"
              title={isHi ? 'इस कदम को सुनें' : 'Read aloud this step'}
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isHi ? 'आवाज़ में सुनें' : 'Listen'}</span>
            </button>

            <button
              onClick={handleComplete}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              title={isHi ? 'टूर बंद करें' : 'Close Tour'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Main Visual & Title */}
          <div className="flex items-start gap-4">
            <div
              className={`p-3.5 rounded-2xl border shrink-0 ${currentStep.accentBg}`}
            >
              {currentStep.icon}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {isHi ? currentStep.titleHi : currentStep.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 mt-1 leading-relaxed">
                {isHi ? currentStep.descriptionHi : currentStep.description}
              </p>
            </div>
          </div>

          {/* Key Bullet Highlights */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              {isHi ? 'इस सुविधा की मुख्य बातें:' : 'Key Features & Safety Highlights:'}
            </span>
            <ul className="space-y-2">
              {(isHi ? currentStep.highlightsHi : currentStep.highlights).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800">
                  <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Direct Jump CTA to this highlighted tool */}
          <div className="flex items-center justify-between p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl">
            <div className="text-xs text-emerald-950 font-medium">
              {isHi ? 'इस सुविधा को तुरंत देखना चाहते हैं?' : 'Want to try this specific tool right now?'}
            </div>
            <button
              onClick={() => handleJumpToTab(currentStep.tabTarget)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <span>{isHi ? currentStep.ctaLabelHi : currentStep.ctaLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          {/* Step Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {tourSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-6 bg-emerald-700'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                title={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Previous / Next / Finish Controls */}
          <div className="flex items-center gap-2">
            {currentStepIndex > 0 ? (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer touch-target-senior"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{isHi ? 'पिछला' : 'Previous'}</span>
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                {isHi ? 'टूर छोड़ें' : 'Skip Tour'}
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shadow-xs touch-target-senior"
            >
              <span>
                {currentStepIndex === tourSteps.length - 1
                  ? isHi
                    ? 'टूर समाप्त करें'
                    : 'Get Started'
                  : isHi
                  ? 'अगला कदम'
                  : 'Next Step'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export type SkillPillar =
  | 'voice-assistant'
  | 'screenshot-camera'
  | 'scam-analyzer'
  | 'upi-simulator'
  | 'personalized-learning';

export interface DailyTip {
  id: string;
  dayNumber: number;
  pillar: SkillPillar;
  categoryEn: string;
  categoryHi: string;
  titleEn: string;
  titleHi: string;
  summaryEn: string;
  summaryHi: string;
  microStepsEn: string[];
  microStepsHi: string[];
  goldenRuleEn: string;
  goldenRuleHi: string;
  practicePromptEn: string;
  practicePromptHi: string;
  targetTab: 'assistant' | 'screenshot' | 'scam' | 'simulator' | 'learn';
}

export interface StruggleItem {
  id: string;
  pillar: SkillPillar;
  labelEn: string;
  labelHi: string;
  reasonEn: string;
  reasonHi: string;
  count: number;
  resolved: boolean;
  recommendedModuleId: string;
  recommendedTab: 'assistant' | 'screenshot' | 'scam' | 'simulator' | 'learn';
  lastUpdated: number;
}

export interface ImprovementEntry {
  id: string;
  pillar: SkillPillar;
  titleEn: string;
  titleHi: string;
  points: number;
  timestamp: number;
}

export interface UserLearningProfile {
  completedTipIds: string[];
  struggles: StruggleItem[];
  improvements: ImprovementEntry[];
  pillarScores: Record<SkillPillar, number>;
}

export const DAILY_LITERACY_TIPS: DailyTip[] = [
  {
    id: 'tip-day-1',
    dayNumber: 1,
    pillar: 'voice-assistant',
    categoryEn: 'Smartphone & Voice Basics',
    categoryHi: 'स्मार्टफोन और आवाज़ सहायता',
    titleEn: 'Make Phone Text Bigger & Easier to Read',
    titleHi: 'फोन के अक्षरों (Font Size) को बड़ा और साफ बनाएं',
    summaryEn:
      'Straining your eyes on small text? Every smartphone lets you increase font size in 3 simple taps without affecting your apps.',
    summaryHi:
      'क्या छोटे अक्षर पढ़ने में आंखों पर जोर पड़ता है? आप अपने फोन की सेटिंग्स से अक्षरों को आसानी से बड़ा कर सकते हैं।',
    microStepsEn: [
      'Open the "Settings" (गियर आइकन) app on your phone home screen.',
      'Scroll down and tap "Display" (डिस्प्ले) -> then tap "Font Size" (अक्षर का आकार).',
      'Slide the dot to the right to make letters Large, or tap "A+" in NIRBHAR AI above.',
    ],
    microStepsHi: [
      'अपने फोन की होम स्क्रीन पर "Settings" (सेटिंग्स) ऐप खोलें।',
      'नीचे स्क्रॉल करें और "Display" (डिस्प्ले) पर टैप करें, फिर "Font Size" चुनें।',
      'स्लाइडर को दाईं ओर खिसकाकर अक्षरों को बड़ा करें।',
    ],
    goldenRuleEn: 'Tip: You can also tap the Mic button below and simply speak your question instead of typing small letters!',
    goldenRuleHi: 'सलाह: छोटे अक्षर टाइप करने के बजाय नीचे माइक बटन दबाएं और बोलकर सवाल पूछें!',
    practicePromptEn: 'How do I make the text size bigger and increase screen brightness on my phone?',
    practicePromptHi: 'मेरे फोन में अक्षरों का आकार बड़ा और स्क्रीन की रोशनी साफ कैसे करें?',
    targetTab: 'assistant',
  },
  {
    id: 'tip-day-2',
    dayNumber: 2,
    pillar: 'upi-simulator',
    categoryEn: 'Safe UPI Payments',
    categoryHi: 'सुरक्षित UPI भुगतान',
    titleEn: 'UPI PIN is ONLY for Sending Money, Never Receiving',
    titleHi: 'UPI पिन केवल पैसे भेजने के लिए है, पैसे पाने के लिए कभी नहीं',
    summaryEn:
      'When someone sends money to your bank account, it arrives automatically. You NEVER need to enter your secret 4 or 6-digit UPI PIN to receive money.',
    summaryHi:
      'जब कोई आपको पैसे भेजता है, तो वह सीधे खाते में आता है। पैसे प्राप्त करने (Receive) के लिए कभी भी UPI पिन नहीं डालना पड़ता।',
    microStepsEn: [
      'Check the top of the screen: if it asks for your UPI PIN, money is LEAVING your account.',
      'Never scan a QR code sent on WhatsApp by a stranger claiming to send you a refund or prize.',
      'If a caller says "Enter PIN to receive ₹5,000", tap Decline immediately.',
    ],
    microStepsHi: [
      'स्क्रीन ध्यान से देखें: यदि UPI पिन मांगा जा रहा है, तो आपके खाते से पैसे कट रहे हैं।',
      'पैसे पाने या कैशबैक के नाम पर किसी अनजान का भेजा QR कोड कभी स्कैन न करें।',
      'यदि कोई कहे कि "पैसे पाने के लिए पिन डालें", तो तुरंत Decline (अस्वीकार) दबाएं।',
    ],
    goldenRuleEn: 'Golden Rule: Entering UPI PIN = Money deducted from your bank account.',
    goldenRuleHi: 'सुनहरा नियम: UPI पिन डालना = आपके बैंक खाते से पैसे कटना।',
    practicePromptEn: 'Let me practice spotting fake receive-money requests in the Safe UPI Simulator.',
    practicePromptHi: 'मुझे सुरक्षित UPI सिमुलेटर में पैसे पाने वाले धोखे से बचने का अभ्यास करना है।',
    targetTab: 'simulator',
  },
  {
    id: 'tip-day-3',
    dayNumber: 3,
    pillar: 'scam-analyzer',
    categoryEn: 'Scam SMS & Call Protection',
    categoryHi: 'धोखाधड़ी संदेश जांच',
    titleEn: 'How to Spot a Fake "Electricity Cut Tonight" SMS',
    titleHi: '"आज रात बिजली कट जाएगी" वाले फर्जी SMS को कैसे पहचानें',
    summaryEn:
      'Scammers send panic messages saying your power will be cut at 9:30 PM unless you call a personal 10-digit mobile number.',
    summaryHi:
      'ठग डराने के लिए मैसेज भेजते हैं कि आज रात 9:30 बजे बिजली कट जाएगी और एक 10 अंकों का निजी मोबाइल नंबर देते हैं।',
    microStepsEn: [
      'Look at the sender: Real electricity boards use official 6-letter codes (like VM-UPPCL), never a 10-digit mobile number.',
      'Never call the phone number written inside an urgent warning SMS.',
      'Check your actual paper electricity bill or official state portal to verify your bill status.',
    ],
    microStepsHi: [
      'भेजने वाले का नाम देखें: असली विभाग 10-अंकों के निजी नंबर से धमकी भरा SMS नहीं भेजते।',
      'डराने वाले मैसेज में लिखे मोबाइल नंबर पर कभी कॉल न करें।',
      'अपने घर के असली बिजली बिल या आधिकारिक वेबसाइट से ही जांच करें।',
    ],
    goldenRuleEn: 'Any SMS creating panic with a "Tonight 9:30 PM" deadline and a mobile number is 100% a scam.',
    goldenRuleHi: 'रात 9:30 बजे बिजली या बैंक बंद होने की धमकी और मोबाइल नंबर वाला हर मैसेज 100% फर्जी है।',
    practicePromptEn: 'How to spot fake electricity bill disconnection SMS?',
    practicePromptHi: 'बिजली कटने का फर्जी मैसेज कैसे पहचानें?',
    targetTab: 'scam',
  },
  {
    id: 'tip-day-4',
    dayNumber: 4,
    pillar: 'screenshot-camera',
    categoryEn: 'Screenshot & Camera Helper',
    categoryHi: 'स्क्रीनशॉट और कैमरा मदद',
    titleEn: 'Check App Permission Popups Before Tapping "Allow"',
    titleHi: 'किसी भी ऐप में "Allow" दबाने से पहले उसकी अनुमति (Permission) जांचें',
    summaryEn:
      'When installing a new app, it may ask for permission to read your SMS, Contacts, or Camera. Only allow what makes sense!',
    summaryHi:
      'नया ऐप खोलते समय वह SMS, संपर्क (Contacts) या कैमरे की अनुमति मांगता है। बिना पढ़े "Allow" न दबाएं।',
    microStepsEn: [
      'Ask yourself: Why does a simple Flashlight or Calculator app need to read my private SMS or Contacts?',
      'If a popup looks confusing or is in complex English, take a screenshot or photo and upload it in Screenshot Helper.',
      'Tap "Don\'t Allow" (अनुमति न दें) if an app asks for unnecessary access.',
    ],
    microStepsHi: [
      'सोचें: एक साधारण टॉर्च या कैलकुलेटर ऐप को आपके निजी SMS पढ़ने की क्या ज़रूरत है?',
      'यदि कोई पॉपअप समझ न आए, तो उसका स्क्रीनशॉट लें और "स्क्रीनशॉट जांच" टैब में अपलोड करें।',
      'गैर-ज़रूरी अनुमति मांगने पर हमेशा "Don\'t Allow" (अनुमति न दें) चुनें।',
    ],
    goldenRuleEn: 'Never allow unknown apps to read your SMS—scammers use this to steal your Bank OTPs.',
    goldenRuleHi: 'किसी भी अनजान ऐप को SMS पढ़ने की अनुमति न दें—इससे ठग आपका बैंक OTP चुरा सकते हैं।',
    practicePromptEn: 'Explain how to inspect an unfamiliar app popup or form using Screenshot Helper.',
    practicePromptHi: 'किसी अनजान ऐप पॉपअप या फॉर्म की स्क्रीनशॉट से जांच कैसे करें?',
    targetTab: 'screenshot',
  },
  {
    id: 'tip-day-5',
    dayNumber: 5,
    pillar: 'voice-assistant',
    categoryEn: 'Smartphone & Voice Basics',
    categoryHi: 'स्मार्टफोन और आवाज़ सहायता',
    titleEn: 'Safely Clean "Storage Full" Without Losing Family Photos',
    titleHi: 'परिवार की फोटो खोए बिना फोन का "Storage Full" साफ करें',
    summaryEn:
      'Good morning forwards on WhatsApp fill up your phone memory quickly. You can clear junk forwards while keeping family photos safe.',
    summaryHi:
      'व्हाट्सएप पर आने वाले रोज़ के गुड मॉर्निंग फोटो फोन की मेमोरी भर देते हैं। आप ज़रूरी फोटो बचाकर कचरा साफ कर सकते हैं।',
    microStepsEn: [
      'Open WhatsApp -> tap the 3 dots at top right -> tap "Settings".',
      'Tap "Storage and Data" -> then tap "Manage Storage".',
      'Review "Forwarded many times" and delete unwanted good-morning images safely.',
    ],
    microStepsHi: [
      'व्हाट्सएप खोलें -> ऊपर दाईं ओर 3 बिंदुओं (⋮) पर टैप करें -> "Settings" चुनें।',
      '"Storage and Data" पर जाएं -> फिर "Manage Storage" पर टैप करें।',
      '"Forwarded many times" वाले फालतू गुड-मॉर्निंग फोटो चुनें और सुरक्षित रूप से डिलीट करें।',
    ],
    goldenRuleEn: 'Never download "Phone Booster / Cleaner Pro" apps from ads—they slow down your phone and show popups.',
    goldenRuleHi: 'विज्ञापन देखकर कोई भी "Phone Cleaner / Booster" ऐप कभी डाउनलोड न करें—वे फोन को नुकसान पहुंचाते हैं।',
    practicePromptEn: 'My phone says Storage Full. How do I clean it step-by-step without deleting important photos?',
    practicePromptHi: 'मेरे फोन में स्टोरेज फुल आ रहा है। जरूरी फोटो खोए बिना जगह कैसे खाली करें?',
    targetTab: 'assistant',
  },
  {
    id: 'tip-day-6',
    dayNumber: 6,
    pillar: 'personalized-learning',
    categoryEn: 'Daily Practice & Mastery',
    categoryHi: 'व्यक्तिगत अभ्यास और प्रगति',
    titleEn: 'The 10-Second Pause Rule Before Clicking Any Link',
    titleHi: 'किसी भी लिंक को छूने से पहले "10 सेकंड रुकने" का नियम',
    summaryEn:
      'Fraudsters rely on haste—either fear (account blocked) or greed (lottery prize). Pausing for 10 seconds protects your hard-earned savings.',
    summaryHi:
      'ठग हमेशा जल्दबाजी कराते हैं—कभी डर दिखाकर (खाता बंद) तो कभी लालच देकर (लॉटरी)। 10 सेकंड रुककर सोचने से आपकी बचत सुरक्षित रहती है।',
    microStepsEn: [
      'Stop and take a breath whenever a message says "Act Immediately / Within 24 Hours".',
      'Never download any file ending in ".apk" sent on WhatsApp or SMS.',
      'Take the 2-minute safety quiz in the Learn & Badges tab to test your scam-spotting confidence!',
    ],
    microStepsHi: [
      'जब भी कोई संदेश "तुरंत करें / 24 घंटे में खाता बंद" कहे, तो 10 सेकंड रुकें और घबराएं नहीं।',
      'व्हाट्सएप या SMS पर आई ".apk" नाम वाली किसी भी फाइल को कभी डाउनलोड न करें।',
      '"सीखें व क्विज" टैब में जाकर 2 मिनट का अभ्यास करें और अपनी सुरक्षा जांचें!',
    ],
    goldenRuleEn: 'Banks and government offices never send ".apk" files or ask for your OTP on WhatsApp.',
    goldenRuleHi: 'बैंक या सरकारी दफ्तर कभी भी व्हाट्सएप पर ".apk" फाइल नहीं भेजते और न ही OTP मांगते हैं।',
    practicePromptEn: 'Take me to my personalized learning quiz to practice spotting digital traps.',
    practicePromptHi: 'मुझे डिजिटल सुरक्षा क्विज और व्यक्तिगत अभ्यास दिखाएं।',
    targetTab: 'learn',
  },
];

const STORAGE_KEY = 'digital_saathi_learning_profile_v1';

const DEFAULT_STRUGGLES: StruggleItem[] = [
  {
    id: 'struggle-upi-collect',
    pillar: 'upi-simulator',
    labelEn: 'Confusing "Receive Money" vs "Send Money" UPI Requests',
    labelHi: 'पैसे पाने (Receive) और पैसे भेजने (Pay) की स्क्रीन में उलझन',
    reasonEn: 'Many beginners accidentally tap "Pay / Enter PIN" when a fraudster sends a collect request.',
    reasonHi: 'कई नए उपयोगकर्ता पैसे पाने के झांसे में आकर पिन डालने की गलती कर बैठते हैं।',
    count: 2,
    resolved: false,
    recommendedModuleId: 'mod-upi',
    recommendedTab: 'simulator',
    lastUpdated: Date.now() - 3600000 * 5,
  },
  {
    id: 'struggle-scam-sms',
    pillar: 'scam-analyzer',
    labelEn: 'Spotting Fake Electricity Bill & KYC Links',
    labelHi: 'फर्जी बिजली बिल और बैंक KYC लिंक की पहचान करना',
    reasonEn: 'Urgent SMS messages with personal 10-digit numbers look official at first glance.',
    reasonHi: 'तत्काल बिजली कटने या खाता ब्लॉक होने वाले मैसेज पहली नज़र में असली लगते हैं।',
    count: 1,
    resolved: false,
    recommendedModuleId: 'mod-scam',
    recommendedTab: 'scam',
    lastUpdated: Date.now() - 3600000 * 12,
  },
  {
    id: 'struggle-app-permissions',
    pillar: 'screenshot-camera',
    labelEn: 'Understanding English Popups & App Permissions',
    labelHi: 'अंग्रेजी पॉपअप और ऐप परमिशन (Allow / Deny) समझना',
    reasonEn: 'Unfamiliar permission dialogs in English can be tricky to interpret safely.',
    reasonHi: 'अंग्रेजी में अचानक आने वाले Allow/Deny बॉक्स को समझना कभी-कभी कठिन होता है।',
    count: 1,
    resolved: false,
    recommendedModuleId: 'mod-phone',
    recommendedTab: 'screenshot',
    lastUpdated: Date.now() - 3600000 * 20,
  },
];

export function getLearningProfile(): UserLearningProfile {
  if (typeof window === 'undefined') {
    return {
      completedTipIds: [],
      struggles: DEFAULT_STRUGGLES,
      improvements: [],
      pillarScores: {
        'voice-assistant': 65,
        'screenshot-camera': 55,
        'scam-analyzer': 60,
        'upi-simulator': 50,
        'personalized-learning': 60,
      },
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        completedTipIds: parsed.completedTipIds || [],
        struggles: parsed.struggles?.length ? parsed.struggles : DEFAULT_STRUGGLES,
        improvements: parsed.improvements || [],
        pillarScores: parsed.pillarScores || {
          'voice-assistant': 65,
          'screenshot-camera': 55,
          'scam-analyzer': 60,
          'upi-simulator': 50,
          'personalized-learning': 60,
        },
      };
    }
  } catch (e) {
    console.warn('Error reading learning profile:', e);
  }

  return {
    completedTipIds: [],
    struggles: DEFAULT_STRUGGLES,
    improvements: [
      {
        id: 'init-1',
        pillar: 'voice-assistant',
        titleEn: 'Started Digital Saathi Voice-First Learning Journey',
        titleHi: 'डिजिटल साथी आवाज़-आधारित सीखने की यात्रा शुरू की',
        points: 10,
        timestamp: Date.now() - 86400000,
      },
    ],
    pillarScores: {
      'voice-assistant': 65,
      'screenshot-camera': 55,
      'scam-analyzer': 60,
      'upi-simulator': 50,
      'personalized-learning': 60,
    },
  };
}

export function saveLearningProfile(profile: UserLearningProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('saathi-learning-updated'));
  } catch (e) {
    console.warn('Error saving learning profile:', e);
  }
}

export function getTodaysTipIndex(): number {
  const dayOfYear = Math.floor(Date.now() / 86400000);
  return dayOfYear % DAILY_LITERACY_TIPS.length;
}

export function getTipForPillar(pillar: SkillPillar): DailyTip {
  return DAILY_LITERACY_TIPS.find((t) => t.pillar === pillar) || DAILY_LITERACY_TIPS[0];
}

export function markDailyTipLearned(tipId: string): UserLearningProfile {
  const profile = getLearningProfile();
  if (!profile.completedTipIds.includes(tipId)) {
    profile.completedTipIds = [...profile.completedTipIds, tipId];
    const tip = DAILY_LITERACY_TIPS.find((t) => t.id === tipId);
    if (tip) {
      profile.pillarScores[tip.pillar] = Math.min(100, (profile.pillarScores[tip.pillar] || 50) + 10);
      profile.improvements = [
        {
          id: `imp-${Date.now()}`,
          pillar: tip.pillar,
          titleEn: `Mastered Daily Tip: ${tip.titleEn}`,
          titleHi: `दैनिक टिप सीखी: ${tip.titleHi}`,
          points: 15,
          timestamp: Date.now(),
        },
        ...profile.improvements.slice(0, 14),
      ];
    }
    saveLearningProfile(profile);
  }
  return profile;
}

export function recordUserStruggle(params: {
  id: string;
  pillar: SkillPillar;
  labelEn: string;
  labelHi: string;
  reasonEn: string;
  reasonHi: string;
  recommendedModuleId: string;
  recommendedTab: 'assistant' | 'screenshot' | 'scam' | 'simulator' | 'learn';
}): UserLearningProfile {
  const profile = getLearningProfile();
  const existingIdx = profile.struggles.findIndex((s) => s.id === params.id);
  if (existingIdx >= 0) {
    profile.struggles[existingIdx] = {
      ...profile.struggles[existingIdx],
      count: profile.struggles[existingIdx].count + 1,
      resolved: false,
      lastUpdated: Date.now(),
    };
  } else {
    profile.struggles = [
      {
        ...params,
        count: 1,
        resolved: false,
        lastUpdated: Date.now(),
      },
      ...profile.struggles,
    ];
  }
  saveLearningProfile(profile);
  return profile;
}

export function recordSkillPracticeSuccess(params: {
  pillar: SkillPillar;
  titleEn: string;
  titleHi: string;
  points?: number;
  resolveStruggleId?: string;
}): UserLearningProfile {
  const profile = getLearningProfile();
  const pts = params.points ?? 10;
  profile.pillarScores[params.pillar] = Math.min(
    100,
    (profile.pillarScores[params.pillar] || 55) + pts
  );

  if (params.resolveStruggleId) {
    profile.struggles = profile.struggles.map((s) =>
      s.id === params.resolveStruggleId ? { ...s, resolved: true, lastUpdated: Date.now() } : s
    );
  }

  profile.improvements = [
    {
      id: `imp-${Date.now()}`,
      pillar: params.pillar,
      titleEn: params.titleEn,
      titleHi: params.titleHi,
      points: pts,
      timestamp: Date.now(),
    },
    ...profile.improvements.slice(0, 14),
  ];

  saveLearningProfile(profile);
  return profile;
}

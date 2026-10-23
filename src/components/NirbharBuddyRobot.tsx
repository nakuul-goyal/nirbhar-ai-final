import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Send,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { Language, AssistantResponse } from '../types';
import { createSpeechRecognizer, isSpeechRecognitionSupported, stopSpeaking } from '../utils/speech';
import { playKeypadClick, playSuccessChime } from '../utils/audioEffects';
import { recordSkillPracticeSuccess } from '../utils/learningTracker';

interface NirbharBuddyRobotProps {
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  onSpeak: (text: string, customRate?: number) => void;
  onStopSpeaking: () => void;
  isSpeaking: boolean;
  onSelectTab: (tab: string) => void;
  currentTab: string;
}

type RobotState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface BuddyExchange {
  id: string;
  question: string;
  replyText: string;
  steps: string[];
  safetyTip: string;
  targetTab?: string;
  isDemo?: boolean;
}

const DEMO_VOICE_PROMPTS: Record<
  Language,
  { label: string; query: string; targetTab?: string }[]
> = {
  en: [
    {
      label: 'UPI PIN Safety Rule',
      query: 'Someone says enter UPI PIN to receive ₹5,000. Is it safe?',
      targetTab: 'simulator',
    },
    {
      label: 'Enlarge Phone Text',
      query: 'How do I make the font size bigger on my smartphone?',
      targetTab: 'assistant',
    },
    {
      label: 'Check Electricity SMS',
      query: 'I got an SMS saying electricity will be cut tonight at 9:30 PM.',
      targetTab: 'scam',
    },
  ],
  hi: [
    {
      label: 'UPI पिन सुरक्षा नियम',
      query: 'कोई कह रहा है पैसे पाने के लिए UPI पिन डालो। क्या यह सुरक्षित है?',
      targetTab: 'simulator',
    },
    {
      label: 'फोन के अक्षर बड़े करें',
      query: 'मेरे स्मार्टफोन में अक्षरों का साइज बड़ा कैसे करें?',
      targetTab: 'assistant',
    },
    {
      label: 'बिजली बिल SMS जांच',
      query: 'मुझे मैसेज आया कि आज रात 9:30 बजे बिजली कट जाएगी। क्या करूँ?',
      targetTab: 'scam',
    },
  ],
  mr: [
    {
      label: 'UPI पिन सुरक्षा नियम',
      query: 'कोणीतरी म्हणत आहे पैसे मिळवण्यासाठी UPI पिन टाका. हे सुरक्षित आहे का?',
      targetTab: 'simulator',
    },
    {
      label: 'फोनमधील अक्षरे मोठी करा',
      query: 'माझ्या फोनमधील अक्षरांचा आकार (Font Size) मोठा कसा करावा?',
      targetTab: 'assistant',
    },
    {
      label: 'लाईट बिल मेसेज तपासा',
      query: 'मला मेसेज आला आहे की आज रात्री ९:३० वाजता वीज कट होईल. मी काय करू?',
      targetTab: 'scam',
    },
  ],
};

function getBuddyInstantFallback(query: string, lang: Language): AssistantResponse {
  const lower = query.toLowerCase();
  const isHi = lang === 'hi';
  const isMr = lang === 'mr';

  if (lower.includes('pin') || lower.includes('पिन') || lower.includes('upi') || lower.includes('यूपीआई') || lower.includes('5000') || lower.includes('५०००')) {
    return {
      replyText: isMr
        ? 'थांबा! पैसे मिळवण्यासाठी UPI पिन कधीही टाकू नका! UPI पिन फक्त पैसे पाठवताना किंवा बँकेचे शिल्लक तपासतानाच टाकला जातो.'
        : isHi
        ? 'रुकिए! पैसे प्राप्त करने के लिए कभी भी UPI पिन नहीं डालना होता! UPI पिन केवल पैसे भेजने या बैलेंस देखने के लिए ही डाला जाता है।'
        : 'Stop! You NEVER enter a UPI PIN to receive money! Entering a UPI PIN will deduct money from your bank account.',
      steps: [
        isMr ? 'कोणत्याही अनोळखी व्यक्तीच्या सांगण्यावरून पिन टाकू नका.' : isHi ? 'किसी अनजान व्यक्ति के कहने पर कभी पिन न डालें।' : 'Never enter a PIN on an unverified payment request.',
        isMr ? 'पैसे मिळवण्यासाठी फक्त तुमचा मोबाईल नंबर किंवा QR कोड पुरेसा असतो.' : isHi ? 'पैसे पाने के लिए केवल मोबाइल नंबर या QR कोड पर्याप्त होता है।' : 'To receive funds, only your mobile number or QR code is needed.',
        isMr ? '"Payment Practice Sandbox" मध्ये जाऊन सुरक्षित सराव करा.' : isHi ? '"पेमेंट अभ्यास सैंडबॉक्स" में बिना असली पैसे के सुरक्षित अभ्यास करें।' : 'Practice safe transfers in the zero-risk UPI Simulator.',
      ],
      safetyTip: isMr
        ? 'सुवर्ण नियम: UPI PIN टाकणे = तुमच्या खात्यातून पैसे जाणे!'
        : isHi
        ? 'सुनहरा नियम: UPI PIN डालना = बैंक खाते से पैसे कटना!'
        : 'Golden Rule: Entering a UPI PIN ALWAYS debits money from your account!',
      suggestedActions: [
        isMr ? 'UPI पेमेंट सराव करा' : isHi ? 'UPI पेमेंट अभ्यास करें' : 'Practice UPI Payments',
      ],
    };
  }

  if (lower.includes('sms') || lower.includes('electricity') || lower.includes('बिजली') || lower.includes('लाईट') || lower.includes('बिल') || lower.includes('cut')) {
    return {
      replyText: isMr
        ? 'हा एक प्रसिद्ध खोटा फसवणूक मेसेज (Fake Scam SMS) आहे. वीज महावितरण कधीही व्यक्तिगत १०-अंकी मोबाईल नंबरवरून वीज कट करण्याचा मेसेज पाठवत नाही.'
        : isHi
        ? 'यह एक आम और खतरनाक धोखाधड़ी (Scam SMS) है। बिजली विभाग कभी भी व्यक्तिगत 10-अंकों के मोबाइल नंबर से लाइन काटने की धमकी नहीं देता।'
        : 'This is a dangerous and widespread phishing scam. Electricity departments never send threat messages from personal 10-digit mobile numbers.',
      steps: [
        isMr ? 'मेसेजमधील कोणत्याही फोन नंबरवर कॉल करू नका.' : isHi ? 'मेसेज में दिए गए किसी भी फोन नंबर पर कॉल न करें।' : 'Do not call the personal phone number in the SMS.',
        isMr ? 'कोणतीही APK फाईल किंवा ॲप डाऊनलोड करू नका.' : isHi ? 'किसी भी अनजान लिंक या "Bill Update" APK पर क्लिक न करें।' : 'Never download any APK file or screen sharing app.',
        isMr ? 'तुमच्या महावितरण ॲपवर किंवा मूळ बिलावर जाऊन खरे बिल तपासा.' : isHi ? 'अपने बिजली बिल की आधिकारिक ऐप या रसीद से ही जांच करें।' : 'Check your actual bill status in the official utility provider app.',
      ],
      safetyTip: isMr
        ? 'सायबर फसवणूक झाल्यास त्वरित राष्ट्रीय हेल्पलाइन १९३० वर कॉल करा.'
        : isHi
        ? 'धोखाधड़ी की स्थिति में तुरंत राष्ट्रीय हेल्पलाइन 1930 पर शिकायत दर्ज करें।'
        : 'Report any fraud immediately to the National Cyber Crime Helpline at 1930.',
    };
  }

  return {
    replyText: isMr
      ? 'नमस्कार! मी निर्भर बडी (Nirbhar Buddy) आहे, तुमचा डिजिटल मित्र. स्मार्टफोन आणि इंटरनेट सुरक्षितपणे वापरण्यास मी मदत करतो.'
      : isHi
      ? 'नमस्ते! मैं निर्भर बडी (Nirbhar Buddy) हूँ, आपका डिजिटल साथी। स्मार्टफोन और ऑनलाइन सुरक्षा को सरल तरीके से सीखने में मैं आपकी मदद करूँगा।'
      : 'Hello! I am Nirbhar Buddy, your friendly AI companion. I am here to guide you step by step in learning digital safety and smartphone skills.',
    steps: [
      isMr ? 'कोणताही प्रश्न मराठी, हिंदी किंवा इंग्रजीत विचारा.' : isHi ? 'कोई भी सवाल हिंदी, मराठी या अंग्रेजी में बोलकर पूछें।' : 'Ask any smartphone or online safety question by voice or text.',
      isMr ? 'UPI पिन आणि OTP कधीही कोणाशी शेअर करू नका.' : isHi ? 'अपना 6-अंकों का UPI पिन या बैंक OTP किसी को न बताएं।' : 'Never share your 6-digit UPI PIN or SMS OTP with anyone.',
      isMr ? 'शंकेस्पद मेसेज तपासण्यासाठी "Scam Detector" वापरा.' : isHi ? 'संदेहास्पद संदेश जांचने के लिए "स्कैम डिटेक्टर" का उपयोग करें।' : 'Use the Scam Detector tab to verify suspicious messages.',
    ],
    safetyTip: isMr
      ? 'मार्गदर्शनासाठी कोणत्याही वेळी खालील बटण दाबून माझ्याशी बोला!'
      : isHi
      ? 'किसी भी समय मुझसे मार्गदर्शन पाने के लिए नीचे माइक दबाएं!'
      : 'Tap the microphone anytime to speak with me directly!',
  };
}

export const NirbharBuddyRobot: React.FC<NirbharBuddyRobotProps> = ({
  language,
  onChangeLanguage,
  onSpeak,
  onStopSpeaking,
  isSpeaking,
  onSelectTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [speechRate] = useState(0.85);

  const [exchanges, setExchanges] = useState<BuddyExchange[]>([
    {
      id: 'initial',
      question: language === 'mr' ? 'नमस्ते बडी!' : language === 'hi' ? 'नमस्ते बडी!' : 'Hello Buddy!',
      replyText:
        language === 'mr'
          ? 'नमस्कार! मी तुमचा निर्भर बडी (Nirbhar Buddy) आहे. तुम्हाला स्मार्टफोन किंवा ऑनलाइन पेमेंटबाबत कोणती मदत हवी आहे? खालील माइक दाबून बोला!'
          : language === 'hi'
          ? 'नमस्ते! मैं आपका निर्भर बडी (Nirbhar Buddy) हूँ। आपको स्मार्टफोन या ऑनलाइन सुरक्षा में क्या सीखना है? नीचे माइक दबाकर बोलें!'
          : 'Hi! I am your Nirbhar Buddy. How can I assist you with your smartphone or digital safety today? Tap the mic to talk to me!',
      steps: [
        language === 'mr'
          ? 'माइक बटण दाबून थेट बोला.'
          : language === 'hi'
          ? 'माइक बटन दबाकर सीधे अपनी भाषा में बोलें।'
          : 'Tap the glowing microphone to speak naturally.',
        language === 'mr'
          ? 'पैसे, UPI किंवा मेसेजबाबत शंका विचारा.'
          : language === 'hi'
          ? 'UPI पिन, ओटीपी या अनजान संदेशों के बारे में पूछें।'
          : 'Ask about UPI PIN rules, suspicious SMS, or phone settings.',
      ],
      safetyTip:
        language === 'mr'
          ? 'लक्षात ठेवा: पैसे मिळवण्यासाठी कधीही UPI पिन टाकू नका!'
          : language === 'hi'
          ? 'याद रखें: पैसे प्राप्त करने के लिए कभी UPI पिन न डालें!'
          : 'Golden Rule: You never enter a UPI PIN to receive money!',
    },
  ]);

  const recognizerRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [exchanges, isThinking, liveTranscript, isOpen]);

  const robotState: RobotState = isRecording
    ? 'listening'
    : isThinking
    ? 'thinking'
    : isSpeaking
    ? 'speaking'
    : 'idle';

  const handleAskBuddy = async (
    queryText: string,
    options?: { autoSpeak?: boolean; isDemo?: boolean; targetTab?: string }
  ) => {
    const trimmed = queryText.trim();
    if (!trimmed || isThinking) return;

    const shouldSpeak = options?.autoSpeak ?? true;
    setInputText('');
    setLiveTranscript('');
    setVoiceError(null);
    setIsThinking(true);

    let replyData: AssistantResponse | null = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: trimmed,
          language,
          mode: 'beginner',
        }),
      });

      clearTimeout(timeoutId);
      
if (response.ok) {
  const data = await response.json();

  if (typeof data.reply === 'string' && data.reply.trim()) {
    replyData = {
      replyText: data.reply,
      steps: [],
      safetyTip: '',
    };
  }
}

    } catch {
      // Fallback handled below
    }

    if (!replyData || !replyData.replyText) {
      replyData = getBuddyInstantFallback(trimmed, language);
    }

    const inferredTab =
      options?.targetTab ||
      (trimmed.toLowerCase().includes('upi') || trimmed.toLowerCase().includes('pin') || trimmed.includes('पिन')
        ? 'simulator'
        : trimmed.toLowerCase().includes('sms') || trimmed.toLowerCase().includes('electricity') || trimmed.includes('बिजली') || trimmed.includes('लाईट')
        ? 'scam'
        : trimmed.toLowerCase().includes('screenshot') || trimmed.includes('स्क्रीनशॉट')
        ? 'screenshot'
        : undefined);

    const newExchange: BuddyExchange = {
      id: `buddy-${Date.now()}`,
      question: trimmed,
      replyText: replyData.replyText,
      steps: replyData.steps || [],
      safetyTip: replyData.safetyTip || '',
      targetTab: inferredTab,
      isDemo: options?.isDemo,
    };

    setExchanges((prev) => [...prev, newExchange]);
    setIsThinking(false);

    recordSkillPracticeSuccess({
      pillar: 'voice-assistant',
      titleEn: `Guided by Nirbhar Buddy: "${trimmed.slice(0, 40)}"`,
      titleHi: `निर्भर बडी से सीखा: "${trimmed.slice(0, 40)}"`,
      points: 5,
    });

    if (shouldSpeak) {
      const fullSpeech = `${newExchange.replyText}. ${newExchange.steps.join('. ')}. ${newExchange.safetyTip}`;
      onSpeak(fullSpeech, speechRate);
    }
  };

  const handleToggleMic = () => {
    playKeypadClick();

    if (isRecording) {
      try {
        recognizerRef.current?.stop();
      } catch {}
      setIsRecording(false);
      return;
    }

    onStopSpeaking();
    setVoiceError(null);

    if (!isSpeechRecognitionSupported()) {
      setVoiceError(
        language === 'mr'
          ? 'तुमच्या ब्राउझरमध्ये व्हॉइस इनपुट उपलब्ध नाही. कृपया टाइप करा किंवा खालील प्रश्न निवडा.'
          : language === 'hi'
          ? 'आपके ब्राउज़र में आवाज़ इनपुट उपलब्ध नहीं है। कृपया टाइप करें या नीचे दिए प्रश्न चुनें।'
          : 'Speech recognition is not supported in this browser. Please type or use quick prompts.'
      );
      return;
    }

    try {
      const recognizer = createSpeechRecognizer(
        language,
        (transcript, isFinal) => {
          setLiveTranscript(transcript);
          if (isFinal) {
            setIsRecording(false);
            playSuccessChime();
            handleAskBuddy(transcript, { autoSpeak: true });
          }
        },
        (error) => {
          setIsRecording(false);
          setVoiceError(
            language === 'mr'
              ? 'आवाज़ ऐकू आली नाही. कृपया पुन्हा बोला.'
              : language === 'hi'
              ? 'आवाज़ सुनाई नहीं दी। कृपया पुनः बोलें।'
              : `Voice error (${error}). Tap mic to retry.`
          );
        },
        () => {
          setIsRecording(false);
        }
      );

      recognizerRef.current = recognizer;
      if (recognizer) {
        recognizer.start();
        setIsRecording(true);
      }
    } catch {
      setIsRecording(false);
      setVoiceError(
        language === 'hi'
          ? 'माइक अनुमति आवश्यक है। कृपया अनुमति दें।'
          : 'Microphone permission needed. Please allow microphone access.'
      );
    }
  };

  const handleQuickPromptClick = (p: { label: string; query: string; targetTab?: string }) => {
    playKeypadClick();
    handleAskBuddy(p.query, { autoSpeak: true, isDemo: true, targetTab: p.targetTab });
  };

  return (
    <>
      {/* 3D FLOATING ROBOT AVATAR at bottom-right */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end select-none">
        {/* Floating Bubble Hint when popup is closed */}
        {!isOpen && (
          <div
            onClick={() => {
              playKeypadClick();
              setIsOpen(true);
            }}
            className="mb-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-xs font-bold py-1.5 px-3 rounded-full shadow-lg border border-white/30 cursor-pointer flex items-center gap-1.5 animate-bounce hover:scale-105 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span>
              {language === 'mr'
                ? 'बोला माझ्याशी! (Nirbhar Buddy)'
                : language === 'hi'
                ? 'मुझसे बात करें! (Nirbhar Buddy)'
                : 'Talk to Nirbhar Buddy!'}
            </span>
          </div>
        )}

        {/* The 3D Floating Robot Body */}
        <button
          onClick={() => {
            playKeypadClick();
            setIsOpen((prev) => !prev);
          }}
          aria-label="Open Nirbhar Buddy 3D AI Voice Assistant"
          className="group relative cursor-pointer focus:outline-none transition-transform duration-300 hover:scale-110 active:scale-95"
        >
          {/* Animated Glow Aura */}
          <div
            className={`absolute -inset-2 rounded-full blur-xl transition-opacity duration-500 ${
              robotState === 'speaking'
                ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-90 animate-pulse'
                : robotState === 'listening'
                ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-95 animate-ping'
                : robotState === 'thinking'
                ? 'bg-gradient-to-r from-amber-400 to-purple-500 opacity-80 animate-pulse'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 opacity-60 group-hover:opacity-100'
            }`}
          />

          {/* SVG 3D Robot Figure */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 drop-shadow-2xl">
            <svg
              viewBox="0 0 120 120"
              className={`w-full h-full filter drop-shadow-lg transition-transform duration-700 ${
                robotState === 'speaking'
                  ? 'animate-bounce'
                  : robotState === 'listening'
                  ? 'scale-105'
                  : 'animate-pulse'
              }`}
            >
              <defs>
                <linearGradient id="robotBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="robotVisorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#1e1b4b" />
                </linearGradient>
                <radialGradient id="eyeGlowGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#67e8f9" />
                  <stop offset="70%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#0284c7" />
                </radialGradient>
                <radialGradient id="listenGlowGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#a7f3d0" />
                  <stop offset="70%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </radialGradient>
              </defs>

              {/* Antenna */}
              <line x1="60" y1="20" x2="60" y2="8" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
              <circle
                cx="60"
                cy="7"
                r="5"
                fill={robotState === 'speaking' ? '#f43f5e' : robotState === 'listening' ? '#10b981' : '#38bdf8'}
                className="animate-pulse"
              />

              {/* Robot Ears / Headphone nubs */}
              <rect x="14" y="44" width="8" height="20" rx="4" fill="#64748b" />
              <rect x="98" y="44" width="8" height="20" rx="4" fill="#64748b" />

              {/* Robot Head / Helmet with 3D gradient */}
              <rect
                x="20"
                y="20"
                width="80"
                height="68"
                rx="28"
                fill="url(#robotBodyGrad)"
                stroke="#c7d2fe"
                strokeWidth="2"
              />

              {/* 3D Specular Highlight on Head */}
              <path
                d="M 32 26 Q 60 22 88 26"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
              />

              {/* Visor Screen */}
              <rect
                x="28"
                y="32"
                width="64"
                height="44"
                rx="18"
                fill="url(#robotVisorGrad)"
                stroke="#38bdf8"
                strokeOpacity="0.4"
                strokeWidth="1.5"
              />

              {/* Glowing Eyes */}
              {robotState === 'speaking' ? (
                <>
                  <path d="M 40 54 Q 47 45 54 54" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" fill="none" />
                  <path d="M 66 54 Q 73 45 80 54" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" fill="none" />
                </>
              ) : (
                <>
                  <ellipse
                    cx="46"
                    cy="52"
                    rx={robotState === 'listening' ? '8' : '6.5'}
                    ry={robotState === 'listening' ? '9' : '7.5'}
                    fill={robotState === 'listening' ? 'url(#listenGlowGrad)' : 'url(#eyeGlowGrad)'}
                  />
                  <circle cx="44" cy="49" r="2" fill="#ffffff" />

                  <ellipse
                    cx="74"
                    cy="52"
                    rx={robotState === 'listening' ? '8' : '6.5'}
                    ry={robotState === 'listening' ? '9' : '7.5'}
                    fill={robotState === 'listening' ? 'url(#listenGlowGrad)' : 'url(#eyeGlowGrad)'}
                  />
                  <circle cx="72" cy="49" r="2" fill="#ffffff" />
                </>
              )}

              {/* Rosy Digital Cheeks */}
              <ellipse cx="36" cy="62" rx="3.5" ry="2" fill="#f472b6" opacity="0.6" />
              <ellipse cx="84" cy="62" rx="3.5" ry="2" fill="#f472b6" opacity="0.6" />

              {/* Floating Little Body / Neck */}
              <rect x="48" y="90" width="24" height="12" rx="6" fill="url(#robotBodyGrad)" stroke="#c7d2fe" strokeWidth="1" />
              <circle cx="60" cy="96" r="3" fill="#38bdf8" />
            </svg>
          </div>

          {/* Status Indicator Pip */}
          <span
            className={`absolute top-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
              robotState === 'speaking'
                ? 'bg-rose-500 animate-ping'
                : robotState === 'listening'
                ? 'bg-emerald-500 animate-ping'
                : robotState === 'thinking'
                ? 'bg-amber-400'
                : 'bg-indigo-500'
            }`}
          />
        </button>
      </div>

      {/* EXPANDED 3D VOICE CHAT POPUP MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-indigo-100 flex flex-col max-h-[88vh] overflow-hidden animate-scaleUp"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md p-1 border border-white/30 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base sm:text-lg">NIRBHAR Buddy</h3>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                      {language === 'mr' ? 'मराठी' : language === 'hi' ? 'हिन्दी' : 'English'}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-100">
                    {language === 'mr'
                      ? 'तुमचा बोलणारा AI डिजिटल सोबती'
                      : language === 'hi'
                      ? 'आपका बोलने वाला AI डिजिटल साथी'
                      : 'Your voice-enabled AI digital companion'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Switch Buttons */}
                <div className="flex bg-white/20 backdrop-blur-md rounded-xl p-0.5 text-xs font-bold">
                  {(['en', 'hi', 'mr'] as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        playKeypadClick();
                        onChangeLanguage(l);
                      }}
                      className={`px-2 py-1 rounded-lg transition-all ${
                        language === l ? 'bg-white text-indigo-700 shadow-sm' : 'text-white/80 hover:text-white'
                      }`}
                    >
                      {l === 'en' ? 'EN' : l === 'hi' ? 'हिन्दी' : 'मराठी'}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    playKeypadClick();
                    onStopSpeaking();
                    setIsOpen(false);
                  }}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Speaking State Visualizer Banner */}
            {isSpeaking && (
              <div className="bg-indigo-50 border-b border-indigo-100 py-2 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-4 bg-indigo-600 rounded-full animate-pulse" />
                    <span className="w-1.5 h-6 bg-purple-600 rounded-full animate-pulse delay-75" />
                    <span className="w-1.5 h-3 bg-blue-600 rounded-full animate-pulse delay-150" />
                  </div>
                  <span className="text-xs font-bold text-indigo-900">
                    {language === 'mr' ? 'बडी बोलत आहे...' : language === 'hi' ? 'बडी बोल रहा है...' : 'Buddy is speaking...'}
                  </span>
                </div>
                <button
                  onClick={onStopSpeaking}
                  className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  {language === 'mr' ? 'थांबवा' : language === 'hi' ? 'रोकें' : 'Stop'}
                </button>
              </div>
            )}

            {/* Conversation Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[50vh]">
              {exchanges.map((ex) => (
                <div key={ex.id} className="space-y-3">
                  {/* User Speech Bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm p-3 shadow-sm text-sm">
                      <p className="font-medium">{ex.question}</p>
                    </div>
                  </div>

                  {/* Robot Response Card */}
                  <div className="flex gap-2 items-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="max-w-[88%] bg-slate-50 border border-indigo-100 rounded-2xl rounded-tl-sm p-3.5 shadow-sm text-sm space-y-2.5">
                      <p className="text-slate-800 font-semibold leading-relaxed">{ex.replyText}</p>

                      {ex.steps && ex.steps.length > 0 && (
                        <div className="space-y-1.5 pt-1 border-t border-slate-200">
                          {ex.steps.map((st, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                              <span>{st}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {ex.safetyTip && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-start gap-2 text-xs text-amber-900">
                          <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                          <span className="font-semibold">{ex.safetyTip}</span>
                        </div>
                      )}

                      {/* Direct Navigation Button if tab matches */}
                      {ex.targetTab && (
                        <button
                          onClick={() => {
                            playKeypadClick();
                            onSelectTab(ex.targetTab!);
                            setIsOpen(false);
                          }}
                          className="w-full mt-1 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>
                            {language === 'mr'
                              ? 'हा विभाग थेट उघडा'
                              : language === 'hi'
                              ? 'यह टूल अभी खोलें'
                              : 'Open Tool Right Now'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Replay Voice Button */}
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            const full = `${ex.replyText}. ${ex.steps.join('. ')}. ${ex.safetyTip}`;
                            onSpeak(full, speechRate);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{language === 'mr' ? 'पुन्हा ऐका' : language === 'hi' ? 'दोबारा सुनें' : 'Listen Again'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Thinking / Processing Bubble */}
              {isThinking && (
                <div className="flex gap-2 items-center text-xs text-slate-500 pl-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                  </div>
                  <span>
                    {language === 'mr'
                      ? 'निर्भर बडी विचार करत आहे...'
                      : language === 'hi'
                      ? 'निर्भर बडी विचार कर रहा है...'
                      : 'Nirbhar Buddy is thinking...'}
                  </span>
                </div>
              )}

              {/* Live Speech Recognition Bubble */}
              {isRecording && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-emerald-900 text-xs animate-pulse">
                  <div className="flex items-center gap-2 mb-1 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                    <span>{language === 'mr' ? 'मी ऐकत आहे... बोला' : language === 'hi' ? 'मैं सुन रहा हूँ... बोलिए' : 'Listening to you... speak clearly'}</span>
                  </div>
                  <p className="italic text-emerald-800">{liveTranscript || '...'}</p>
                </div>
              )}

              {/* Error Notice */}
              {voiceError && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 text-rose-800 text-xs flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{voiceError}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Demo Prompts for Seniors */}
            <div className="bg-slate-50 border-t border-slate-100 p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {language === 'mr'
                    ? 'वारंवार विचारले जाणारे प्रश्न (क्लिक करा):'
                    : language === 'hi'
                    ? 'अक्सर पूछे जाने वाले सवाल (क्लिक करें):'
                    : 'Quick Helpful Prompts (Tap to ask):'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DEMO_VOICE_PROMPTS[language].map((dp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPromptClick(dp)}
                    className="bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold py-1 px-2.5 rounded-full shadow-2xs hover:scale-102 transition-transform cursor-pointer"
                  >
                    {dp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Input & Large Voice Action Bar */}
            <div className="p-3 bg-white border-t border-slate-200 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {/* Large Microphone Button */}
                <button
                  onClick={handleToggleMic}
                  aria-label={isRecording ? 'Stop listening' : 'Start voice input'}
                  className={`cursor-pointer rounded-2xl p-3 flex items-center justify-center font-bold text-sm transition-all shadow-md ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse ring-4 ring-rose-200'
                      : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white'
                  }`}
                >
                  {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                {/* Text Input Box */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAskBuddy(inputText);
                      }
                    }}
                    placeholder={
                      language === 'mr'
                        ? 'येथे प्रश्न टाइप करा किंवा माइक दाबा...'
                        : language === 'hi'
                        ? 'यहाँ सवाल लिखें या माइक दबाएं...'
                        : 'Type question or tap mic...'
                    }
                    className="w-full bg-slate-100 focus:bg-white border border-slate-300 focus:border-indigo-500 rounded-2xl py-3 pl-3 pr-10 text-xs sm:text-sm text-slate-800 focus:outline-none transition-colors"
                  />
                  <button
                    onClick={() => handleAskBuddy(inputText)}
                    disabled={!inputText.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 disabled:text-slate-400 p-1.5 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

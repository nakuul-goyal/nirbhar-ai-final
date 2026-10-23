import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  HelpCircle,
  RefreshCw,
  Lightbulb,
  Copy,
  Check,
  Share2,
  AlertCircle,
  Camera,
  QrCode,
  Award,
} from 'lucide-react';
import { ChatMessage, Language, AssistantResponse } from '../types';
import { SAMPLE_QUESTIONS } from '../data/mockData';
import { speakText, stopSpeaking, createSpeechRecognizer } from '../utils/speech';
import { playSuccessChime, playKeypadClick } from '../utils/audioEffects';
import { DailyDigitalLiteracyTip } from './DailyDigitalLiteracyTip';
import { recordSkillPracticeSuccess, recordUserStruggle } from '../utils/learningTracker';

interface AssistantTabProps {
  language: Language;
  onSpeak: (text: string, customRate?: number) => void;
  onSelectTab?: (tab: string) => void;
  isSpeaking?: boolean;
}

export const AssistantTab: React.FC<AssistantTabProps> = ({
  language,
  onSpeak,
  onSelectTab,
  isSpeaking,
}) => {
  const isHi = language === 'hi';
  const isMr = language === 'mr';
  const isDevanagari = isHi || isMr;

  const getWelcomeMessage = (lang: Language): ChatMessage => ({
    id: 'welcome',
    sender: 'assistant',
    text:
      lang === 'mr'
        ? 'नमस्कार! मी तुमचा NIRBHAR AI (निर्भर AI) सोबती आहे. स्मार्टफोन वापरणे, व्हॉट्सॲप, ऑनलाइन पेमेंट किंवा कोणताही अनोळखी मेसेज समजून घेण्यात अडचण असल्यास मला नक्की विचारा.'
        : lang === 'hi'
        ? 'नमस्ते! मैं आपका NIRBHAR AI (निर्भर AI) साथी हूँ। स्मार्टफोन चलाने, व्हाट्सएप, फोनपे, सरकारी योजनाओं या किसी भी मैसेज को समझने में आपको कोई भी परेशानी हो, तो मुझसे बेझिझक पूछें।'
        : 'Hello! Welcome to NIRBHAR AI — Learn Digital. Live Independent. If you have any difficulty using your smartphone, WhatsApp, online payments, or understanding suspicious messages, ask me freely.',
    steps: [
      lang === 'mr'
        ? 'तुम्ही खालील माइक बटण दाबून किंवा उजव्या कोपऱ्यातील Nirbhar Buddy रोबोटवर क्लिक करून बोलू शकता.'
        : lang === 'hi'
        ? 'आप नीचे दिए गए माइक बटन को दबाकर या कोने में तैरते Nirbhar Buddy रोबोट से बोलकर सवाल पूछ सकते हैं।'
        : 'Tap the microphone button below or click the floating Nirbhar Buddy 3D robot to speak your question.',
      lang === 'mr'
        ? 'मी तुम्हाला एक-एक पाऊल सोप्या भाषेत समजावून सांगेन.'
        : lang === 'hi'
        ? 'मैं आपको एक-एक करके आसान कदमों में समझाऊंगा ताकि कोई घबराहट न हो।'
        : 'I will explain each step one at a time in simple language so you can follow easily.',
    ],
    safetyTip:
      lang === 'mr'
        ? 'लक्षात ठेवा: तुमचा ६ अंकी बँक OTP किंवा UPI पिन फोनवर कोणालाही सांगू नका.'
        : lang === 'hi'
        ? 'याद रखें: अपना 6 अंकों का बैंक OTP या UPI PIN किसी को भी फोन पर कभी न बताएं।'
        : 'Golden Rule: Never share your 6-digit Bank OTP or UPI PIN with anyone over a phone call.',
    suggestedActions: [
      lang === 'mr'
        ? 'यूपीआय पिन आणि ओटीपी मध्ये काय फरक आहे?'
        : isHi
        ? 'यूपीआई पिन और ओटीपी में क्या अंतर है?'
        : 'What is the difference between UPI PIN and OTP?',
      lang === 'mr'
        ? 'लाईट बिल कट होण्याचा खोटा मेसेज कसा ओळखावा?'
        : isHi
        ? 'बिजली कटने का फर्जी मैसेज कैसे पहचानें?'
        : 'How to spot fake electricity bill disconnection SMS?',
      lang === 'mr'
        ? 'पीएम किसान हप्ता कसा तपासावा?'
        : isHi
        ? 'पीएम किसान की किस्त कैसे देखें?'
        : 'How to check PM Kisan installment status?',
    ],
    timestamp: Date.now(),
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => [getWelcomeMessage(language)]);

  const [inputText, setInputText] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [learningMode, setLearningMode] = useState<'beginner' | 'advanced'>('beginner');
  const [speechRate, setSpeechRate] = useState<number>(0.85); // 0.85x default gentle senior pace
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({});
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState<string | null>(null);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const speechRecognizerRef = useRef<any>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, liveTranscript]);

  useEffect(() => {
    if (!isSpeaking) {
      setActiveSpeakingMsgId(null);
    }
  }, [isSpeaking]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [getWelcomeMessage(language)];
      }
      return prev;
    });
  }, [language]);

  const handleSendMessage = async (textToSend?: string, wasVoiceQuery: boolean = false) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLiveTranscript('');
    setIsLoading(true);

    try {
      let data: AssistantResponse | null = null;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8500);

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            message: text,
            language,
            mode: learningMode,
            history: messages.map((m) => ({ role: m.sender, content: m.text })),
          }),
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          data = await response.json();
        }
      } catch (networkErr) {
        console.warn('Network / API response took longer or was interrupted, using instant domain mentor guidance');
      }

      if (!data || !data.replyText) {
        data = getLocalAssistantFallback(text, isHi);
      }

      const newMsgId = `asst-${Date.now()}`;
      const assistantMessage: ChatMessage = {
        id: newMsgId,
        sender: 'assistant',
        text: data.replyText,
        steps: data.steps,
        safetyTip: data.safetyTip,
        suggestedActions: data.suggestedActions,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Track user query topic for Personalized Learning & Progress Tracking
      const lowerQ = text.toLowerCase();
      if (lowerQ.includes('pin') || lowerQ.includes('upi') || lowerQ.includes('पिन') || lowerQ.includes('पेमेंट')) {
        recordUserStruggle({
          id: 'struggle-upi-pin-query',
          pillar: 'upi-simulator',
          labelEn: 'UPI PIN vs OTP & Payment Safety',
          labelHi: 'यूपीआई पिन (UPI PIN) और ओटीपी सुरक्षा नियम',
          reasonEn: `Asked AI Assistant: "${text.slice(0, 60)}"`,
          reasonHi: `सहायक से पूछा गया सवाल: "${text.slice(0, 60)}"`,
          recommendedModuleId: 'mod-upi',
          recommendedTab: 'simulator',
        });
      } else if (lowerQ.includes('scam') || lowerQ.includes('sms') || lowerQ.includes('बिजली') || lowerQ.includes('फर्जी')) {
        recordUserStruggle({
          id: 'struggle-scam-query',
          pillar: 'scam-analyzer',
          labelEn: 'Identifying Fake Disconnection & Lottery Messages',
          labelHi: 'फर्जी बिजली बिल और लॉटरी संदेशों की पहचान',
          reasonEn: `Asked AI Assistant: "${text.slice(0, 60)}"`,
          reasonHi: `सहायक से पूछा गया सवाल: "${text.slice(0, 60)}"`,
          recommendedModuleId: 'mod-scam',
          recommendedTab: 'scam',
        });
      } else {
        recordSkillPracticeSuccess({
          pillar: 'voice-assistant',
          titleEn: `Practiced Voice/Chat Query: "${text.slice(0, 45)}"`,
          titleHi: `डिजिटल साथी से सवाल सीखा: "${text.slice(0, 45)}"`,
          points: 5,
        });
      }

      // Fully Hands-Free Voice Response: automatically read aloud when user asked by voice
      if (wasVoiceQuery) {
        setActiveSpeakingMsgId(newMsgId);
        const speechContent = `${data.replyText}. ${data.steps ? data.steps.join('. ') : ''}. ${
          data.safetyTip ? (isHi ? 'सुरक्षा नियम: ' : 'Safety rule: ') + data.safetyTip : ''
        }`;
        onSpeak(speechContent, speechRate);
      }
    } catch (error) {
      console.warn('Chat handler handled exception:', error);
      const fallback = getLocalAssistantFallback(text, isHi);
      const fallbackId = `fallback-${Date.now()}`;
      const fallbackMsg: ChatMessage = {
        id: fallbackId,
        sender: 'assistant',
        text: fallback.replyText,
        steps: fallback.steps,
        safetyTip: fallback.safetyTip,
        suggestedActions: fallback.suggestedActions,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (wasVoiceQuery) {
        setActiveSpeakingMsgId(fallbackId);
        onSpeak(fallback.replyText, speechRate);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      try {
        speechRecognizerRef.current?.stop();
      } catch (e) {}
      setIsRecording(false);
      return;
    }

    // Stop ongoing audio so synthesizer voice is not heard by speech recognizer
    stopSpeaking();
    setVoiceNotice(null);
    setLiveTranscript('');

    const recognizer = createSpeechRecognizer(
      language,
      (transcript, isFinal) => {
        setLiveTranscript(transcript);
        setInputText(transcript);

        if (isFinal && transcript.trim()) {
          setIsRecording(false);
          setLiveTranscript('');
          handleSendMessage(transcript.trim(), true);
        }
      },
      (err) => {
        console.warn('Voice error:', err);
        setIsRecording(false);
        setLiveTranscript('');
        if (err === 'not-allowed') {
          setVoiceNotice(
            isHi
              ? 'माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया ब्राउज़र में माइक की अनुमति दें।'
              : 'Microphone permission was denied. Please allow microphone access in your browser settings.'
          );
        } else if (err !== 'no-speech') {
          setVoiceNotice(
            isHi
              ? 'माइक से आवाज़ साफ़ नहीं सुनी जा सकी। कृपया दोबारा बोलें या नीचे सवाल टाइप करें।'
              : 'Could not catch voice audio clearly. Please try speaking again or type your question.'
          );
        }
      },
      () => {
        setIsRecording(false);
      }
    );

    if (recognizer) {
      speechRecognizerRef.current = recognizer;
      try {
        recognizer.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Recognizer start error:', err);
        setIsRecording(false);
      }
    } else {
      setVoiceNotice(
        isHi
          ? 'आपके ब्राउज़र में आवाज़ पहचान (Web Speech API) उपलब्ध नहीं है। कृपया नीचे लिखकर सवाल पूछें।'
          : 'Web Speech recognition is not supported in this browser. Please type your question.'
      );
    }
  };

  const toggleStepCompletion = (msgId: string, stepIndex: number, totalSteps: number) => {
    playKeypadClick();
    setCompletedSteps((prev) => {
      const current = prev[msgId] || [];
      const updated = current.includes(stepIndex)
        ? current.filter((i) => i !== stepIndex)
        : [...current, stepIndex];

      // If user completed all steps, play pleasant celebratory chime and record skill mastery!
      if (updated.length === totalSteps && !current.includes(stepIndex)) {
        setTimeout(() => {
          playSuccessChime();
          recordSkillPracticeSuccess({
            pillar: 'voice-assistant',
            titleEn: 'Completed all step-by-step instructions in AI Assistant',
            titleHi: 'सहायक के सभी चरणबद्ध निर्देश सफलतापूर्वक पूरे किए',
            points: 10,
          });
        }, 200);
      }

      return { ...prev, [msgId]: updated };
    });
  };

  const copyGuide = (msg: ChatMessage) => {
    const textToCopy = `NIRBHAR AI Guide:\n${msg.text}\n\nSteps:\n${(msg.steps || []).map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nSafety Rule: ${msg.safetyTip || 'Never share your UPI PIN or OTP'}`;
    navigator.clipboard?.writeText(textToCopy);
    setCopiedMsgId(msg.id);
    setTimeout(() => setCopiedMsgId(null), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-gradient-to-r from-indigo-950 via-blue-950 to-purple-950 text-white border border-indigo-400/30 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1">
            NIRBHAR AI — Learn Digital. Live Independent.
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <span>
              {isMr
                ? 'निर्भर AI — डिजिटल शिका. स्वावलंबी जगा.'
                : isHi
                ? 'निर्भर AI — डिजिटल सीखें। आत्मनिर्भर जिएं।'
                : 'NIRBHAR AI — Your Trusted Digital Companion'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            {isMr
              ? 'मराठी, हिंदी किंवा इंग्रजीमध्ये एक-एक पाऊल सोप्या भाषेत शिका. भीतीशिवाय आत्मनिर्भर व्हा.'
              : isHi
              ? 'आसान भाषा में एक-एक कदम सीखें। कोई भी सवाल पूछने में संकोच न करें।'
              : 'Learn one simple step at a time in English, Hindi, or Marathi. No technical jargon, no fear.'}
          </p>
        </div>

        {/* Learning Mode Control */}
        <div className="flex items-center gap-1 p-1 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl shrink-0">
          <button
            onClick={() => setLearningMode('beginner')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              learningMode === 'beginner'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xs'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            {isMr ? 'सोपा मोड (नवीन)' : isHi ? 'सरल मोड (शुरुआती)' : 'Beginner Mode'}
          </button>
          <button
            onClick={() => setLearningMode('advanced')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              learningMode === 'advanced'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xs'
                : 'text-blue-100 hover:text-white'
            }`}
          >
            {isMr ? 'संक्षिप्त मोड' : isHi ? 'संक्षिप्त मोड' : 'Standard'}
          </button>
        </div>
      </div>

      {/* Daily Digital Literacy Tip Component */}
      <DailyDigitalLiteracyTip
        language={language}
        onSpeak={onSpeak}
        isSpeaking={isSpeaking}
        onSelectTab={onSelectTab}
        onAskQuestion={(q) => handleSendMessage(q, false)}
      />

      {/* 5 Core Pillars Quick Action Hero Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Tile 1: Voice-First AI Assistant */}
        <button
          onClick={handleVoiceInput}
          className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-indigo-200/90 hover:border-indigo-400 hover:shadow-md transition-all text-left cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-200'
                  : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white group-hover:scale-105 shadow-xs'
              }`}
            >
              <Mic className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">
              {isHi ? '1. माइक टैप' : '1. Voice AI'}
            </span>
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-950">
              {isHi ? 'बोलकर सवाल पूछें' : 'Ask by Speaking'}
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {isHi ? 'हिंदी या अंग्रेजी में बोलकर कदम-दर-कदम सीखें' : 'Speak in Hindi, Marathi or English for voice guidance'}
            </p>
          </div>
        </button>

        {/* Tile 2: Screenshot & Camera Helper */}
        <button
          onClick={() => onSelectTab?.('screenshot')}
          className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-blue-200/90 hover:border-blue-400 hover:shadow-md transition-all text-left cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-all shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
              {isHi ? '2. फोटो जांच' : '2. Camera AI'}
            </span>
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 group-hover:text-blue-950">
              {isHi ? 'स्क्रीनशॉट व कैमरा' : 'Screenshot & Camera'}
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {isHi ? 'अनजान ऐप, फॉर्म या एरर की फोटो से जांच करें' : 'Upload screenshots or snap camera photos'}
            </p>
          </div>
        </button>

        {/* Tile 3: Scam Message Analyzer */}
        <button
          onClick={() => onSelectTab?.('scam')}
          className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/90 hover:border-amber-400 hover:shadow-md transition-all text-left cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center group-hover:scale-105 transition-all shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              {isHi ? '3. साइबर कवच' : '3. Scam Shield'}
            </span>
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 group-hover:text-amber-950">
              {isHi ? 'धोखाधड़ी SMS जांच' : 'Scam SMS Analyzer'}
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {isHi ? 'संदिग्ध SMS में छुपे खतरे और चेतावनी संकेत समझें' : 'Identify fraud traps & warning signs in SMS'}
            </p>
          </div>
        </button>

        {/* Tile 4: Safe UPI Payment Simulator */}
        <button
          onClick={() => onSelectTab?.('simulator')}
          className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/90 hover:border-purple-400 hover:shadow-md transition-all text-left cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center group-hover:scale-105 transition-all shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">
              {isHi ? '4. ₹0 जोखिम' : '4. Safe UPI'}
            </span>
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 group-hover:text-purple-950">
              {isHi ? 'सुरक्षित पेमेंट अभ्यास' : 'UPI Payment Simulator'}
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {isHi ? 'असली पैसे खर्च किए बिना QR व पिन का अभ्यास करें' : 'Practice digital transactions without real money'}
            </p>
          </div>
        </button>

        {/* Tile 5: Personalized Learning & Progress Tracking */}
        <button
          onClick={() => onSelectTab?.('learn')}
          className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-100 border border-indigo-200/90 hover:border-indigo-400 hover:shadow-md transition-all text-left cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center group-hover:scale-105 transition-all shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">
              {isHi ? '5. प्रगति ट्रैकर' : '5. Progress AI'}
            </span>
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-950">
              {isHi ? 'सीखें व सुधार मापें' : 'Personalized Learning'}
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {isHi ? 'कमजोर क्षेत्रों की पहचान और सुझाए गए पाठ देखें' : 'Track struggles, recommended lessons & growth'}
            </p>
          </div>
        </button>
      </div>

      {/* Suggested Quick Questions */}
      <div className="bg-white border border-indigo-100/90 rounded-2xl p-4 shadow-2xs">
        <div className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>{isHi ? 'अक्सर पूछे जाने वाले सवाल (टैप करें):' : 'Common Questions (Tap to Ask):'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.slice(0, 4).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(isHi ? q.hi : q.en)}
              className="text-left text-xs sm:text-sm bg-slate-50 hover:bg-indigo-50 text-slate-800 hover:text-indigo-950 border border-slate-200 hover:border-indigo-300 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs font-medium"
            >
              {isHi ? q.hi : q.en}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Hands-Free Voice Listening Soundwave Banner */}
      {isRecording && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 via-indigo-50/70 to-purple-50/70 border-2 border-indigo-600 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Glowing Pulsing Mic Icon */}
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <div className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-45" />
              <Mic className="w-6 h-6 relative z-10 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-indigo-950">
                  {isHi ? 'सुन रहा हूँ... अपनी भाषा में बोलिए' : 'Listening... Speak your question'}
                </span>
                {/* 4 Animated Wave Bars */}
                <div className="flex items-end gap-1 h-4 shrink-0 py-0.5" aria-hidden="true">
                  <span className="w-1 bg-blue-600 rounded-full animate-wave-1" />
                  <span className="w-1 bg-indigo-500 rounded-full animate-wave-2" />
                  <span className="w-1 bg-purple-500 rounded-full animate-wave-3" />
                  <span className="w-1 bg-cyan-500 rounded-full animate-wave-4" />
                </div>
              </div>

              {/* Real-time Streaming Transcript */}
              <p className="text-sm font-semibold text-slate-800 mt-1 truncate bg-white/80 px-2.5 py-1 rounded-lg border border-indigo-200">
                {liveTranscript || (isHi ? 'जैसे: "UPI पिन कैसे बदलें" या "वाईफाई कैसे जोड़ें"' : 'e.g. "How to connect Wi-Fi" or "What is UPI PIN"')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            {liveTranscript && (
              <button
                onClick={() => {
                  speechRecognizerRef.current?.stop();
                  setIsRecording(false);
                  handleSendMessage(liveTranscript, true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isHi ? 'भेजें' : 'Send'}</span>
              </button>
            )}
            <button
              onClick={() => {
                speechRecognizerRef.current?.stop();
                setIsRecording(false);
                setLiveTranscript('');
              }}
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              {isHi ? 'रद्द करें' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Messages Feed */}
      <div className="space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const completedForMsg = completedSteps[msg.id] || [];
          const isThisMsgSpeaking = isSpeaking && activeSpeakingMsgId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-2xl rounded-2xl p-4 sm:p-5 border transition-all ${
                  isUser
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-indigo-400/30 rounded-tr-none shadow-md'
                    : isThisMsgSpeaking
                    ? 'bg-indigo-50/40 text-slate-900 border-indigo-400 rounded-tl-none shadow-md ring-2 ring-indigo-400/40'
                    : 'bg-white text-slate-900 border-indigo-100/90 rounded-tl-none shadow-xs hover:border-indigo-200'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${isUser ? 'text-blue-100' : 'text-indigo-900'}`}>
                      {isUser
                        ? isMr
                          ? 'तुम्ही'
                          : isHi
                          ? 'आप'
                          : 'You'
                        : isDevanagari
                        ? 'NIRBHAR AI (निर्भर AI)'
                        : 'NIRBHAR AI'}
                    </span>

                    {/* Speaking Soundwave Indicator for active message */}
                    {isThisMsgSpeaking && (
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-[11px] font-bold animate-pulse">
                        <div className="flex items-end gap-0.5 h-3 shrink-0 py-0.5" aria-hidden="true">
                          <span className="w-1 bg-blue-600 rounded-full animate-wave-1" />
                          <span className="w-1 bg-indigo-600 rounded-full animate-wave-2" />
                          <span className="w-1 bg-purple-600 rounded-full animate-wave-3" />
                          <span className="w-1 bg-cyan-600 rounded-full animate-wave-4" />
                        </div>
                        <span>{isHi ? 'बोल रहा है...' : 'Speaking...'}</span>
                      </div>
                    )}
                  </div>

                  {!isUser && (
                    <div className="flex items-center gap-2">
                      {/* Audio Speed Rate Toggle */}
                      <button
                        onClick={() => setSpeechRate((prev) => (prev <= 0.85 ? 1.0 : 0.85))}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer font-medium"
                        title={isHi ? 'आवाज़ की गति बदलें' : 'Toggle voice pace'}
                      >
                        {speechRate <= 0.85 ? (isHi ? '🐢 0.85x धीमी' : '🐢 0.85x Slow') : '1.0x Normal'}
                      </button>

                      {/* Read Aloud Button with Visual Pulse Animation */}
                      <button
                        onClick={() => {
                          if (isThisMsgSpeaking) {
                            stopSpeaking();
                            setActiveSpeakingMsgId(null);
                          } else {
                            setActiveSpeakingMsgId(msg.id);
                            onSpeak(
                              `${msg.text}. ${msg.steps?.join('. ') || ''}. ${
                                msg.safetyTip ? (isHi ? 'सुरक्षा नियम: ' : 'Safety rule: ') + msg.safetyTip : ''
                              }`,
                              speechRate
                            );
                          }
                        }}
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer font-semibold ${
                          isThisMsgSpeaking
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white ring-4 ring-indigo-300 shadow-md animate-speaking-halo'
                            : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200'
                        }`}
                        title={isHi ? 'आवाज़ में सुनें' : 'Read aloud'}
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${isThisMsgSpeaking ? 'animate-bounce' : 'text-indigo-700'}`} />
                        <span>
                          {isThisMsgSpeaking
                            ? isHi ? 'रोकें' : 'Stop'
                            : isHi ? 'सुनें' : 'Listen'}
                        </span>
                      </button>

                      {/* Copy Guide Button */}
                      <button
                        onClick={() => copyGuide(msg)}
                        className="flex items-center gap-1 text-xs text-slate-600 hover:text-indigo-800 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                        title={isHi ? 'निर्देश कॉपी करें' : 'Copy guide'}
                      >
                        {copiedMsgId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="hidden sm:inline text-emerald-700">{isHi ? 'कॉपी हुआ' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{isHi ? 'कॉपी' : 'Copy'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Body Text */}
                <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* Step-by-Step Micro Checklist */}
                {msg.steps && msg.steps.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-indigo-100 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                        {isHi ? 'कदम-दर-कदम निर्देश:' : 'Step-by-Step Instructions:'}
                      </div>

                      {/* Interactive completion counter badge */}
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900">
                        {completedForMsg.length} / {msg.steps.length} {isHi ? 'पूर्ण' : 'done'}
                      </span>
                    </div>

                    {/* Interactive Animated Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-1.5 transition-all duration-300 rounded-full"
                        style={{
                          width: `${Math.round((completedForMsg.length / msg.steps.length) * 100)}%`,
                        }}
                      />
                    </div>

                    {/* Celebration indicator when all steps completed */}
                    {completedForMsg.length === msg.steps.length && msg.steps.length > 0 && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          {isHi
                            ? '🎉 शाबाश! आपने सभी कदम सफलतापूर्वक समझ लिए हैं।'
                            : '🎉 Outstanding! You have completed all steps successfully.'}
                        </span>
                      </div>
                    )}

                    {msg.steps.map((step, idx) => {
                      const isDone = completedForMsg.includes(idx);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleStepCompletion(msg.id, idx, msg.steps!.length)}
                          className={`flex items-start gap-3 p-3 rounded-xl border text-sm transition-all cursor-pointer select-none ${
                            isDone
                              ? 'bg-indigo-50/50 border-indigo-200 text-slate-500 line-through'
                              : 'bg-slate-50/70 border-slate-200 hover:border-indigo-300 text-slate-900 shadow-2xs'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${
                              isDone
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {isDone ? '✓' : idx + 1}
                          </div>
                          <div className="flex-1">
                            <span>{step}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 shrink-0 self-center font-medium">
                            {isDone ? (isHi ? 'हो गया' : 'Done') : (isHi ? 'टैप करें' : 'Tap')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Safety Precaution Alert */}
                {msg.safetyTip && (
                  <div className="mt-4 p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-xl flex items-start gap-2.5 text-amber-950 text-xs sm:text-sm shadow-2xs">
                    <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold block mb-0.5 text-amber-900">
                        {isHi ? 'महत्वपूर्ण सुरक्षा नियम:' : 'Crucial Safety Rule:'}
                      </strong>
                      <span className="font-medium">{msg.safetyTip}</span>
                    </div>
                  </div>
                )}

                {/* Suggested Follow-ups */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((action, aidx) => (
                      <button
                        key={aidx}
                        onClick={() => handleSendMessage(action)}
                        className="text-xs bg-slate-50 hover:bg-indigo-50 text-indigo-950 border border-slate-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium"
                      >
                        → {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 p-4 bg-white border border-indigo-100 rounded-2xl w-fit shadow-2xs">
            <RefreshCw className="w-4 h-4 text-indigo-700 animate-spin" />
            <span className="text-sm font-medium text-slate-700">
              {isMr
                ? 'NIRBHAR AI सोपी पायरी तयार करत आहे...'
                : isHi
                ? 'NIRBHAR AI आसान कदम तैयार कर रहा है...'
                : 'NIRBHAR AI is thinking...'}
            </span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box with Voice & Send */}
      <div className="sticky bottom-2 bg-white/95 backdrop-blur-md border border-indigo-200 rounded-2xl p-2.5 shadow-md">
        {voiceNotice && (
          <div className="mb-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-medium">{voiceNotice}</span>
            </div>
            <button
              onClick={() => setVoiceNotice(null)}
              className="text-slate-400 hover:text-slate-600 px-1 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Microphone Button */}
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-3 rounded-xl transition-all touch-target-senior cursor-pointer flex items-center justify-center shrink-0 ${
              isRecording
                ? 'bg-red-600 text-white animate-pulse shadow-md ring-4 ring-red-200'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
            }`}
            title={
              isRecording
                ? isHi
                  ? 'सुन रहा है... रोकने के लिए दबाएं'
                  : 'Listening... Tap to stop'
                : isHi
                ? 'बोलकर पूछें (माइक)'
                : 'Ask by speaking'
            }
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-indigo-700" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isRecording
                ? isHi
                  ? 'सुन रहा हूँ... बोलिए...'
                  : 'Listening... Please speak...'
                : isHi
                ? 'यहाँ लिखें या माइक दबाकर बोलें...'
                : 'Type your question or tap mic to speak...'
            }
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 text-white rounded-xl transition-all touch-target-senior cursor-pointer flex items-center justify-center shrink-0 shadow-xs"
            title={isHi ? 'भेजें' : 'Send'}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

function getLocalAssistantFallback(question: string, isHi: boolean): AssistantResponse {
  const lower = question.toLowerCase();

  if (lower.includes('wifi') || lower.includes('वाईफाई') || lower.includes('internet') || lower.includes('इंटरनेट')) {
    return {
      replyText: isHi
        ? 'वाई-फाई से सुरक्षित जुड़ने के आसान कदम नीचे दिए गए हैं। हमेशा अपने घर या सुरक्षित पासवर्ड वाले नेटवर्क से ही जुड़ें।'
        : 'Here are the safe, simple steps to connect to Wi-Fi. Always connect to your known home network.',
      steps: [
        isHi ? 'स्क्रीन ऊपर से नीचे स्वाइप करें और वाई-फाई आइकन को 2 सेकंड तक दबाकर रखें।' : 'Swipe down from the top of your screen and hold the Wi-Fi icon.',
        isHi ? 'सूची में से अपने घर के वाई-फाई के नाम पर टैप करें।' : 'Tap your home Wi-Fi network name from the list.',
        isHi ? 'राउटर पर लिखा पासवर्ड सही से दर्ज करें और "Connect" दबाएं।' : 'Carefully type the Wi-Fi password and tap Connect.',
      ],
      safetyTip: isHi
        ? 'होटल या रेलवे स्टेशन के बिना पासवर्ड वाले फ्री वाई-फाई पर कभी बैंक या UPI ऐप न चलाएं।'
        : 'Never use banking or UPI payment apps on unverified free public Wi-Fi.',
      suggestedActions: [
        isHi ? 'फोन में अक्षर बड़े कैसे करें?' : 'How to increase font size on phone?',
        isHi ? 'यूपीआई पिन और ओटीपी का अंतर क्या है?' : 'What is the difference between UPI PIN and OTP?',
      ],
    };
  }

  if (lower.includes('pin') || lower.includes('पिन') || lower.includes('otp') || lower.includes('ओटीपी')) {
    return {
      replyText: isHi
        ? 'यूपीआई पिन (UPI PIN) और बैंक ओटीपी (OTP) का यह सुनहरा सुरक्षा नियम हमेशा याद रखें।'
        : 'Always remember this golden security rule about your secret UPI PIN and bank OTP.',
      steps: [
        isHi ? 'UPI PIN केवल तब डाला जाता है जब आपके खाते से पैसे कट रहे हों।' : 'Rule 1: UPI PIN is ONLY entered when money is leaving your account.',
        isHi ? 'पैसे पाने (Receive) के लिए कभी भी पिन नहीं डालना होता।' : 'Rule 2: You NEVER enter a PIN or scan a QR to receive money.',
        isHi ? 'बैंक से आए 6-अंकों के OTP को फोन पर किसी को न बताएं।' : 'Rule 3: Never share your 6-digit SMS OTP over a phone call.',
      ],
      safetyTip: isHi
        ? 'यदि कोई कहे कि "पैसे पाने के लिए पिन डालो", तो यह 100% धोखा है। तुरंत कॉल काट दें।'
        : 'If someone asks you to enter a PIN to receive money, hang up immediately—it is a fraud trap.',
      suggestedActions: [
        isHi ? 'बिजली कटने का मैसेज कैसे पहचानें?' : 'How to spot electricity bill scams?',
        isHi ? 'पेमेंट सिमुलेटर में अभ्यास करें' : 'Practice in safe payment simulator',
      ],
    };
  }

  return {
    replyText: isHi
      ? 'NIRBHAR AI आपकी पूरी सहायता करेगा। किसी भी तकनीकी कार्य को चरणबद्ध तरीके से करने से वह बहुत आसान हो जाता है।'
      : 'NIRBHAR AI is here to assist you step-by-step. Technology is safe and easy when taken one step at a time.',
    steps: [
      isHi ? 'ऐप्स हमेशा केवल गूगल प्ले स्टोर (Play Store) से ही इंस्टॉल करें।' : 'Only install apps from the official Google Play Store.',
      isHi ? 'संदिग्ध एसएमएस या व्हाट्सएप संदेशों में आए लिंक पर कभी क्लिक न करें।' : 'Never tap unknown links sent via SMS or messaging apps.',
      isHi ? 'किसी भी असमंजस में स्क्रीनशॉट जांच या धोखाधड़ी जांच टूल का उपयोग करें।' : 'Use the Screenshot Inspector or Scam Detector whenever you are unsure.',
    ],
    safetyTip: isHi
      ? 'अपना बैंक पासवर्ड या ओटीपी किसी भी अनजान कॉलर से कभी साझा न करें।'
      : 'Never share your bank credentials, ATM PIN, or OTP with anyone.',
    suggestedActions: [
      isHi ? 'यूपीआई पिन और ओटीपी का अंतर क्या है?' : 'What is difference between PIN and OTP?',
      isHi ? 'फोन में अक्षर बड़े कैसे करें?' : 'How to make text size bigger?',
    ],
  };
}


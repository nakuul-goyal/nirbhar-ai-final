import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Send,
  Globe,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Compass,
} from 'lucide-react';
import { Language, AssistantResponse } from '../types';
import {
  RISHI_LANGUAGES,
  RishiLanguageCode,
  checkLanguageVoiceSupport,
  createSpeechRecognizer,
  speakText,
  stopSpeaking,
} from '../utils/speech';

interface RishiVoiceAssistantProps {
  language: Language;
  onChangeLanguage?: (lang: Language) => void;
  onSelectTab: (tab: string) => void;
  currentTab: string;
}

interface RishiTurn {
  id: string;
  question: string;
  replyText: string;
  steps?: string[];
  safetyTip?: string;
  suggestedActions?: string[];
  lang: RishiLanguageCode;
}

const RISHI_GREETINGS: Record<
  RishiLanguageCode,
  {
    greeting: string;
    subtitle: string;
    tapToSpeak: string;
    listening: string;
    speaking: string;
    placeholder: string;
    quickPrompts: { label: string; query: string }[];
  }
> = {
  hi: {
    greeting: 'नमस्ते! मैं ऋषि (Rishi) हूँ — आपका NIRBHAR आवाज़ सहायक।',
    subtitle: 'माइक दबाएं, अपना सवाल पूछें (हिंदी या Hinglish में) और आसान जवाब सुनें।',
    tapToSpeak: 'बोलने के लिए माइक दबाएं',
    listening: 'ऋषि सुन रहा है... बोलिए',
    speaking: 'ऋषि बोल रहा है...',
    placeholder: 'सवाल लिखें या Hinglish में पूछें...',
    quickPrompts: [
      { label: 'NIRBHAR ऐप कैसे चलाएं?', query: 'NIRBHAR ऐप का उपयोग कदम-दर-कदम कैसे करें?' },
      { label: 'UPI PIN और OTP में अंतर?', query: 'यूपीआई पिन और ओटीपी में क्या अंतर है?' },
      { label: 'फर्जी SMS कैसे पहचानें?', query: 'धोखाधड़ी या फर्जी मैसेज कैसे पहचानें?' },
    ],
  },
  en: {
    greeting: 'Hello! I am Rishi — your NIRBHAR multilingual voice assistant.',
    subtitle: 'Tap the microphone, ask any question or Hinglish query, and hear a simple answer.',
    tapToSpeak: 'Tap Mic to Ask Rishi',
    listening: 'Rishi is listening... Speak now',
    speaking: 'Rishi is speaking...',
    placeholder: 'Type your question in English or Hinglish...',
    quickPrompts: [
      { label: 'How to use NIRBHAR app?', query: 'Explain how to use the NIRBHAR app step by step.' },
      { label: 'UPI PIN vs OTP rule?', query: 'What is the difference between UPI PIN and OTP?' },
      { label: 'How to check scam SMS?', query: 'How do I check a suspicious SMS in NIRBHAR?' },
    ],
  },
  mr: {
    greeting: 'नमस्कार! मी ऋषी (Rishi) आहे — तुमचा NIRBHAR आवाज सहाय्यक.',
    subtitle: 'माइक दाबा, तुमचा प्रश्न विचारा आणि सोप्या भाषेत उत्तर ऐका.',
    tapToSpeak: 'बोलण्यासाठी माइक दाबा',
    listening: 'ऋषी ऐकत आहे... बोला',
    speaking: 'ऋषी बोलत आहे...',
    placeholder: 'येथे तुमचा प्रश्न लिहा...',
    quickPrompts: [
      { label: 'NIRBHAR ॲप कसे वापरावे?', query: 'NIRBHAR ॲप कसे वापरावे ते पायरी-पायरीने सांगा.' },
      { label: 'UPI पिन आणि OTP फरक?', query: 'UPI पिन आणि OTP मध्ये काय फरक आहे?' },
      { label: 'फसवणूक मेसेज कसा तपासावा?', query: 'फसवणुकीचा SMS कसा ओळखावा?' },
    ],
  },
  gu: {
    greeting: 'નમસ્તે! હું ઋષિ (Rishi) છું — તમારો NIRBHAR વૉઇસ સહાયક.',
    subtitle: 'માઇક દબાવો, પ્રશ્ન પૂછો અને સરળ ભાષામાં જવાબ સાંભળો.',
    tapToSpeak: 'બોલવા માટે માઇક દબાવો',
    listening: 'ઋષિ સાંભળી રહ્યો છે... બોલો',
    speaking: 'ઋષિ બોલી રહ્યો છે...',
    placeholder: 'તમારો પ્રશ્ન અહીં લખો...',
    quickPrompts: [
      { label: 'NIRBHAR એપ કેવી રીતે વાપરવી?', query: 'NIRBHAR એપનો ઉપયોગ કેવી રીતે કરવો?' },
      { label: 'UPI પિન અને OTP નિયમ?', query: 'UPI PIN અને OTP વચ્ચે શું તફાવત છે?' },
    ],
  },
  bn: {
    greeting: 'নমস্কার! আমি ঋষি (Rishi) — আপনার NIRBHAR ভয়েস সহকারী।',
    subtitle: 'মাইক চাপুন, প্রশ্ন করুন এবং সহজ ভাষায় উত্তর শুনুন।',
    tapToSpeak: 'কথা বলতে মাইক চাপুন',
    listening: 'ঋষি শুনছে... বলুন',
    speaking: 'ঋষি বলছে...',
    placeholder: 'আপনার প্রশ্ন এখানে লিখুন...',
    quickPrompts: [
      { label: 'NIRBHAR অ্যাপ কীভাবে ব্যবহার করব?', query: 'NIRBHAR অ্যাপ কীভাবে ব্যবহার করব ধাপে ধাপে বলুন।' },
      { label: 'UPI পিন ও OTP নিয়ম?', query: 'UPI পিন এবং OTP এর মধ্যে পার্থক্য কী?' },
    ],
  },
  ta: {
    greeting: 'வணக்கம்! நான் ரிஷி (Rishi) — உங்கள் NIRBHAR குரல் உதவியாளர்.',
    subtitle: 'மைக்கை அழுத்தி உங்கள் கேள்வியைக் கேளுங்கள், எளிய பதிலைக் கேளுங்கள்.',
    tapToSpeak: 'பேச மைக்கைத் தொடவும்',
    listening: 'ரிஷி கேட்கிறார்... பேசுங்கள்',
    speaking: 'ரிஷி பேசுகிறார்...',
    placeholder: 'உங்கள் கேள்வியை இங்கே தட்டச்சு செய்யவும்...',
    quickPrompts: [
      { label: 'NIRBHAR செயலியை பயன்படுத்துவது எப்படி?', query: 'NIRBHAR செயலியை படிப்படியாக பயன்படுத்துவது எப்படி?' },
      { label: 'UPI PIN மற்றும் OTP விதி?', query: 'UPI PIN மற்றும் OTP இடையே உள்ள வேறுபாடு என்ன?' },
    ],
  },
  te: {
    greeting: 'నమస్కారం! నేను రిషి (Rishi) — మీ NIRBHAR వాయిస్ అసిస్టెంట్.',
    subtitle: 'మైక్ నొక్కండి, మీ ప్రశ్న అడగండి మరియు సులభమైన సమాధానం వినండి.',
    tapToSpeak: 'మాట్లాడటానికి మైక్ నొక్కండి',
    listening: 'రిషి వింటున్నారు... మాట్లాడండి',
    speaking: 'రిషి మాట్లాడుతున్నారు...',
    placeholder: 'మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి...',
    quickPrompts: [
      { label: 'NIRBHAR యాప్ ఎలా వాడాలి?', query: 'NIRBHAR యాప్ ఎలా ఉపయోగించాలో దశలవారీగా చెప్పండి.' },
      { label: 'UPI పిన్ మరియు OTP తేడా?', query: 'UPI PIN మరియు OTP మధ్య తేడా ఏమిటి?' },
    ],
  },
  kn: {
    greeting: 'ನಮಸ್ಕಾರ! ನಾನು ರಿಷಿ (Rishi) — ನಿಮ್ಮ NIRBHAR ಧ್ವನಿ ಸಹಾಯಕ.',
    subtitle: 'ಮೈಕ್ ಒತ್ತಿ, ಪ್ರಶ್ನೆ ಕೇಳಿ ಮತ್ತು ಸರಳ ಉತ್ತರವನ್ನು ಕೇಳಿ.',
    tapToSpeak: 'ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿ',
    listening: 'ರಿಷಿ ಕೇಳುತ್ತಿದ್ದಾರೆ... ಮಾತನಾಡಿ',
    speaking: 'ರಿಷಿ ಮಾತನಾಡುತ್ತಿದ್ದಾರೆ...',
    placeholder: 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...',
    quickPrompts: [
      { label: 'NIRBHAR ಆಪ್ ಬಳಸುವುದು ಹೇಗೆ?', query: 'NIRBHAR ಆಪ್ ಅನ್ನು ಹಂತ ಹಂತವಾಗಿ ಬಳಸುವುದು ಹೇಗೆ?' },
      { label: 'UPI ಪಿನ್ ಮತ್ತು OTP ವ್ಯತ್ಯಾಸ?', query: 'UPI PIN ಮತ್ತು OTP ನಡುವಿನ ವ್ಯತ್ಯಾಸವೇನು?' },
    ],
  },
  ml: {
    greeting: 'നമസ്കാരം! ഞാൻ ഋഷി (Rishi) — നിങ്ങളുടെ NIRBHAR വോയ്‌സ് അസിസ്റ്റന്റ്.',
    subtitle: 'മൈക്ക് അമർത്തി ചോദ്യം ചോദിക്കൂ, ലളിതമായ മറുപടി കേൾക്കൂ.',
    tapToSpeak: 'സംസാരിക്കാൻ മൈക്ക് അമർത്തുക',
    listening: 'ഋഷി കേൾക്കുന്നു... സംസാരിക്കൂ',
    speaking: 'ഋഷി സംസാരിക്കുന്നു...',
    placeholder: 'നിങ്ങളുടെ ചോദ്യം ഇവിടെ ടൈപ്പ് ചെയ്യുക...',
    quickPrompts: [
      { label: 'NIRBHAR ആപ്പ് എങ്ങനെ ഉപയോഗിക്കാം?', query: 'NIRBHAR ആപ്പ് എങ്ങനെ ഉപയോഗിക്കാമെന്ന് ഘട്ടം ഘട്ടമായി പറയൂ.' },
      { label: 'UPI പിൻ, OTP വ്യത്യാസം?', query: 'UPI PIN-ഉം OTP-യും തമ്മിലുള്ള വ്യത്യാസം എന്താണ്?' },
    ],
  },
  pa: {
    greeting: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਰਿਸ਼ੀ (Rishi) ਹਾਂ — ਤੁਹਾਡਾ NIRBHAR ਵੌਇਸ ਸਹਾਇਕ।',
    subtitle: 'ਮਾਈਕ ਦਬਾਓ, ਸਵਾਲ ਪੁੱਛੋ ਅਤੇ ਸੌਖੀ ਭਾਸ਼ਾ ਵਿੱਚ ਜਵਾਬ ਸੁਣੋ।',
    tapToSpeak: 'ਬੋਲਣ ਲਈ ਮਾਈਕ ਦਬਾਓ',
    listening: 'ਰਿਸ਼ੀ ਸੁਣ ਰਿਹਾ ਹੈ... ਬੋਲੋ',
    speaking: 'ਰਿਸ਼ੀ ਬੋਲ ਰਿਹਾ ਹੈ...',
    placeholder: 'ਆਪਣਾ ਸਵਾਲ ਇੱਥੇ ਲਿਖੋ...',
    quickPrompts: [
      { label: 'NIRBHAR ਐਪ ਕਿਵੇਂ ਚਲਾਈਏ?', query: 'NIRBHAR ਐਪ ਦੀ ਵਰਤੋਂ ਕਿਵੇਂ ਕਰੀਏ?' },
      { label: 'UPI ਪਿੰਨ ਅਤੇ OTP ਫ਼ਰਕ?', query: 'UPI PIN ਅਤੇ OTP ਵਿੱਚ ਕੀ ਅੰਤਰ ਹੈ?' },
    ],
  },
  or: {
    greeting: 'ନମସ୍କାର! ମୁଁ ଋଷି (Rishi) — ଆପଣଙ୍କର NIRBHAR ଭଏସ୍ ସହାୟକ।',
    subtitle: 'ମାଇକ୍ ଦବାନ୍ତୁ, ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ ଏବଂ ସରଳ ଉତ୍ତର ଶୁଣନ୍ତୁ।',
    tapToSpeak: 'କହିବା ପାଇଁ ମାଇକ୍ ଦବାନ୍ତୁ',
    listening: 'ଋଷି ଶୁଣୁଛନ୍ତି... କୁହନ୍ତୁ',
    speaking: 'ଋଷି କହୁଛନ୍ତି...',
    placeholder: 'ଆପଣଙ୍କ ପ୍ରଶ୍ନ ଏଠାରେ ଲେଖନ୍ତୁ...',
    quickPrompts: [
      { label: 'NIRBHAR ଆପ୍ କିପରି ବ୍ୟବହାର କରିବେ?', query: 'NIRBHAR ଆପ୍ କିପରି ବ୍ୟବହାର କରିବେ କୁହନ୍ତୁ।' },
      { label: 'UPI ପିନ୍ ଓ OTP ପାର୍ଥକ୍ୟ?', query: 'UPI PIN ଏବଂ OTP ମଧ୍ୟରେ ପାର୍ଥକ୍ୟ କଣ?' },
    ],
  },
  as: {
    greeting: 'নমস্কাৰ! মই ঋষি (Rishi) — আপোনাৰ NIRBHAR ভয়েচ সহায়ক।',
    subtitle: 'মাইক টিপক, প্ৰশ্ন সোধক আৰু সহজ উত্তৰ শুনক।',
    tapToSpeak: 'ক’বলৈ মাইক টিপক',
    listening: 'ঋষিয়ে শুনি আছে... কওক',
    speaking: 'ঋষিয়ে কৈ আছে...',
    placeholder: 'আপোনাৰ প্ৰশ্ন ইয়াত লিখক...',
    quickPrompts: [
      { label: 'NIRBHAR এপ কেনেকৈ ব্যৱহাৰ কৰিব?', query: 'NIRBHAR এপ কেনেকৈ ব্যৱহাৰ কৰিব জনাব।' },
      { label: 'UPI পিন আৰু OTP পাৰ্থক্য?', query: 'UPI PIN আৰু OTP ৰ মাজত পাৰ্থক্য কি?' },
    ],
  },
};

export const RishiVoiceAssistant: React.FC<RishiVoiceAssistantProps> = ({
  language,
  onChangeLanguage,
  onSelectTab,
  currentTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rishiLang, setRishiLang] = useState<RishiLanguageCode>(language as RishiLanguageCode);
  const [isListening, setIsListening] = useState(false);
  const [isRishiSpeaking, setIsRishiSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voiceCapability, setVoiceCapability] = useState<{
    speechRecognitionSupported: boolean;
    speechSynthesisSupported: boolean;
    hasNativeBrowserVoice: boolean;
  }>({
    speechRecognitionSupported: true,
    speechSynthesisSupported: true,
    hasNativeBrowserVoice: true,
  });

  const [lastTurn, setLastTurn] = useState<RishiTurn | null>(null);
  const recognizerRef = useRef<any>(null);

  // Sync when global app language changes (en, hi, mr)
  useEffect(() => {
    setRishiLang(language as RishiLanguageCode);
  }, [language]);

  // Re-evaluate browser voice capabilities whenever language changes or voices load
  useEffect(() => {
    const updateSupport = () => {
      setVoiceCapability(checkLanguageVoiceSupport(rishiLang));
    };
    updateSupport();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateSupport;
    }
  }, [rishiLang]);

  const handleLanguageChange = (newLang: RishiLanguageCode) => {
    stopRishiAudio();
    setRishiLang(newLang);
    setErrorMessage(null);
    if (onChangeLanguage && (newLang === 'en' || newLang === 'hi' || newLang === 'mr')) {
      onChangeLanguage(newLang);
    }
  };

  const stopRishiAudio = () => {
    try {
      recognizerRef.current?.stop();
    } catch {}
    setIsListening(false);
    stopSpeaking();
    setIsRishiSpeaking(false);
  };

  const speakRishiReply = (textToRead: string, langCode: RishiLanguageCode) => {
    stopSpeaking();
    speakText(
      textToRead,
      langCode,
      () => setIsRishiSpeaking(true),
      () => setIsRishiSpeaking(false),
      0.9
    );
  };

  const askRishi = async (queryText: string) => {
    const cleanQuery = queryText.trim();
    if (!cleanQuery || isLoading) return;

    setIsListening(false);
    setLiveTranscript('');
    setTextInput('');
    setErrorMessage(null);
    setIsLoading(true);

    try {
      let data: AssistantResponse | null = null;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: cleanQuery,
          language: rishiLang,
          mode: 'beginner',
          assistantPersona: 'rishi',
        }),
      });

      clearTimeout(timeoutId);
      if (res.ok) {
        data = await res.json();
      }

      if (!data || !data.replyText) {
        data = getLocalRishiFallback(cleanQuery, rishiLang);
      }

      const turn: RishiTurn = {
        id: `rishi-${Date.now()}`,
        question: cleanQuery,
        replyText: data.replyText,
        steps: data.steps,
        safetyTip: data.safetyTip,
        suggestedActions: data.suggestedActions,
        lang: rishiLang,
      };

      setLastTurn(turn);

      const fullSpeech = `${data.replyText} ${(data.steps || []).slice(0, 3).join('. ')}`;
      speakRishiReply(fullSpeech, rishiLang);
    } catch {
      const fallback = getLocalRishiFallback(cleanQuery, rishiLang);
      const turn: RishiTurn = {
        id: `rishi-${Date.now()}`,
        question: cleanQuery,
        replyText: fallback.replyText,
        steps: fallback.steps,
        safetyTip: fallback.safetyTip,
        suggestedActions: fallback.suggestedActions,
        lang: rishiLang,
      };
      setLastTurn(turn);
      speakRishiReply(`${fallback.replyText} ${(fallback.steps || []).join('. ')}`, rishiLang);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMic = () => {
    if (isListening) {
      try {
        recognizerRef.current?.stop();
      } catch {}
      setIsListening(false);
      if (liveTranscript.trim()) {
        askRishi(liveTranscript.trim());
      }
      return;
    }

    stopSpeaking();
    setIsRishiSpeaking(false);
    setErrorMessage(null);
    setLiveTranscript('');

    if (!voiceCapability.speechRecognitionSupported) {
      setErrorMessage(
        'Voice input (Web Speech API) is not supported in this browser. Please use the text box below to chat with Rishi.'
      );
      return;
    }

    const recognizer = createSpeechRecognizer(
      rishiLang,
      (transcript, isFinal) => {
        setLiveTranscript(transcript);
        if (isFinal && transcript.trim()) {
          setIsListening(false);
          setLiveTranscript('');
          askRishi(transcript.trim());
        }
      },
      (errCode) => {
        setIsListening(false);
        setLiveTranscript('');
        if (errCode === 'not-allowed' || errCode === 'service-not-allowed') {
          setErrorMessage(
            rishiLang === 'hi'
              ? 'माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया ब्राउज़र में माइक अनुमति दें या नीचे लिखकर पूछें।'
              : 'Microphone permission was blocked. Please allow microphone access in your browser or type your question below.'
          );
        } else if (errCode === 'language-not-supported') {
          setErrorMessage(
            `Speech recognition for this language is not supported by your device browser. Please type your question below.`
          );
        } else if (errCode !== 'no-speech') {
          setErrorMessage(
            rishiLang === 'hi'
              ? 'आवाज़ स्पष्ट नहीं सुनाई दी। कृपया दोबारा माइक दबाएं या नीचे टाइप करें।'
              : 'Could not hear clearly. Please tap the mic again or use the text chat below.'
          );
        }
      },
      () => {
        setIsListening(false);
      }
    );

    if (!recognizer) {
      setErrorMessage(
        'Voice recognition is unavailable in this browser. Please type your question below.'
      );
      return;
    }

    recognizerRef.current = recognizer;
    try {
      recognizer.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
      setErrorMessage('Could not start microphone. Please use the text input below.');
    }
  };

  const currentStrings = RISHI_GREETINGS[rishiLang] || RISHI_GREETINGS.en;
  const currentLangMeta =
    RISHI_LANGUAGES.find((l) => l.code === rishiLang) || RISHI_LANGUAGES[0];

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Rishi Popup Assistant Card */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Rishi Multilingual AI Voice Assistant"
          className="mb-3 w-[calc(100vw-2.5rem)] sm:w-96 max-h-[82vh] bg-[#fcfaf7] border-2 border-emerald-700/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header with Avatar, Name, and Language Selector */}
          <div className="bg-emerald-900 text-white px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Cute Animated Rishi Orb/Mascot */}
              <div className="relative w-9 h-9 rounded-full bg-emerald-800 border border-emerald-400/50 flex items-center justify-center shrink-0 shadow-inner">
                <div className="flex items-center gap-1">
                  <span
                    className={`w-1.5 h-2 rounded-full bg-emerald-300 transition-transform ${
                      isRishiSpeaking ? 'scale-y-125 animate-pulse' : 'animate-robot-blink'
                    }`}
                  />
                  <span
                    className={`w-1.5 h-2 rounded-full bg-emerald-300 transition-transform ${
                      isRishiSpeaking ? 'scale-y-125 animate-pulse' : 'animate-robot-blink'
                    }`}
                  />
                </div>
                {(isListening || isRishiSpeaking) && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-white">
                    Rishi (ऋषि)
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-700 text-emerald-100">
                    NIRBHAR
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200 truncate">
                  12 Languages · Hinglish · Voice Guide
                </p>
              </div>
            </div>

            {/* Language Dropdown Selector + Close */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="relative flex items-center bg-emerald-950/80 border border-emerald-600/60 rounded-xl px-2 py-1">
                <Globe className="w-3.5 h-3.5 text-emerald-300 mr-1 shrink-0" />
                <select
                  aria-label="Select Rishi Language"
                  value={rishiLang}
                  onChange={(e) => handleLanguageChange(e.target.value as RishiLanguageCode)}
                  className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                >
                  {RISHI_LANGUAGES.map((lang) => (
                    <option
                      key={lang.code}
                      value={lang.code}
                      className="bg-stone-900 text-white"
                    >
                      {lang.nativeName} ({lang.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  stopRishiAudio();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
                title="Close Rishi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Honest Voice Support Notice if Browser Lacks Native Voice for Selected Language */}
          {(!voiceCapability.speechRecognitionSupported || !voiceCapability.hasNativeBrowserVoice) && (
            <div className="px-3.5 py-2 bg-amber-50 border-b border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span>
                {!voiceCapability.speechRecognitionSupported
                  ? `Your browser does not support Web Speech microphone input. Please use text chat below.`
                  : `Your device browser does not have an offline ${currentLangMeta.nameEn} voice installed; Rishi will use cloud voice fallback or display text clearly.`}
              </span>
            </div>
          )}

          {/* Scrollable Body */}
          <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
            {/* Siri-Like Center Tap-to-Speak Orb */}
            <div className="bg-white border border-[#e6dcce] rounded-2xl p-4 text-center space-y-2.5 shadow-2xs">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleToggleMic}
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                    isListening
                      ? 'bg-red-600 text-white scale-105 ring-4 ring-red-200'
                      : isRishiSpeaking
                      ? 'bg-emerald-700 text-white ring-4 ring-emerald-200'
                      : 'bg-emerald-800 hover:bg-emerald-900 text-white hover:scale-105'
                  }`}
                  aria-label={currentStrings.tapToSpeak}
                >
                  {(isListening || isRishiSpeaking) && (
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30" />
                  )}
                  {isListening ? (
                    <MicOff className="w-7 h-7 relative z-10" />
                  ) : (
                    <Mic className="w-7 h-7 relative z-10" />
                  )}
                </button>

                {/* Equalizer Waves when Listening or Speaking */}
                {(isListening || isRishiSpeaking) && (
                  <div className="flex items-end justify-center gap-1 h-4 mt-2" aria-hidden="true">
                    <span className="w-1 bg-emerald-600 rounded-full animate-wave-1" />
                    <span className="w-1 bg-emerald-500 rounded-full animate-wave-2" />
                    <span className="w-1 bg-amber-500 rounded-full animate-wave-3" />
                    <span className="w-1 bg-emerald-600 rounded-full animate-wave-4" />
                  </div>
                )}

                <p className="text-xs font-bold text-stone-900 mt-2">
                  {isListening
                    ? currentStrings.listening
                    : isRishiSpeaking
                    ? currentStrings.speaking
                    : currentStrings.tapToSpeak}
                </p>

                {liveTranscript ? (
                  <p className="text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 mt-1 font-medium">
                    "{liveTranscript}"
                  </p>
                ) : (
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                    {currentStrings.subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Error or Permission Notice */}
            {errorMessage && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-stone-400 hover:text-stone-700 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="p-3 bg-white border border-[#e6dcce] rounded-xl text-xs text-stone-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700 animate-spin shrink-0" />
                <span>Rishi is preparing a simple answer in {currentLangMeta.nativeName}...</span>
              </div>
            )}

            {/* Latest Answer Card */}
            {lastTurn ? (
              <div className="bg-white border border-[#e6dcce] rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2">
                  <span className="text-[11px] font-bold text-emerald-900 truncate">
                    Q: {lastTurn.question}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {isRishiSpeaking ? (
                      <button
                        type="button"
                        onClick={stopRishiAudio}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[11px] font-bold cursor-pointer"
                      >
                        <VolumeX className="w-3 h-3" />
                        <span>Stop</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          speakRishiReply(
                            `${lastTurn.replyText} ${(lastTurn.steps || []).join('. ')}`,
                            lastTurn.lang
                          )
                        }
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-bold cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3 text-emerald-700" />
                        <span>Listen</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-900 font-medium leading-relaxed">
                  {lastTurn.replyText}
                </p>

                {lastTurn.steps && lastTurn.steps.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {lastTurn.steps.map((step, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs text-stone-800 bg-[#faf8f5] p-2 rounded-lg border border-[#ece3d5]"
                      >
                        <span className="w-4 h-4 rounded-full bg-emerald-800 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}

                {lastTurn.safetyTip && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-950 font-medium">
                    🛡️ {lastTurn.safetyTip}
                  </div>
                )}
              </div>
            ) : (
              /* Greeting & Step-by-Step App Navigation Helper */
              <div className="bg-white border border-[#e6dcce] rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-stone-800 leading-relaxed">
                    {currentStrings.greeting}
                  </p>
                  <button
                    type="button"
                    onClick={() => speakRishiReply(currentStrings.greeting, rishiLang)}
                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 cursor-pointer"
                    title="Hear greeting"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Prompt Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {currentStrings.quickPrompts.map((qp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => askRishi(qp.query)}
                      className="text-left text-[11px] font-semibold bg-[#faf8f5] hover:bg-emerald-50 text-stone-800 hover:text-emerald-950 border border-[#e2d8cb] px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      → {qp.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick App Navigation Shortcuts */}
            <div className="pt-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5 flex items-center gap-1">
                <Compass className="w-3 h-3 text-emerald-700" />
                <span>Jump to NIRBHAR Section:</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'assistant', label: '1. Voice Chat' },
                  { id: 'screenshot', label: '2. Screenshot' },
                  { id: 'scam', label: '3. Scam Check' },
                  { id: 'simulator', label: '4. Safe UPI' },
                  { id: 'govt', label: '5. Govt Help' },
                  { id: 'learn', label: '6. Lessons' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSelectTab(tab.id)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border text-center transition-colors cursor-pointer ${
                      currentTab === tab.id
                        ? 'bg-emerald-800 text-white border-emerald-900'
                        : 'bg-white text-stone-700 border-[#e2d8cb] hover:bg-emerald-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Text Chat Fallback Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              askRishi(textInput);
            }}
            className="p-2.5 bg-white border-t border-[#e6dcce] flex items-center gap-2"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={currentStrings.placeholder}
              className="flex-1 text-xs bg-[#faf8f5] border border-[#dfd5c6] rounded-xl px-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-700"
            />
            <button
              type="submit"
              disabled={!textInput.trim() || isLoading}
              className="p-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer shrink-0"
              title="Send to Rishi"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Bottom-Right Rishi Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open Rishi Multilingual AI Voice Assistant"
        className="group relative flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-full bg-emerald-900 hover:bg-emerald-950 text-white shadow-xl border-2 border-emerald-400/50 transition-all cursor-pointer animate-robot-float"
      >
        {/* Cute Mascot Face with Blinking Eyes */}
        <div className="relative w-9 h-9 rounded-full bg-emerald-800 border border-emerald-300/60 flex flex-col items-center justify-center shrink-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-2 rounded-full bg-emerald-300 ${
                isRishiSpeaking || isListening ? 'animate-ping' : 'animate-robot-blink'
              }`}
            />
            <span
              className={`w-1.5 h-2 rounded-full bg-emerald-300 ${
                isRishiSpeaking || isListening ? 'animate-ping' : 'animate-robot-blink'
              }`}
            />
          </div>
          <span className="w-2.5 h-1 rounded-full bg-emerald-300/90 mt-1" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border border-emerald-950" />
        </div>

        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-extrabold tracking-tight text-white">
              Rishi (ऋषि)
            </span>
            <Mic className="w-3.5 h-3.5 text-emerald-300" />
          </div>
          <span className="block text-[10px] font-medium text-emerald-200 leading-none mt-0.5">
            {isOpen ? 'Close Voice Guide' : 'Ask in 12 Languages'}
          </span>
        </div>
      </button>
    </div>
  );
};

function getLocalRishiFallback(query: string, lang: RishiLanguageCode): AssistantResponse {
  const lower = query.toLowerCase();
  const isHi = lang === 'hi';

  if (lower.includes('nirbhar') || lower.includes('app') || lower.includes('ऐप') || lower.includes('कैसे')) {
    return {
      replyText: isHi
        ? 'नमस्ते! मैं ऋषि हूँ। NIRBHAR ऐप का उपयोग करना बहुत सरल है:'
        : 'Hello! I am Rishi. Using the NIRBHAR app is very simple:',
      steps: [
        isHi
          ? '1. AI सहायक (Assistant) में माइक दबाकर कोई भी सवाल पूछें।'
          : '1. Tap the mic in AI Assistant to ask any smartphone or banking question.',
        isHi
          ? '2. स्क्रीनशॉट जांच (Screenshot Help) में किसी भी अनजान स्क्रीन की फोटो अपलोड करें।'
          : '2. Upload any confusing phone screen in Screenshot Help for a safety check.',
        isHi
          ? '3. धोखाधड़ी जांच (Scam Detector) में संदिग्ध SMS की जांच करें और भुगतान अभ्यास (Payment Sandbox) में बिना असली पैसे के UPI सीखें।'
          : '3. Check suspicious SMS in Scam Detector and practice ₹0 safe UPI in Payment Sandbox.',
      ],
      safetyTip: isHi
        ? 'अपना 6-अंकों का बैंक OTP या UPI PIN कभी किसी के साथ साझा न करें।'
        : 'Never share your 6-digit Bank OTP or UPI PIN with anyone.',
    };
  }

  return {
    replyText: isHi
      ? 'नमस्ते! मैं ऋषि (Rishi) हूँ। कृपया हर कदम धीरे और सुरक्षित रूप से पूरा करें।'
      : 'Hello! I am Rishi, your NIRBHAR voice companion. Follow these safe steps:',
    steps: [
      isHi
        ? 'पैसे प्राप्त करने (Receive) के लिए कभी भी UPI पिन दर्ज न करें।'
        : 'Never enter your UPI PIN to receive money.',
      isHi
        ? 'किसी भी अनजान लिंक या व्हाट्सएप APK फाइल पर क्लिक न करें।'
        : 'Do not click unknown SMS links or download WhatsApp APK files.',
      isHi
        ? 'साइबर धोखाधड़ी होने पर तुरंत 1930 पर कॉल करें।'
        : 'Call the National Cyber Helpline 1930 immediately in case of fraud.',
    ],
    safetyTip: isHi
      ? 'बैंक अधिकारी कभी भी फोन पर आपसे OTP या पिन नहीं मांगते।'
      : 'Bank officials will never call you to ask for your OTP or UPI PIN.',
  };
}

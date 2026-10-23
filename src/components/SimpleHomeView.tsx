import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  ShieldAlert,
  QrCode,
  Camera,
  PhoneCall,
  Volume2,
  Sparkles,
  HelpCircle,
  FileText,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Send,
} from 'lucide-react';
import { Language } from '../types';
import { DailyDigitalLiteracyTip } from './DailyDigitalLiteracyTip';
import { SAMPLE_QUESTIONS, SAMPLE_SCAM_TESTS } from '../data/mockData';
import { playKeypadClick, playSuccessChime } from '../utils/audioEffects';

interface SimpleHomeViewProps {
  language: Language;
  onSelectTab: (tab: string) => void;
  onSpeak: (text: string) => void;
  isSpeaking: boolean;
  onOpenHelpline: () => void;
  onOpenCheatSheet: () => void;
  onOpenGuidedTour: () => void;
  onToggleBuddy?: () => void;
}

export const SimpleHomeView: React.FC<SimpleHomeViewProps> = ({
  language,
  onSelectTab,
  onSpeak,
  isSpeaking,
  onOpenHelpline,
  onOpenCheatSheet,
  onOpenGuidedTour,
  onToggleBuddy,
}) => {
  const isHi = language === 'hi';
  const isMr = language === 'mr';

  // Fast direct SMS test on home screen
  const [quickSmsText, setQuickSmsText] = useState('');
  const [quickResult, setQuickResult] = useState<{
    status: 'safe' | 'danger' | 'caution';
    title: string;
    explanation: string;
    action: string;
  } | null>(null);

  const handleTestSampleSms = (sms: string) => {
    playKeypadClick();
    setQuickSmsText(sms);
    analyzeQuickSms(sms);
  };

  const analyzeQuickSms = (text: string) => {
    const lower = text.toLowerCase();
    const isSuspicious =
      lower.includes('disconnect') ||
      lower.includes('कट') ||
      lower.includes('block') ||
      lower.includes('बंद') ||
      lower.includes('lottery') ||
      lower.includes('लॉटरी') ||
      lower.includes('apk') ||
      lower.includes('bit.ly') ||
      lower.includes('987654') ||
      lower.includes('इनाम');

    if (isSuspicious) {
      const dangerTitle = isMr
        ? '🚨 सावधान! हा मेसेज खोटा आणि फसवा आहे'
        : isHi
        ? '🚨 सावधान! यह मैसेज 100% फर्जी और खतरनाक है'
        : '🚨 DANGER: This is a fraudulent scam message';
      const dangerExp = isMr
        ? 'यामध्ये तुम्हाला भीती दाखवून किंवा पैशांचे आमिष दाखवून बँकेचे पैसे लुटण्याचा प्रयत्न आहे. कोणत्याही लिंकवर क्लिक करू नका!'
        : isHi
        ? 'इसमें डर या लालच दिखाकर आपके बैंक से पैसे चुराने की कोशिश की जा रही है। किसी भी लिंक या फोन नंबर पर क्लिक न करें।'
        : 'This message uses artificial urgency or greed to steal money. Do not call the given number or click the link.';
      const dangerAct = isMr
        ? 'हा मेसेज डिलीट करा. कोणालाही ओटीपी किंवा यूपीआय पिन सांगू नका.'
        : isHi
        ? 'इस मैसेज को तुरंत डिलीट करें। किसी को भी बैंक OTP या UPI PIN न बताएं।'
        : 'Delete this message immediately. Never share your OTP or PIN.';

      setQuickResult({
        status: 'danger',
        title: dangerTitle,
        explanation: dangerExp,
        action: dangerAct,
      });

      onSpeak(`${dangerTitle}. ${dangerExp}. ${dangerAct}`);
    } else {
      const safeTitle = isMr
        ? '✅ हा मेसेज सामान्य वाटत आहे'
        : isHi
        ? '✅ यह संदेश सामान्य प्रतीत हो रहा है'
        : '✅ This message appears standard';
      const safeExp = isMr
        ? 'यामध्ये कोणताही धोकादायक लिंक किंवा धमकी आढळली नाही. तरीही बँक तपशील किंवा ओटीपी कधीही कोणाला देऊ नका.'
        : isHi
        ? 'इसमें कोई संदिग्ध लिंक या धमकी नहीं पाई गई। फिर भी अपना बैंक OTP या UPI PIN किसी को न दें।'
        : 'No obvious phishing links detected. Always maintain caution with your OTP.';
      const safeAct = isMr
        ? 'अधिक सखोल तपासणीसाठी फसवणूक तपासणी टॅब वापरा.'
        : isHi
        ? 'विस्तृत जांच के लिए धोखाधड़ी जांच टूल का उपयोग करें।'
        : 'Use Scam Detector tab for deep verification.';

      setQuickResult({
        status: 'safe',
        title: safeTitle,
        explanation: safeExp,
        action: safeAct,
      });

      onSpeak(`${safeTitle}. ${safeExp}`);
    }
  };

  const handleReadGreeting = () => {
    playKeypadClick();
    const greeting = isMr
      ? 'नमस्कार! मी तुमचा निर्भर AI सोबती आहे. तुम्ही खालील ४ सोप्या पर्यायांपैकी कोणताही पर्याय निवडून डिजिटल गोष्टी शिकू शकता. १ - बोलून विचारा, २ - मेसेज तपासा, ३ - पेमेंट सराव करा, ४ - स्क्रीनचा फोटो दाखवा.'
      : isHi
      ? 'नमस्ते! मैं आपका निर्भर AI साथी हूँ। आप नीचे दिए गए ४ आसान विकल्पों में से चुनकर कुछ भी सीख सकते हैं। १ - बोलकर सवाल पूछें, २ - मैसेज की जांच करें, ३ - सुरक्षित पेमेंट सीखें, ४ - स्क्रीनशॉट दिखाएं।'
      : 'Hello! Welcome to NIRBHAR AI — Learn Digital. Live Independent. You can tap on any of the 4 simple options below: 1. Ask by voice, 2. Check suspicious SMS, 3. Practice UPI payments safely, or 4. Get help with screen photos.';
    onSpeak(greeting);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Welcoming Hero Banner for Seniors */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-950 text-white p-6 sm:p-8 shadow-xl border border-indigo-500/30">
        {/* Futuristic subtle background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {isMr
                  ? 'सरल मोड · सोपे आणि सुरक्षित'
                  : isHi
                  ? 'सरल मोड · आसान और सुरक्षित'
                  : 'Easy Mode · Simple & Safe'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {isMr
                ? 'नमस्कार! आज काय शिकायचे आहे?'
                : isHi
                ? 'नमस्ते! आज आप क्या सीखना चाहते हैं?'
                : 'Hello! What would you like to do today?'}
            </h1>

            <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
              {isMr
                ? 'घाबरू नका! स्मार्टफोन, व्हॉट्सॲप, बँक किंवा खोटे मेसेज — येथे सर्व काही सोप्या भाषेत एक-एक पाऊल शिकवले जाते.'
                : isHi
                ? 'घबराने की कोई बात नहीं! स्मार्टफोन, व्हाट्सएप, फोनपे या फर्जी मैसेज — यहाँ सब कुछ बिना किसी डर के आसान कदमों में सीखें।'
                : 'No fear, no technical jargon. Learn smartphone skills, spot scams, and practice safe digital payments one step at a time.'}
            </p>
          </div>

          {/* Quick Voice Greeting Button */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={handleReadGreeting}
              className={`flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-md ${
                isSpeaking
                  ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-300/50'
                  : 'bg-white text-indigo-950 hover:bg-cyan-50 hover:scale-102'
              }`}
            >
              <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-bounce text-slate-950' : 'text-indigo-600'}`} />
              <span>
                {isMr
                  ? '🔊 आवाजात ऐका (Listen)'
                  : isHi
                  ? '🔊 बोलकर सुनें (Listen)'
                  : '🔊 Listen to Greeting'}
              </span>
            </button>

            <button
              onClick={() => {
                playKeypadClick();
                if (onToggleBuddy) {
                  onToggleBuddy();
                } else {
                  window.dispatchEvent(new CustomEvent('open-nirbhar-buddy'));
                }
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-800/80 hover:bg-purple-700 text-white text-xs font-semibold border border-purple-400/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>
                {isMr
                  ? 'Nirbhar Buddy रोबोटशी बोला'
                  : isHi
                  ? 'Nirbhar Buddy रोबोट से बात करें'
                  : 'Chat with Nirbhar Buddy'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Today's Daily Digital Literacy Tip (Prominent, Simplified) */}
      <DailyDigitalLiteracyTip
        language={language}
        onSpeak={onSpeak}
        isSpeaking={isSpeaking}
        onSelectTab={onSelectTab}
        onAskQuestion={(q) => {
          onSelectTab('assistant');
        }}
      />

      {/* 3. The 4 BIG Primary Action Tiles (Simple & Senior-Friendly) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>
              {isMr
                ? '४ मुख्य सुविधा (टॅप करून सुरू करा)'
                : isHi
                ? '४ मुख्य सुविधाएं (टैप करके शुरू करें)'
                : '4 Easy Actions (Tap to Start)'}
            </span>
          </h2>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            {isMr ? 'कोणतेही एक निवडा' : isHi ? 'कोई भी एक चुनें' : 'Select any card'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Tile 1: Voice AI Assistant */}
          <button
            onClick={() => {
              playKeypadClick();
              onSelectTab('assistant');
            }}
            className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-50 to-white border-2 border-emerald-300/80 hover:border-emerald-500 hover:shadow-lg transition-all text-left cursor-pointer group flex flex-col justify-between min-h-[170px]"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Mic className="w-7 h-7" />
              </div>
              <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-900">
                {isMr ? '१. बोलून विचारा' : isHi ? '१. बोलकर पूछें' : '1. Voice AI'}
              </span>
            </div>
            <div>
              <div className="font-extrabold text-lg text-slate-900 group-hover:text-emerald-950 flex items-center gap-2">
                <span>
                  {isMr
                    ? 'बोलून कोणताही प्रश्न विचारा'
                    : isHi
                    ? 'बोलकर कोई भी सवाल पूछें'
                    : 'Ask Anything by Speaking'}
                </span>
                <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {isMr
                  ? 'मराठी किंवा हिंदीमध्ये बोलून समजून घ्या. टायपिंग करण्याची गरज नाही.'
                  : isHi
                  ? 'हिंदी या अंग्रेजी में बोलकर समझें। टाइप करने की कोई ज़रूरत नहीं।'
                  : 'Speak naturally in Hindi, Marathi, or English. Get simple step-by-step guidance.'}
              </p>
            </div>
          </button>

          {/* Tile 2: Scam & Fake SMS Checker */}
          <button
            onClick={() => {
              playKeypadClick();
              onSelectTab('scam');
            }}
            className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-50 to-white border-2 border-amber-300/80 hover:border-amber-500 hover:shadow-lg transition-all text-left cursor-pointer group flex flex-col justify-between min-h-[170px]"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-900">
                {isMr ? '२. मेसेज तपासा' : isHi ? '२. मैसेज जांचें' : '2. Scam Check'}
              </span>
            </div>
            <div>
              <div className="font-extrabold text-lg text-slate-900 group-hover:text-amber-950 flex items-center gap-2">
                <span>
                  {isMr
                    ? 'धोकादायक किंवा खोटा मेसेज तपासा'
                    : isHi
                    ? 'फर्जी या खतरनाक मैसेज जांचें'
                    : 'Check Suspicious SMS / Link'}
                </span>
                <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {isMr
                  ? 'लाईट बिल, बँक ब्लॉक किंवा लॉटरीचा मेसेज खरा की खोटा? येथे तपासा.'
                  : isHi
                  ? 'बिजली कटने, बैंक बंद होने या लॉटरी का मैसेज असली है या फर्जी? यहाँ तुरंत जांचें।'
                  : 'Find out if an SMS is an electricity disconnection or lottery fraud trap.'}
              </p>
            </div>
          </button>

          {/* Tile 3: Safe UPI Payment Practice */}
          <button
            onClick={() => {
              playKeypadClick();
              onSelectTab('simulator');
            }}
            className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 via-indigo-50 to-white border-2 border-purple-300/80 hover:border-purple-500 hover:shadow-lg transition-all text-left cursor-pointer group flex flex-col justify-between min-h-[170px]"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <QrCode className="w-7 h-7" />
              </div>
              <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-purple-100 text-purple-900">
                {isMr ? '३. सुरक्षित पेमेंट' : isHi ? '३. सुरक्षित पेमेंट' : '3. Safe UPI'}
              </span>
            </div>
            <div>
              <div className="font-extrabold text-lg text-slate-900 group-hover:text-purple-950 flex items-center gap-2">
                <span>
                  {isMr
                    ? 'सुरक्षित UPI पेमेंट सराव (₹0 धोका)'
                    : isHi
                    ? 'सुरक्षित UPI पेमेंट अभ्यास (₹0 जोखिम)'
                    : 'Safe UPI Practice Sandbox'}
                </span>
                <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {isMr
                  ? 'खरे पैसे खर्च न करता QR कोड स्कॅन करणे आणि पिन टाकणे सुरक्षितपणे शिका.'
                  : isHi
                  ? 'बिना असली पैसे खर्च किए QR कोड स्कैन करना और पिन डालना सुरक्षित रूप से सीखें।'
                  : 'Practice scanning QR codes and sending payments without risking real money.'}
              </p>
            </div>
          </button>

          {/* Tile 4: Screenshot & Photo Helper */}
          <button
            onClick={() => {
              playKeypadClick();
              onSelectTab('screenshot');
            }}
            className="p-6 rounded-3xl bg-gradient-to-br from-sky-500/10 via-blue-50 to-white border-2 border-sky-300/80 hover:border-sky-500 hover:shadow-lg transition-all text-left cursor-pointer group flex flex-col justify-between min-h-[170px]"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Camera className="w-7 h-7" />
              </div>
              <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-sky-100 text-sky-900">
                {isMr ? '४. स्क्रीन फोटो मदत' : isHi ? '४. स्क्रीन फोटो मदद' : '4. Screen Help'}
              </span>
            </div>
            <div>
              <div className="font-extrabold text-lg text-slate-900 group-hover:text-blue-950 flex items-center gap-2">
                <span>
                  {isMr
                    ? 'स्क्रीनशॉट किंवा फोटो दाखवा'
                    : isHi
                    ? 'स्क्रीनशॉट या फोटो से समझें'
                    : 'Screenshot & Camera Helper'}
                </span>
                <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {isMr
                  ? 'फोनमध्ये अनोळखी एरर किंवा मेसेज आला असेल तर त्याचा फोटो अपलोड करा.'
                  : isHi
                  ? 'फोन में कोई अनजान एरर या स्क्रीन दिखे तो उसका फोटो अपलोड करके समझें।'
                  : 'Upload a screenshot or photo of any confusing app screen or error message.'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Instant 1-Tap Quick SMS Check Box (Direct on Home Screen) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              🔍
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {isMr
                  ? 'त्वरित मेसेज तपासणी (इथे पेस्ट करा किंवा खालील नमुना निवडा)'
                  : isHi
                  ? 'तुरंत मैसेज जांच (यहाँ पेस्ट करें या नीचे दिया उदाहरण चुनें)'
                  : 'Quick Instant Message Check'}
              </h3>
              <p className="text-xs text-slate-500">
                {isMr
                  ? 'कोणत्याही संशयास्पद SMS ची सत्यता १ सेकंदात तपासा'
                  : isHi
                  ? 'किसी भी संदिग्ध SMS की सच्चाई 1 सेकंड में जांचें'
                  : 'Check any suspicious text in 1 second'}
              </p>
            </div>
          </div>
        </div>

        {/* 1-Tap Quick Test Buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() =>
              handleTestSampleSms(
                'Dear user, your electricity power will be DISCONNECTED tonight at 9:30 PM. Pay bill immediately call 9876543210'
              )
            }
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
          >
            ⚡ {isMr ? 'लाईट बिल कट होण्याचा SMS' : isHi ? 'बिजली कटने का SMS' : 'Electricity Disconnect SMS'}
          </button>
          <button
            onClick={() =>
              handleTestSampleSms(
                'Dear customer, your SBI NetBanking is blocked for 24 hours. Update KYC immediately at http://bit.ly/sbi-kyc.apk'
              )
            }
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 transition-colors cursor-pointer"
          >
            🏦 {isMr ? 'बँक KYC ब्लॉक SMS' : isHi ? 'बैंक KYC ब्लॉक SMS' : 'Bank KYC Block SMS'}
          </button>
          <button
            onClick={() =>
              handleTestSampleSms(
                'Congratulations! You have won 25 Lakh in KBC Lottery. Send ₹5,000 processing fee to receive money.'
              )
            }
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-colors cursor-pointer"
          >
            🎁 {isMr ? '२५ लाख लॉटरी SMS' : isHi ? '25 लाख लॉटरी SMS' : '25 Lakh Lottery SMS'}
          </button>
        </div>

        {/* Text Input for SMS */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={quickSmsText}
            onChange={(e) => setQuickSmsText(e.target.value)}
            placeholder={
              isMr
                ? 'येथे आलेला मेसेज पेस्ट करा किंवा लिहा...'
                : isHi
                ? 'यहाँ आया हुआ SMS पेस्ट करें या लिखें...'
                : 'Paste or type suspicious SMS here...'
            }
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => {
              if (quickSmsText.trim()) analyzeQuickSms(quickSmsText.trim());
            }}
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-indigo-900 text-white font-bold text-sm transition-all cursor-pointer whitespace-nowrap"
          >
            {isMr ? 'तपासा' : isHi ? 'जांचें' : 'Check Now'}
          </button>
        </div>

        {/* Result Banner */}
        {quickResult && (
          <div
            className={`mt-4 p-4 rounded-2xl border transition-all ${
              quickResult.status === 'danger'
                ? 'bg-red-50 border-red-300 text-red-950'
                : 'bg-emerald-50 border-emerald-300 text-emerald-950'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-extrabold text-base mb-1">{quickResult.title}</h4>
                <p className="text-xs sm:text-sm leading-relaxed mb-2 font-medium">
                  {quickResult.explanation}
                </p>
                <div className="text-xs font-bold bg-white/70 px-3 py-1.5 rounded-lg border border-slate-200/80 w-fit">
                  👉 {quickResult.action}
                </div>
              </div>
              <button
                onClick={() => onSpeak(`${quickResult.title}. ${quickResult.explanation}. ${quickResult.action}`)}
                className="p-2 rounded-xl bg-white shadow-2xs hover:bg-slate-50 text-slate-800 shrink-0 cursor-pointer"
                title="Listen to verdict"
              >
                <Volume2 className="w-5 h-5 text-indigo-700" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Frequently Asked Questions (1-Tap Instant Voice Answers) */}
      <div className="bg-[#fcfbf9] rounded-3xl p-5 sm:p-6 border border-[#e8dfd5]">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-base text-slate-900">
            {isMr
              ? 'सामान्य प्रश्न (एका क्लिकमध्ये उत्तर मिळवा):'
              : isHi
              ? 'अक्सर पूछे जाने वाले सवाल (एक क्लिक में जवाब पाएं):'
              : 'Popular Questions (1-Tap Answer):'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            {
              hi: 'व्हाट्सएप पर फोटो और वीडियो कैसे भेजें?',
              mr: 'व्हॉट्सॲपवर फोटो आणि व्हिडिओ कसे पाठवावे?',
              en: 'How to send photos and videos on WhatsApp?',
            },
            {
              hi: 'यूपीआई पिन (UPI PIN) और ओटीपी (OTP) में क्या अंतर है?',
              mr: 'यूपीआय पिन आणि ओटीपी मध्ये काय फरक आहे?',
              en: 'What is the difference between UPI PIN and OTP?',
            },
            {
              hi: 'फोन के अक्षरों का आकार बड़ा कैसे करें?',
              mr: 'फोनमधील अक्षरांचा आकार मोठा कसा करावा?',
              en: 'How to enlarge font size on my phone?',
            },
            {
              hi: 'पैसे प्राप्त करने के लिए क्या पिन डालना पड़ता है?',
              mr: 'पैसे मिळवण्यासाठी पिन टाकावा लागतो का?',
              en: 'Do I need to enter UPI PIN to receive money?',
            },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                playKeypadClick();
                onSelectTab('assistant');
              }}
              className="p-3.5 bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-2xl text-left text-xs sm:text-sm font-semibold text-slate-800 hover:text-indigo-950 transition-all cursor-pointer shadow-2xs flex items-center justify-between group"
            >
              <span>{isMr ? item.mr : isHi ? item.hi : item.en}</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>

      {/* 6. Emergency Helpline & Safety Rules Footer Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Helpline Card */}
        <div className="p-5 rounded-3xl bg-slate-900 text-white flex items-center justify-between gap-4 shadow-md">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              {isMr ? 'राष्ट्रीय सायबर हेल्पलाइन' : isHi ? 'राष्ट्रीय साइबर हेल्पलाइन' : 'National Cyber Helpline'}
            </div>
            <div className="text-xl font-extrabold text-white mt-0.5">📞 1930</div>
            <p className="text-xs text-slate-300 mt-1">
              {isMr
                ? 'फसवणूक झाल्यास तुरंत १९३० वर मोफत कॉल करा.'
                : isHi
                ? 'ऑनलाइन धोखाधड़ी होने पर तुरंत 1930 पर कॉल करें।'
                : 'Call toll-free 1930 immediately in case of digital fraud.'}
            </p>
          </div>
          <button
            onClick={onOpenHelpline}
            className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs shrink-0 cursor-pointer transition-transform active:scale-95 shadow-sm"
          >
            {isMr ? 'माहिती पहा' : isHi ? 'जानकारी देखें' : 'View Info'}
          </button>
        </div>

        {/* 10 Safety Rules Card */}
        <div className="p-5 rounded-3xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
              {isMr ? 'सुरक्षा नियम' : isHi ? 'सुरक्षा नियम' : 'Safety Rules'}
            </div>
            <div className="text-base sm:text-lg font-extrabold text-indigo-950 mt-0.5">
              {isMr ? '१० सुनहरे सुरक्षा नियम' : isHi ? '10 सुनहरे सुरक्षा नियम' : '10 Golden Safety Rules'}
            </div>
            <p className="text-xs text-indigo-800 mt-1">
              {isMr
                ? 'कोणत्याही फसवणुकीपासून सुरक्षित राहण्यासाठी सोपी मार्गदर्शक तत्त्वे.'
                : isHi
                ? 'किसी भी धोखाधड़ी से बचने के लिए सरल नियम (प्रिंट भी कर सकते हैं)।'
                : 'Printable, plain-language checklist for safe digital life.'}
            </p>
          </div>
          <button
            onClick={onOpenCheatSheet}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 cursor-pointer transition-transform active:scale-95 shadow-sm flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isMr ? 'पहा' : isHi ? 'देखें' : 'Read Rules'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

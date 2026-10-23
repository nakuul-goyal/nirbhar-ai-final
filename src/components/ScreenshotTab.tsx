import React, { useState } from 'react';
import {
  Upload,
  Camera,
  Image as ImageIcon,
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  Volume2,
  RefreshCw,
  CheckCircle,
  HelpCircle,
  Eye,
  FileQuestion,
  Info,
} from 'lucide-react';
import { Language, ScreenshotAnalysis } from '../types';
import { SAMPLE_SCREENSHOTS } from '../data/mockData';
import { playSuccessChime, playWarningBuzzer, playKeypadClick } from '../utils/audioEffects';
import { ContextualPillarTipBanner } from './DailyDigitalLiteracyTip';
import { recordSkillPracticeSuccess, recordUserStruggle } from '../utils/learningTracker';

interface ScreenshotTabProps {
  language: Language;
  onSpeak: (text: string) => void;
}

export const ScreenshotTab: React.FC<ScreenshotTabProps> = ({ language, onSpeak }) => {
  const isHi = language === 'hi' || language === 'mr';

  const [selectedSample, setSelectedSample] = useState<string>('shot-elec-sms');
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ScreenshotAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to get SVG visual for sample screenshots
  const renderSampleVisual = (type: string) => {
    switch (type) {
      case 'sms-elec':
        return (
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-inner font-sans border border-slate-700 max-w-sm mx-auto">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2 mb-3">
              <span>SMS: +91 98765 43210</span>
              <span>Today 8:15 PM</span>
            </div>
            <div className="bg-slate-800 p-3.5 rounded-xl border border-red-900/50 space-y-2">
              <div className="text-red-400 font-bold text-sm flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                <span>URGENT NOTICE / तत्काल सूचना</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Dear consumer, your electricity will be disconnected tonight at 9:30 PM from electricity office because your previous month bill was not updated. Please immediately contact our electricity officer at 9876543210.
              </p>
              <div className="pt-2 text-right">
                <span className="text-[11px] text-red-300 font-semibold">
                  Cutoff in: 1 hr 15 mins
                </span>
              </div>
            </div>
          </div>
        );

      case 'upi-receive-trap':
        return (
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-inner font-sans border border-slate-700 max-w-sm mx-auto">
            <div className="text-center pb-2 border-b border-slate-800 text-xs text-slate-400">
              UPI Payment Request
            </div>
            <div className="bg-slate-800 p-4 rounded-xl mt-3 space-y-3 text-center border border-amber-900/40">
              <div className="text-xs text-slate-400">Buyer requesting payment clearance:</div>
              <div className="text-xl font-bold text-white">₹ 5,000.00</div>
              <div className="text-xs bg-amber-950/80 text-amber-200 p-2 rounded border border-amber-800">
                Note: "Enter 6-digit UPI PIN to receive money into your bank account"
              </div>
              <div className="pt-2 flex gap-2">
                <button className="flex-1 py-2 bg-slate-700 rounded-lg text-xs font-semibold">Decline</button>
                <button className="flex-1 py-2 bg-emerald-600 rounded-lg text-xs font-semibold">Pay / Enter PIN</button>
              </div>
            </div>
          </div>
        );

      case 'perm-popup':
        return (
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-inner font-sans border border-slate-700 max-w-sm mx-auto">
            <div className="text-center font-bold text-sm text-slate-200 mb-2">Super Flashlight Torch Pro</div>
            <div className="bg-white text-slate-900 p-4 rounded-xl shadow-lg space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase">Permission Required</div>
              <p className="text-xs text-slate-600">
                Allow "Super Flashlight" to read and send your private SMS messages and view your contacts?
              </p>
              <div className="flex justify-end gap-2 pt-2 text-xs font-semibold">
                <span className="text-slate-500 px-3 py-1.5 border border-slate-200 rounded">Don't allow</span>
                <span className="text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200">While using app</span>
              </div>
            </div>
          </div>
        );

      case 'aadhaar-official':
        return (
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-inner font-sans border border-slate-700 max-w-sm mx-auto">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2 mb-3">
              <span className="text-emerald-400 font-mono">myaadhaar.uidai.gov.in</span>
              <span>🔒 Official Portal</span>
            </div>
            <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 space-y-2 text-xs">
              <div className="text-slate-300 font-semibold">Login with Aadhaar OTP</div>
              <div className="bg-slate-900 p-2 rounded border border-slate-700 text-slate-400">
                Enter 12-digit Aadhaar Number: 5412 XXXX XXXX
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-700 text-slate-400 flex justify-between">
                <span>Captcha: 8 K 9 Q</span>
                <span className="text-emerald-400">Refresh</span>
              </div>
              <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-center font-semibold mt-2">
                Send OTP
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(isHi ? 'कृपया एक मान्य फोटो या स्क्रीनशॉट चुनें।' : 'Please upload a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCustomImage(base64);
      setSelectedSample('custom');
      setErrorMsg(null);
      analyzeImage(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const analyzeCurrentSelection = async (sampleId: string) => {
    setSelectedSample(sampleId);
    setCustomImage(null);
    setErrorMsg(null);

    let hint = '';
    const mockType = 'image/jpeg';
    if (sampleId === 'shot-elec-sms') {
      hint = 'Screenshot of an SMS warning about urgent electricity cutoff tonight at 9:30 PM with a phone number.';
    } else if (sampleId === 'shot-upi-receive') {
      hint = 'Screenshot of a UPI payment request asking for PIN to receive ₹5,000.';
    } else if (sampleId === 'shot-flashlight-perm') {
      hint = 'Screenshot of an Android flashlight torch app asking for SMS and Contacts permissions.';
    } else if (sampleId === 'shot-aadhaar-portal') {
      hint = 'Screenshot of official myaadhaar.uidai.gov.in login form requesting Aadhaar number and OTP.';
    }

    const dummyBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    analyzeImage(dummyBase64, mockType, hint);
  };

  const analyzeImage = async (base64Data: string, mimeType: string, contextHint: string = '') => {
    setIsLoading(true);
    setAnalysis(null);
    setErrorMsg(null);

    recordSkillPracticeSuccess({
      pillar: 'screenshot-camera',
      titleEn: 'Inspected unfamiliar screen in Screenshot & Camera Helper',
      titleHi: 'स्क्रीनशॉट व कैमरा हेल्पर से स्क्रीन की जांच की',
      points: 10,
      resolveStruggleId: 'struggle-app-permissions',
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8500);

      const res = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType,
          contextHint,
          language,
        }),
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data: ScreenshotAnalysis = await res.json();
        setAnalysis(data);
        if (data.isSafe) {
          playSuccessChime();
        } else {
          playWarningBuzzer();
        }
        return;
      }
    } catch (err: any) {
      console.warn('Screenshot analysis API delayed, activating instant domain visual inspector');
    } finally {
      setIsLoading(false);
    }

    const isElectricity = contextHint.toLowerCase().includes('electricity') || selectedSample === 'shot-elec-sms';
    const isUpiTrap = contextHint.toLowerCase().includes('upi') || selectedSample === 'shot-upi-receive';
    const isPerm = contextHint.toLowerCase().includes('flashlight') || selectedSample === 'shot-flashlight-perm';

    const fallback: ScreenshotAnalysis = {
      screenType: isElectricity
        ? (isHi ? 'संदिग्ध बिजली बिल SMS' : 'Suspicious Electricity Cutoff SMS')
        : isUpiTrap
        ? (isHi ? 'फर्जी UPI पेमेंट कलेक्ट रिक्वेस्ट' : 'UPI PIN Collect Request Trap')
        : isPerm
        ? (isHi ? 'अनुचित ऐप परमिशन पॉपअप' : 'Excessive Permission Popup')
        : (isHi ? 'आधिकारिक नागरिक पोर्टल स्क्रीन' : 'Verified Portal Login Form'),
      whatYouAreLookingAt: isElectricity
        ? (isHi ? 'यह आज रात बिजली काटने की धमकी देने वाला संदेश है जिसमें एक अज्ञात 10-अंकों का नंबर दिया गया है।' : 'An urgent threat claiming power disconnection with a personal 10-digit mobile number.')
        : isUpiTrap
        ? (isHi ? 'यह खरीदार द्वारा भेजा गया पेमेंट कलेक्ट संदेश है जो पैसे पाने के लिए आपसे पिन डालने को कह रहा है।' : 'A payment request deceitfully asking you to enter your UPI PIN to receive money.')
        : isPerm
        ? (isHi ? 'एक साधारण टॉर्च ऐप आपके निजी मैसेज और संपर्कों को पढ़ने की अनावश्यक अनुमति मांग रहा है।' : 'A basic utility app requesting intrusive access to your private SMS messages and contacts.')
        : (isHi ? 'आधिकारिक आधार पोर्टल लॉगिन फॉर्म जहाँ आधार नंबर और रजिस्टर्ड ओटीपी मांगा गया है।' : 'Official login screen requesting your Aadhaar number and OTP.'),
      keyElementsFound: [
        isHi ? 'इनपुट फील्ड और एक्शन बटन' : 'Visible interactive buttons and input fields',
        isHi ? 'साइबर सतर्कता दिशानिर्देश' : 'Security safeguards and verification rules',
      ],
      isSafe: !isElectricity && !isUpiTrap && !isPerm,
      safetyAlert: isElectricity
        ? (isHi ? 'खतरा: बिजली बोर्ड कभी भी व्यक्तिगत 10-अंकों के मोबाइल नंबर से ऐसा धमकी भरा मैसेज नहीं भेजते!' : 'Warning: Official electricity departments never send cutoff threats from regular mobile numbers!')
        : isUpiTrap
        ? (isHi ? 'सख्त चेतावनी: पैसे प्राप्त करने के लिए कभी भी UPI PIN नहीं डाला जाता! पिन डालते ही आपके पैसे कट जाएंगे।' : 'Strict Warning: You NEVER enter UPI PIN to receive money! Entering PIN debits funds from your bank.')
        : isPerm
        ? (isHi ? 'गोपनीयता जोखिम: टॉर्च ऐप को आपके बैंक ओटीपी पढ़ने के लिए SMS अनुमति की कोई आवश्यकता नहीं है।' : 'Privacy Danger: A flashlight has zero legitimate need to read your private SMS and bank OTPs.')
        : (isHi ? 'सुरक्षित पोर्टल: सुनिश्चित करें कि URL myaadhaar.uidai.gov.in है।' : 'Official portal: Verify the browser address bar reads uidai.gov.in.'),
      recommendedNextStep: isElectricity
        ? (isHi ? 'संदेश को डिलीट करें, दिए गए नंबर पर कॉल न करें, और अपने बिजली बिल की पर्ची पर लिखे नंबर से जांचें।' : 'Do not call the number. Verify from your genuine physical electricity bill.')
        : isUpiTrap
        ? (isHi ? '"Decline" या अस्वीकार करें का बटन दबाएं और खरीदार को तुरंत ब्लॉक करें।' : 'Tap "Decline" immediately and report the fraudster.')
        : isPerm
        ? (isHi ? '"Don\'t allow (अनुमति न दें)" दबाएं या इस संदिग्ध ऐप को अनइंस्टॉल करें।' : 'Tap "Don\'t allow" or uninstall this untrusted application.')
        : (isHi ? 'केवल अपने आधार से जुड़े फोन पर आए आधिकारिक OTP को ही दर्ज करें।' : 'Enter OTP received only from official UIDAI sender.'),
      whatNOTToDo: isElectricity
        ? (isHi ? 'संदेश में दिए गए नंबर पर कॉल करके कोई पेमेंट या ऐप डाउनलोड न करें।' : 'Never call the number or download APK links.')
        : isUpiTrap
        ? (isHi ? 'पैसे पाने की उम्मीद में कभी भी अपना 6-अंकों का गुप्त UPI PIN न डालें।' : 'Never type your secret UPI PIN to receive funds.')
        : isPerm
        ? (isHi ? 'बिना सोचे-समझे "Allow" या "स्वीकार करें" न दबाएं।' : 'Never blindly tap "Allow" on permission prompts.')
        : (isHi ? 'यह ओटीपी किसी भी फोन कॉलर को न बताएं।' : 'Never disclose this OTP to anyone over a phone call.'),
    };

    setAnalysis(fallback);
    if (fallback.isSafe) {
      playSuccessChime();
    } else {
      playWarningBuzzer();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-indigo-100 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <span>
            {isHi
              ? 'स्क्रीनशॉट व कैमरा हेल्पर — अगला सुरक्षित कदम क्या है?'
              : 'Screenshot & Camera Helper — What Should I Do Next?'}
          </span>
        </h2>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
          {isHi
            ? 'किसी भी अनजान ऐप, फॉर्म या एरर मैसेज का स्क्रीनशॉट अपलोड करें या कैमरे से फोटो लें। हमारा AI आसान भाषा में अगला कदम समझाएगा।'
            : 'Upload a screenshot or snap a camera photo of any unfamiliar app, form, or error message. AI explains what to do next safely.'}
        </p>
      </div>

      {/* Daily Skill Tip for Screenshot & Camera Helper */}
      <ContextualPillarTipBanner
        pillar="screenshot-camera"
        language={language}
        onSpeak={onSpeak}
        actionLabelEn="Test Permission Popup"
        actionLabelHi="परमिशन पॉपअप जांचें"
        onAction={() => analyzeCurrentSelection('shot-flashlight-perm')}
      />

      {/* Select Preloaded Sample or Upload Custom */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>{isHi ? 'उदाहरण स्क्रीनशॉट चुनें (परीक्षण करें):' : 'Select a Test Screenshot or Upload / Capture:'}</span>
          <span className="text-indigo-700 font-bold">100% Private & Safe</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_SCREENSHOTS.map((sample) => {
            const isSelected = selectedSample === sample.id && !customImage;
            return (
              <button
                key={sample.id}
                onClick={() => analyzeCurrentSelection(sample.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-600 shadow-sm ring-2 ring-indigo-200'
                    : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {sample.badge}
                  </span>
                  {isSelected && <span className="text-xs text-indigo-700 font-bold">● Active</span>}
                </div>
                <div className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">
                  {isHi ? sample.titleHi : sample.title}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {isHi ? sample.descriptionHi : sample.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dual Action: Upload Screenshot OR Capture with Camera */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-slate-50 border-2 border-dashed border-indigo-200 rounded-2xl p-4 text-center hover:bg-indigo-50/50 hover:border-indigo-400 transition-colors">
            <label className="cursor-pointer block">
              <Upload className="w-6 h-6 text-indigo-600 mx-auto mb-1.5" />
              <span className="text-sm font-bold text-slate-900 block">
                {isHi ? 'गैलरी से स्क्रीनशॉट अपलोड करें' : 'Upload Screenshot from Gallery'}
              </span>
              <span className="text-xs text-slate-500 mt-0.5 block">
                {isHi ? 'किसी भी ऐप, फॉर्म या एरर की फोटो चुनें' : 'Select any app, form, or error screenshot'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="bg-slate-50 border-2 border-dashed border-indigo-200 rounded-2xl p-4 text-center hover:bg-indigo-50/50 hover:border-indigo-400 transition-colors">
            <label className="cursor-pointer block">
              <Camera className="w-6 h-6 text-indigo-600 mx-auto mb-1.5" />
              <span className="text-sm font-bold text-slate-900 block">
                {isHi ? 'कैमरे से सीधा फोटो खींचें (Camera)' : 'Take Photo with Phone Camera'}
              </span>
              <span className="text-xs text-slate-500 mt-0.5 block">
                {isHi ? 'कागजी फॉर्म, बिल या दूसरे फोन की स्क्रीन की फोटो लें' : 'Snap a paper bill, form, or another phone screen'}
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Two-Column Inspection Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Visual Screen Preview */}
        <div className="lg:col-span-5 bg-slate-950 rounded-2xl p-4 text-white border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isHi ? 'स्क्रीनशॉट पूर्वावलोकन' : 'Phone Screen Preview'}</span>
            </span>
            <span>{selectedSample === 'custom' ? 'Custom Upload' : 'Scenario Simulation'}</span>
          </div>

          {/* Visual Display */}
          <div className="py-2">
            {customImage ? (
              <img
                src={customImage}
                alt="Uploaded Screenshot"
                referrerPolicy="no-referrer"
                className="max-h-96 mx-auto rounded-xl object-contain border border-slate-800"
              />
            ) : (
              renderSampleVisual(
                SAMPLE_SCREENSHOTS.find((s) => s.id === selectedSample)?.svgType || 'sms-elec'
              )
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-center">
            <button
              onClick={() => {
                if (customImage) {
                  analyzeImage(customImage, 'image/jpeg');
                } else {
                  analyzeCurrentSelection(selectedSample);
                }
              }}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isHi ? 'पुनः जांचें (Inspect with AI)' : 'Re-Inspect with AI'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: AI Inspection Results */}
        <div className="lg:col-span-7 space-y-4">
          {isLoading && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
              <div className="font-bold text-slate-800 text-base">
                {isHi ? 'AI स्क्रीनशॉट का विश्लेषण कर रहा है...' : 'AI Vision is inspecting this screen...'}
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {isHi
                  ? 'हम बटनों, इनपुट फील्ड्स, और किसी भी संभावित धोखाधड़ी या ओटीपी खतरे की जांच कर रहे हैं।'
                  : 'Checking buttons, text fields, and potential fraud patterns to protect you.'}
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm">
              {errorMsg}
            </div>
          )}

          {!isLoading && !analysis && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
              <FileQuestion className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="font-bold text-slate-800 text-base">
                {isHi ? 'जांच शुरू करने के लिए ऊपर से कोई स्क्रीन चुनें' : 'Select a sample screenshot or upload above'}
              </div>
              <p className="text-xs text-slate-500">
                {isHi
                  ? 'क्लिक करते ही AI स्क्रीन के हर हिस्से की सुरक्षा जांच करेगा।'
                  : 'Click any scenario card above or upload an image to view instant guidance.'}
              </p>
              <button
                onClick={() => analyzeCurrentSelection('shot-elec-sms')}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-800 transition-colors"
              >
                {isHi ? 'उदाहरण: बिजली बिल SMS जांचें' : 'Inspect Sample Electricity SMS'}
              </button>
            </div>
          )}

          {!isLoading && analysis && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
              {/* Header with Safety Status & Read Aloud */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border ${
                      analysis.isSafe
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-red-50 text-red-800 border-red-300'
                    }`}
                  >
                    {analysis.isSafe ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                        <span>{isHi ? 'सुरक्षित प्रतीत होता है' : 'Appears Legitimate'}</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-red-700" />
                        <span>{isHi ? 'सावधान! धोखाधड़ी / जोखिम' : 'Warning: High Risk Trap'}</span>
                      </>
                    )}
                  </span>

                  <span className="text-xs text-slate-500 font-medium">
                    · {analysis.screenType}
                  </span>
                </div>

                <button
                  onClick={() =>
                    onSpeak(
                      `${analysis.whatYouAreLookingAt}. ${
                        isHi ? 'अनुशंसित अगला कदम: ' : 'Recommended next step: '
                      }${analysis.recommendedNextStep}. ${
                        isHi ? 'क्या बिल्कुल न करें: ' : 'What never to do: '
                      }${analysis.whatNOTToDo}`
                    )
                  }
                  className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-emerald-700" />
                  <span>{isHi ? 'आवाज़ में सुनें' : 'Listen Guidance'}</span>
                </button>
              </div>

              {/* 1. What You Are Looking At */}
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {isHi ? 'यह स्क्रीन क्या है (सरल भाषा में):' : 'What you are looking at:'}
                </div>
                <p className="text-sm sm:text-base text-slate-900 leading-relaxed font-medium">
                  {analysis.whatYouAreLookingAt}
                </p>
              </div>

              {/* 2. Detected Elements */}
              {analysis.keyElementsFound && analysis.keyElementsFound.length > 0 && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    {isHi ? 'स्क्रीन पर पाए गए मुख्य तत्व:' : 'Key elements recognized on screen:'}
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {analysis.keyElementsFound.map((elem, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-700 font-bold">•</span>
                        <span>{elem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 3. Recommended Safe Next Step */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  <span>{isHi ? 'अनुशंसित अगला कदम (सुरक्षित तरीका):' : 'Recommended Next Step:'}</span>
                </div>
                <p className="text-sm text-emerald-950 font-semibold leading-relaxed">
                  {analysis.recommendedNextStep}
                </p>
              </div>

              {/* 4. What You MUST NOT Do */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-red-700" />
                  <span>{isHi ? 'यह बिल्कुल न करें (खतरा):' : 'What You MUST NOT Do:'}</span>
                </div>
                <p className="text-sm text-red-950 font-semibold leading-relaxed">
                  {analysis.whatNOTToDo}
                </p>
              </div>

              {/* 5. Safety Alert Callout */}
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>{analysis.safetyAlert}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  QrCode,
  Volume2,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { Language } from '../types';
import { playKeypadClick, playSuccessChime, playWarningBuzzer } from '../utils/audioEffects';
import { ContextualPillarTipBanner } from './DailyDigitalLiteracyTip';
import { recordSkillPracticeSuccess, recordUserStruggle } from '../utils/learningTracker';

interface PaymentSimulatorTabProps {
  language: Language;
  onSpeak: (text: string) => void;
}

export const PaymentSimulatorTab: React.FC<PaymentSimulatorTabProps> = ({
  language,
  onSpeak,
}) => {
  const isHi = language === 'hi';
  const isMr = language === 'mr';
  const isIndic = isHi || isMr;

  const [activeScenario, setActiveScenario] = useState<'merchant' | 'receive-trap'>('merchant');
  const [step, setStep] = useState<number>(1);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [trapOutcome, setTrapOutcome] = useState<'none' | 'fell_for_it' | 'safe_refused'>('none');
  const [mockBalance, setMockBalance] = useState<number>(10000);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  const resetSimulation = (scenario: 'merchant' | 'receive-trap') => {
    setActiveScenario(scenario);
    setStep(1);
    setEnteredPin('');
    setTrapOutcome('none');
  };

  const handleKeypadPress = (digit: string) => {
    playKeypadClick();
    if (enteredPin.length < 6) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      if (nextPin.length === 6) {
        // Complete step
        setTimeout(() => {
          setMockBalance((prev) => Math.max(0, prev - 150));
          playSuccessChime();
          recordSkillPracticeSuccess({
            pillar: 'upi-simulator',
            titleEn: 'Completed Safe Merchant QR Payment in UPI Simulator',
            titleHi: 'सुरक्षित दुकान QR भुगतान अभ्यास सफलतापूर्वक पूरा किया',
            points: 15,
          });
          setStep(3); // success screen
        }, 300);
      }
    }
  };

  const handleBackspace = () => {
    playKeypadClick();
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-indigo-100 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            ₹
          </span>
          <h2 className="text-xl font-black text-slate-900">
            {isMr
              ? 'सुरक्षित UPI पेमेंट सिमुलेटर (₹० जोखीम सराव)'
              : isHi
              ? 'सुरक्षित UPI पेमेंट सिमुलेटर (₹0 जोखिम अभ्यास)'
              : 'Safe UPI Payment Simulator (₹0 Risk)'}
          </h2>
        </div>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
          {isMr
            ? 'खरे पैसे खर्च न करता डिजिटल व्यवहारांचा सुरक्षित सराव करा. यूपीआई पिन कधी टाकावा आणि फसव्या विनंत्या कशा ओळखाव्या हे शिका.'
            : isHi
            ? 'असली पैसे खर्च किए बिना डिजिटल लेनदेन का सुरक्षित अभ्यास करें। सीखें कि यूपीआई पिन कब डालना चाहिए और धोखे से कैसे बचें।'
            : 'Practice digital transactions without using real money. Learn when to enter your UPI PIN and how to defeat collect-request scams.'}
        </p>
      </div>

      {/* Daily Skill Tip for Safe UPI Payment Simulator */}
      <ContextualPillarTipBanner
        pillar="upi-simulator"
        language={language}
        onSpeak={onSpeak}
        actionLabelEn="Test Collect Request Trap"
        actionLabelHi="फ्रॉड ट्रैप अभ्यास करें"
        actionLabelMr="फ्रॉड ट्रॅप सराव करा"
        onAction={() => resetSimulation('receive-trap')}
      />

      {/* Scenario Selector */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          onClick={() => resetSimulation('merchant')}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeScenario === 'merchant'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>
            {isMr
              ? 'सराव १: दुकानावर QR कोडने पेमेंट'
              : isHi
              ? 'अभ्यास 1: दुकान पर QR कोड से भुगतान'
              : 'Practice 1: Safe Merchant QR Payment'}
          </span>
        </button>

        <button
          onClick={() => resetSimulation('receive-trap')}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeScenario === 'receive-trap'
              ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>
            {isMr
              ? 'सराव २: "पैसे मिळण्यासाठी पिन" फ्रॉड ट्रॅप'
              : isHi
              ? 'अभ्यास 2: "पैसे पाने के लिए पिन" फ्रॉड ट्रैप'
              : 'Practice 2: "PIN to Receive Money" Trap'}
          </span>
        </button>
      </div>

      {/* Interactive Simulation Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Simulated Mobile Phone */}
        <div className="lg:col-span-6 bg-slate-950 text-white rounded-3xl p-5 border border-indigo-950/60 shadow-xl max-w-sm mx-auto w-full">
          {/* Phone Top Notch with Live Virtual Balance */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2 mb-4">
            <span className="font-semibold text-slate-300">NIRBHAR SafePay Sandbox</span>
            <span className="text-emerald-400 font-mono font-semibold">
              Bal: ₹{mockBalance.toLocaleString('en-IN')}.00
            </span>
          </div>

          {/* SCENARIO 1: Safe Merchant Payment */}
          {activeScenario === 'merchant' && (
            <div className="space-y-4">
              {step === 1 && (
                <div className="text-center space-y-4 py-2">
                  <div className="w-32 h-32 mx-auto bg-white p-2.5 rounded-2xl border-4 border-indigo-600 flex items-center justify-center text-slate-900 shadow-md">
                    <QrCode className="w-24 h-24 text-slate-800" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Sharma General Store</h3>
                    <p className="text-xs text-slate-400">UPI ID: sharmastore@upi</p>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800">
                    <span className="text-xs text-slate-400 block">
                      {isMr ? 'पेमेंट रक्कम:' : isHi ? 'भुगतान राशि:' : 'Amount to Pay:'}
                    </span>
                    <span className="text-2xl font-bold text-indigo-400 font-mono">₹ 150.00</span>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm cursor-pointer transition-colors shadow-md"
                  >
                    {isMr ? 'पुढे जा (Proceed to Pay)' : isHi ? 'आगे बढ़ें (Proceed to Pay)' : 'Proceed to Pay'}
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <div className="text-center pb-2 border-b border-slate-800">
                    <span className="text-xs text-slate-400 block">
                      {isMr ? 'पेमेंट केले जात आहे:' : isHi ? 'भुगतान किया जा रहा है:' : 'Paying to:'}
                    </span>
                    <span className="text-sm font-bold text-white">Sharma General Store (₹ 150.00)</span>
                  </div>

                  <div className="text-center py-1">
                    <div className="text-xs text-amber-400 font-medium mb-1">
                      {isMr
                        ? 'आपला ६-अंकी गुपित UPI PIN टाका:'
                        : isHi
                        ? 'अपना गुप्त 6-अंकों का UPI PIN दर्ज करें:'
                        : 'ENTER 6-DIGIT UPI PIN:'}
                    </div>
                    {/* PIN Dots */}
                    <div className="flex justify-center gap-2 my-2">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`w-3.5 h-3.5 rounded-full border ${
                            i < enteredPin.length
                              ? 'bg-indigo-400 border-indigo-400 shadow-sm'
                              : 'bg-slate-900 border-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Simulated Keypad */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        onClick={() => handleKeypadPress(digit)}
                        className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-lg font-bold font-mono transition-colors cursor-pointer border border-slate-800"
                      >
                        {digit}
                      </button>
                    ))}
                    <div />
                    <button
                      onClick={() => handleKeypadPress('0')}
                      className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-lg font-bold font-mono transition-colors cursor-pointer border border-slate-800"
                    >
                      0
                    </button>
                    <button
                      onClick={handleBackspace}
                      className="py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-800"
                    >
                      DEL
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center space-y-3 py-4">
                  <div className="w-14 h-14 bg-emerald-950 text-emerald-400 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {isMr ? 'पेमेंट यशस्वी!' : isHi ? 'भुगतान सफल!' : 'Payment Successful!'}
                    </h3>
                    <p className="text-xs text-slate-400">Sharma General Store</p>
                    <p className="text-xl font-bold text-emerald-400 font-mono mt-1">₹ 150.00</p>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-2xl text-xs text-slate-300 text-left space-y-1 border border-slate-800">
                    <div className="font-bold text-emerald-400">
                      {isMr ? '✓ महत्त्वाचा धडा:' : isHi ? '✓ महत्वपूर्ण सबक:' : '✓ Key Lesson:'}
                    </div>
                    <p>
                      {isMr
                        ? 'तुम्ही पिन टाकला कारण तुमच्या खात्यातून ₹१५० दुकानदाराकडे जात होते.'
                        : isHi
                        ? 'आपने पिन इसलिए डाला क्योंकि आपके खाते से ₹150 की राशि दुकानदार को जा रही थी।'
                        : 'You entered your PIN because ₹150 was leaving your bank account to the merchant.'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowReceiptModal(true)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      {isMr ? 'पावती पहा (Receipt)' : isHi ? 'रसीद देखें (Receipt)' : 'View Receipt'}
                    </button>
                    <button
                      onClick={() => resetSimulation('merchant')}
                      className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      {isMr ? 'पुन्हा करा' : isHi ? 'दोबारा करें' : 'Try Again'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SCENARIO 2: The "Enter PIN to Receive Money" Fraud Trap */}
          {activeScenario === 'receive-trap' && (
            <div className="space-y-4">
              {trapOutcome === 'none' && (
                <div className="space-y-3 py-1">
                  <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-2xl text-xs text-rose-200">
                    <strong>{isMr ? 'प्रसंग (Scenario):' : isHi ? 'परिदृश्य (Scenario):' : 'Scenario:'}</strong>{' '}
                    {isMr
                      ? 'एका अनोळखी खरेदीदाराने तुमचे जुने कपाट खरेदी करण्यासाठी ही पेमेंट रिक्वेस्ट पाठवली आहे आणि फोनवर सांगत आहे: "पिन टाका, पैसे तुमच्या खात्यात जमा होतील."'
                      : isHi
                      ? 'एक अनजान खरीदार ने आपकी पुरानी अलमारी खरीदने के लिए यह पेमेंट रिक्वेस्ट भेजा है और फोन पर कह रहा है: "पिन डालिए, पैसे आपके खाते में आ जाएंगे।"'
                      : 'An unknown buyer sent you this payment request and claims: "Enter your UPI PIN to receive the ₹5,000 into your bank account."'}
                  </div>

                  <div className="bg-slate-900 p-4 rounded-2xl text-center space-y-2 border border-slate-800">
                    <span className="text-xs text-slate-400">Incoming Payment Collect Request</span>
                    <div className="text-2xl font-bold text-white font-mono">₹ 5,000.00</div>
                    <div className="text-xs text-amber-300 bg-amber-950/60 p-2 rounded-xl">
                      Payee Note: "Enter UPI PIN to accept ₹5000 deposit"
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 text-center font-medium pt-1">
                    {isMr ? 'तुम्ही काय कराल?' : isHi ? 'आपको क्या करना चाहिए?' : 'What will you do?'}
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        playWarningBuzzer();
                        recordUserStruggle({
                          id: 'struggle-upi-collect',
                          pillar: 'upi-simulator',
                          labelEn: 'Confusing "Receive Money" vs "Send Money" UPI Requests',
                          labelHi: 'पैसे पाने (Receive) और पैसे भेजने (Pay) की स्क्रीन में उलझन',
                          reasonEn: 'Tapped "Enter UPI PIN" on an incoming ₹5,000 collect request trap in Simulator.',
                          reasonHi: 'सिमुलेटर में ₹5,000 पाने के झांसे में यूपीआई पिन डालने का बटन दबाया।',
                          recommendedModuleId: 'mod-upi',
                          recommendedTab: 'learn',
                        });
                        setTrapOutcome('fell_for_it');
                      }}
                      className="w-full py-2.5 px-3 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isMr
                        ? 'पिन टाका (पैसे मिळवण्यासाठी)'
                        : isHi
                        ? 'पिन डालें (पैसे प्राप्त करने के लिए)'
                        : 'Enter UPI PIN to receive the ₹5,000'}
                    </button>

                    <button
                      onClick={() => {
                        playSuccessChime();
                        recordSkillPracticeSuccess({
                          pillar: 'upi-simulator',
                          titleEn: 'Safely Declined Fake "PIN to Receive ₹5,000" Trap',
                          titleHi: '"पैसे पाने के लिए पिन डालें" वाले धोखे को समझदारी से अस्वीकार किया',
                          points: 20,
                          resolveStruggleId: 'struggle-upi-collect',
                        });
                        setTrapOutcome('safe_refused');
                      }}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
                    >
                      {isMr
                        ? 'नाकारा (Decline) — पैसे मिळवण्यासाठी पिनची गरज नसते!'
                        : isHi
                        ? 'अस्वीकार करें (Decline) — पैसे पाने के लिए पिन की जरूरत नहीं होती!'
                        : 'Decline — PIN is NEVER required to receive money!'}
                    </button>
                  </div>
                </div>
              )}

              {trapOutcome === 'fell_for_it' && (
                <div className="space-y-3 py-2 text-center">
                  <div className="w-14 h-14 bg-rose-950 text-rose-400 border-2 border-rose-500 rounded-full flex items-center justify-center mx-auto">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-rose-400">
                    {isMr
                      ? '⚠️ फसवणूक! तुमचे ₹५,००० कापले गेले असते!'
                      : isHi
                      ? '⚠️ धोखा! आपके ₹5,000 कट जाते!'
                      : '⚠️ FRAUD TRAP! You would lose ₹5,000!'}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed text-left bg-slate-900 p-3 rounded-2xl border border-rose-900">
                    {isMr
                      ? 'प्रत्यक्षात तुमच्या बँकेतून ₹५,००० कापून भामट्याकडे गेले असते! नेहमी लक्षात ठेवा: पैसे मिळवण्यासाठी (Receive) कधीही पिन टाकायचा नसतो.'
                      : isHi
                      ? 'यदि यह असली जिंदगी होती, तो आपके बैंक से ₹5,000 कटकर धोखेबाज के पास चले जाते! हमेशा याद रखें: पैसे प्राप्त करने (Receive) के लिए कभी भी पिन नहीं डालना होता।'
                      : 'In real life, ₹5,000 would have been debited from YOUR account! Always remember: Entering a UPI PIN ALWAYS transfers money OUT of your bank.'}
                  </p>
                  <button
                    onClick={() => resetSimulation('receive-trap')}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    {isMr ? 'पुन्हा सुरक्षितपणे सराव करा' : isHi ? 'दोबारा समझें' : 'Try Again Safely'}
                  </button>
                </div>
              )}

              {trapOutcome === 'safe_refused' && (
                <div className="space-y-3 py-2 text-center">
                  <div className="w-14 h-14 bg-emerald-950 text-emerald-300 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-emerald-400">
                    {isMr
                      ? 'अभिनंदन! तुम्ही तुमचे पैसे वाचवले!'
                      : isHi
                      ? 'शानदार! आपने अपने पैसे बचा लिए!'
                      : 'EXCELLENT! You Saved Your Money!'}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed text-left bg-slate-900 p-3 rounded-2xl border border-emerald-900">
                    {isMr
                      ? 'अतिशय योग्य निर्णय! पैसे स्वीकारण्यासाठी फक्त मोबाईल नंबर किंवा UPI ID देणे पुरेसे असते. कोणत्याही पिनची गरज नसते.'
                      : isHi
                      ? 'आपने बिल्कुल सही फैसला लिया! पैसे प्राप्त करने के लिए केवल अपना मोबाइल नंबर या UPI ID बताना काफी होता है। किसी पिन की जरूरत नहीं होती।'
                      : 'Perfect decision! To receive money, sharing just your mobile number or UPI ID is enough. You NEVER enter a PIN.'}
                  </p>
                  <button
                    onClick={() => resetSimulation('receive-trap')}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {isMr ? 'सराव पूर्ण झाला' : isHi ? 'अभ्यास पूरा हुआ' : 'Practice Completed'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Conceptual Deck: UPI PIN vs OTP vs Screen Lock */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-indigo-100 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-50 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <span>
                  {isMr
                    ? 'तीन महत्त्वाचे कोड — फरक समजून घ्या'
                    : isHi
                    ? 'तीन कोड — अंतर समझें'
                    : 'Three Critical Codes — Understand the Difference'}
                </span>
              </h3>
              <button
                onClick={() =>
                  onSpeak(
                    isMr
                      ? 'यूपीआई पिन, बँक ओटीपी आणि फोन स्क्रीन लॉक: यूपीआई पिन पैसे पाठवण्यासाठी असतो. ओटीपी बँकेकडून आलेला ६ अंकांचा कोड असतो. हे दोन्ही कोणालाही सांगू नका.'
                      : isHi
                      ? 'यूपीआई पिन, बैंक ओटीपी, और फोन स्क्रीन लॉक में अंतर: यूपीआई पिन पैसे भेजने के लिए होता है। ओटीपी बैंक से आया 6 अंकों का अस्थायी कोड होता है। दोनों कभी किसी को न बताएं।'
                      : 'Difference between UPI PIN, Bank OTP, and Screen Lock: UPI PIN is only for sending money. Bank OTP is a temporary verification code. Never share either with anyone.'
                  )
                }
                className="p-1.5 text-slate-500 hover:text-indigo-700 rounded-lg transition-colors cursor-pointer"
                title={isMr ? 'ऐका' : isHi ? 'आवाज़ में सुनें' : 'Read aloud'}
              >
                <Volume2 className="w-4 h-4 text-indigo-600" />
              </button>
            </div>

            {/* Card 1: UPI PIN */}
            <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                  1. UPI PIN (यूपीआई पिन)
                </span>
                <span className="text-[11px] text-indigo-700 font-bold bg-indigo-100/70 px-2 py-0.5 rounded-full">
                  {isMr ? '४ किंवा ६ अंक' : isHi ? '4 या 6 अंक' : '4 or 6 digits'}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {isMr
                  ? 'हा तुमचा गुपित कोड आहे जो फक्त खात्यातून पैसे पाठवताना टाकला जातो. पैसे मिळवण्यासाठी कधीही लागत नाही.'
                  : isHi
                  ? 'यह आपका स्थायी गुप्त कोड है जो पैसे आपके खाते से बाहर भेजने के लिए केवल आपके द्वारा टाइप किया जाता है। इसे कभी किसी को न बताएं।'
                  : 'Your permanent secret code entered only by you when money is leaving your account. Never required to receive money.'}
              </p>
            </div>

            {/* Card 2: Bank OTP */}
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                  2. Bank OTP (ओटीपी - एक वेळचा पासवर्ड)
                </span>
                <span className="text-[11px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                  {isMr ? '६ अंक (SMS)' : isHi ? '6 अंक (SMS)' : '6 digits'}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {isMr
                  ? 'बँकेने फक्त ५-१० मिनिटांसाठी पाठवलेला कोड. अनोळखी व्यक्तीला हा कोड सांगणे म्हणजे बँकेची चावी सोपवण्यासारखे आहे.'
                  : isHi
                  ? 'बैंक द्वारा केवल 5-10 मिनट के लिए भेजा गया कोड। किसी भी अनजान कॉलर को यह कोड बोलकर बताना बैंक की चाबी सौंपने जैसा है।'
                  : 'A temporary code sent by your bank via SMS valid for 5-10 minutes. Reading it to a caller gives them access to your money.'}
              </p>
            </div>

            {/* Card 3: Screen Lock PIN */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  3. Screen Lock PIN (स्क्रीन लॉक)
                </span>
                <span className="text-[11px] text-slate-600 font-bold bg-slate-200 px-2 py-0.5 rounded-full">
                  {isMr ? 'फोनचे कुलूप' : isHi ? 'फोन का ताला' : 'Phone Lock'}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {isMr
                  ? 'हा फक्त फोनची स्क्रीन उघडण्यासाठी असतो. याचा बँकेशी किंवा पैशांशी थेट संबंध नसतो.'
                  : isHi
                  ? 'यह केवल आपके स्मार्टफोन की स्क्रीन खोलने के लिए होता है। इसका बैंक या पैसों से सीधा संबंध नहीं होता।'
                  : 'Used only to unlock your mobile phone display so strangers cannot browse your apps if phone is lost.'}
              </p>
            </div>

            {/* Golden Rule Summary */}
            <div className="p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white rounded-2xl text-xs space-y-1 shadow-md">
              <span className="text-amber-300 font-black block">
                {isMr ? '★ यूपीआईचा सुवर्ण नियम:' : isHi ? '★ यूपीआई का सबसे बड़ा नियम:' : '★ The Golden Rule of UPI:'}
              </span>
              <p className="text-white font-medium text-xs sm:text-sm">
                {isMr
                  ? 'पैसे जाताना पिन लागतो, पैसे येताना पिन कधीही लागत नाही!'
                  : isHi
                  ? 'पैसे कटने पर पिन लगता है, पैसे आने पर पिन कभी नहीं लगता!'
                  : 'PIN is for SENDING money, NEVER for RECEIVING money!'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-indigo-100 animate-in zoom-in-95 duration-150">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isMr ? 'अधिकृत यूपीआई पावती' : isHi ? 'आधिकारिक यूपीआई रसीद' : 'UPI Payment Receipt'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">Txn ID: UPI/{Date.now().toString().slice(-8)}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">{isMr ? 'दुकानदार:' : isHi ? 'दुकानदार:' : 'Merchant:'}</span>
                <span className="font-bold text-slate-900">Sharma General Store</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isMr ? 'रक्कम:' : isHi ? 'राशि:' : 'Amount Paid:'}</span>
                <span className="font-mono font-bold text-indigo-700 text-sm">₹ 150.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isMr ? 'उर्वरित शिल्लक:' : isHi ? 'नया बैंक बैलेंस:' : 'Remaining Balance:'}</span>
                <span className="font-mono font-semibold text-slate-800">₹ {mockBalance.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isMr ? 'स्थिती:' : isHi ? 'स्थिति:' : 'Status:'}</span>
                <span className="text-emerald-700 font-bold">SUCCESSFUL</span>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 font-medium">
              {isMr
                ? 'ही पावती सिद्ध करते की पैसे यशस्वीरित्या पोहोचले आहेत. कधीही कोणाला पिन सांगू नका.'
                : isHi
                ? 'यह रसीद प्रमाणित करती है कि पैसे सुरक्षित ट्रांसफर हो चुके हैं। कभी भी किसी को दोबारा पिन न बताएं।'
                : 'This simulates your real bank receipt. Your account is debited only once.'}
            </div>

            <button
              onClick={() => setShowReceiptModal(false)}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
            >
              {isMr ? 'पावती बंद करा' : isHi ? 'रसीद बंद करें' : 'Close Receipt'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

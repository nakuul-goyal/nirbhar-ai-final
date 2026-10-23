import React, { useState } from 'react';
import {
  Globe,
  User,
  Sparkles,
  CheckCircle2,
  Volume2,
  ShieldCheck,
  ChevronRight,
  LogOut,
  X,
  Compass,
} from 'lucide-react';
import { Language } from '../types';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  saveUserProfile,
  DigitalLevel,
  UserProfileData,
} from '../firebase';
import { playKeypadClick, playSuccessChime } from '../utils/audioEffects';

interface OnboardingLandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  currentLevel: DigitalLevel;
  onSelectLevel: (level: DigitalLevel) => void;
  onSpeak: (text: string) => void;
  userProfile: UserProfileData | null;
  onProfileUpdated?: (profile: UserProfileData) => void;
}

export const OnboardingLandingModal: React.FC<OnboardingLandingModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage,
  currentLevel,
  onSelectLevel,
  onSpeak,
  userProfile,
  onProfileUpdated,
}) => {
  const [selectedLang, setSelectedLang] = useState<Language>(currentLanguage);
  const [selectedLevel, setSelectedLevel] = useState<DigitalLevel>(currentLevel);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [guestName, setGuestName] = useState<string>(
    userProfile?.displayName || localStorage.getItem('nirbhar_guest_name') || ''
  );

  if (!isOpen) return null;

  const isHi = selectedLang === 'hi';
  const isMr = selectedLang === 'mr';

  const languages: {
    id: Language;
    nativeName: string;
    subtext: string;
    description: string;
    flag: string;
  }[] = [
    {
      id: 'hi',
      nativeName: 'हिंदी (Hindi)',
      subtext: 'सरल हिंदी आवाज और बड़े अक्षर',
      description: 'स्क्रीनशॉट सहायता, आवाज द्वारा प्रश्न, और यूपीआई अभ्यास हिंदी में।',
      flag: '🇮🇳',
    },
    {
      id: 'mr',
      nativeName: 'मराठी (Marathi)',
      subtext: 'सोपी मराठी भाषा आणि व्हॉइस मार्गदर्शन',
      description: 'डिजिटल पेमेंट, फसवणूक संदेश ओळख, आणि सरकारी सेवा माहिती मराठीत.',
      flag: '🇮🇳',
    },
    {
      id: 'en',
      nativeName: 'English',
      subtext: 'Clear, step-by-step simple English',
      description: 'Voice assistance, scam analyzer, safe UPI simulator, and digital skills.',
      flag: '🌐',
    },
  ];

  const levels: {
    id: DigitalLevel;
    titleEn: string;
    titleHi: string;
    titleMr: string;
    badgeEn: string;
    badgeHi: string;
    badgeMr: string;
    descEn: string;
    descHi: string;
    descMr: string;
    featuresEn: string[];
    featuresHi: string[];
    featuresMr: string[];
  }[] = [
    {
      id: 'beginner',
      titleEn: 'Beginner',
      titleHi: 'शुरुआती (नवसिखिया)',
      titleMr: 'नवशिक्या (सुरुवात)',
      badgeEn: 'Gentle & Extra Patient',
      badgeHi: 'अति-सरल व धैर्यपूर्ण',
      badgeMr: 'अतिशय सोपे व सावकाश',
      descEn: 'For new smartphone users who want step-by-step guidance, very clear voice instructions, and large icons.',
      descHi: 'स्मार्टफोन के नए उपयोगकर्ताओं के लिए। धीमी आवाज में मार्गदर्शन, बड़े अक्षर और एक-एक कदम की सीख।',
      descMr: 'स्मार्टफोन वापरणाऱ्या नवीन नागरिकांसाठी. सावकाश बोलणारा सोबती आणि सोप्या पायऱ्या.',
      featuresEn: ['Extra slow audio guidance', 'One-click daily basic skills', 'Safe zero-risk practice'],
      featuresHi: ['अति-धीमी आवाज में मार्गदर्शन', 'दैनिक बुनियादी 3-कदम टिप्स', 'बिना पैसे का सुरक्षित अभ्यास'],
      featuresMr: ['सावकाश व्हॉइस सूचना', 'दररोजचे सोपे ३-पायऱ्या नियम', 'बिनपैशांचा सुरक्षित सराव'],
    },
    {
      id: 'standard',
      titleEn: 'Standard',
      titleHi: 'मध्यम (सामान्य उपयोगकर्ता)',
      titleMr: 'मध्यम (नियमित वापरकर्ता)',
      badgeEn: 'Most Popular',
      badgeHi: 'सबसे लोकप्रिय',
      badgeMr: 'सर्वात लोकप्रिय',
      descEn: 'Can use basic apps like WhatsApp & YouTube. Wants to master safe UPI payments, scan QR codes, and spot fake SMS.',
      descHi: 'व्हाट्सएप और यूट्यूब चलाना जानते हैं। अब सुरक्षित यूपीआई, बिजली बिल भुगतान और फर्जी संदेश पहचानना सीखना चाहते हैं।',
      descMr: 'व्हॉट्सॲप वापरता येते. सुरक्षित यूपीआई पेमेंट, क्यूआर कोड स्कॅनिंग आणि फसव्या मेसेजपासून बचाव शिकायचा आहे.',
      featuresEn: ['Safe UPI simulator tests', 'Scam message risk analyzer', 'Govt service documents checklist'],
      featuresHi: ['सुरक्षित यूपीआई पेमेंट सिमुलेटर', 'फर्जी संदेश जांच और हेल्पलाइन', 'सरकारी योजनाओं के जरूरी दस्तावेज'],
      featuresMr: ['यूपीआई सिमुलेटर सराव', 'फसव्या मेसेजची सत्यता तपासणी', 'सरकारी योजनांची कागदपत्र यादी'],
    },
    {
      id: 'pro',
      titleEn: 'Pro',
      titleHi: 'अनुभवी (तज्ज्ञ / डिजिटल गुरु)',
      titleMr: 'अनुभवी (डिजिटल गुरु)',
      badgeEn: 'Advanced Protection',
      badgeHi: 'उन्नत सुरक्षा व कौशल्य',
      badgeMr: 'प्रगत सुरक्षा कौशल्ये',
      descEn: 'Comfortable with technology. Wants deep scam analysis, phishing link forensics, and advanced digital security tips.',
      descHi: 'डिजिटल सेवाओं में सहज हैं। उन्नत साइबर सुरक्षा, फिशिंग लिंक विश्लेषण और परिवार को सुरक्षित रखने के गुर चाहते हैं।',
      descMr: 'तंत्रज्ञानात सरावलेले. प्रगत सायबर सुरक्षा, संशयास्पद लिंक्स तपासणी आणि संपूर्ण डिजिटल स्वावलंबन.',
      featuresEn: ['Fast-track audio speeds', 'Detailed scam threat heuristics', 'Full learning dashboard tracking'],
      featuresHi: ['तेज गति का ऑडियो', 'विस्तृत साइबर सुरक्षा विश्लेषण', 'पूर्ण व्यक्तिगत प्रगति ट्रैकिंग'],
      featuresMr: ['जलद व्हॉइस गती', 'सखोल सायबर धोका विश्लेषण', 'संपूर्ण प्रगती अहवाल'],
    },
  ];

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      playKeypadClick();
      const user = await signInWithGoogle();
      playSuccessChime();

      const profilePayload: UserProfileData = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Learner',
        photoURL: user.photoURL || '',
        language: selectedLang,
        level: selectedLevel,
        points: userProfile?.points || 100,
        completedTips: userProfile?.completedTips || [],
        struggles: userProfile?.struggles || [],
      };

      await saveUserProfile(profilePayload);
      if (onProfileUpdated) onProfileUpdated(profilePayload);
      onSelectLanguage(selectedLang);
      onSelectLevel(selectedLevel);
    } catch (err) {
      console.error('Sign-in failed:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      playKeypadClick();
      await signOutUser();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const handleFinish = async () => {
    playSuccessChime();
    onSelectLanguage(selectedLang);
    onSelectLevel(selectedLevel);

    if (guestName.trim()) {
      localStorage.setItem('nirbhar_guest_name', guestName.trim());
    }
    localStorage.setItem('nirbhar_level', selectedLevel);
    localStorage.setItem('nirbhar_language', selectedLang);
    localStorage.setItem('nirbhar_onboarding_completed', 'true');

    if (auth.currentUser) {
      const updatedProfile: UserProfileData = {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email || '',
        displayName: auth.currentUser.displayName || guestName || 'Learner',
        photoURL: auth.currentUser.photoURL || '',
        language: selectedLang,
        level: selectedLevel,
        points: userProfile?.points || 100,
        completedTips: userProfile?.completedTips || [],
        struggles: userProfile?.struggles || [],
      };
      try {
        await saveUserProfile(updatedProfile);
        if (onProfileUpdated) onProfileUpdated(updatedProfile);
      } catch (e) {
        console.warn('Profile save warning:', e);
      }
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="landing-modal-title"
    >
      <div className="bg-white rounded-3xl border border-indigo-100 max-w-2xl w-full shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header Banner with NIRBHAR AI Brand Gradient */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-2xl shadow-inner">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-md">
                  NIRBHAR AI
                </span>
                <span className="text-xs text-indigo-200">
                  {isMr ? 'स्वागत आहे' : isHi ? 'स्वागत है' : 'Welcome'}
                </span>
              </div>
              <h2 id="landing-modal-title" className="text-xl sm:text-2xl font-black mt-0.5">
                {isMr
                  ? 'आपली भाषा व शिकण्याची पातळी निवडा'
                  : isHi
                  ? 'अपनी भाषा और सीखने का स्तर चुनें'
                  : 'Select Language, Profile & Skill Level'}
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100 mt-1">
                {isMr
                  ? 'डिजिटल साक्षरता आणि स्वावलंबनासाठी आपले वैयक्तिक सेटिंग्ज'
                  : isHi
                  ? 'डिजिटल साक्षरता और स्वावलंबन के लिए आपकी व्यक्तिगत सेटिंग्स'
                  : 'Tailor your personalized digital literacy companion'}
              </p>
            </div>
          </div>

          {/* Stepper Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/15">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeStep === 1
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'bg-white/10 text-white/80 hover:bg-white/15'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>1. {isMr ? 'भाषा' : isHi ? 'भाषा' : 'Language'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeStep === 2
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'bg-white/10 text-white/80 hover:bg-white/15'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>2. {isMr ? 'प्रोफाइल' : isHi ? 'प्रोफाइल' : 'Profile'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeStep === 3
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'bg-white/10 text-white/80 hover:bg-white/15'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>3. {isMr ? 'पातळी' : isHi ? 'स्तर' : 'Level'}</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* STEP 1: LANGUAGE SELECTION */}
          {activeStep === 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isMr ? 'पायरी १: आपली आवडती भाषा निवडा' : isHi ? 'चरण 1: अपनी पसंदीदा भाषा चुनें' : 'Step 1: Choose Your Preferred Language'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isMr ? 'स्क्रीनवरील सर्व माहिती आणि रोबोटचा आवाज याच भाषेत असेल' : isHi ? 'स्क्रीन पर सभी जानकारी और रोबोट की आवाज इसी भाषा में होगी' : 'All screen text and Nirbhar Buddy voice assistance will follow this language'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {languages.map((lang) => {
                  const isSelected = selectedLang === lang.id;
                  return (
                    <div
                      key={lang.id}
                      onClick={() => {
                        playKeypadClick();
                        setSelectedLang(lang.id);
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-md ring-2 ring-indigo-200'
                          : 'border-slate-200 hover:border-indigo-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{lang.flag}</span>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-indigo-600 fill-indigo-100" />
                          )}
                        </div>
                        <h4 className="font-extrabold text-base text-slate-900 mt-2">
                          {lang.nativeName}
                        </h4>
                        <p className="text-xs font-semibold text-indigo-700 mt-0.5">
                          {lang.subtext}
                        </p>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                          {lang.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (lang.id === 'hi') {
                            onSpeak('नमस्ते! मैं निर्भर एआई हूँ, आपका डिजिटल साथी।');
                          } else if (lang.id === 'mr') {
                            onSpeak('नमस्कार! मी निर्भर एआय आहे, तुमचा डिजिटल सोबती.');
                          } else {
                            onSpeak('Hello! I am Nirbhar AI, your digital learning companion.');
                          }
                        }}
                        className="mt-3 py-1.5 px-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-700 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isMr ? 'आवाज ऐका' : isHi ? 'आवाज सुनें' : 'Sample Voice'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: PROFILE & FIREBASE GOOGLE SIGN-IN */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isMr ? 'पायरी २: आपले प्रोफाइल' : isHi ? 'चरण 2: अपनी प्रोफाइल' : 'Step 2: Choose Your Profile'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isMr ? 'आपली प्रगती सर्व डिव्हाइसवर जतन करण्यासाठी गुगलने साइन इन करा किंवा अतिथी म्हणून सुरू ठेवा' : isHi ? 'अपनी प्रगति सुरक्षित रखने के लिए गूगल से साइन इन करें या सीधे शुरू करें' : 'Sign in with Google to save your learning progress securely to the cloud or continue locally'}
                </p>
              </div>

              {auth.currentUser ? (
                /* Signed-in user card */
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {auth.currentUser.photoURL ? (
                      <img
                        src={auth.currentUser.photoURL}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full border-2 border-indigo-500"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-lg">
                        {auth.currentUser.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900">
                          {auth.currentUser.displayName || 'Learner'}
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                          Cloud Synced ✓
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{auth.currentUser.email}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="py-1.5 px-3 rounded-xl border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{isMr ? 'बाहेर पडा' : isHi ? 'लॉगआउट' : 'Sign Out'}</span>
                  </button>
                </div>
              ) : (
                /* Google Sign-in Card */
                <div className="p-5 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-white shadow-xs border border-indigo-100 flex items-center justify-center text-xl">
                    🔐
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900">
                      {isMr ? 'गुगल खात्याद्वारे १-क्लिक साइन इन' : isHi ? 'गूगल खाते से 1-क्लिक साइन इन' : '1-Click Sign In with Google'}
                    </h4>
                    <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                      {isMr
                        ? 'कोणताही पासवर्ड लक्षात ठेवण्याची गरज नाही. आपली दैनंदिन प्रगती, बॅज आणि गुण क्लाउडवर सुरक्षित राहतील.'
                        : isHi
                        ? 'पासवर्ड याद रखने की कोई जरूरत नहीं। आपकी दैनिक सीखने की प्रगति और अभ्यास रिकॉर्ड सुरक्षित रहेगा।'
                        : 'No password needed. Sync your daily tips, UPI simulator score, and progress across all your devices.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSigningIn}
                    className="mx-auto py-2.5 px-6 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>
                      {isSigningIn
                        ? isMr ? 'साइन इन होत आहे...' : isHi ? 'साइन इन हो रहा है...' : 'Signing in...'
                        : isMr ? 'गुगल खात्यासह साइन इन करा' : isHi ? 'गूगल के साथ साइन इन करें' : 'Sign in with Google'}
                    </span>
                  </button>
                </div>
              )}

              {/* Guest / Device Name input */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {isMr ? 'किंवा आपले नाव लिहा (अतिथी मोड):' : isHi ? 'या अपना नाम लिखें (अतिथि मोड):' : 'Or Your Name (Guest Learner Mode):'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder={isMr ? 'उदा. रमेश पाटील' : isHi ? 'उदा. रमेश कुमार' : 'e.g. Ramesh Kumar'}
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isMr
                    ? 'नाव न दिल्यास तुम्ही "अतिथी" म्हणून लगेच शिकणे सुरू करू शकता.'
                    : isHi
                    ? 'नाम नहीं भरने पर भी आप सीधे अतिथि के रूप में सीख सकते हैं।'
                    : 'You can also proceed without entering a name as a guest learner.'}
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: PROFICIENCY OPTIONS: BEGINNER, STANDARD, PRO */}
          {activeStep === 3 && (
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isMr ? 'पायरी ३: आपली डिजिटल पातळी निवडा' : isHi ? 'चरण 3: अपना डिजिटल स्तर चुनें' : 'Step 3: Choose Your Learning Level'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isMr
                    ? 'या आधारे रोबोट तुम्हाला योग्य गती आणि सोप्या उदाहरणांसह मार्गदर्शन करेल'
                    : isHi
                    ? 'इसके आधार पर रोबोट आपको सही गति और आसान उदाहरणों से मार्गदर्शन देगा'
                    : 'Select Beginner, Standard, or Pro to adapt the voice speed, guidance tone, and difficulty'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-1">
                {levels.map((lvl) => {
                  const isSelected = selectedLevel === lvl.id;
                  const title = isMr ? lvl.titleMr : isHi ? lvl.titleHi : lvl.titleEn;
                  const badge = isMr ? lvl.badgeMr : isHi ? lvl.badgeHi : lvl.badgeEn;
                  const desc = isMr ? lvl.descMr : isHi ? lvl.descHi : lvl.descEn;
                  const features = isMr ? lvl.featuresMr : isHi ? lvl.featuresHi : lvl.featuresEn;

                  return (
                    <div
                      key={lvl.id}
                      onClick={() => {
                        playKeypadClick();
                        setSelectedLevel(lvl.id);
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 text-left ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-md ring-2 ring-indigo-200'
                          : 'border-slate-200 hover:border-indigo-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-slate-900 text-base">
                            {title}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              lvl.id === 'beginner'
                                ? 'bg-emerald-100 text-emerald-800'
                                : lvl.id === 'standard'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {badge}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {desc}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] text-slate-500 font-medium">
                          {features.map((feat, idx) => (
                            <span key={idx} className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                              <span>{feat}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (lvl.id === 'beginner') {
                              onSpeak(
                                isMr
                                  ? 'सुरुवातीच्या पातळीत मी तुम्हाला अगदी सावकाश आणि एक-एक पायरी समजावून सांगेन.'
                                  : isHi
                                  ? 'शुरुआती स्तर में मैं आपको बहुत धीमी और आसान आवाज में एक-एक कदम सिखाऊंगा।'
                                  : 'In Beginner mode, I will speak extra slowly and explain every step simply.'
                              );
                            } else if (lvl.id === 'standard') {
                              onSpeak(
                                isMr
                                  ? 'मध्यम पातळीत आपण यूपीआई पेमेंट, क्यूआर स्कॅनिंग आणि फसव्या मेसेजपासून बचाव शिकू.'
                                  : isHi
                                  ? 'मध्यम स्तर में हम यूपीआई पेमेंट, क्यूआर कोड और फ्रॉड मैसेज से बचाव सीखेंगे।'
                                  : 'In Standard mode, we practice UPI payments, QR codes, and scam message checks.'
                              );
                            } else {
                              onSpeak(
                                isMr
                                  ? 'अनुभवी पातळीत आपण सायबर सुरक्षा, डीजीलॉकर आणि प्रगत डिजिटल टूल्स हाताळू.'
                                  : isHi
                                  ? 'अनुभवी स्तर में हम साइबर सुरक्षा, डिजिलॉकर और डिजिटल स्वावलंबन के गुर सीखेंगे।'
                                  : 'In Pro mode, we explore advanced digital security, forensics, and quick shortcuts.'
                              );
                            }
                          }}
                          className="py-1.5 px-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          title="Preview Guidance"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{isMr ? 'नमुना ऐका' : isHi ? 'नमूना सुनें' : 'Listen'}</span>
                        </button>

                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4 fill-indigo-600 text-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {activeStep > 1 ? (
            <button
              type="button"
              onClick={() => setActiveStep((prev) => prev - 1)}
              className="py-2 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold cursor-pointer transition-colors"
            >
              {isMr ? '← मागे' : isHi ? '← पीछे' : '← Back'}
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {activeStep < 3 ? (
              <button
                type="button"
                onClick={() => {
                  playKeypadClick();
                  setActiveStep((prev) => prev + 1);
                }}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-200 cursor-pointer transition-all"
              >
                <span>{isMr ? 'पुढील पायरी' : isHi ? 'अगला कदम' : 'Next Step'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg shadow-indigo-200 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isMr ? 'तयार! शिकणे सुरू करा' : isHi ? 'तैयार! सीखना शुरू करें' : 'Ready! Start Learning'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

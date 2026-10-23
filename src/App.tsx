import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AccessibilityBar } from './components/AccessibilityBar';
import { AssistantTab } from './components/AssistantTab';
import { ScreenshotTab } from './components/ScreenshotTab';
import { ScamDetectorTab } from './components/ScamDetectorTab';
import { PaymentSimulatorTab } from './components/PaymentSimulatorTab';
import { GovtServicesTab } from './components/GovtServicesTab';
import { LearningDashboardTab } from './components/LearningDashboardTab';
import { HumanAssistanceModal } from './components/HumanAssistanceModal';
import { OfflineCheatSheetModal } from './components/OfflineCheatSheetModal';
import { GuidedTourModal } from './components/GuidedTourModal';
import { AudioSpeakingBanner } from './components/AudioSpeakingBanner';
import { NirbharBuddyRobot } from './components/NirbharBuddyRobot';
import { OnboardingLandingModal } from './components/OnboardingLandingModal';
import { AccessibilitySettings, Language } from './types';
import { speakText, stopSpeaking } from './utils/speech';
import {
  auth,
  onAuthStateChanged,
  fetchUserProfile,
  saveUserProfile,
  UserProfileData,
  DigitalLevel,
  testConnection,
} from './firebase';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('assistant');
  const [isHelplineOpen, setIsHelplineOpen] = useState(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    try {
      const completed = localStorage.getItem('nirbhar_onboarding_completed');
      return !completed;
    } catch {
      return false;
    }
  });

  const [userLevel, setUserLevel] = useState<DigitalLevel>(() => {
    try {
      const saved = localStorage.getItem('nirbhar_level') as DigitalLevel;
      if (saved === 'beginner' || saved === 'standard' || saved === 'pro') {
        return saved;
      }
    } catch {
      // Fallback
    }
    return 'beginner';
  });

  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.85);
  const [activeSnippet, setActiveSnippet] = useState<string>('');

  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    let initialLang: Language = 'hi';
    try {
      const saved = localStorage.getItem('nirbhar_language') as Language;
      if (saved === 'en' || saved === 'hi' || saved === 'mr') {
        initialLang = saved;
      }
    } catch {
      // ignore
    }
    return {
      language: initialLang,
      textScale: 'normal',
      highContrast: false,
      lowBandwidth: false,
      autoReadAloud: false,
    };
  });

  // Verify Firebase connection and listen to Auth state changes
  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const profile = await fetchUserProfile(currentUser.uid);
          if (profile) {
            setUserProfile(profile);
            if (profile.language) {
              setSettings((prev) => ({ ...prev, language: profile.language }));
            }
            if (profile.level) {
              setUserLevel(profile.level);
            }
          } else {
            // First time cloud profile creation
            const newProfile: UserProfileData = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Learner',
              photoURL: currentUser.photoURL || '',
              language: settings.language,
              level: userLevel,
              points: 100,
              completedTips: [],
              struggles: [],
            };
            await saveUserProfile(newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.warn('Firebase user profile sync warning:', err);
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSpeak = (text: string, customRate?: number) => {
    // If beginner, slightly slower voice
    const defaultRate = userLevel === 'beginner' ? 0.8 : userLevel === 'pro' ? 1.0 : 0.85;
    const rateToUse = customRate ?? defaultRate;
    setActiveSnippet(text.slice(0, 65) + (text.length > 65 ? '...' : ''));
    speakText(
      text,
      settings.language,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      rateToUse
    );
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  const handleToggleRate = () => {
    setSpeechRate((prev) => (prev <= 0.85 ? 1.0 : 0.85));
  };

  const handleChangeLanguage = (lang: Language) => {
    setSettings((prev) => ({ ...prev, language: lang }));
    try {
      localStorage.setItem('nirbhar_language', lang);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const handleChangeLevel = (lvl: DigitalLevel) => {
    setUserLevel(lvl);
    try {
      localStorage.setItem('nirbhar_level', lvl);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const isHi = settings.language === 'hi';
  const isMr = settings.language === 'mr';

  const textScaleClass =
    settings.textScale === 'xl'
      ? 'text-scale-xl'
      : settings.textScale === 'large'
      ? 'text-scale-large'
      : 'text-scale-normal';

  const contrastClass = settings.highContrast ? 'high-contrast-mode' : '';

  return (
    <div
      className={`min-h-screen flex flex-col bg-slate-50 text-slate-900 ${textScaleClass} ${contrastClass}`}
    >
      {/* 1. Top Bar Contract Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        language={settings.language}
        onOpenHelpline={() => setIsHelplineOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        userLevel={userLevel}
        userDisplayName={userProfile?.displayName}
        userPhotoURL={userProfile?.photoURL}
        isSignedIn={!!userProfile}
      />

      {/* 2. Global Accessibility & Senior Toolbar */}
      <AccessibilityBar
        settings={settings}
        onUpdateSettings={setSettings}
        isSpeaking={isSpeaking}
        onStopSpeaking={handleStopSpeaking}
        onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
        onOpenGuidedTour={() => setIsTourOpen(true)}
      />

      {/* 3. Main Viewport Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24">
        {currentTab === 'assistant' && (
          <AssistantTab
            language={settings.language}
            onSpeak={handleSpeak}
            onSelectTab={setCurrentTab}
            isSpeaking={isSpeaking}
          />
        )}

        {currentTab === 'screenshot' && (
          <ScreenshotTab language={settings.language} onSpeak={handleSpeak} />
        )}

        {currentTab === 'scam' && (
          <ScamDetectorTab
            language={settings.language}
            onSpeak={handleSpeak}
            onOpenHelpline={() => setIsHelplineOpen(true)}
          />
        )}

        {currentTab === 'simulator' && (
          <PaymentSimulatorTab language={settings.language} onSpeak={handleSpeak} />
        )}

        {currentTab === 'govt' && (
          <GovtServicesTab language={settings.language} onSpeak={handleSpeak} />
        )}

        {currentTab === 'learn' && (
          <LearningDashboardTab
            language={settings.language}
            onSpeak={handleSpeak}
            onSelectTab={setCurrentTab}
          />
        )}
      </main>

      {/* 4. Floating Audio Speaking Banner with Visual Equalizer & Halo */}
      <AudioSpeakingBanner
        isSpeaking={isSpeaking}
        language={settings.language}
        onStop={handleStopSpeaking}
        speechRate={speechRate}
        onToggleRate={handleToggleRate}
        activeSnippet={activeSnippet}
      />

      {/* 5. Floating 3D AI Robot Voice Assistant — Nirbhar Buddy */}
      <NirbharBuddyRobot
        language={settings.language}
        onChangeLanguage={handleChangeLanguage}
        onSpeak={handleSpeak}
        onStopSpeaking={handleStopSpeaking}
        isSpeaking={isSpeaking}
        onSelectTab={setCurrentTab}
        currentTab={currentTab}
      />

      {/* 6. Onboarding Landing Modal for Language, Profile & Skill Level */}
      <OnboardingLandingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        currentLanguage={settings.language}
        onSelectLanguage={handleChangeLanguage}
        currentLevel={userLevel}
        onSelectLevel={handleChangeLevel}
        onSpeak={handleSpeak}
        userProfile={userProfile}
        onProfileUpdated={(p) => setUserProfile(p)}
      />

      {/* 7. Other Modals */}
      <GuidedTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        language={settings.language}
        onSpeak={handleSpeak}
        onNavigateToTab={(tabId) => setCurrentTab(tabId)}
      />

      <HumanAssistanceModal
        isOpen={isHelplineOpen}
        onClose={() => setIsHelplineOpen(false)}
        language={settings.language}
      />

      <OfflineCheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
        language={settings.language}
        onSpeak={handleSpeak}
      />

      {/* 8. Clean Editorial Footer */}
      <footer className="bg-white/90 border-t border-indigo-100 mt-auto py-6 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-slate-900">NIRBHAR AI</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-bold text-indigo-700">
              Learn Digital. Live Independent.
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>
              {isMr
                ? 'ज्येष्ठ नागरिक आणि नवीन वापरकर्त्यांसाठी डिजिटल सोबती'
                : isHi
                ? 'वरिष्ठ नागरिकों और नव-उपयोगकर्ताओं के लिए डिजिटल साथी'
                : 'Empowering seniors and first-time smartphone users'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="hover:text-indigo-700 transition-colors cursor-pointer text-indigo-700 font-bold"
            >
              {isMr ? 'प्रोफाइल व पातळी' : isHi ? 'प्रोफाइल व स्तर' : 'Profile & Level'}
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              onClick={() => setIsTourOpen(true)}
              className="hover:text-slate-900 transition-colors cursor-pointer font-medium"
            >
              {isMr ? 'मार्गदर्शन टूर' : isHi ? 'मार्गदर्शन टूर (Guide)' : 'App Tour'}
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              onClick={() => setIsHelplineOpen(true)}
              className="hover:text-slate-900 transition-colors cursor-pointer font-medium"
            >
              {isMr ? 'हेल्पलाइन 1930' : isHi ? 'हेल्पलाइन 1930' : 'Cyber Helpline 1930'}
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              onClick={() => setIsCheatSheetOpen(true)}
              className="hover:text-slate-900 transition-colors cursor-pointer font-medium"
            >
              {isMr ? 'सुरक्षा नियम' : isHi ? 'सुरक्षा नियम' : 'Safety Rules'}
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>
              {isMr ? '१००% सुरक्षित व खाजगी' : isHi ? 'सुरक्षित व 100% निजी' : '100% Private & Safe'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

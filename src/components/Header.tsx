import React from 'react';
import { PhoneCall, User, Globe } from 'lucide-react';
import { Language } from '../types';
import { DigitalLevel } from '../firebase';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  language: Language;
  onOpenHelpline: () => void;
  onOpenOnboarding?: () => void;
  userLevel?: DigitalLevel;
  userDisplayName?: string;
  userPhotoURL?: string;
  isSignedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  language,
  onOpenHelpline,
  onOpenOnboarding,
  userLevel = 'beginner',
  userDisplayName,
  userPhotoURL,
  isSignedIn = false,
}) => {
  const isHi = language === 'hi';
  const isMr = language === 'mr';

  const navItems = [
    {
      id: 'assistant',
      label: isMr ? 'निर्भर AI सहायक' : isHi ? 'निर्भर AI सहायक' : 'AI Assistant',
    },
    {
      id: 'screenshot',
      label: isMr ? 'स्क्रीनशॉट मदत' : isHi ? 'स्क्रीनशॉट जांच' : 'Screenshot Help',
    },
    {
      id: 'scam',
      label: isMr ? 'फसवणूक तपासणी' : isHi ? 'धोखाधड़ी जांच' : 'Scam Detector',
    },
    {
      id: 'simulator',
      label: isMr ? 'UPI पेमेंट सराव' : isHi ? 'भुगतान अभ्यास' : 'Payment Sandbox',
    },
    {
      id: 'govt',
      label: isMr ? 'सरकारी सेवा' : isHi ? 'सरकारी सेवाएं' : 'Govt Services',
    },
    {
      id: 'learn',
      label: isMr ? 'शिका आणि प्रगती' : isHi ? 'सीखें व प्रगति' : 'Learn & Progress',
    },
  ];

  const getLevelLabel = () => {
    if (userLevel === 'beginner') return isMr ? 'नवशिक्या' : isHi ? 'शुरुआती' : 'Beginner';
    if (userLevel === 'standard') return isMr ? 'मध्यम' : isHi ? 'मध्यम' : 'Standard';
    return isMr ? 'तज्ज्ञ' : isHi ? 'तज्ज्ञ' : 'Pro';
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark & Tagline */}
        <button
          onClick={() => onSelectTab('assistant')}
          className="text-left cursor-pointer transition-opacity hover:opacity-90 whitespace-nowrap shrink-0 flex items-center gap-3"
        >
          {/* Futuristic Blue-Purple Emblem */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0">
            N
          </div>
          <div>
            <span className="block text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-none">
              NIRBHAR{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI
              </span>
            </span>
            <span className="block text-[11px] font-semibold text-slate-500 mt-1">
              {isMr
                ? 'Learn Digital. Live Independent. · डिजिटल शिका. स्वावलंबी जगा.'
                : isHi
                ? 'Learn Digital. Live Independent. · डिजिटल सीखें। आत्मनिर्भर जिएं।'
                : 'Learn Digital. Live Independent.'}
            </span>
          </div>
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-600">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1 ${
                  isActive
                    ? 'text-indigo-900 font-bold border-b-2 border-indigo-600'
                    : 'hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Profile & Helpline Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Profile / Level button that opens Onboarding Landing Modal */}
          {onOpenOnboarding && (
            <button
              onClick={onOpenOnboarding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-100 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 text-xs font-bold transition-all cursor-pointer"
              title="Change Language, Profile, or Skill Level"
            >
              {userPhotoURL ? (
                <img
                  src={userPhotoURL}
                  alt="User"
                  className="w-5 h-5 rounded-full object-cover border border-indigo-400"
                />
              ) : (
                <User className="w-3.5 h-3.5 text-indigo-700" />
              )}
              <span className="hidden sm:inline">
                {userDisplayName || (isSignedIn ? 'User' : isMr ? 'प्रोफाइल' : isHi ? 'प्रोफाइल' : 'Profile')}
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-white text-[10px] text-indigo-700 font-extrabold uppercase border border-indigo-200">
                {getLevelLabel()}
              </span>
            </button>
          )}

          <button
            onClick={onOpenHelpline}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-blue-900 hover:to-purple-900 rounded-xl transition-all whitespace-nowrap shrink-0 touch-target-senior cursor-pointer shadow-xs"
          >
            <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {isMr
                ? 'हेल्पलाइन 1930'
                : isHi
                ? 'हेल्पलाइन 1930'
                : '1930'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Navigation Scroller */}
      <div className="lg:hidden flex items-center gap-2 px-4 py-2 overflow-x-auto border-t border-indigo-100/80 bg-slate-50/90 scrollbar-none">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 cursor-pointer transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-indigo-50 border border-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import {
  Building2,
  ExternalLink,
  CheckSquare,
  Square,
  AlertTriangle,
  Volume2,
  Info,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Language, GovtService } from '../types';
import { GOVERNMENT_SERVICES } from '../data/mockData';

interface GovtServicesTabProps {
  language: Language;
  onSpeak: (text: string) => void;
}

export const GovtServicesTab: React.FC<GovtServicesTabProps> = ({
  language,
  onSpeak,
}) => {
  const isHi = language === 'hi' || language === 'mr';

  const [selectedServiceId, setSelectedServiceId] = useState<string>('pm-kisan');
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const activeService =
    GOVERNMENT_SERVICES.find((s) => s.id === selectedServiceId) ||
    GOVERNMENT_SERVICES[0];

  const toggleDoc = (docName: string) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [`${selectedServiceId}-${docName}`]: !prev[`${selectedServiceId}-${docName}`],
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="bg-white border border-indigo-100 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <span>{isHi ? 'सरकारी सेवाएं सहायक (Government Services Guide)' : 'Government Services Assistant'}</span>
        </h2>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
          {isHi
            ? 'पीएम किसान, आधार, आयुष्मान भारत और डिजिलॉकर जैसी आवश्यक योजनाओं की आधिकारिक जानकारी, कागजातों की सूची, और दलालों से बचने के नियम।'
            : 'Step-by-step guides for official citizen portals. Check document checklists, official URLs, and avoid unauthorized broker charges.'}
        </p>
      </div>

      {/* Services Grid Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {GOVERNMENT_SERVICES.map((srv) => {
          const isSelected = selectedServiceId === srv.id;
          return (
            <button
              key={srv.id}
              onClick={() => setSelectedServiceId(srv.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-50/70 border-indigo-600 shadow-sm ring-2 ring-indigo-200'
                  : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-mono text-[11px] truncate max-w-[140px]">{srv.department}</span>
                {isSelected && <span className="text-indigo-700 font-bold shrink-0">● Active</span>}
              </div>
              <div className="font-extrabold text-slate-900 text-sm leading-snug">
                {isHi ? srv.nameHi : srv.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Service Guide Card */}
      <div className="bg-white border border-indigo-100 rounded-2xl p-5 sm:p-7 space-y-6 shadow-sm">
        {/* Header with Department & Official URL */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {activeService.department}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              {isHi ? activeService.nameHi : activeService.name}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onSpeak(
                  `${isHi ? activeService.nameHi : activeService.name}. ${
                    isHi ? activeService.purposeHi : activeService.purpose
                  }`
                )
              }
              className="p-2 text-slate-600 hover:text-emerald-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
              title={isHi ? 'आवाज़ में सुनें' : 'Read aloud'}
            >
              <Volume2 className="w-5 h-5 text-emerald-700" />
            </button>

            <a
              href={activeService.officialPortal}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <span>{isHi ? 'आधिकारिक पोर्टल खोलें' : 'Official Portal'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Purpose & Cost Badge */}
        <div className="space-y-2">
          <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
            {isHi ? activeService.purposeHi : activeService.purpose}
          </p>
          <div className="text-xs text-slate-600 font-medium">
            <span className="font-semibold text-slate-800">{isHi ? 'शुल्क / खर्च: ' : 'Official Fee: '}</span>
            <span className="text-emerald-800 font-semibold">{activeService.isFreeOrCost}</span>
          </div>
        </div>

        {/* Two-Column: Document Checklist & Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Left: Document Readiness Checklist */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {isHi ? 'जरूरी कागजात (चेकलिस्ट):' : 'Required Documents Checklist:'}
              </span>
              <span className="text-[11px] text-slate-500">
                {isHi ? 'पास में रखें' : 'Keep handy'}
              </span>
            </div>

            <p className="text-xs text-slate-600">
              {isHi
                ? 'पोर्टल खोलने से पहले इन दस्तावेजों पर टिक लगाएं:'
                : 'Tick the documents you have ready before starting:'}
            </p>

            <div className="space-y-2">
              {activeService.requiredDocuments.map((doc, idx) => {
                const isChecked = !!checkedDocs[`${selectedServiceId}-${doc.name}`];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleDoc(doc.name)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-300 text-slate-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">{isHi ? doc.nameHi : doc.name}</span>
                      {doc.mandatory && (
                        <span className="text-[10px] text-red-600 block mt-0.5 font-bold">
                          {isHi ? '* अनिवार्य' : '* Mandatory'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Step-by-Step Instructions */}
          <div className="lg:col-span-7 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              {isHi ? 'पोर्टल पर आवेदन करने के आसान कदम:' : 'Step-by-Step Instructions on Official Portal:'}
            </span>

            <div className="space-y-2.5">
              {activeService.stepByStepGuide.map((stepItem, sidx) => (
                <div
                  key={sidx}
                  className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {sidx + 1}
                  </div>
                  <p className="leading-relaxed">
                    {isHi ? stepItem.stepHi : stepItem.step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Warning Against Roadside Middlemen & Common Mistakes */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
          <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>{isHi ? 'सावधानियां और फर्जी दलालों से बचाव:' : 'Precautions & Avoiding Broker Overcharges:'}</span>
          </div>
          <ul className="space-y-1.5 text-xs text-amber-950">
            {(isHi ? activeService.commonMistakesHi : activeService.commonMistakes).map(
              (mistake, midx) => (
                <li key={midx} className="flex items-start gap-2">
                  <span className="text-amber-700 font-bold">•</span>
                  <span>{mistake}</span>
                </li>
              )
            )}
          </ul>
        </div>
      </div>

      {/* Verified Local Centers Finder using Google Maps */}
      <NearbyCentersFinder language={language} />
    </div>
  );
};

const NearbyCentersFinder: React.FC<{ language: Language }> = ({ language }) => {
  const isHi = language === 'hi';
  const [cityInput, setCityInput] = useState('');
  const [centersResult, setCentersResult] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const searchCenters = async (city: string) => {
    const loc = city.trim();
    if (!loc) return;
    setIsSearching(true);
    setCentersResult(null);

    try {
      const res = await fetch('/api/find-centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: loc,
          serviceType: 'CSC Common Service Centre and Aadhaar Seva Kendra',
          language,
        }),
      });
      const data = await res.json();
      setCentersResult(data.result || 'No centers found. Please check spelling.');
    } catch (err) {
      console.error(err);
      setCentersResult(isHi ? 'केंद्रों की खोज में त्रुटि हुई।' : 'Error searching for centers.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-700" />
          <span>{isHi ? 'नजदीकी अधिकृत सीएससी या आधार सेवा केंद्र खोजें' : 'Find Verified CSC & Aadhaar Centers Nearby'}</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {isHi
            ? 'अपने शहर या जिले का नाम दर्ज करें और गूगल मैप्स आधारित अधिकृत केंद्र देखें।'
            : 'Enter your city or district to locate verified government-approved assistance centers.'}
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          placeholder={isHi ? 'उदा: जयपुर, वाराणसी, पटना, इंदौर...' : 'e.g. Jaipur, Varanasi, Patna, Lucknow...'}
          className="flex-1 text-xs sm:text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white"
        />
        <button
          onClick={() => searchCenters(cityInput)}
          disabled={!cityInput.trim() || isSearching}
          className="px-5 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-colors"
        >
          {isSearching ? (isHi ? 'खोज रहे हैं...' : 'Searching...') : (isHi ? 'केंद्र खोजें' : 'Search Centers')}
        </button>
      </div>

      {centersResult && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
          {centersResult}
        </div>
      )}
    </div>
  );
};


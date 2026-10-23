import React from 'react';
import { X, Printer, Volume2, ShieldCheck, Check } from 'lucide-react';
import { Language } from '../types';

interface OfflineCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSpeak: (text: string) => void;
}

export const OfflineCheatSheetModal: React.FC<OfflineCheatSheetModalProps> = ({
  isOpen,
  onClose,
  language,
  onSpeak,
}) => {
  const isHi = language === 'hi' || language === 'mr';

  if (!isOpen) return null;

  const rules = [
    {
      title: '1. PIN is ONLY for SENDING money',
      titleHi: '1. पिन केवल पैसे भेजने के लिए होता है',
      desc: 'You NEVER need to enter a UPI PIN, password, or scan a QR code to receive money into your bank.',
      descHi: 'खाते में पैसे प्राप्त करने के लिए कभी भी यूपीआई पिन या क्यूआर कोड स्कैन करने की आवश्यकता नहीं होती।',
    },
    {
      title: '2. Bank OTP is a secret key',
      titleHi: '2. बैंक OTP आपकी निजी चाबी है',
      desc: 'Never share the 6-digit OTP received on SMS with anyone over a phone call, not even bank employees.',
      descHi: 'फोन कॉल पर किसी भी अनजान व्यक्ति या तथाकथित बैंक कर्मचारी को अपना 6 अंकों का ओटीपी न बताएं।',
    },
    {
      title: '3. Electricity cutoff SMS is a scam',
      titleHi: '3. रात में बिजली कटने का SMS फर्जी है',
      desc: 'Real electricity boards do not send personal 10-digit mobile numbers with threats to disconnect tonight.',
      descHi: 'असली बिजली विभाग रात को तुरंत बिजली काटने की धमकी और व्यक्तिगत फोन नंबर कभी नहीं भेजते।',
    },
    {
      title: '4. Never install AnyDesk or TeamViewer on call',
      titleHi: '4. कॉलर के कहने पर एनीडेस्क (AnyDesk) डाउनलोड न करें',
      desc: 'Screen sharing apps allow scammers to view your entire phone screen and steal your passwords.',
      descHi: 'स्क्रीन शेयरिंग ऐप्स से धोखेबाज आपके फोन की स्क्रीन देखकर पासवर्ड व पैसे चुरा लेते हैं।',
    },
    {
      title: '5. Never install WhatsApp ".apk" files',
      titleHi: '5. व्हाट्सएप पर आई ".apk" फाइल कभी न खोलें',
      desc: 'Only install apps from the official Google Play Store. Free scheme APKs contain spyware.',
      descHi: 'केवल गूगल प्ले स्टोर से ही ऐप डाउनलोड करें। मुफ्त योजना के नाम पर भेजे गए ऐप खतरनाक होते हैं।',
    },
    {
      title: '6. Check official website ending: .gov.in',
      titleHi: '6. सरकारी साइट के पते में ".gov.in" जरूर देखें',
      desc: 'Real Indian government portals end with .gov.in or .nic.in, never .com, .top, or .xyz.',
      descHi: 'असली सरकारी वेबसाइटों के अंत में ".gov.in" होता है। फर्जी साइटों पर आधार नंबर न डालें।',
    },
    {
      title: '7. Lock your Aadhaar Biometrics on myAadhaar',
      titleHi: '7. myAadhaar पर बायोमेट्रिक फिंगरप्रिंट लॉक रखें',
      desc: 'Keep biometric lock enabled so no one can misuse your fingerprints at cash withdrawal kiosks.',
      descHi: 'फिंगरप्रिंट लॉक चालू रखने से कोई भी आपकी अंगुली के निशान से पैसे नहीं निकाल सकता।',
    },
    {
      title: '8. KBC / Lottery lottery SMS is 100% fake',
      titleHi: '8. लॉटरी या इनाम के बदले फीस मांगना धोखा है',
      desc: 'Nobody awards ₹25 Lakhs without a ticket. Anyone asking for "processing fee" is a thief.',
      descHi: 'बिना टिकट के कोई लॉटरी नहीं निकलती। फाइल चार्ज या टैक्स के नाम पर पैसे मांगना ठगी है।',
    },
    {
      title: '9. Dial 1930 immediately if money is lost',
      titleHi: '9. ऑनलाइन ठगी होने पर तुरंत 1930 पर कॉल करें',
      desc: 'The National Cyber Crime Helpline can freeze the scammer bank account if called within 2 hours.',
      descHi: 'धोखाधड़ी के तुरंत बाद 1930 पर फोन करने से बैंक में धोखेबाज का खाता रोका जा सकता है।',
    },
    {
      title: '10. Visit your local Common Service Centre (CSC)',
      titleHi: '10. सहायता के लिए नजदीकी सीएससी (CSC) केंद्र जाएं',
      desc: 'For authentic assistance with government forms, visit your village CSC or local Post Office.',
      descHi: 'सरकारी फॉर्म या प्रमाण पत्र हेतु किसी दलाल के बजाय सरकारी सीएससी केंद्र या डाकघर जाएं।',
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/NIRBHAR_AI__Empowerment_in_Motion_d7e82865.png"
              alt="NIRBHAR Logo"
              className="h-11 w-auto object-contain rounded-lg shrink-0"
            />
            <div>
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                {isHi ? 'NIRBHAR सुरक्षा कार्ड (ऑफ़लाइन नियम)' : 'NIRBHAR Safety Pocket Guide'}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                {isHi ? 'डिजिटल सुरक्षा के 10 स्वर्णिम नियम' : '10 Golden Rules for Digital Safety'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onSpeak(
                  rules
                    .map((r) => `${isHi ? r.titleHi : r.title}. ${isHi ? r.descHi : r.desc}`)
                    .join('. ')
                )
              }
              className="p-2 text-slate-600 hover:text-indigo-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
              title={isHi ? 'पूरे नियम सुनें' : 'Listen all rules'}
            >
              <Volume2 className="w-5 h-5 text-indigo-700" />
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isHi ? 'प्रिंट करें / सुरक्षित रखें' : 'Print / Save'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Title Block */}
        <div className="text-center pb-2 border-b border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {isHi
              ? 'NIRBHAR — स्मार्टफोन व ऑनलाइन सुरक्षा के 10 स्वर्णिम नियम'
              : 'NIRBHAR — 10 Golden Rules for Digital & UPI Safety'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isHi
              ? 'NIRBHAR · आपातकाल में साइबर हेल्पलाइन: 1930'
              : 'NIRBHAR · National Cyber Helpline: 1930'}
          </p>
        </div>

        {/* 10 Rules List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1"
            >
              <div className="font-bold text-xs sm:text-sm text-slate-900">
                {isHi ? rule.titleHi : rule.title}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isHi ? rule.descHi : rule.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Helpline Strip */}
        <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs">
          <span>{isHi ? 'राष्ट्रीय साइबर हेल्पलाइन: 1930' : 'National Cyber Fraud Helpline: 1930'}</span>
          <span>{isHi ? 'वरिष्ठ नागरिक एल्डरलाइन: 14567' : 'Senior Citizens Elderline: 14567'}</span>
        </div>
      </div>
    </div>
  );
};

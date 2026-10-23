import React, { useState } from 'react';
import {
  X,
  PhoneCall,
  Users,
  MapPin,
  Building,
  CheckCircle,
  AlertOctagon,
  FileText,
  Printer,
} from 'lucide-react';
import { Language } from '../types';

interface HumanAssistanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const HumanAssistanceModal: React.FC<HumanAssistanceModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const isHi = language === 'hi' || language === 'mr';

  const [requested, setRequested] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    problemType: 'scam',
    villageOrCity: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRequested(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-5 sm:p-7 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              {isHi ? 'मानवीय सहायता व आधिकारिक हेल्पलाइन' : 'Official Helplines & Human Assistance'}
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              {isHi ? 'सीधे किसी व्यक्ति या हेल्पलाइन से बात करें' : 'Talk to a Human Mentor or Official Help'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Official 24x7 Government Helplines */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            {isHi ? 'आपातकालीन राष्ट्रीय टोल-फ्री हेल्पलाइन (मुफ्त):' : 'National Official 24/7 Helplines (Toll-Free):'}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1930 */}
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-900">
                  {isHi ? 'साइबर अपराध / वित्तीय धोखाधड़ी' : 'Cyber Crime & Financial Fraud'}
                </span>
                <span className="text-xs font-mono font-bold bg-red-200 text-red-900 px-2 py-0.5 rounded">
                  1930
                </span>
              </div>
              <p className="text-xs text-red-950">
                {isHi
                  ? 'बैंक खाते या UPI से धोखाधड़ी में पैसे कटने पर तुरंत 1930 मिलाएं।'
                  : 'Call immediately within the first hour if money is stolen through online fraud.'}
              </p>
            </div>

            {/* 14567 */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">
                  {isHi ? 'एल्डरलाइन (वरिष्ठ नागरिक हेल्पलाइन)' : 'Elderline (Senior Citizens)'}
                </span>
                <span className="text-xs font-mono font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
                  14567
                </span>
              </div>
              <p className="text-xs text-blue-950">
                {isHi
                  ? 'बुजुर्गों के लिए भारत सरकार की मुफ्त सहायता व परामर्श सेवा।'
                  : 'National helpline for elderly citizens offering free support and guidance.'}
              </p>
            </div>

            {/* 1915 */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  {isHi ? 'राष्ट्रीय उपभोक्ता हेल्पलाइन' : 'National Consumer Helpline'}
                </span>
                <span className="text-xs font-mono font-bold bg-slate-200 text-slate-900 px-2 py-0.5 rounded">
                  1915
                </span>
              </div>
              <p className="text-xs text-slate-700">
                {isHi
                  ? 'ऑनलाइन शॉपिंग या सेवा प्रदाता द्वारा धोखा दिए जाने पर।'
                  : 'For grievances against online e-commerce sellers or faulty services.'}
              </p>
            </div>

            {/* 1091 */}
            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900">
                  {isHi ? 'महिला सुरक्षा हेल्पलाइन' : 'Women Safety Helpline'}
                </span>
                <span className="text-xs font-mono font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded">
                  1091
                </span>
              </div>
              <p className="text-xs text-purple-950">
                {isHi
                  ? 'ऑनलाइन उत्पीड़न या सुरक्षा सहायता के लिए।'
                  : '24/7 dedicated assistance for women facing harassment or safety concerns.'}
              </p>
            </div>
          </div>
        </div>

        {/* 2. In-Person Local Free Assistance */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
          <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-4 h-4 text-emerald-700" />
            <span>{isHi ? 'आपके नजदीकी सुरक्षित केंद्र:' : 'Where to Get Free In-Person Assistance:'}</span>
          </div>
          <div className="text-xs text-emerald-950 space-y-1.5">
            <p>
              • <strong>CSC कॉमन सर्विस सेंटर (Common Service Centre):</strong>{' '}
              {isHi
                ? 'हर ग्राम पंचायत और शहर में सरकारी केंद्र जहाँ नाममात्र शुल्क में सरकारी फॉर्म व आधार सेवाएं मिलती हैं।'
                : 'Government-certified digital service kiosks available in every village and ward.'}
            </p>
            <p>
              • <strong>इंडिया पोस्ट डाकिया (India Post Postman):</strong>{' '}
              {isHi
                ? 'डाकघर का डाकिया आपके घर आकर आधार से बैंक खाते का पैसा निकालने व e-KYC करने में मदद करता है।'
                : 'Your local postman can assist at your doorstep with Aadhaar-enabled payments and mobile linking.'}
            </p>
          </div>
        </div>

        {/* 3. Volunteer Mentorship Assistance Request */}
        <div className="border-t border-slate-200 pt-4 space-y-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            {isHi ? 'समुदाय डिजिटल साथी से सहायता का अनुरोध:' : 'Request Community Digital Mentor Help:'}
          </span>

          {requested ? (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-700 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">
                {isHi ? 'अनुरोध पर्ची तैयार है!' : 'Assistance Summary Card Generated!'}
              </h4>
              <p className="text-xs text-slate-600">
                {isHi
                  ? `नाम: ${formData.name || 'उपभोक्ता'} · समस्या: ${formData.problemType} · स्थान: ${formData.villageOrCity || 'स्थानीय'}`
                  : `Name: ${formData.name || 'Citizen'} · Problem: ${formData.problemType} · Location: ${formData.villageOrCity || 'Local'}`}
              </p>
              <div className="text-[11px] text-slate-500 pt-1">
                {isHi
                  ? 'यह विवरण आप अपने नजदीकी सीएससी (CSC) केंद्र या परिवार के सदस्य को दिखा सकते हैं।'
                  : 'You can present this summary to your nearest CSC operator or family guide.'}
              </div>
              <button
                onClick={() => setRequested(false)}
                className="text-xs text-emerald-800 font-semibold underline mt-2 cursor-pointer"
              >
                {isHi ? 'नया अनुरोध दर्ज करें' : 'Create another request'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {isHi ? 'आपका नाम:' : 'Your Name:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={isHi ? 'उदा. रामेश्वर शर्मा' : 'e.g. Rameshwar Sharma'}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {isHi ? 'गांव या शहर का नाम:' : 'Village / Town / City:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.villageOrCity}
                    onChange={(e) => setFormData({ ...formData, villageOrCity: e.target.value })}
                    placeholder={isHi ? 'उदा. रामपुर' : 'e.g. Rampur'}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {isHi ? 'किस कार्य में सहायता चाहिए?' : 'What do you need help with?'}
                </label>
                <select
                  value={formData.problemType}
                  onChange={(e) => setFormData({ ...formData, problemType: e.target.value })}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                >
                  <option value="scam">{isHi ? 'संदिग्ध कॉल या पैसे कटने की शिकायत' : 'Suspicious fraud call / money deducted'}</option>
                  <option value="govt">{isHi ? 'पीएम किसान या सरकारी योजना का फॉर्म' : 'PM Kisan or Govt scheme application'}</option>
                  <option value="upi">{isHi ? 'फोनपे / गूगलपे शुरू करने में सहायता' : 'Setting up UPI / PhonePe / Google Pay'}</option>
                  <option value="phone">{isHi ? 'स्मार्टफोन की सेटिंग्स या स्टोरेज ठीक करना' : 'Phone settings or storage issue'}</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                >
                  {isHi ? 'सहायता पर्ची बनाएं' : 'Generate Help Slip'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

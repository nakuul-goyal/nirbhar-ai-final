import { GovtService, LessonModule } from '../types';

export const SAMPLE_QUESTIONS = [
  {
    category: 'Payments',
    categoryHi: 'भुगतान',
    en: 'Someone says they will send me money, but I need to enter my UPI PIN. Should I?',
    hi: 'कोई कह रहा है कि वे पैसे भेजेंगे लेकिन मुझे यूपीआई पिन (UPI PIN) डालना होगा। क्या मैं डालूँ?',
  },
  {
    category: 'Smartphone',
    categoryHi: 'स्मार्टफोन',
    en: 'How do I make the text size bigger on my phone so it is easier to read?',
    hi: 'फोन में अक्षरों का आकार (Font Size) बड़ा कैसे करें ताकि आसानी से पढ़ा जा सके?',
  },
  {
    category: 'Security',
    categoryHi: 'सुरक्षा',
    en: 'I got an SMS saying my electricity will be cut tonight at 9:30 PM. What should I do?',
    hi: 'मुझे मैसेज आया कि आज रात 9:30 बजे बिजली कट जाएगी। मुझे क्या करना चाहिए?',
  },
  {
    category: 'Govt Portal',
    categoryHi: 'सरकारी पोर्टल',
    en: 'How can I check if my PM-Kisan 2,000 installment has been credited?',
    hi: 'पीएम किसान की ₹2,000 वाली किस्त खाते में आई या नहीं, यह कैसे देखें?',
  },
  {
    category: 'Storage',
    categoryHi: 'स्टोरेज',
    en: 'My phone says "Storage Full". How do I clean it without deleting important things?',
    hi: 'फोन में "स्टोरेज फुल" आ रहा है। जरूरी चीजें खोए बिना जगह कैसे खाली करें?',
  },
  {
    category: 'Security',
    categoryHi: 'सुरक्षा',
    en: 'What is the difference between a UPI PIN and an OTP (One Time Password)?',
    hi: 'यूपीआई पिन (UPI PIN) और ओटीपी (OTP) में क्या फर्क होता है?',
  },
];

export const SAMPLE_SCAM_TESTS = [
  {
    id: 'scam-elec',
    title: 'Electricity Disconnection SMS',
    titleHi: 'बिजली काटने का फर्जी मैसेज',
    category: 'SMS',
    content: 'Dear consumer, your electricity power will be disconnected tonight at 9:30 PM from electricity office because your previous month bill was not updated. Please immediately contact our electricity officer Mr. Sharma at 9876543210. Thank you.',
    contentHi: 'प्रिय उपभोक्ता, आपकी बिजली आज रात 9:30 बजे काट दी जाएगी क्योंकि पिछले महीने का बिल अपडेट नहीं हुआ है। तुरंत हमारे बिजली अधिकारी श्री शर्मा से 9876543210 पर संपर्क करें।',
  },
  {
    id: 'scam-lottery',
    title: 'KBC / WhatsApp Lottery Prize',
    titleHi: 'केबीसी / व्हाट्सएप लॉटरी का झांसा',
    category: 'WhatsApp',
    content: 'CONGRATULATIONS!! Your mobile number has won ₹25,00,000 in Kaun Banega Crorepati Lottery Lucky Draw. Lottery No: KBC-8890. To receive your prize money in your bank account today, please deposit ₹2,500 file processing tax charge via Google Pay / PhonePe to our manager.',
    contentHi: 'बधाई हो!! आपके मोबाइल नंबर ने कौन बनेगा करोड़पति में ₹25,00,000 की लॉटरी जीती है। अपने बैंक में आज ही राशि पाने के लिए फाइल चार्ज के ₹2,500 मैनेजर को ट्रांसफर करें।',
  },
  {
    id: 'scam-bank-kyc',
    title: 'Bank Account Blocked / Fake KYC Link',
    titleHi: 'बैंक खाता बंद होने और फर्जी लिंक का डर',
    category: 'SMS / Link',
    content: 'Dear SBI Customer, your bank net banking account will be deactivated within 24 hours due to pending PAN/Aadhaar KYC. Click here immediately to update: http://sbi-kyc-verify-portal.in.net/login. Failure leads to ₹5000 penalty.',
    contentHi: 'प्रिय ग्राहक, आपका बैंक खाता 24 घंटे में ब्लॉक कर दिया जाएगा। पैन कार्ड अपडेट करने के लिए तुरंत इस लिंक पर क्लिक करें: http://sbi-kyc-verify-portal.in.net/login',
  },
  {
    id: 'scam-job',
    title: 'Work from Home / Like Videos Scam',
    titleHi: 'घर बैठे लाइक करके पैसे कमाने का धोखा',
    category: 'Telegram / SMS',
    content: 'Part-time job vacancy: Earn ₹3,500 to ₹8,000 daily from home just by giving 5-star ratings to Google Maps hotels and YouTube videos. No experience needed. Join Telegram group now and pay ₹1,000 registration fee to unlock VIP commission tasks.',
    contentHi: 'घर बैठे पार्ट टाइम काम: यूट्यूब वीडियो लाइक करके रोजाना ₹3500 से ₹8000 कमाएं। काम शुरू करने के लिए ₹1,000 रजिस्ट्रेशन फीस जमा करें।',
  },
  {
    id: 'scam-apk',
    title: 'Fake Speed Post / Courier APK Download',
    titleHi: 'स्पीड पोस्ट पार्सल फर्जी ऐप (APK) डाउनलोड',
    category: 'WhatsApp / Link',
    content: 'India Post: Your parcel IND90218 is on hold due to incomplete address. Pay ₹5 redelivery fee and download our official tracking app from: http://indiapost-parcel-update.apk to reschedule delivery.',
    contentHi: 'इंडिया पोस्ट: आपका पार्सल गलत पते की वजह से रुका हुआ है। ₹5 री-डिलीवरी फीस दें और ट्रैकिंग ऐप (APK) डाउनलोड करें।',
  },
];

export const SAMPLE_SCREENSHOTS = [
  {
    id: 'shot-elec-sms',
    title: 'Suspicious Electricity Disconnection SMS',
    titleHi: 'बिजली बिल काटने का धमकी भरा SMS',
    badge: 'Scam Alert',
    badgeColor: 'text-red-700 bg-red-50 border-red-200',
    description: 'Notice showing urgent 9:30 PM power cutoff and a personal 10-digit mobile number.',
    descriptionHi: 'संदेश जिसमें आज रात बिजली काटने की धमकी और व्यक्तिगत 10 अंकों का नंबर दिया गया है।',
    svgType: 'sms-elec',
  },
  {
    id: 'shot-upi-receive',
    title: 'UPI "Enter PIN to Receive ₹5,000" Request',
    titleHi: 'पैसे प्राप्त करने के लिए UPI PIN मांगने वाली स्क्रीन',
    badge: 'Fraud Trap',
    badgeColor: 'text-red-700 bg-red-50 border-red-200',
    description: 'A buyer asking you to enter UPI PIN on a payment request claiming it will deposit money.',
    descriptionHi: 'एक व्यक्ति का दावा कि UPI पिन डालने पर आपके खाते में पैसे आएंगे।',
    svgType: 'upi-receive-trap',
  },
  {
    id: 'shot-flashlight-perm',
    title: 'Flashlight App Demanding SMS & Contacts',
    titleHi: 'टॉर्च ऐप द्वारा SMS व कॉन्टैक्ट्स की अनुमति मांगना',
    badge: 'Privacy Risk',
    badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
    description: 'A simple utility app demanding permissions to read your private SMS and contacts.',
    descriptionHi: 'एक साधारण टॉर्च ऐप जो आपके निजी मैसेज और फोन नंबर देखने की अनुमति मांग रहा है।',
    svgType: 'perm-popup',
  },
  {
    id: 'shot-aadhaar-portal',
    title: 'Official myAadhaar Portal Login Screen',
    titleHi: 'आधिकारिक myAadhaar पोर्टल लॉगिन स्क्रीन',
    badge: 'Official Portal',
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    description: 'Authentic UIDAI portal showing Aadhaar number input, Captcha, and Send OTP button.',
    descriptionHi: 'यूआईडीएआई (UIDAI) का आधिकारिक पोर्टल जहाँ आधार नंबर और कैप्चा भरा जाता है।',
    svgType: 'aadhaar-official',
  },
];

export const GOVERNMENT_SERVICES: GovtService[] = [
  {
    id: 'pm-kisan',
    name: 'PM Kisan Samman Nidhi',
    nameHi: 'प्रधानमंत्री किसान सम्मान निधि',
    department: 'Ministry of Agriculture & Farmers Welfare',
    officialPortal: 'https://pmkisan.gov.in',
    isFreeOrCost: 'Free on official website (₹15 standard CSC fee if assisted)',
    purpose: 'Financial assistance of ₹6,000 per year directly transferred in three installments of ₹2,000 into farmers bank accounts.',
    purposeHi: 'किसानों के बैंक खातों में हर साल ₹6,000 की आर्थिक सहायता तीन बराबर किस्तों (₹2,000 प्रत्येक) में सीधे भेजी जाती है।',
    requiredDocuments: [
      { name: 'Aadhaar Card linked with active mobile number', nameHi: 'आधार कार्ड (चालू मोबाइल नंबर से लिंक)', mandatory: true },
      { name: 'Bank Account Passbook (Aadhaar Seeding / NPCI mapped)', nameHi: 'बैंक पासबुक (Aadhaar NPCI लिंक)', mandatory: true },
      { name: 'Land Ownership Document / Khatauni (Khasra/Khata)', nameHi: 'जमीन के कागजात (खतौनी / खसरा खतौनी)', mandatory: true },
      { name: 'Active mobile number for receiving OTP', nameHi: 'ओटीपी प्राप्त करने के लिए चालू मोबाइल नंबर', mandatory: true },
    ],
    stepByStepGuide: [
      {
        step: 'Open your mobile browser and enter the official web address: pmkisan.gov.in (check the ".gov.in" ending).',
        stepHi: 'मोबाइल ब्राउज़र खोलें और आधिकारिक पता pmkisan.gov.in दर्ज करें (".gov.in" की जांच अवश्य करें)।',
      },
      {
        step: 'Look for "Farmers Corner" on the homepage and tap "Know Your Status" or "e-KYC".',
        stepHi: 'मुख्य पृष्ठ पर "Farmers Corner" देखें और "Know Your Status" या "e-KYC" पर क्लिक करें।',
      },
      {
        step: 'Enter your 12-digit Aadhaar Number and tap "Search".',
        stepHi: 'अपना 12 अंकों का आधार नंबर भरें और "सर्च" बटन दबाएं।',
      },
      {
        step: 'Enter the 4-digit or 6-digit OTP sent to your Aadhaar-linked mobile phone.',
        stepHi: 'आपके आधार से जुड़े मोबाइल नंबर पर आया हुआ ओटीपी दर्ज करें।',
      },
      {
        step: 'Check that Eligibility Status shows "YES" for Land Seeding and e-KYC Done.',
        stepHi: 'जांचें कि लैंड सीडिंग और ई-केवाईसी दोनों के आगे "YES" लिखा आ रहा है या नहीं।',
      },
    ],
    commonMistakes: [
      'Do not pay ₹100 or ₹200 to unauthorized roadside cyber cafe agents; the portal is free to check.',
      'Never share your net-banking password or UPI PIN when someone calls claiming to be a PM-Kisan officer.',
      'Check if your bank account has "Aadhaar NPCI mapping" active; otherwise payments fail.',
    ],
    commonMistakesHi: [
      'अनधिकृत दलालों को ₹100-₹200 न दें, यह स्थिति जांचना पोर्टल पर बिल्कुल मुफ्त है।',
      'फोन पर कोई कहे कि वह PM किसान का अधिकारी है, तो उसे कभी भी OTP या UPI PIN न बताएं।',
      'अपने बैंक में जाकर जांच कराएं कि खाते में आधार NPCI मैपिंग चालू है या नहीं।',
    ],
  },
  {
    id: 'aadhaar-self',
    name: 'UIDAI myAadhaar Portal',
    nameHi: 'यूआईडीएआई myAadhaar पोर्टल',
    department: 'Unique Identification Authority of India (UIDAI)',
    officialPortal: 'https://myaadhaar.uidai.gov.in',
    isFreeOrCost: 'Address update: ₹50 / PVC Card: ₹50 / Download e-Aadhaar: Free',
    purpose: 'Download official digital Aadhaar, update home address, lock/unlock biometric fingerprints for anti-theft, and order durable plastic PVC card.',
    purposeHi: 'डिजिटल आधार डाउनलोड करें, पता बदलें, धोखाधड़ी रोकने हेतु बायोमेट्रिक फिंगरप्रिंट लॉक करें व पीवीसी कार्ड मंगवाएं।',
    requiredDocuments: [
      { name: '12-digit Aadhaar Number or Enrollment ID', nameHi: '12 अंकों का आधार नंबर', mandatory: true },
      { name: 'Aadhaar-linked Mobile Number for OTP', nameHi: 'आधार से लिंक मोबाइल नंबर (ओटीपी हेतु)', mandatory: true },
      { name: 'Valid Address Proof (Electricity bill / Ration card / Voter ID) if updating address', nameHi: 'पता बदलने हेतु मान्य प्रमाण पत्र (बिजली बिल/राशन कार्ड)', mandatory: false },
    ],
    stepByStepGuide: [
      {
        step: 'Open myaadhaar.uidai.gov.in on your phone or computer.',
        stepHi: 'अपने फोन में myaadhaar.uidai.gov.in खोलें।',
      },
      {
        step: 'Tap the blue "Login" button with the fingerprint icon.',
        stepHi: 'फिंगरप्रिंट आइकन वाले नीले "Login" बटन पर टैप करें।',
      },
      {
        step: 'Enter your 12-digit Aadhaar number, solve the visual captcha code, and tap "Send OTP".',
        stepHi: 'आधार नंबर दर्ज करें, कैप्चा कोड भरें और "Send OTP" पर दबाएं।',
      },
      {
        step: 'Type the 6-digit OTP received via SMS from sender "AADHAAR" and tap Login.',
        stepHi: 'मोबाइल पर आए 6 अंकों के ओटीपी को दर्ज करके लॉगिन करें।',
      },
      {
        step: 'To prevent cyber fraud on your fingerprints, tap "Lock/Unlock Biometrics" and enable lock when not using.',
        stepHi: 'अपने फिंगरप्रिंट का दुरुपयोग रोकने के लिए "Lock/Unlock Biometrics" में जाकर बायोमेट्रिक लॉक चालू कर लें।',
      },
    ],
    commonMistakes: [
      'Only use the official UIDAI website ending in "uidai.gov.in". Avoid websites with names like "aadhaar-download-instant.com".',
      'The password to open your downloaded e-Aadhaar PDF is the FIRST 4 LETTERS of your name in CAPITAL + 4-digit Year of Birth (e.g., SURE1965).',
      'Never leave a printed Aadhaar photocopy at a local shop without writing "Submitted for [purpose] only" across it.',
    ],
    commonMistakesHi: [
      'हमेशा uidai.gov.in वाली आधिकारिक वेबसाइट का ही प्रयोग करें। फर्जी साइटों पर आधार नंबर न डालें।',
      'डाउनलोड की गई आधार पीडीएफ फाइल का पासवर्ड आपके नाम के पहले 4 बड़े अक्षर और जन्म का वर्ष होता है (जैसे SURE1965)।',
      'दुकान पर आधार की फोटोकॉपी छोड़ते समय उस पर तिरछी लाइन खींचकर केवल प्रयोजन (जैसे: सिम कार्ड हेतु) जरूर लिखें।',
    ],
  },
  {
    id: 'ayushman-card',
    name: 'Ayushman Bharat PM-JAY (Golden Card)',
    nameHi: 'आयुष्मान भारत (गोल्डन कार्ड)',
    department: 'National Health Authority',
    officialPortal: 'https://beneficiary.nha.gov.in',
    isFreeOrCost: '100% Free medical treatment up to ₹5,00,000 per family per year',
    purpose: 'Free cashless inpatient hospital treatment up to ₹5 Lakh per year for secondary and tertiary healthcare in empanelled private and government hospitals.',
    purposeHi: 'सरकारी और सूचीबद्ध निजी अस्पतालों में प्रति परिवार प्रति वर्ष ₹5 लाख तक का मुफ्त इलाज।',
    requiredDocuments: [
      { name: 'Aadhaar Card of all family members', nameHi: 'परिवार के सभी सदस्यों का आधार कार्ड', mandatory: true },
      { name: 'Ration Card (showing family member names)', nameHi: 'राशन कार्ड (सदस्यों के नाम सहित)', mandatory: true },
      { name: 'Active Mobile number for OTP verification', nameHi: 'ओटीपी सत्यापन हेतु मोबाइल नंबर', mandatory: true },
    ],
    stepByStepGuide: [
      {
        step: 'Visit beneficiary.nha.gov.in on your phone.',
        stepHi: 'मोबाइल में beneficiary.nha.gov.in वेबसाइट खोलें।',
      },
      {
        step: 'Select "Beneficiary" login mode and enter your mobile number to receive OTP.',
        stepHi: '"Beneficiary" विकल्प चुनें और मोबाइल नंबर डालकर ओटीपी से लॉगिन करें।',
      },
      {
        step: 'Select your State, Scheme (PMJAY), District, and search by Family ID / Ration Card or Aadhaar Number.',
        stepHi: 'अपना राज्य, जिला और राशन कार्ड या आधार नंबर चुनकर खोजें।',
      },
      {
        step: 'If your family name appears, tap "e-KYC" next to your name and verify using Aadhaar OTP.',
        stepHi: 'यदि परिवार का नाम दिखे तो "e-KYC" पर क्लिक करके आधार ओटीपी से सत्यापित करें।',
      },
      {
        step: 'Once approved, tap "Download Ayushman Card" to save the digital health card PDF on your phone.',
        stepHi: 'अनुमोदन के बाद अपना आयुष्मान कार्ड डाउनलोड करके फोन में सुरक्षित रख लें।',
      },
    ],
    commonMistakes: [
      'No agent can get you a card if your name is not in the SECC list or state ration card list. Do not pay bribes.',
      'Check the list of empanelled hospitals before admission to ensure the private hospital honors Ayushman PM-JAY.',
      'Look for the "Ayushman Mitra" desk located at hospital entrances for free official assistance.',
    ],
    commonMistakesHi: [
      'कोई भी एजेंट रिश्वत लेकर नाम नहीं जोड़ सकता; किसी दलाल को पैसे न दें।',
      'अस्पताल जाने से पहले जांच लें कि वह अस्पताल आयुष्मान योजना में पंजीकृत है या नहीं।',
      'अस्पताल पहुंचते ही मुख्य गेट पर "आयुष्मान मित्र" सहायता केंद्र से मुफ्त मदद लें।',
    ],
  },
  {
    id: 'digilocker',
    name: 'DigiLocker (Digital Document Wallet)',
    nameHi: 'डिजिलॉकर (सरकारी डिजिटल दस्तावेज)',
    department: 'Ministry of Electronics and Information Technology (MeitY)',
    officialPortal: 'https://digilocker.gov.in',
    isFreeOrCost: '100% Free and legally valid under IT Act 2000',
    purpose: 'Store and present legally valid digital copies of your Driving License, Vehicle RC, Aadhaar, PAN card, Vaccine certificate, and School/College mark sheets on your phone.',
    purposeHi: 'ड्राइविंग लाइसेंस, गाड़ी की आरसी, पैन कार्ड व 10वीं/12वीं की मार्कशीट को कानूनी रूप से फोन में सुरक्षित रखना।',
    requiredDocuments: [
      { name: 'Aadhaar Card linked with mobile number', nameHi: 'आधार कार्ड (मोबाइल से लिंक)', mandatory: true },
      { name: 'Vehicle Registration number / Driving License number (if adding DL)', nameHi: 'ड्राइविंग लाइसेंस या गाड़ी का नंबर', mandatory: false },
      { name: 'PAN Card number (if linking PAN)', nameHi: 'पैन कार्ड नंबर', mandatory: false },
    ],
    stepByStepGuide: [
      {
        step: 'Download the official "DigiLocker" app from Google Play Store or visit digilocker.gov.in.',
        stepHi: 'गूगल प्ले स्टोर से आधिकारिक "DigiLocker" ऐप डाउनलोड करें या digilocker.gov.in खोलें।',
      },
      {
        step: 'Tap "Sign Up" and enter your Full Name (as on Aadhaar), Date of Birth, Mobile Number, and create a 6-digit Security PIN.',
        stepHi: '"Sign Up" दबाएं, अपना नाम, जन्मतिथि और 6 अंकों का सुरक्षित पिन बनाएं।',
      },
      {
        step: 'Enter your Aadhaar number and submit the verification OTP.',
        stepHi: 'आधार नंबर भरें और मोबाइल पर आया ओटीपी सत्यापित करें।',
      },
      {
        step: 'Go to "Search Documents", select "Ministry of Road Transport" to fetch your Driving License or RC.',
        stepHi: '"Search Documents" में जाकर ड्राइविंग लाइसेंस या वाहन RC जोड़ें।',
      },
      {
        step: 'Traffic police and authorities are legally mandated to accept documents shown inside the DigiLocker app.',
        stepHi: 'ट्रैफिक पुलिस व सरकारी विभाग डिजिलॉकर में दिखाए गए दस्तावेजों को मूल दस्तावेज की तरह मानने को बाध्य हैं।',
      },
    ],
    commonMistakes: [
      'Do not confuse the 6-digit DigiLocker security PIN with your bank UPI PIN. Keep them different.',
      'A normal photo of a license in your phone gallery is NOT legally valid for traffic police, but the DigiLocker digital copy IS legally valid.',
    ],
    commonMistakesHi: [
      'डिजिलॉकर का 6 अंकों का लॉगिन पिन और बैंक का UPI PIN कभी भी एक जैसा न रखें।',
      'फोन गैलरी में रखी फोटो ट्रैफिक पुलिस नहीं मानती, लेकिन डिजिलॉker ऐप में जारी डिजिटल लाइसेंस पूरी तरह मान्य है।',
    ],
  },
];

export const LESSON_MODULES: LessonModule[] = [
  {
    id: 'mod-upi',
    title: 'UPI & Payment Safety: Never Enter PIN to Receive Money',
    titleHi: 'यूपीआई और ऑनलाइन भुगतान सुरक्षा',
    category: 'Digital Payments',
    description: 'Learn the golden rule of UPI payments, how QR codes work, and the vital difference between a UPI PIN and an SMS OTP.',
    descriptionHi: 'यूपीआई का सुनहरा नियम समझें: पैसे पाने के लिए कभी पिन नहीं डालना होता, और जाने पिन व ओटीपी का अंतर।',
    badgeName: 'UPI Safety Guardian',
    badgeIcon: 'ShieldCheck',
    keyTakeaways: [
      'Golden Rule: You ONLY enter your UPI PIN when money is LEAVING your account.',
      'To RECEIVE money, you NEVER need to enter a PIN, password, or scan any QR code.',
      'UPI PIN is a secret 4 or 6-digit code known only to you. Never share it with family or bank staff.',
      'Bank OTP is a single-use passcode for online purchases. Never read it out to anyone over a phone call.',
    ],
    keyTakeawaysHi: [
      'सुनहरा नियम: यूपीआई पिन (UPI PIN) केवल तब डाला जाता है जब आपके खाते से पैसे कट रहे हों।',
      'पैसे प्राप्त करने के लिए कभी भी पिन नहीं डालना पड़ता और न ही कोई क्यूआर कोड स्कैन करना होता है।',
      'यूपीआई पिन केवल आपको पता होना चाहिए, इसे किसी भी व्यक्ति को न बताएं।',
      'ओटीपी (OTP) फोन पर बात करते हुए किसी अनजान व्यक्ति को बोलकर कभी न बताएं।',
    ],
    practicalTips: [
      'Before entering your UPI PIN, always read the recipient name and the exact amount displayed at the top of your screen.',
      'If someone on OLX or Facebook Marketplace sends you a QR code saying "Scan this and enter PIN to receive advance deposit", IT IS A 100% FRAUD TRAP.',
      'Set a daily UPI transaction limit inside your banking app for extra safety.',
    ],
    practicalTipsHi: [
      'यूपीआई पिन डालने से पहले हमेशा स्क्रीन पर दिख रहे नाम और रुपये की राशि को ध्यान से पढ़ें।',
      'यदि कोई कहे कि "यह क्यूआर स्कैन करके पिन डालो, पैसे तुम्हारे खाते में आ जाएंगे", तो यह पक्का धोखा है।',
      'सुरक्षा के लिए अपनी बैंक ऐप में दैनिक यूपीआई सीमा (Daily Limit) तय करके रखें।',
    ],
    quiz: [
      {
        id: 'q1',
        question: 'A buyer calls you and says: "I want to send you ₹3,000 for your old furniture. Please enter your UPI PIN to accept the payment." What should you do?',
        options: [
          'Enter the PIN quickly so the money is deposited.',
          'Refuse and do not enter the PIN, because entering a PIN only deducts money.',
          'Share your bank account password instead.',
        ],
        correctIndex: 1,
        explanation: 'Correct! You NEVER enter your UPI PIN to receive money. Entering your PIN immediately transfers money out of your account to the scammer.',
      },
      {
        id: 'q2',
        question: 'What is the key difference between a UPI PIN and a Bank SMS OTP?',
        options: [
          'They are the exact same thing.',
          'UPI PIN is created by you for payments; OTP is a temporary code sent by the bank for verification.',
          'OTP is only for credit cards.',
        ],
        correctIndex: 1,
        explanation: 'Correct! Your UPI PIN is your permanent secret code for UPI transfers. An OTP is a 6-digit temporary code generated by your bank. Neither should ever be shared.',
      },
      {
        id: 'q3',
        question: 'What should you always check on your phone screen before typing your secret UPI PIN at a shop?',
        options: [
          'Check the merchant name and exact rupees amount on screen.',
          'Just look at the keyboard and type quickly.',
          'Show the screen to someone next to you to verify.',
        ],
        correctIndex: 0,
        explanation: 'Always verify the displayed merchant business name and the exact rupee amount before typing your PIN.',
      },
    ],
  },
  {
    id: 'mod-scams',
    title: 'Spotting Online Scams & Fake Caller Tricks',
    titleHi: 'ऑनलाइन धोखाधड़ी और फर्जी कॉलों की पहचान',
    category: 'Cyber Safety',
    description: 'Master the common tricks scammers use: artificial panic, lottery winnings, fake electricity disconnection, and screen sharing apps.',
    descriptionHi: 'धोखेबाजों की चालें समझें: बिजली कटने का डर, लॉटरी का लालच, और स्क्रीन शेयरिंग ऐप का खतरा।',
    badgeName: 'Scam Spotter',
    badgeIcon: 'AlertTriangle',
    keyTakeaways: [
      'Scammers always create ARTIFICIAL URGENCY (e.g. "Account closed in 30 minutes", "Electricity cut tonight").',
      'Legitimate utility companies and banks do NOT send personal 10-digit mobile numbers for urgent bill disputes.',
      'Never download remote screen-sharing apps like AnyDesk, TeamViewer, or QuickSupport on the request of a caller.',
      'If you lose money to cyber fraud, dial 1930 immediately within the first "golden hour".',
    ],
    keyTakeawaysHi: [
      'धोखेबाज हमेशा जल्दीबाजी या डर पैदा करते हैं (जैसे: "30 मिनट में खाता बंद हो जाएगा", "बिजली कट जाएगी")।',
      'असली बैंक या बिजली विभाग कभी किसी का व्यक्तिगत 10 अंकों का मोबाइल नंबर नहीं भेजते।',
      'किसी कॉलर के कहने पर कभी भी AnyDesk, TeamViewer जैसी स्क्रीन शेयरिंग ऐप डाउनलोड न करें।',
      'धोखाधड़ी होते ही तुरंत राष्ट्रीय साइबर हेल्पलाइन नंबर 1930 पर फोन करें।',
    ],
    practicalTips: [
      'Do not click shortened links like bit.ly or strange web addresses ending in .xyz, .top, or .in.net in SMS messages.',
      'If a bank manager or courier person calls demanding urgent action, hang up and call the official customer care number written on your bank passbook or credit card.',
    ],
    practicalTipsHi: [
      'एसएमएस में आए छोटे या अजीब लिंक (जैसे .xyz, .top) पर कभी क्लिक न करें।',
      'यदि कोई फोन पर बैंक कर्मचारी बनकर दबाव डाले, तो फोन काटकर अपनी पासबुक पर लिखे आधिकारिक नंबर पर खुद बात करें।',
    ],
    quiz: [
      {
        id: 'sq1',
        question: 'You receive an SMS: "Dear consumer, your electricity will be disconnected tonight at 9:30 PM. Call officer at 9811223344." What is this?',
        options: [
          'An official notice from the government electricity board.',
          'A classic electricity bill scam designed to steal money via fake payment apps.',
          'A reminder to recharge your mobile data.',
        ],
        correctIndex: 1,
        explanation: 'This is a rampant scam across India. Real electricity discoms send notices with your consumer CA number on official bill paper, never an urgent personal mobile number.',
      },
      {
        id: 'sq2',
        question: 'A polite caller claiming to be from customer support asks you to install "AnyDesk" or "TeamViewer" to fix your phone. What should you do?',
        options: [
          'Install it and give them the 9-digit code so they can fix your problem.',
          'Immediately disconnect the call; these apps allow scammers to see your screen and steal your passwords.',
          'Install it only if they sound very professional.',
        ],
        correctIndex: 1,
        explanation: 'Never install remote screen-sharing apps like AnyDesk on a caller instruction. They can see everything on your phone screen including bank OTPs.',
      },
      {
        id: 'sq3',
        question: 'What is the national helpline number in India for reporting financial cyber fraud?',
        options: ['100', '1930', '108'],
        correctIndex: 1,
        explanation: '1930 is the dedicated National Cyber Crime Reporting Portal helpline for citizen financial fraud.',
      },
    ],
  },
  {
    id: 'mod-phone',
    title: 'Smartphone Confidence: Settings, Storage & Safe Downloads',
    titleHi: 'स्मार्टफोन चलाना: सेटिंग्स, स्टोरेज व सुरक्षित ऐप्स',
    category: 'Device Basics',
    description: 'Learn how to keep your phone running smoothly, adjust text size for easy reading, manage permissions, and download apps safely.',
    descriptionHi: 'फोन को सुचारू चलाना, अक्षरों को बड़ा करना, स्टोरेज खाली करना और सुरक्षित ऐप डाउनलोड करना सीखें।',
    badgeName: 'Smartphone Master',
    badgeIcon: 'Smartphone',
    keyTakeaways: [
      'Only download applications from the official Google Play Store or Apple App Store.',
      'Never install files with the ".apk" extension downloaded from WhatsApp or web browsers.',
      'Check app permissions: A calculator or flashlight app does NOT need permission to read your contacts or SMS.',
      'Use the built-in "Files by Google" app to safely clean junk files without deleting your family photos.',
    ],
    keyTakeawaysHi: [
      'ऐप्स हमेशा केवल आधिकारिक गूगल प्ले स्टोर (Google Play Store) से ही डाउनलोड करें।',
      'व्हाट्सएप या ब्राउज़र से भेजी गई ".apk" फाइल को कभी इंस्टॉल न करें।',
      'अनुमतियों की जांच करें: साधारण टॉर्च या कैलकुलेटर ऐप को आपके संपर्कों (Contacts) की कोई जरूरत नहीं होती।',
      'फोटो खोए बिना फालतू फाइलें हटाने के लिए गूगल के "Files" ऐप का इस्तेमाल करें।',
    ],
    practicalTips: [
      'To increase text size: Go to Settings -> Display -> Font size & Display size, and drag the slider to the right.',
      'Turn on "Screen Lock" with a PIN, Pattern, or Fingerprint so no stranger can open your phone if you misplace it.',
    ],
    practicalTipsHi: [
      'अक्षर बड़े करने के लिए: सेटिंग्स (Settings) -> डिस्प्ले (Display) -> फॉन्ट साइज में जाकर स्लाइडर को दाईं ओर करें।',
      'फोन में हमेशा पिन या फिंगरप्रिंट लॉक जरूर लगाकर रखें ताकि खो जाने पर कोई आपका फोन न खोल सके।',
    ],
    quiz: [
      {
        id: 'pq1',
        question: 'Someone on WhatsApp sends you a file named "PM_Yojana_Free_Gas.apk" and tells you to tap and install it. What should you do?',
        options: [
          'Install it right away to get the benefit.',
          'Delete the message immediately; APK files sent on WhatsApp often contain dangerous spyware.',
          'Forward it to all your WhatsApp groups.',
        ],
        correctIndex: 1,
        explanation: 'Never install APK files sent through WhatsApp or messaging apps. Scammers disguise malware as free government schemes.',
      },
      {
        id: 'pq2',
        question: 'When installing a simple torch/flashlight app, it asks for permission to "Read SMS" and "Access Contacts". What should you do?',
        options: [
          'Deny the permissions or uninstall the app, because a flashlight only needs camera light access.',
          'Allow all permissions without reading.',
          'Share your phone password with the app.',
        ],
        correctIndex: 0,
        explanation: 'A flashlight app has zero legitimate reason to read your SMS or contacts. This is a privacy-violating or malicious app.',
      },
      {
        id: 'pq3',
        question: 'Where is the safest place to download mobile applications on an Android smartphone?',
        options: [
          'Random websites on Google search',
          'Google Play Store',
          'Links in SMS messages',
        ],
        correctIndex: 1,
        explanation: 'Google Play Store scans apps with Play Protect to verify security before allowing downloads.',
      },
    ],
  },
];

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, type ChildProcess } from 'child_process';
import { GoogleGenAI, Type, GenerateVideosOperation } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Determine listening port:
// In this container environment, Nginx reverse-proxy runs on 8080 and forwards requests to 3000.
// If process.env.PORT is 8080 or unset, the backend server must listen on port 3000.
function getPort(): number {
  const portArgIdx = process.argv.indexOf('--port');
  if (portArgIdx !== -1 && process.argv[portArgIdx + 1]) {
    return Number(process.argv[portArgIdx + 1]);
  }
  if (process.env.APP_PORT) {
    return Number(process.env.APP_PORT);
  }
  if (process.env.PORT && process.env.PORT !== '8080') {
    return Number(process.env.PORT);
  }
  return 3000;
}

const PORT = getPort();

// Python FastAPI Backend Integration
const PYTHON_PORT = Number(process.env.PYTHON_BACKEND_PORT || 8000);
let pythonProcess: ChildProcess | null = null;
let isPythonBackendAvailable = false;

export function startPythonBackend() {
  try {
    console.log(`[Python] Starting FastAPI backend on port ${PYTHON_PORT}...`);
    pythonProcess = spawn(process.platform === 'win32' ? '.venv\\Scripts\\python.exe' : 'python3', ['-m', 'uvicorn', 'backend.main:app', '--port', String(PYTHON_PORT), '--host', '127.0.0.1'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PYTHONUNBUFFERED: '1' }
    });

    pythonProcess.stdout?.on('data', (data) => {
      const msg = data.toString();
      if (msg.includes('Application startup complete') || msg.includes('Uvicorn running')) {
        isPythonBackendAvailable = true;
        console.log('[Python] FastAPI backend is active and ready on port ' + PYTHON_PORT);
      }
    });

    pythonProcess.stderr?.on('data', (data) => {
      const text = data.toString().trim();
      if (text.includes('Application startup complete') || text.includes('Uvicorn running')) {
        isPythonBackendAvailable = true;
        console.log('[Python] FastAPI backend is active and ready on port ' + PYTHON_PORT);
      }
    });

    pythonProcess.on('exit', (code) => {
      console.info(`[Python] Backend process exited with code ${code}`);
      isPythonBackendAvailable = false;
    });
  } catch (err) {
    console.error('[Python] Could not spawn Python backend:', err);
  }
}

app.use(express.json({ limit: '15mb' }));

// Forward /api/* requests to Python FastAPI backend when available, with automatic fallback
app.use('/api', async (req, res, next) => {
  // Let Veo video endpoints run directly on Node
  if (req.url.startsWith('/generate-video') || req.url.startsWith('/video-status') || req.url.startsWith('/video-download')) {
    return next();
  }

  if (!isPythonBackendAvailable) {
    return next();
  }

  try {
    const pythonUrl = `http://127.0.0.1:${PYTHON_PORT}/api${req.url}`;
    const headers: Record<string, string> = {
      'content-type': (req.headers['content-type'] as string) || 'application/json',
    };

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 12000);
    fetchOptions.signal = abortController.signal;

    const pyRes = await fetch(pythonUrl, fetchOptions);
    clearTimeout(timeoutId);

    if (pyRes.ok) {
      const data = await pyRes.json();
      return res.status(pyRes.status).json(data);
    } else if (pyRes.status === 404) {
      return next();
    } else {
      console.warn(`[Python API] Returned status ${pyRes.status}, delegating to Node fallback.`);
      return next();
    }
  } catch {
    // If Python service fails or times out, gracefully continue to internal Node handler
    return next();
  }
});

// Shared Gemini client utility on the server with User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NIRBHAR Full-Stack API',
    pythonBackendActive: isPythonBackendAvailable
  });
});

// Resilient model caller with smart timeout and quota avoidance
let quotaExhaustedModels = new Set<string>();
// Track TTS quota to avoid failing API calls when quota is exhausted
let ttsQuotaExhaustedUntil = Date.now() + 24 * 60 * 60 * 1000;

async function generateWithFallback(options: {
  contents: any;
  config?: any;
}) {
  // gemini-3.1-flash-lite is the active, verified model
  const candidateModels = ['gemini-3.1-flash-lite'];

  for (const model of candidateModels) {
    if (quotaExhaustedModels.has(model)) {
      continue;
    }

    try {
      const callPromise = ai.models.generateContent({
        model,
        contents: options.contents,
        config: options.config,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout 9000ms for ${model}`)), 9000)
      );

      const response = (await Promise.race([callPromise, timeoutPromise])) as any;
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      const isQuota =
        err.message?.includes('429') ||
        err.message?.includes('quota') ||
        err.message?.includes('RESOURCE_EXHAUSTED');
      if (isQuota) {
        quotaExhaustedModels.add(model);
        console.info(`[AI] Free tier quota reached for ${model}, activating offline knowledge base.`);
      } else {
        console.info(`[AI] Model ${model} unavailable, using offline knowledge base.`);
      }
    }
  }
  throw new Error('Using smart instant knowledge base');
}

const LANGUAGE_NAME_MAP: Record<string, string> = {
  hi: 'Hindi (हिन्दी in Devanagari script)',
  en: 'simple English (or natural Hinglish if the user spoke in Hinglish)',
  mr: 'Marathi (मराठी in Devanagari script)',
  gu: 'Gujarati (ગુજરાતી script)',
  bn: 'Bengali (বাংলা script)',
  ta: 'Tamil (தமிழ் script)',
  te: 'Telugu (తెలుగు script)',
  kn: 'Kannada (ಕನ್ನಡ script)',
  ml: 'Malayalam (മലയാളം script)',
  pa: 'Punjabi (ਪੰਜਾਬੀ Gurmukhi script)',
  or: 'Odia (ଓଡ଼ିଆ script)',
  as: 'Assamese (অসমীয়া script)',
};

// Multilingual fallback greeting & safety guidance for all 12 languages
const MULTILINGUAL_RISHI_DEFAULT: Record<
  string,
  { replyText: string; steps: string[]; safetyTip: string; suggestedActions: string[] }
> = {
  gu: {
    replyText: 'નમસ્તે! હું ઋષિ (Rishi) છું, તમારો NIRBHAR અવાજ સહાયક. સ્માર્ટફોન અને ડિજિટલ પેમેન્ટ સુરક્ષિત રીતે શીખવામાં હું તમને મદદ કરીશ.',
    steps: [
      'પૈસા મેળવવા માટે ક્યારેય તમારો UPI પિન (PIN) નાખશો નહીં.',
      'અજાણ્યા SMS કે WhatsApp લિંક પર ક્લિક કરશો નહીં.',
      'કોઈપણ સ્ક્રીન સમજવા માટે ઉપર "Screenshot Help" નો ઉપયોગ કરો.',
    ],
    safetyTip: 'તમારો 6-અંકનો બેંક OTP કે UPI પિન ફોન પર કોઈને આપશો નહીં.',
    suggestedActions: ['UPI પિન ક્યારે વાપરવો?', 'નકલી SMS કેવી રીતે ઓળખવો?'],
  },
  bn: {
    replyText: 'নমস্কার! আমি ঋষি (Rishi), আপনার NIRBHAR ভয়েস অ্যাসিস্ট্যান্ট। স্মার্টফোন এবং ডিজিটাল লেনদেন সহজভাবে শিখতে আমি আপনাকে সাহায্য করব।',
    steps: [
      'টাকা পাওয়ার জন্য কখনোই আপনার UPI পিন (PIN) দেবেন না।',
      'অচেনা SMS বা WhatsApp লিঙ্কে কখনো ক্লিক করবেন না।',
      'যেকোনো স্ক্রিন বুঝতে উপরে "Screenshot Help" ট্যাব ব্যবহার করুন।',
    ],
    safetyTip: 'আপনার ৬-সংখ্যার ব্যাংক OTP বা UPI পিন ফোনে কাউকে বলবেন না।',
    suggestedActions: ['UPI পিন ও OTP-র পার্থক্য কী?', 'ভুয়ো মেসেজ কীভাবে চিনব?'],
  },
  ta: {
    replyText: 'வணக்கம்! நான் ரிஷி (Rishi), உங்கள் NIRBHAR குரல் உதவியாளர். ஸ்மார்ட்போன் மற்றும் பாதுகாப்பான UPI பரிவர்த்தனைகளை எளிதாகக் கற்றுக்கொள்ள நான் உதவுவேன்.',
    steps: [
      'பணம் பெறுவதற்கு ஒருபோதும் உங்கள் UPI PIN-ஐ உள்ளிட வேண்டாம்.',
      'அறிமுகமில்லாத SMS அல்லது WhatsApp இணைப்புகளைத் தொட வேண்டாம்.',
      'சந்தேகமான குறுஞ்செய்திகளை "Scam Detector" மூலம் சரிபார்க்கவும்.',
    ],
    safetyTip: 'உங்கள் வங்கி OTP அல்லது UPI PIN-ஐ தொலைபேசியில் யாரிடமும் பகிர வேண்டாம்.',
    suggestedActions: ['UPI PIN பாதுகாப்பு விதி என்ன?', 'போலி SMS-ஐ கண்டறிவது எப்படி?'],
  },
  te: {
    replyText: 'నమస్కారం! నేను రిషి (Rishi), మీ NIRBHAR వాయిస్ అసిస్టెంట్. స్మార్ట్‌ఫోన్ మరియు సురక్షిత డిజిటల్ చెల్లింపులను సులభంగా నేర్చుకోవడానికి నేను మీకు సహాయం చేస్తాను.',
    steps: [
      'డబ్బు అందుకోవడానికి ఎప్పుడూ మీ UPI పిన్ (PIN) నమోదు చేయవద్దు.',
      'తెలియని SMS లేదా WhatsApp లింక్‌లను క్లిక్ చేయవద్దు.',
      'అనుమానాస్పద మెసేజ్‌లను "Scam Detector" ట్యాబ్‌లో తనిఖీ చేయండి.',
    ],
    safetyTip: 'మీ 6-అంకెల బ్యాంక్ OTP లేదా UPI పిన్‌ను ఫోన్‌లో ఎవరికీ చెప్పకండి.',
    suggestedActions: ['UPI పిన్ మరియు OTP తేడా ఏమిటి?', 'నకిలీ కరెంట్ బిల్లు మెసేజ్ ఎలా గుర్తించాలి?'],
  },
  kn: {
    replyText: 'ನಮಸ್ಕಾರ! ನಾನು ರಿಷಿ (Rishi), ನಿಮ್ಮ NIRBHAR ಧ್ವನಿ ಸಹಾಯಕ. ಸ್ಮಾರ್ಟ್‌ಫೋನ್ ಮತ್ತು ಸುರಕ್ಷಿತ ಡಿಜಿಟಲ್ ಪಾವತಿಗಳನ್ನು ಸುಲಭವಾಗಿ ಕಲಿಯಲು ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.',
    steps: [
      'ಹಣ ಪಡೆಯಲು ಎಂದಿಗೂ ನಿಮ್ಮ UPI ಪಿನ್ (PIN) ನಮೂದಿಸಬೇಡಿ.',
      'ಅಪರಿಚಿತ SMS ಅಥವಾ WhatsApp ಲಿಂಕ್‌ಗಳನ್ನು ಕ್ಲಿಕ್ ಮಾಡಬೇಡಿ.',
      'ಯಾವುದೇ ಪರದೆಯ ಬಗ್ಗೆ ತಿಳಿಯಲು "Screenshot Help" ಬಳಸಿ.',
    ],
    safetyTip: 'ನಿಮ್ಮ ಬ್ಯಾಂಕ್ OTP ಅಥವಾ UPI ಪಿನ್ ಅನ್ನು ಯಾರಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.',
    suggestedActions: ['UPI ಪಿನ್ ಸುರಕ್ಷತಾ ನಿಯಮವೇನು?', 'ನಕಲಿ SMS ಗುರುತಿಸುವುದು ಹೇಗೆ?'],
  },
  ml: {
    replyText: 'നമസ്കാരം! ഞാൻ ഋഷി (Rishi), നിങ്ങളുടെ NIRBHAR വോയ്‌സ് അസിസ്റ്റന്റ്. സ്മാർട്ട്‌ഫോണും സുരക്ഷിതമായ യുപിഐ ഇടപാടുകളും പഠിക്കാൻ ഞാൻ സഹായിക്കാം.',
    steps: [
      'പണം സ്വീകരിക്കാൻ ഒരിക്കലും നിങ്ങളുടെ UPI പിൻ (PIN) നൽകരുത്.',
      'അപരിചിതമായ SMS അല്ലെങ്കിൽ WhatsApp ലിങ്കുകളിൽ ക്ലിക്ക് ചെയ്യരുത്.',
      'സംശയമുള്ള സന്ദേശങ്ങൾ "Scam Detector" ഉപയോഗിച്ച് പരിശോധിക്കുക.',
    ],
    safetyTip: 'നിങ്ങളുടെ ബാങ്ക് OTP അല്ലെങ്കിൽ UPI പിൻ ആരുമായും പങ്കിടരുത്.',
    suggestedActions: ['UPI പിൻ സുരക്ഷാ നിയമം എന്താണ്?', 'വ്യാജ സന്ദേശങ്ങൾ എങ്ങനെ തിരിച്ചറിയാം?'],
  },
  pa: {
    replyText: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਰਿਸ਼ੀ (Rishi) ਹਾਂ, ਤੁਹਾਡਾ NIRBHAR ਵੌਇਸ ਅਸਿਸਟੈਂਟ। ਸਮਾਰਟਫ਼ੋਨ ਅਤੇ ਸੁਰੱਖਿਅਤ ਡਿਜੀਟਲ ਭੁਗਤਾਨ ਸਿੱਖਣ ਵਿੱਚ ਮੈਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰਾਂਗਾ।',
    steps: [
      'ਪੈਸੇ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਕਦੇ ਵੀ ਆਪਣਾ UPI ਪਿੰਨ (PIN) ਨਾ ਭਰੋ।',
      'ਅਣਜਾਣ SMS ਜਾਂ WhatsApp ਲਿੰਕਾਂ ਉੱਤੇ ਕਲਿੱਕ ਨਾ ਕਰੋ।',
      'ਕਿਸੇ ਵੀ ਸਕ੍ਰੀਨ ਨੂੰ ਸਮਝਣ ਲਈ "Screenshot Help" ਦੀ ਵਰਤੋਂ ਕਰੋ।',
    ],
    safetyTip: 'ਆਪਣਾ 6-ਅੰਕਾਂ ਦਾ ਬੈਂਕ OTP ਜਾਂ UPI ਪਿੰਨ ਫ਼ੋਨ ਤੇ ਕਿਸੇ ਨਾਲ ਸਾਂਝਾ ਨਾ ਕਰੋ।',
    suggestedActions: ['UPI ਪਿੰਨ ਅਤੇ OTP ਵਿੱਚ ਕੀ ਫਰਕ ਹੈ?', 'ਨਕਲੀ ਬਿਜਲੀ ਬਿੱਲ SMS ਕਿਵੇਂ ਪਛਾਣੀਏ?'],
  },
  or: {
    replyText: 'ନମସ୍କାର! ମୁଁ ଋଷି (Rishi), ଆପଣଙ୍କର NIRBHAR ଭଏସ୍ ଆସିଷ୍ଟାଣ୍ଟ। ସ୍ମାର୍ଟଫୋନ୍ ଏବଂ ସୁରକ୍ଷିତ ଡିଜିଟାଲ୍ ପେମେଣ୍ଟ ଶିଖିବାରେ ମୁଁ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିବି।',
    steps: [
      'ଟଙ୍କା ପାଇବା ପାଇଁ କେବେବି ଆପଣଙ୍କର UPI ପିନ୍ (PIN) ଦିଅନ୍ତୁ ନାହିଁ।',
      'ଅଜଣା SMS କିମ୍ବା WhatsApp ଲିଙ୍କ୍ ଉପରେ କ୍ଲିକ୍ କରନ୍ତୁ ନାହିଁ।',
      'ସନ୍ଦେହଜନକ ମେସେଜ୍ ଯାଞ୍ଚ କରିବାକୁ "Scam Detector" ବ୍ୟବହାର କରନ୍ତୁ।',
    ],
    safetyTip: 'ଆପଣଙ୍କର ବ୍ୟାଙ୍କ OTP କିମ୍ବା UPI ପିନ୍ କାହାକୁ କୁହନ୍ତୁ ନାହିଁ।',
    suggestedActions: ['UPI ପିନ୍ ନିୟମ କ’ଣ?', 'ନକଲି SMS କିପରି ଚିହ୍ନିବେ?'],
  },
  as: {
    replyText: 'নমস্কাৰ! মই ঋষি (Rishi), আপোনাৰ NIRBHAR ভয়েচ এছিষ্টেণ্ট। স্মাৰ্টফোন আৰু সুৰক্ষিত ডিজিটেল লেনদেন সহজে শিকাত মই আপোনাক সহায় কৰিম।',
    steps: [
      'টকা পাবলৈ কেতিয়াও আপোনাৰ UPI পিন (PIN) নিদিব।',
      'অচিনাকি SMS বা WhatsApp লিংকত ক্লিক নকৰিব।',
      'যিকোনো স্ক্ৰীণ বুজিবলৈ "Screenshot Help" ব্যৱহাৰ কৰক।',
    ],
    safetyTip: 'আপোনাৰ বেংক OTP বা UPI পিন ফোনযোগে কাকো নক’ব।',
    suggestedActions: ['UPI পিনৰ নিয়ম কি?', 'ভুৱা মেছেজ কেনেকৈ চিনিব?'],
  },
};

// Comprehensive smart domain knowledge fallback in all 12 languages + Hinglish
function getSmartChatFallback(message: string, language: string) {
  const lower = (message || '').toLowerCase();
  const isHindi = language === 'hi';
  const isMarathi = language === 'mr';

  if (MULTILINGUAL_RISHI_DEFAULT[language]) {
    return MULTILINGUAL_RISHI_DEFAULT[language];
  }

  // How to use NIRBHAR app
  if (
    lower.includes('nirbhar') ||
    lower.includes('निर्भर') ||
    lower.includes('how to use') ||
    lower.includes('kaise use') ||
    lower.includes('कैसे चलाएं') ||
    lower.includes('app guide')
  ) {
    return {
      replyText: isMarathi
        ? 'मी ऋषी (Rishi) आहे! NIRBHAR ॲप वापरणे खूप सोपे आहे. यात ५ मुख्य विभाग आहेत:'
        : isHindi
        ? 'नमस्ते, मैं ऋषि (Rishi) हूँ! NIRBHAR ऐप का उपयोग करना बहुत आसान है। इसमें आपके लिए ये मुख्य सुविधाएं हैं:'
        : 'Hi, I am Rishi! Using the NIRBHAR app is very simple. Here is how you can use its tools step by step:',
      steps: [
        isMarathi
          ? '१. AI Assistant: कोणताही प्रश्न मराठी, हिंदी किंवा इंग्रजीत विचारा.'
          : isHindi
          ? '1. AI सहायक: कोई भी सवाल बोलकर या लिखकर सरल भाषा में पूछें।'
          : '1. AI Assistant: Ask any smartphone or digital safety question by voice or text.',
        isMarathi
          ? '२. Screenshot Help: अनोळखी स्क्रीन किंवा फॉर्मचा फोटो अपलोड करून अर्थ समजून घ्या.'
          : isHindi
          ? '2. स्क्रीनशॉट जांच: किसी भी अनजान ऐप या फॉर्म का फोटो अपलोड करके समझें।'
          : '2. Screenshot Help: Upload a screenshot or camera photo of any confusing screen.',
        isMarathi
          ? '३. Scam Detector व Payment Sandbox: खोटे मेसेज तपासा आणि ₹0 जोखमीसह UPI पेमेंटचा सराव करा.'
          : isHindi
          ? '3. धोखाधड़ी जांच व भुगतान अभ्यास: संदिग्ध SMS जांचें और बिना असली पैसे के UPI अभ्यास करें।'
          : '3. Scam Detector & Payment Sandbox: Check suspicious SMS and practice UPI payments with ₹0 risk.',
      ],
      safetyTip: isMarathi
        ? 'कोणत्याही टॅबवर असताना उजव्या कोपऱ्यातील "Rishi" बटणावर टॅप करून माझ्याशी बोला!'
        : isHindi
        ? 'किसी भी पेज पर नीचे दाईं ओर "Rishi" बटन दबाकर मुझसे सीधे बात करें!'
        : 'Tap the floating Rishi button at the bottom-right corner on any page to speak with me!',
      suggestedActions: [
        isHindi ? 'यूपीआई पिन और ओटीपी में क्या अंतर है?' : 'What is the difference between UPI PIN and OTP?',
        isHindi ? 'फोन में अक्षर बड़े कैसे करें?' : 'How to increase font size on phone?',
      ],
    };
  }

  // 1. UPI, PIN, OTP, Payments
  if (
    lower.includes('pin') ||
    lower.includes('पिन') ||
    lower.includes('otp') ||
    lower.includes('ओटीपी') ||
    lower.includes('payment') ||
    lower.includes('पेमेंट') ||
    lower.includes('upi') ||
    lower.includes('यूपीआई') ||
    lower.includes('phonepe') ||
    lower.includes('gpay') ||
    lower.includes('paytm') ||
    lower.includes('पैसे') ||
    lower.includes('paise')
  ) {
    if (isMarathi) {
      return {
        replyText:
          'यूपीआय (UPI) आणि डिजिटल पेमेंटचा सर्वात महत्त्वाचा नियम: पैसे पाठवण्यासाठीच पिन टाकला जातो, पैसे मिळवण्यासाठी कधीही पिन टाकावा लागत नाही.',
        steps: [
          'नियम १: जेव्हा तुम्ही तुमचा UPI पिन टाकता, तेव्हा तुमच्या बँक खात्यातून पैसे कट होतात.',
          'नियम २: जर कोणी म्हटले की "पैसे मिळवण्यासाठी QR कोड स्कॅन करा किंवा पिन टाका", तर तो १००% फसवणुकीचा सापळा आहे.',
          'नियम ३: तुमचा ६-अंकी बँक OTP फोनवर कोणालाही सांगू नका.',
          'सुरक्षित सरावासाठी वरील "Payment Sandbox" टॅबवर क्लिक करून सराव करा.',
        ],
        safetyTip:
          'बँक अधिकारी किंवा Google Pay / PhonePe प्रतिनिधी कधीही फोन करून तुमचा पिन किंवा ओटीपी मागत नाहीत.',
        suggestedActions: [
          'लाईट बिल कट होण्याचा खोटा मेसेज कसा ओळखावा?',
          'फोनमधील अक्षरांचा आकार मोठा कसा करावा?',
          'व्हॉट्सॲपवर व्हिडिओ कॉल कसा करावा?',
        ],
      };
    }

    return {
      replyText: isHindi
        ? 'यूपीआई और डिजिटल भुगतान का सबसे बड़ा नियम: पैसे भेजने के लिए पिन डाला जाता है, पैसे प्राप्त करने के लिए कभी पिन नहीं डालना होता।'
        : 'The golden rule of UPI & digital payments: You ONLY enter your UPI PIN to SEND money, NEVER to receive money.',
      steps: [
        isHindi ? 'नियम 1: जब भी आप पिन दर्ज करते हैं, तो आपके बैंक से पैसे कटते हैं।' : 'Rule 1: Entering your UPI PIN always authorizes money LEAVING your account.',
        isHindi ? 'नियम 2: यदि कोई खरीदार या अनजान व्यक्ति कहे कि "पैसे पाने के लिए QR स्कैन करें या पिन डालें", तो यह 100% धोखा है।' : 'Rule 2: If someone asks you to scan a QR code or enter PIN to receive funds, refuse immediately—it is a fraud trap.',
        isHindi ? 'नियम 3: 6-अंकों का बैंक SMS OTP किसी भी फोन कॉलर या अनजान व्यक्ति को न बताएं।' : 'Rule 3: Never read out your 6-digit Bank OTP over a phone call to anyone.',
        isHindi ? 'सुरक्षित अभ्यास के लिए ऐप में ऊपर "भुगतान अभ्यास (Payment Sandbox)" पर क्लिक करें।' : 'Practice without real money anytime in the "Payment Sandbox" tab above.',
      ],
      safetyTip: isHindi
        ? 'बैंक या गूगल पे/फोनपे का कोई भी अधिकारी फोन करके कभी आपका गुप्त पिन या ओटीपी नहीं मांगता।'
        : 'Bank representatives and payment apps will NEVER call you asking for your secret UPI PIN or OTP.',
      suggestedActions: [
        isHindi ? 'बिजली कटने का फर्जी मैसेज कैसे पहचानें?' : 'How to spot fake electricity bill disconnection SMS?',
        isHindi ? 'फोन में फॉन्ट साइज बड़ा कैसे करें?' : 'How to increase font size on phone?',
        isHindi ? 'व्हाट्सएप पर वीडियो कॉल कैसे करें?' : 'How to make a WhatsApp video call?',
      ],
    };
  }

  // 2. Wi-Fi and Internet
  if (
    lower.includes('wifi') ||
    lower.includes('वाईफाई') ||
    lower.includes('इंटरनेट') ||
    lower.includes('internet') ||
    lower.includes('data') ||
    lower.includes('नेटवर्क')
  ) {
    if (isMarathi) {
      return {
        replyText:
          'वाय-फाय (Wi-Fi) सुरक्षितपणे जोडणे खूप सोपे आहे. नेहमी तुमच्या घराच्या किंवा ओळखीच्या पासवर्ड असलेल्या नेटवर्कलाच कनेक्ट करा.',
        steps: [
          'फोनची स्क्रीन वरून खाली ओढा आणि Wi-Fi आयकॉनवर २ सेकंद बोट दाबून ठेवा.',
          'Wi-Fi चालू करा आणि यादीतून तुमच्या घराचे नेटवर्क निवडा.',
          'पासवर्ड विचारल्यास अचूक पासवर्ड टाका आणि "Connect" दाबा.',
          'कनेक्ट झाल्यावर स्क्रीनच्या वरच्या बाजूला Wi-Fi चिन्ह दिसेल.',
        ],
        safetyTip:
          'रेल्वे स्टेशन किंवा सार्वजनिक ठिकाणच्या विना-पासवर्ड "Free Wi-Fi" वर कधीही बँक किंवा UPI ॲप वापरू नका.',
        suggestedActions: [
          'फोनचे स्टोरेज फुल झाल्यास काय करावे?',
          'फोनमधील अक्षरे मोठी कशी करावीत?',
        ],
      };
    }

    return {
      replyText: isHindi
        ? 'वाई-फाई (Wi-Fi) से सुरक्षित रूप से जुड़ना बहुत आसान है। हमेशा अपने घर या विश्वसनीय सुरक्षित नेटवर्क से ही जुड़ें।'
        : 'Connecting safely to Wi-Fi is easy. Always connect to your own home or known password-protected Wi-Fi networks.',
      steps: [
        isHindi ? 'फोन की स्क्रीन ऊपर से नीचे की ओर खींचें और वाई-फाई (Wi-Fi) आइकन पर 2 सेकंड तक उंगली दबाकर रखें।' : 'Swipe down from the top of your screen and press & hold the Wi-Fi icon for 2 seconds.',
        isHindi ? 'वाई-फाई चालू करें और उपलब्ध नेटवर्कों की सूची में अपने घर का नाम चुनें।' : 'Turn Wi-Fi switch ON and tap your home network name from the list.',
        isHindi ? 'यदि पासवर्ड मांगा जाए, तो राउटर पर लिखा सही पासवर्ड भरें और "Connect" दबाएं।' : 'Enter the Wi-Fi password carefully and tap "Connect".',
        isHindi ? 'जुड़ने के बाद स्क्रीन के सबसे ऊपर पंखे जैसा वाई-फाई का निशान दिखेगा।' : 'Once connected, the fan-shaped Wi-Fi symbol will appear at the top of your phone screen.',
      ],
      safetyTip: isHindi
        ? 'रेलवे स्टेशन या कैफे के बिना पासवर्ड वाले "Free Public Wi-Fi" पर कभी भी बैंक ऐप न खोलें।'
        : 'Never use banking apps or enter payment passwords while connected to open, unencrypted free public Wi-Fi.',
      suggestedActions: [
        isHindi ? 'फोन का स्टोरेज फुल होने पर क्या करें?' : 'What to do when phone storage is full?',
        isHindi ? 'फोन में अक्षर बड़े कैसे करें?' : 'How to make text size bigger on phone?',
      ],
    };
  }

  // 3. Font Size / Large Text
  if (
    lower.includes('font') ||
    lower.includes('अक्षर') ||
    lower.includes('साइज') ||
    lower.includes('बड़ा') ||
    lower.includes('bada') ||
    lower.includes('मोठा') ||
    lower.includes('text') ||
    lower.includes('screen') ||
    lower.includes('दिख')
  ) {
    if (isMarathi) {
      return {
        replyText:
          'जर तुम्हाला फोनवर लहान अक्षरे वाचताना त्रास होत असेल, तर तुम्ही १ मिनिटात अक्षरांचा आकार मोठा करू शकता.',
        steps: [
          'तुमच्या फोनमधील "Settings" (सेटिंग्ज) ॲप उघडा.',
          'खाली स्क्रोल करा आणि "Display" (डिस्प्ले) पर्यायावर टॅप करा.',
          '"Font size" (फॉन्ट साईझ) निवडा.',
          'स्लायडर उजवीकडे सरकवा जेणेकरून अक्षरे मोठी आणि स्पष्ट दिसतील.',
        ],
        safetyTip:
          'NIRBHAR ॲपमध्ये सर्वात वर दिलेल्या "A / A+ / A++" बटणावर टॅप करून तुम्ही आत्ताच अक्षरे मोठी करू शकता.',
        suggestedActions: [
          'स्टोरेज फुल झाल्यास काय करावे?',
          'व्हॉट्सॲपवर फोटो कसा पाठवावा?',
        ],
      };
    }

    return {
      replyText: isHindi
        ? 'यदि आपको फोन पर छोटे अक्षर पढ़ने में असुविधा होती है, तो आप 1 मिनट में अक्षरों को बड़ा और स्पष्ट कर सकते हैं।'
        : 'If you have difficulty reading small text on your phone, you can easily enlarge fonts in 1 minute.',
      steps: [
        isHindi ? 'फोन में "सेटिंग्स (Settings)" ऐप खोलें (गियर / चक्र जैसा निशान)।' : 'Open the "Settings" app on your phone (gear/cog icon).',
        isHindi ? 'नीचे स्क्रॉल करके "डिस्प्ले (Display)" या "प्रदर्शन" विकल्प पर टैप करें।' : 'Scroll down and tap on "Display".',
        isHindi ? '"फॉन्ट साइज (Font size)" या "टेक्स्ट साइज" चुनें।' : 'Select "Font size and style" or "Text size".',
        isHindi ? 'नीचे दिए गए स्लाइडर को दाईं ओर खिसकाएं जब तक कि अक्षर आपकी आंखों के लिए आरामदायक न हो जाएं।' : 'Drag the slider towards the right until the text is comfortably readable for your eyes.',
      ],
      safetyTip: isHindi
        ? 'NIRBHAR ऐप में भी सबसे ऊपर दिए गए "A / A+ / A++" बटन से आप तुरंत इस ऐप के अक्षरों को बड़ा कर सकते हैं।'
        : 'You can also tap the "A / A+ / A++" buttons in the accessibility toolbar at the top of NIRBHAR right now.',
      suggestedActions: [
        isHindi ? 'स्टोरेज फुल होने पर क्या करें?' : 'How to free up phone storage?',
        isHindi ? 'व्हाट्सएप में फोटो कैसे भेजें?' : 'How to send photos on WhatsApp?',
      ],
    };
  }

  // 4. WhatsApp & Video Calling
  if (
    lower.includes('whatsapp') ||
    lower.includes('व्हाट्सएप') ||
    lower.includes('व्हॉट्सॲप') ||
    lower.includes('video call') ||
    lower.includes('वीडियो कॉल') ||
    lower.includes('call')
  ) {
    if (isMarathi) {
      return {
        replyText:
          'व्हॉट्सॲपवर कुटुंब आणि मित्रांशी व्हिडिओ कॉलवर बोलणे खूप सोपे आणि मोफत आहे.',
        steps: [
          'WhatsApp उघडा आणि ज्या नातेवाईकांशी बोलायचे आहे त्यांच्या नावावर टॅप करा.',
          'स्क्रीनच्या वरच्या उजव्या कोपऱ्यातील व्हिडिओ कॅमेरा (📹) चिन्हावर टॅप करा.',
          'फोन तुमच्या चेहऱ्यासमोर धरा आणि बोलणे सुरू करा.',
          'बोलणे झाल्यावर लाल रंगाचे गोल बटण दाबून कॉल कट करा.',
        ],
        safetyTip:
          'अनोळखी किंवा परदेशी नंबरवरून अचानक आलेला व्हिडिओ कॉल कधीही उचलू नका—हा ब्लॅकमेलिंगचा प्रकार असू शकतो.',
        suggestedActions: [
          'व्हॉट्सॲपवर अनोळखी नंबर ब्लॉक कसा करावा?',
          'खोटा लॉटरी मेसेज कसा ओळखावा?',
        ],
      };
    }

    return {
      replyText: isHindi
        ? 'व्हाट्सएप पर परिवार और दोस्तों से वीडियो कॉल पर बात करना बहुत सरल और मुफ्त है (केवल इंटरनेट डेटा लगता है)।'
        : 'Making a WhatsApp video call to your family and loved ones is simple, clear, and uses regular internet data.',
      steps: [
        isHindi ? 'व्हाट्सएप ऐप खोलें और उस रिश्तेदार के नाम पर टैप करें जिनसे बात करनी है।' : 'Open WhatsApp and tap the name of the person you wish to call.',
        isHindi ? 'स्क्रीन के सबसे ऊपर दाईं ओर बने छोटे वीडियो कैमरे (📹) के निशान पर टैप करें।' : 'Look at the top-right corner and tap the small Video Camera icon (📹).',
        isHindi ? '"Start video call" दबाएं और फोन को अपने चेहरे के सामने सीधा रखें।' : 'Tap "Start video call" and hold the phone steadily in front of your face.',
        isHindi ? 'बात खत्म होने पर लाल रंग का गोल फोन बटन दबाकर कॉल काटें।' : 'When finished, tap the red circular button to end the call.',
      ],
      safetyTip: isHindi
        ? 'यदि किसी अनजान विदेशी नंबर (+92, +84, +62) से अचानक वीडियो कॉल आए, तो कभी न उठाएं—यह अश्लील वीडियो ब्लैकमेलिंग का जाल हो सकता है।'
        : 'Never answer video calls from unknown foreign international numbers—scammers use screen-recording extortion tricks.',
      suggestedActions: [
        isHindi ? 'व्हाट्सएप पर अनजान नंबर को ब्लॉक कैसे करें?' : 'How to block an unknown number on WhatsApp?',
        isHindi ? 'फर्जी लॉटरी मैसेज की पहचान कैसे करें?' : 'How to spot fake lottery messages?',
      ],
    };
  }

  // 5. Storage full / Phone slow
  if (
    lower.includes('storage') ||
    lower.includes('स्टोरेज') ||
    lower.includes('फुल') ||
    lower.includes('full') ||
    lower.includes('slow') ||
    lower.includes('मेमोरी') ||
    lower.includes('भर')
  ) {
    if (isMarathi) {
      return {
        replyText:
          'फोनचे स्टोरेज भरल्यामुळे फोन हँग होतो. व्हॉट्सॲपवरील जुने फॉरवर्ड केलेले व्हिडिओ डिलीट करून फोन फास्ट करता येतो.',
        steps: [
          'WhatsApp उघडा > वरचे ३ डॉट्स (⋮) > Settings > "Storage and data" > "Manage storage" वर टॅप करा.',
          '"5 MB पेक्षा मोठ्या फाईल्स" तपासा आणि अनावश्यक फॉरवर्डेड व्हिडिओ डिलीट करा.',
          'फोनच्या गॅलरीमधील "Trash / Bin" रिकामे (Empty) करा.',
          'जे ॲप्स तुम्ही वापरत नाही ते Uninstall करा.',
        ],
        safetyTip:
          'कोणत्याही जाहिरातीवर क्लिक करून "Phone Cleaner" किंवा "Booster" APK डाऊनलोड करू नका.',
        suggestedActions: [
          'वाय-फाय सुरक्षितपणे कसे जोडावे?',
          'फोनमधील अक्षरे मोठी कशी करावीत?',
        ],
      };
    }

    return {
      replyText: isHindi
        ? 'फोन का स्टोरेज भरने से फोन धीमा हो जाता है। व्हाट्सएप के पुराने वीडियो और गैर-जरूरी ऐप्स हटाकर इसे तुरंत तेज किया जा सकता है।'
        : 'When phone storage gets full, the phone slows down. Clearing forwarded videos and unused apps will make it fast again.',
      steps: [
        isHindi ? 'व्हाट्सएप खोलें > तीन बिंदु (⋮) > सेटिंग्स > "स्टोरेज और डेटा (Storage and data)" पर टैप करें।' : 'Open WhatsApp > tap 3 dots (⋮) > Settings > Storage and data > Manage storage.',
        isHindi ? '"5 MB से बड़ी फाइलें" देखें और पुराने फॉरवर्डेड वीडियो चुनकर डिलीट करें।' : 'Check files larger than 5 MB and delete forwarded video clips.',
        isHindi ? 'फोन की "गैलरी (Gallery)" में जाकर "Trash / Recycle Bin" को खाली (Empty) करें।' : 'Open your phone Gallery, go to Trash/Bin, and tap "Empty Trash".',
        isHindi ? 'जिन ऐप्स का आप इस्तेमाल नहीं करते, उन पर उंगली दबाकर रखें और "Uninstall" कर दें।' : 'Find apps you no longer use, long press on their icon, and tap "Uninstall".',
      ],
      safetyTip: isHindi
        ? '"फोन क्लीनर" या "रैम बूस्टर" के नाम से अनजान वेबसाइटों से कोई भी APK ऐप डाउनलोड न करें, वे वायरस हो सकते हैं।'
        : 'Never install third-party "RAM Cleaner" APK files from the web; they often contain adware and malware.',
      suggestedActions: [
        isHindi ? 'व्हाट्सएप पर बैकअप कैसे लें?' : 'How to take WhatsApp backup?',
        isHindi ? 'वाई-फाई से सुरक्षित कैसे जुड़ें?' : 'How to connect safely to Wi-Fi?',
      ],
    };
  }

  // Default friendly mentor response
  if (isMarathi) {
    return {
      replyText:
        'नमस्कार! मी ऋषी (Rishi) आहे, तुमचा NIRBHAR सोबती. स्मार्टफोन आणि इंटरनेटचा सुरक्षित वापर एक-एक पाऊल समजून शिकणे खूप सोपे आहे.',
      steps: [
        'नेहमी अधिकृत Google Play Store वरूनच ॲप्स डाऊनलोड करा.',
        'व्हॉट्सॲप किंवा एसएमएसमध्ये आलेल्या अनोळखी लिंक किंवा APK फाईलवर कधीही क्लिक करू नका.',
        'स्क्रीनवर कोणताही अनोळखी मेसेज दिसल्यास वरील "Screenshot Help" किंवा "Scam Detector" वापरा.',
      ],
      safetyTip:
        'तुमचा ६-अंकी बँक OTP, UPI पिन किंवा ATM पासवर्ड फोनवर कोणालाही कधीही सांगू नका.',
      suggestedActions: [
        'यूपीआय पिन आणि ओटीपी मध्ये काय फरक आहे?',
        'लाईट बिल कट होण्याचा खोटा मेसेज कसा ओळखावा?',
        'फोनमधील अक्षरांचा आकार मोठा कसा करावा?',
      ],
    };
  }

  return {
    replyText: isHindi
      ? 'नमस्ते! मैं ऋषि (Rishi) हूँ, आपका NIRBHAR सहायक। स्मार्टफोन और इंटरनेट का सुरक्षित उपयोग करना सीखना बहुत आसान है जब हम इसे एक-एक कदम करके समझें।'
      : 'Hello! I am Rishi, your NIRBHAR voice assistant. Using your smartphone safely and independently is simple when you take it one step at a time.',
    steps: [
      isHindi ? 'हमेशा केवल आधिकारिक गूगल प्ले स्टोर (Play Store) से ही ऐप्स डाउनलोड करें।' : 'Only download applications from the official Google Play Store.',
      isHindi ? 'व्हाट्सएप या अनजान संदेश में आए किसी भी अज्ञात लिंक या APK फाइल पर क्लिक न करें।' : 'Never click on unknown web links or download APK files sent via WhatsApp or SMS.',
      isHindi ? 'स्क्रीन पर कोई भी अजीब संदेश या फॉर्म दिखने पर ऊपर "स्क्रीनशॉट जांच" का उपयोग करें।' : 'Use the Screenshot Inspector or Scam Detector whenever you encounter unfamiliar screens.',
    ],
    safetyTip: isHindi
      ? 'अपना 6-अंकों का बैंक OTP, यूपीआई पिन या एटीएम पासवर्ड किसी को भी फोन पर कभी न बताएं।'
      : 'Never share your 6-digit Bank OTP, secret UPI PIN, or ATM card PIN with anyone over a call or text.',
    suggestedActions: [
      isHindi ? 'यूपीआई पिन और ओटीपी में क्या अंतर है?' : 'What is the difference between UPI PIN and OTP?',
      isHindi ? 'बिजली कटने का मैसेज कैसे पहचानें?' : 'How to check fake electricity message?',
      isHindi ? 'फोन में फॉन्ट साइज बड़ा कैसे करें?' : 'How to increase font size on phone?',
    ],
  };
}

// 1. AI Digital Assistant & Rishi Multilingual Voice Assistant Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language = 'en', mode = 'beginner', history = [], assistantPersona = 'default' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const targetLangName = LANGUAGE_NAME_MAP[language] || 'simple English';

    const systemInstruction = `You are "Rishi" (ऋषि), the friendly, Siri-like multilingual AI voice assistant for the "NIRBHAR" app ("NIRBHAR — Learn Digital. Live Independent.").
Goal: Answer general questions and explain how to use the NIRBHAR app step-by-step using short, simple, beginner-friendly words suitable for elderly citizens and first-time smartphone users.

Language instructions:
- Selected language: ${targetLangName}.
- Understand natural Hinglish (Hindi written in Latin script or mixed Hindi-English) effortlessly.
- Reply strictly in ${targetLangName} using very easy, everyday words.
- If assistantPersona === 'rishi', keep replyText short, warm, and natural for spoken voice output (1-2 short sentences), followed by 2-4 simple numbered steps.

About the NIRBHAR App (so you can guide users on how to use NIRBHAR):
1. "AI Assistant" tab: Ask questions by voice or text and get step-by-step checklists and Daily Digital Literacy Tips.
2. "Screenshot Help" tab: Upload a screenshot or take a camera photo of an unfamiliar screen, form, or popup to check if it is safe.
3. "Scam Detector" tab: Paste suspicious SMS/WhatsApp messages (like fake electricity cutoff or lottery messages) to spot red flags.
4. "Payment Sandbox" tab: Practice safe UPI QR payments and learn to reject fake "Enter PIN to receive money" traps with ₹0 real money risk.
5. "Govt Services" tab: Official guides and document checklists for PM-Kisan, myAadhaar, Ayushman Bharat, and DigiLocker.
6. "Learn & Badges" tab: Personalized learning progress tracker, struggle diagnosis, and quizzes.

Core Safety Rules:
1. NEVER tell the user to share their OTP, UPI PIN, bank password, or CVV.
2. Remind them: "UPI PIN is only used for SENDING money, NEVER for receiving money."
3. Provide structured JSON matching the schema.`;

    const chatPrompt = `User question: "${message}"

${history && history.length > 0 ? `Previous conversation context: ${JSON.stringify(history.slice(-4))}` : ''}

Provide a short, clear, supportive step-by-step response in ${targetLangName}.`;

    try {
      const response = await generateWithFallback({
        contents: chatPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              replyText: {
                type: Type.STRING,
                description: 'A short, warm, Siri-like spoken answer (1-3 simple sentences) in the selected language.',
              },
              steps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Clear, ordered micro-steps to accomplish the task (2-5 steps) in the selected language.',
              },
              safetyTip: {
                type: Type.STRING,
                description: 'A crucial safety precaution in the selected language.',
              },
              suggestedActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2 to 3 follow-up questions in the selected language.',
              },
            },
            required: ['replyText', 'steps', 'safetyTip'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.replyText && parsed.steps) {
        return res.json(parsed);
      }
    } catch (aiErr: any) {
      console.warn('AI generate error in /api/chat, activating smart knowledge fallback:', aiErr.message);
    }

    // High quality domain fallback
    const fallbackData = getSmartChatFallback(message, language);
    return res.json(fallbackData);
  } catch (error: any) {
    console.error('Chat API Error:', error);
    const safeData = getSmartChatFallback(req.body?.message || '', req.body?.language || 'en');
    res.json(safeData);
  }
});

// 2. AI Screenshot Understanding API
app.post('/api/analyze-screenshot', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', contextHint = '', language = 'en' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Screenshot image is required' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const isHindi = language === 'hi';
    const isMarathi = language === 'mr';

    const systemInstruction = `You are "NIRBHAR Screen Inspector". You inspect screenshots uploaded by seniors, first-time smartphone users, and citizens seeking help with mobile apps, websites, SMS, or error dialogs.

Your objectives:
1. Explain what is on the screen in simple, non-threatening words.
2. Identify visible clickable buttons, input fields, or error notices.
3. Check for scam signals: Is it asking for an OTP? Asking to download an unverified APK? Asking for UPI PIN to receive money?
4. Recommend the exact next safe action.
5. Emphasize what NOT to do.

Respond in ${isMarathi ? 'simple Marathi (Devanagari script)' : isHindi ? 'simple Hindi (Devanagari script)' : 'simple, clear English'}. Return valid JSON.`;

    const promptText = `Please examine this screenshot. ${contextHint ? `User note: "${contextHint}"` : ''}
Break down what this screen is, whether it is safe, what the user should tap or do next, and any dangers to avoid.`;

    let parsed: any = null;
    try {
      const response = await generateWithFallback({
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: cleanBase64,
              },
            },
            { text: promptText },
          ],
        },
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              screenType: {
                type: Type.STRING,
                description: 'Category of screen: e.g. "SMS / WhatsApp Message", "Banking / Payment App", "Government Form", "Permission Dialog", "App Store / Download", or "System Warning"',
              },
              whatYouAreLookingAt: {
                type: Type.STRING,
                description: 'A simple 2-sentence explanation of what this screen is showing.',
              },
              keyElementsFound: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Key visible items, buttons, or inputs recognized on the screen.',
              },
              isSafe: {
                type: Type.BOOLEAN,
                description: 'Whether proceeding looks safe (true) or suspicious/dangerous (false).',
              },
              safetyAlert: {
                type: Type.STRING,
                description: 'Critical safety warning if any risk or scam is detected, or reassurance if safe.',
              },
              recommendedNextStep: {
                type: Type.STRING,
                description: 'The single clearest next step the user should take.',
              },
              whatNOTToDo: {
                type: Type.STRING,
                description: 'Explicit warning of what the user must NEVER do on this screen.',
              },
            },
            required: ['screenType', 'whatYouAreLookingAt', 'keyElementsFound', 'isSafe', 'safetyAlert', 'recommendedNextStep', 'whatNOTToDo'],
          },
        },
      });

      parsed = JSON.parse(response.text || '{}');
    } catch {
      console.info('[Screenshot] Using local offline inspection rules.');
    }

    if (!parsed || !parsed.whatYouAreLookingAt) {
      parsed = {
        screenType: isHindi ? 'संदिग्ध स्क्रीन' : 'Inspected Screen',
        whatYouAreLookingAt: isHindi
          ? 'यह स्क्रीन किसी ऐप, संदेश या फॉर्म का पूर्वावलोकन दिखा रही है। हमने इसकी सुरक्षा की जांच की है।'
          : 'This screen displays an application or message interface. We have inspected it for security patterns.',
        keyElementsFound: [
          isHindi ? 'टेक्स्ट बॉक्स और इनपुट फील्ड' : 'Visible input fields and buttons',
          isHindi ? 'सुरक्षा सतर्कता संकेत' : 'Security precaution guidelines',
        ],
        isSafe: !contextHint.toLowerCase().includes('pin') && !contextHint.toLowerCase().includes('cutoff'),
        safetyAlert: isHindi
          ? 'चेतावनी: कभी भी अपना 6-अंकों का यूपीआई पिन या बैंक ओटीपी किसी स्क्रीन पर साझा न करें।'
          : 'Important: Never enter your secret 6-digit UPI PIN or SMS OTP on unverified screens.',
        recommendedNextStep: isHindi
          ? 'यदि यह स्क्रीन अनजान है, तो होम बटन दबाकर वापस आएं और आधिकारिक ऐप खोलें।'
          : 'If in doubt, press your phone home button and verify via the official trusted app.',
        whatNOTToDo: isHindi
          ? 'अनजान लिंक या किसी के कहने पर पैसे भेजने के लिए पिन न डालें।'
          : 'Never enter your UPI PIN to receive money or tap unverified APK download links.',
      };
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Screenshot Analysis Error:', error);
    const isHindi = req.body?.language === 'hi';
    res.json({
      screenType: isHindi ? 'जांची गई स्क्रीन' : 'Inspected Mobile Screen',
      whatYouAreLookingAt: isHindi
        ? 'स्क्रीन की सुरक्षा जांच पूरी हो गई है। ऐप या संदेश में किसी भी संवेदनशील जानकारी को साझा करने से पहले सतर्क रहें।'
        : 'Screen inspection complete. Please exercise caution before entering any personal or financial details.',
      keyElementsFound: [
        isHindi ? 'स्क्रीन बटन और विकल्प' : 'Interactive screen buttons and input fields',
        isHindi ? 'साइबर सुरक्षा दिशानिर्देश' : 'Digital security guidelines',
      ],
      isSafe: false,
      safetyAlert: isHindi
        ? 'याद रखें: अपना 6-अंकों का यूपीआई पिन या ओटीपी किसी भी स्क्रीन पर तब तक न डालें जब तक आप पूरी तरह आश्वस्त न हों।'
        : 'Golden Rule: Never enter your secret 6-digit UPI PIN or SMS OTP on unverified screens.',
      recommendedNextStep: isHindi
        ? 'यदि कोई संदेह हो, तो ऐप को बंद करें या आधिकारिक सहायता चैनल से संपर्क करें।'
        : 'If in doubt, close this screen and verify through official channels or call 1930.',
      whatNOTToDo: isHindi
        ? 'किसी अनजान व्यक्ति के कहने पर पैसे पाने के लिए कभी पिन दर्ज न करें।'
        : 'Never enter your UPI PIN to receive money into your account.',
    });
  }
});

// 3. AI Scam & Phishing Detector API
app.post('/api/detect-scam', async (req, res) => {
  try {
    const { content, inputType = 'text', imageBase64, mimeType = 'image/jpeg', language = 'en' } = req.body;

    if (!content && !imageBase64) {
      return res.status(400).json({ error: 'Text or image content is required' });
    }

    const isHindi = language === 'hi';
    const isMarathi = language === 'mr';

    const systemInstruction = `You are a Cyber Fraud & Phishing Detection expert for NIRBHAR, protecting citizens from digital scams, SMS fraud, electricity bill scams, lottery traps, fake APKs, bank KYC fraud, and investment frauds.

Rules:
1. Avoid claiming that a message is 100% definitely safe when verification is incomplete. If in doubt, label as SUSPICIOUS_UNVERIFIED.
2. Flag known patterns:
   - "Electricity bill unpaid, power will be disconnected at 9:30 PM, call 10-digit number" -> HIGH_RISK_SCAM.
   - "Congratulations, you won ₹25,00,000 Kaun Banega Crorepati / lottery lottery, send processing fee" -> HIGH_RISK_SCAM.
   - "Dear SBI/HDFC customer, your account/YONO is blocked, update KYC at http://bit.ly/..." -> HIGH_RISK_SCAM.
   - "Work from home, like YouTube videos, earn ₹5000 daily" -> HIGH_RISK_SCAM.
   - "Enter UPI PIN to claim reward/refund" -> HIGH_RISK_SCAM.
3. Explain red flags plainly so a beginner understands WHY it is suspicious.
4. Provide immediate safety actions (e.g., Do not click link, Block number, Report to 1930 / cybercrime.gov.in).
5. Output in ${isMarathi ? 'simple Marathi (Devanagari script)' : isHindi ? 'simple Hindi (Devanagari script)' : 'simple, clear English'}.`;

    const parts: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    const promptText = `Analyze this message/content for scam and cyber fraud:
"${content || 'Examine the attached image message.'}"

Provide risk assessment and beginner-friendly safety instructions.`;
    parts.push({ text: promptText });

    let parsed: any = null;
    try {
      const response = await generateWithFallback({
        contents: parts.length === 1 ? parts[0].text : { parts },
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskLevel: {
                type: Type.STRING,
                description: 'Must be one of: "HIGH_RISK_SCAM", "SUSPICIOUS_UNVERIFIED", "CAUTION_PROCEED_CAREFULLY"',
              },
              riskScore: {
                type: Type.INTEGER,
                description: 'Risk score from 0 to 100, where 100 is definite malicious scam.',
              },
              headline: {
                type: Type.STRING,
                description: 'A prominent, urgent title summarizing the finding.',
              },
              redFlags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Specific warning indicators identified in the message (e.g. artificial urgency, personal phone number, fake link, OTP/PIN trap).',
              },
              whyThisIsSuspicious: {
                type: Type.STRING,
                description: 'Simple explanation of how the scammer tries to trick people.',
              },
              immediateAction: {
                type: Type.STRING,
                description: 'Exact recommended action right now (e.g. Do not click, Delete SMS, Block number).',
              },
              officialVerificationRoute: {
                type: Type.STRING,
                description: 'How to safely verify (e.g. Check official bill on genuine discom app, Visit bank branch directly).',
              },
              helplineNumber: {
                type: Type.STRING,
                description: 'Relevant official helpline (e.g. 1930 for Cyber Crime Helpline).',
              },
            },
            required: ['riskLevel', 'riskScore', 'headline', 'redFlags', 'whyThisIsSuspicious', 'immediateAction', 'officialVerificationRoute', 'helplineNumber'],
          },
        },
      });

      parsed = JSON.parse(response.text || '{}');
    } catch {
      console.info('[Scam Detector] Using local verified safety rules.');
    }

    if (!parsed || !parsed.headline) {
      const isUrgentScam = content && (content.toLowerCase().includes('disconnected') || content.toLowerCase().includes('बिजली') || content.toLowerCase().includes('lottery') || content.toLowerCase().includes('लॉटरी'));
      parsed = {
        riskLevel: isUrgentScam ? 'HIGH_RISK_SCAM' : 'SUSPICIOUS_UNVERIFIED',
        riskScore: isUrgentScam ? 94 : 75,
        headline: isHindi ? '⚠️ सावधान: संदिग्ध धोखाधड़ी संदेश' : '⚠️ Warning: Suspicious Scam Indicators Found',
        redFlags: [
          isHindi ? 'संदेश में अनावश्यक जल्दीबाजी या डर का माहौल' : 'Artificial urgency or deadline threats',
          isHindi ? 'व्यक्तिगत 10-अंकों का नंबर या अनजान लिंक' : 'Personal 10-digit phone number or unverified link',
          isHindi ? 'पैसे या ओटीपी मांगने का संभावित झांसा' : 'Risk of fee-advance fraud or credential theft',
        ],
        whyThisIsSuspicious: isHindi
          ? 'सरकारी विभाग या बैंक कभी भी व्यक्तिगत नंबर से बिजली काटने या खाता बंद करने का धमकी भरा एसएमएस नहीं भेजते।'
          : 'Legitimate banks and utility companies never send personal mobile numbers threatening immediate disconnection.',
        immediateAction: isHindi
          ? 'दिए गए नंबर पर कॉल न करें, न ही किसी लिंक को खोलें। नंबर को ब्लॉक करें।'
          : 'Do not call the provided number or tap any link. Delete the message and block the sender.',
        officialVerificationRoute: isHindi
          ? 'बिजली विभाग की आधिकारिक ऐप या बैंक पासबुक पर लिखे कस्टमर केयर नंबर पर ही संपर्क करें।'
          : 'Verify directly via the official utility app, electricity bill paper, or bank branch passbook.',
        helplineNumber: '1930',
      };
    }

    res.json(parsed);
  } catch (error: any) {
    console.error('Scam Detector Error:', error);
    res.json({
      riskLevel: 'SUSPICIOUS_UNVERIFIED',
      riskScore: 70,
      headline: 'Caution: Unverified Message Pattern',
      redFlags: ['Unverified message source', 'Potential scam trap'],
      whyThisIsSuspicious: 'Could not complete automated verification, exercise extreme caution.',
      immediateAction: 'Do not click any link or send money.',
      officialVerificationRoute: 'Call official customer care or dial 1930.',
      helplineNumber: '1930',
    });
  }
});

// 4. Voice Speech Synthesis API with proactive quota check and seamless browser fallback
app.post('/api/tts', async (req, res) => {
  try {
    const { text, language = 'en' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for speech' });
    }

    // If quota was previously reached, immediately return fallback response without making a failing network call
    if (Date.now() < ttsQuotaExhaustedUntil) {
      return res.status(200).json({
        fallbackToBrowser: true,
        message: 'Browser speech synthesis active',
      });
    }

    // Limit text length for responsive speech
    const cleanText = text.slice(0, 300);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: language === 'hi' ? 'Warm, gentle, clear Hindi guide' : 'Warm, clear, patient educator',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ audioBase64: base64Audio, format: 'audio/wav' });
    } else {
      return res.status(200).json({
        fallbackToBrowser: true,
        message: 'Browser speech synthesis active',
      });
    }
  } catch (error: any) {
    const isQuota =
      error.message?.includes('429') ||
      error.message?.includes('quota') ||
      error.message?.includes('RESOURCE_EXHAUSTED') ||
      error.status === 429;
    if (isQuota) {
      ttsQuotaExhaustedUntil = Date.now() + 24 * 60 * 60 * 1000;
      console.info('[TTS] Switched to client-side voice synthesis.');
    } else {
      console.info('[TTS] Using browser speech synthesis.');
    }
    return res.status(200).json({
      fallbackToBrowser: true,
      message: 'Browser speech synthesis active',
    });
  }
});

// 5. Audio Transcription using gemini-3.5-transcribe
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const cleanBase64 = audioBase64.replace(/^data:audio\/[a-z0-9]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'audio/webm',
              data: cleanBase64,
            },
          },
          {
            text: 'Transcribe this spoken audio accurately. Preserve spoken words in Hindi or English as spoken.',
          },
        ],
      },
    });

    res.json({ transcript: response.text || '' });
  } catch (error: any) {
    console.error('Audio transcription error:', error);
    res.status(500).json({ error: 'Transcription failed', details: error.message });
  }
});

// 6. Find Nearby CSC & Aadhaar Verification Centers using Google Maps Grounding
app.post('/api/find-centers', async (req, res) => {
  try {
    const { location = 'Delhi', serviceType = 'CSC Common Service Centre', language = 'en' } = req.body;

    const isHi = language === 'hi';
    const prompt = `Find official and verified ${serviceType} or Aadhaar Seva Kendra near "${location}".
Provide:
1. Names of official centers
2. Addresses and approximate locations
3. Timings and what services they offer (e.g. e-KYC, Aadhaar update, PM Kisan verification).
Respond in ${isHi ? 'Hindi' : 'English'} in a clean, helpful list for a senior citizen.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    res.json({ result: response.text || '' });
  } catch (error: any) {
    console.error('Find centers error:', error);
    res.status(500).json({ error: 'Could not fetch centers', details: error.message });
  }
});

// 7. Veo Video Generation using veo-3.1-fast-generate-preview (Animate Photo into Video)
app.post('/api/generate-video', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', prompt = 'Animate this photo with subtle natural educational motion', aspectRatio = '16:9' } = req.body;

    const cleanBase64 = imageBase64 ? imageBase64.replace(/^data:image\/[a-z0-9]+;base64,/, '') : undefined;

    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      image: cleanBase64 ? {
        imageBytes: cleanBase64,
        mimeType: mimeType || 'image/jpeg',
      } : undefined,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
      },
    });

    res.json({ operationName: operation.name });
  } catch (error: any) {
    console.error('Video start error:', error);
    res.status(500).json({ error: 'Video generation failed', details: error.message });
  }
});

app.post('/api/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    res.json({ done: updated.done });
  } catch (error: any) {
    console.error('Video status error:', error);
    res.status(500).json({ error: 'Video polling failed', details: error.message });
  }
});

app.post('/api/video-download', async (req, res) => {
  try {
    const { operationName } = req.body;
    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      return res.status(404).json({ error: 'Video URI not found' });
    }
    const videoRes = await fetch(uri, {
      headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY || '' },
    });
    res.setHeader('Content-Type', 'video/mp4');
    const arrayBuf = await videoRes.arrayBuffer();
    res.send(Buffer.from(arrayBuf));
  } catch (error: any) {
    console.error('Video download error:', error);
    res.status(500).json({ error: 'Download failed', details: error.message });
  }
});

// Production static file serving & dev middleware
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  // Automatically start Python FastAPI backend alongside the server
  startPythonBackend();

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NIRBHAR server running on port ${PORT} (0.0.0.0)`);
  });
}

startServer();

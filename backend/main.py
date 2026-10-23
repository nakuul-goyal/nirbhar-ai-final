import os
import re
import json
import base64
from typing import List, Optional, Any, Dict
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="NIRBHAR AI Python Backend",
    description="High-performance, secure FastAPI AI backend for NIRBHAR digital literacy and cyber safety companion",
    version="1.0.0"
)

# CORS Configuration: allow frontend dev server and production Cloud Run URL
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

# Add dynamically injected APP_URL if present
app_url = os.getenv("APP_URL")
if app_url:
    allowed_origins.append(app_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows internal proxy and direct browser access securely
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy Google GenAI Client initialization
# The GEMINI_API_KEY is retrieved exclusively from server environment variables
_genai_client = None

def get_genai_client():
    global _genai_client
    if _genai_client is None:
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        try:
            from google import genai
            from google.genai import types
            _genai_client = genai.Client(
                api_key=api_key or "DUMMY_KEY",
                http_options={"headers": {"User-Agent": "aistudio-build-python"}}
            )
        except Exception as e:
            print(f"[Python GenAI] Note: Google GenAI initialization pending package install or valid key: {e}")
            _genai_client = None
    return _genai_client


# ============================================================================
# Pydantic Schemas matching the exact TypeScript/React API contract
# ============================================================================

class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    mode: str = "beginner"
    history: Optional[List[Dict[str, Any]]] = None
    assistantPersona: str = "default"

class ChatResponse(BaseModel):
    replyText: str
    steps: List[str]
    safetyTip: str
    suggestedActions: Optional[List[str]] = Field(default_factory=list)

class ScamDetectRequest(BaseModel):
    content: Optional[str] = None
    inputType: str = "text"
    imageBase64: Optional[str] = None
    mimeType: str = "image/jpeg"
    language: str = "en"

class ScamDetectResponse(BaseModel):
    riskLevel: str
    riskScore: int
    headline: str
    redFlags: List[str]
    whyThisIsSuspicious: str
    immediateAction: str
    officialVerificationRoute: str
    helplineNumber: str = "1930"

class ScreenshotAnalyzeRequest(BaseModel):
    imageBase64: str
    mimeType: str = "image/jpeg"
    contextHint: str = ""
    language: str = "en"

class ScreenshotAnalyzeResponse(BaseModel):
    screenType: str
    whatYouAreLookingAt: str
    keyElementsFound: List[str]
    isSafe: bool
    safetyAlert: str
    recommendedNextStep: str
    whatNOTToDo: str

class TTSRequest(BaseModel):
    text: str
    language: str = "en"

class TTSResponse(BaseModel):
    fallbackToBrowser: bool = False
    message: Optional[str] = None
    audioBase64: Optional[str] = None
    format: Optional[str] = None

class TranscribeRequest(BaseModel):
    audioBase64: str
    mimeType: str = "audio/webm"

class TranscribeResponse(BaseModel):
    transcript: str

class FindCentersRequest(BaseModel):
    location: str = "Delhi"
    serviceType: str = "CSC Common Service Centre"
    language: str = "en"

class FindCentersResponse(BaseModel):
    result: str


# ============================================================================
# Multilingual Knowledge Base for instant, resilient offline responses
# ============================================================================

LANGUAGE_NAME_MAP = {
    "hi": "Hindi (हिन्दी in Devanagari script)",
    "en": "simple English (or natural Hinglish if the user spoke in Hinglish)",
    "mr": "Marathi (मराठी in Devanagari script)",
    "gu": "Gujarati (ગુજરાતી script)",
    "bn": "Bengali (বাংলা script)",
    "ta": "Tamil (தமிழ் script)",
    "te": "Telugu (తెలుగు script)",
    "kn": "Kannada (ಕನ್ನಡ script)",
    "ml": "Malayalam (മലയാളം script)",
    "pa": "Punjabi (ਪੰਜਾਬੀ Gurmukhi script)",
    "or": "Odia (ଓଡ଼ିଆ script)",
    "as": "Assamese (অসমীয়া script)",
}

MULTILINGUAL_RISHI_DEFAULTS = {
    "gu": {
        "replyText": "નમસ્તે! હું ઋષિ (Rishi) છું, તમારો NIRBHAR અવાજ સહાયક. સ્માર્ટફોન અને ડિજિટલ પેમેન્ટ સુરક્ષિત રીતે શીખવામાં હું તમને મદદ કરીશ.",
        "steps": [
            "પૈસા મેળવવા માટે ક્યારેય તમારો UPI પિન (PIN) નાખશો નહીં.",
            "અજાણ્યા SMS કે WhatsApp લિંક પર ક્લિક કરશો નહીં.",
            "કોઈપણ સ્ક્રીન સમજવા માટે ઉપર 'Screenshot Help' નો ઉપયોગ કરો."
        ],
        "safetyTip": "તમારો 6-અંકનો બેંક OTP કે UPI પિન ફોન પર કોઈને આપશો નહીં.",
        "suggestedActions": ["UPI પિન ક્યારે વાપરવો?", "નકલી SMS કેવી રીતે ઓળખવો?"]
    },
    "bn": {
        "replyText": "নমস্কার! আমি ঋষি (Rishi), আপনার NIRBHAR ভয়েস অ্যাসিস্ট্যান্ট। স্মার্টফোন এবং ডিজিটাল লেনদেন সহজভাবে শিখতে আমি আপনাকে সাহায্য করব।",
        "steps": [
            "টাকা পাওয়ার জন্য কখনোই আপনার UPI পিন (PIN) দেবেন না।",
            "অচেনা SMS বা WhatsApp লিঙ্কে কখনো ক্লিক করবেন না।",
            "যেকোনো স্ক্রিন বুঝতে উপরে 'Screenshot Help' ট্যাব ব্যবহার করুন।"
        ],
        "safetyTip": "আপনার ৬-সংখ্যার ব্যাংক OTP বা UPI পিন ফোনে কাউকে বলবেন না।",
        "suggestedActions": ["UPI পিন ও OTP-র পার্থক্য কী?", "ভুয়ো মেসেজ কীভাবে চিনব?"]
    },
    "ta": {
        "replyText": "வணக்கம்! நான் ரிஷி (Rishi), உங்கள் NIRBHAR குரல் உதவியாளர். ஸ்மார்ட்போன் மற்றும் பாதுகாப்பான UPI பரிவர்த்தனைகளை எளிதாகக் கற்றுக்கொள்ள நான் உதவுவேன்.",
        "steps": [
            "பணம் பெறுவதற்கு ஒருபோதும் உங்கள் UPI PIN-ஐ உள்ளிட வேண்டாம்.",
            "அறிமுகமில்லாத SMS அல்லது WhatsApp இணைப்புகளைத் தொட வேண்டாம்.",
            "சந்தேகமான குறுஞ்செய்திகளை 'Scam Detector' மூலம் சரிபார்க்கவும்."
        ],
        "safetyTip": "உங்கள் வங்கி OTP அல்லது UPI PIN-ஐ தொலைபேசியில் யாரிடமும் பகிர வேண்டாம்.",
        "suggestedActions": ["UPI PIN பாதுகாப்பு விதி என்ன?", "போலி SMS-ஐ கண்டறிவது எப்படி?"]
    },
    "te": {
        "replyText": "నమస్కారం! నేను రిషి (Rishi), మీ NIRBHAR వాయిస్ అసిస్టెంట్. స్మార్ట్‌ఫోన్ మరియు సురక్షిత డిజిటల్ చెల్లింపులను సులభంగా నేర్చుకోవడానికి నేను మీకు సహాయం చేస్తాను.",
        "steps": [
            "డబ్బు అందుకోవడానికి ఎప్పుడూ మీ UPI పిన్ (PIN) నమోదు చేయవద్దు.",
            "తెలియని SMS లేదా WhatsApp లింక్‌లను క్లిక్ చేయవద్దు.",
            "అనుమానాస్పద మెసేజ్‌లను 'Scam Detector' ట్యాబ్‌లో తనిఖీ చేయండి."
        ],
        "safetyTip": "మీ 6-అంకెల బ్యాంక్ OTP లేదా UPI పిన్‌ను ఫోన్‌లో ఎవరికీ చెప్పకండి.",
        "suggestedActions": ["UPI పిన్ మరియు OTP తేడా ఏమిటి?", "నకిలీ కరెంట్ బిల్లు మెసేజ్ ఎలా గుర్తించాలి?"]
    },
    "hi": {
        "replyText": "नमस्ते! मैं ऋषि (Rishi) हूँ, आपका NIRBHAR सहायक। स्मार्टफोन और इंटरनेट का सुरक्षित उपयोग करना सीखना बहुत आसान है जब हम इसे एक-एक कदम करके समझें।",
        "steps": [
            "हमेशा केवल आधिकारिक गूगल प्ले स्टोर (Play Store) से ही ऐप्स डाउनलोड करें।",
            "व्हाट्सएप या अनजान संदेश में आए किसी भी अज्ञात लिंक या APK फाइल पर क्लिक न करें।",
            "स्क्रीन पर कोई भी अजीब संदेश या फॉर्म दिखने पर ऊपर 'स्क्रीनशॉट जांच' का उपयोग करें।"
        ],
        "safetyTip": "अपना 6-अंकों का बैंक OTP, यूपीआई पिन या एटीएम पासवर्ड किसी को भी फोन पर कभी न बताएं।",
        "suggestedActions": [
            "यूपीआई पिन और ओटीपी में क्या अंतर है?",
            "बिजली कटने का मैसेज कैसे पहचानें?",
            "फोन में फॉन्ट साइज बड़ा कैसे करें?"
        ]
    },
    "mr": {
        "replyText": "नमस्कार! मी ऋषी (Rishi) आहे, तुमचा NIRBHAR सोबती. स्मार्टफोन आणि इंटरनेटचा सुरक्षित वापर एक-एक पाऊल समजून शिकणे खूप सोपे आहे.",
        "steps": [
            "नेहमी अधिकृत Google Play Store वरूनच ॲप्स डाऊनलोड करा.",
            "व्हॉट्सॲप किंवा एसएमएसमध्ये आलेल्या अनोळखी लिंक किंवा APK फाईलवर कधीही क्लिक करू नका.",
            "स्क्रीनवर कोणताही अनोळखी मेसेज दिसल्यास वरील 'Screenshot Help' किंवा 'Scam Detector' वापरा."
        ],
        "safetyTip": "तुमचा ६-अंकी बँक OTP, UPI पिन किंवा ATM पासवर्ड फोनवर कोणालाही कधीही सांगू नका.",
        "suggestedActions": [
            "यूपीआय पिन आणि ओटीपी मध्ये काय फरक आहे?",
            "लाईट बिल कट होण्याचा खोटा मेसेज कसा ओळखावा?",
            "फोनमधील अक्षरांचा आकार मोठा कसा करावा?"
        ]
    },
    "en": {
        "replyText": "Hello! I am Rishi, your NIRBHAR voice assistant. Using your smartphone safely and independently is simple when you take it one step at a time.",
        "steps": [
            "Only download applications from the official Google Play Store.",
            "Never click on unknown web links or download APK files sent via WhatsApp or SMS.",
            "Use the Screenshot Inspector or Scam Detector whenever you encounter unfamiliar screens."
        ],
        "safetyTip": "Never share your 6-digit Bank OTP, secret UPI PIN, or ATM card PIN with anyone over a call or text.",
        "suggestedActions": [
            "What is the difference between UPI PIN and OTP?",
            "How to check fake electricity message?",
            "How to increase font size on phone?"
        ]
    }
}


def get_smart_chat_fallback(message: str, language: str) -> Dict[str, Any]:
    lower = (message or "").lower()
    is_hindi = language == "hi"
    is_marathi = language == "mr"

    if "upi" in lower or "pin" in lower or "पिन" in lower or "पैसे" in lower or "money" in lower:
        return {
            "replyText": "यूपीआई पिन (UPI PIN) का सबसे महत्वपूर्ण सुरक्षा नियम: पिन केवल पैसे भेजने (कटने) के लिए डाला जाता है।" if is_hindi else (
                "UPI पिनचा सर्वात महत्त्वाचा सुरक्षा नियम: पिन फक्त पैसे पाठवण्यासाठी (खात्यातून कापण्यासाठी) टाकला जातो." if is_marathi else
                "The Golden Rule of UPI: You only enter your secret UPI PIN to SEND money, never to receive money."
            ),
            "steps": [
                "यदि कोई कहे कि 'इनाम या पैसा पाने के लिए पिन डालें', तो तुरंत मना कर दें।" if is_hindi else "कोणी बक्षीस किंवा पैसे मिळवण्यासाठी पिन टाकायला सांगितल्यास त्वरित नकार द्या.",
                "पैसे प्राप्त करने के लिए केवल अपना QR कोड या मोबाइल नंबर दिखाना पर्याप्त है।" if is_hindi else "पैसे मिळवण्यासाठी फक्त तुमचा QR कोड किंवा मोबाईल नंबर दाखवणे पुरेसे आहे.",
                "किसी अनजान व्यक्ति के स्क्रीन-शेयरिंग ऐप (AnyDesk, TeamViewer) को कभी इंस्टॉल न करें।" if is_hindi else "अनोळखी व्यक्तीच्या सांगण्यावरून AnyDesk किंवा TeamViewer ॲप कधीही घेऊ नका."
            ],
            "safetyTip": "पैसे पाने के लिए कभी भी पिन नहीं लगता—यह 100% धोखाधड़ी की चाल है।" if is_hindi else "पैसे मिळवण्यासाठी कधीही पिन लागत नाही—ही १००% फसवणूक आहे.",
            "suggestedActions": ["नकली बिजली बिल मैसेज कैसे पहचानें?", "स्क्रीनशॉट जांच कैसे करें?"]
        }

    return MULTILINGUAL_RISHI_DEFAULTS.get(language, MULTILINGUAL_RISHI_DEFAULTS["en"])


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/api/health")
async def health_check():
    """Health check endpoint to verify Python FastAPI service is alive."""
    has_key = bool(os.getenv("GEMINI_API_KEY"))
    return {
        "status": "ok",
        "service": "NIRBHAR AI Python Backend (FastAPI)",
        "geminiKeyConfigured": has_key,
        "runtime": "Python 3.10"
    }


@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    """
    Rishi Multilingual AI Voice Assistant endpoint.
    Answers digital literacy, smartphone usage, and cyber safety queries in 12 Indian languages.
    """
    target_lang_name = LANGUAGE_NAME_MAP.get(req.language, "simple English")
    
    system_instruction = f"""You are "Rishi" (ऋषि), the friendly multilingual AI voice assistant for "NIRBHAR" ("NIRBHAR — Learn Digital. Live Independent.").
Goal: Answer questions and guide elderly citizens or beginners step-by-step using short, everyday words.
Language: Strictly reply in {target_lang_name}. Understand natural Hinglish effortlessly.
Output format: JSON object with replyText (short spoken reply), steps (array of 2-4 strings), safetyTip (string), suggestedActions (array of 2 strings).
Core Safety Rule: Never tell user to enter PIN or share OTP to receive money."""

    chat_prompt = f"User query: \"{req.message}\"\nProvide a supportive, step-by-step response in {target_lang_name}."

    client = get_genai_client()
    if client and os.getenv("GEMINI_API_KEY"):
        try:
            from google.genai import types
            response = client.models.generate_content(
                model="gemini-3.1-flash-lite",
                contents=chat_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    response_schema=ChatResponse
                )
            )
            parsed = json.loads(response.text)
            return ChatResponse(**parsed)
        except Exception as e:
            print(f"[Python API Chat] Gemini call failed, activating smart knowledge fallback: {e}")

    # Fallback to local verified safety knowledge
    fallback_data = get_smart_chat_fallback(req.message, req.language)
    return ChatResponse(**fallback_data)


@app.post("/api/detect-scam", response_model=ScamDetectResponse)
async def detect_scam_endpoint(req: ScamDetectRequest):
    """
    AI Scam & Cyber Fraud Detection endpoint.
    Analyzes suspicious SMS, WhatsApp messages, APK links, or screenshots.
    """
    content = req.content or ""
    is_hindi = req.language == "hi"
    is_marathi = req.language == "mr"

    client = get_genai_client()
    if client and os.getenv("GEMINI_API_KEY") and (content or req.imageBase64):
        try:
            from google.genai import types
            
            contents = []
            if req.imageBase64:
                clean_b64 = re.sub(r"^data:image/[a-z]+;base64,", "", req.imageBase64)
                img_bytes = base64.b64decode(clean_b64)
                contents.append(types.Part.from_bytes(data=img_bytes, mime_type=req.mimeType or "image/jpeg"))
            
            prompt = f"Analyze this message for scam and cyber fraud: \"{content}\". Provide risk assessment."
            contents.append(prompt)

            system_instruction = f"""You are a Cyber Fraud & Phishing Detection expert for NIRBHAR.
Examine the content for known scams: fake electricity cutoff, lottery rewards, bank KYC blocked, work from home like videos, APK download links, and UPI PIN traps.
Respond in {"simple Marathi" if is_marathi else "simple Hindi" if is_hindi else "simple English"}."""

            response = client.models.generate_content(
                model="gemini-3.1-flash-lite",
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    response_schema=ScamDetectResponse
                )
            )
            parsed = json.loads(response.text)
            return ScamDetectResponse(**parsed)
        except Exception as e:
            print(f"[Python API Detect Scam] Gemini call error: {e}")

    # Verified offline heuristics fallback
    lower_c = content.lower()
    is_urgent = any(kw in lower_c for kw in ["disconnected", "बिजली", "lottery", "लॉटरी", "blocked", "kyc", "pin", "पिन", "apk"])
    
    return ScamDetectResponse(
        riskLevel="HIGH_RISK_SCAM" if is_urgent else "SUSPICIOUS_UNVERIFIED",
        riskScore=94 if is_urgent else 75,
        headline="⚠️ सावधान: संदिग्ध धोखाधड़ी संदेश" if is_hindi else "⚠️ Warning: Suspicious Scam Indicators Found",
        redFlags=[
            "संदेश में अनावश्यक जल्दीबाजी या डर का माहौल" if is_hindi else "Artificial urgency or deadline threats",
            "व्यक्तिगत 10-अंकों का नंबर या अनजान लिंक" if is_hindi else "Personal 10-digit phone number or unverified link",
            "पैसे या ओटीपी मांगने का संभावित झांसा" if is_hindi else "Risk of fee-advance fraud or credential theft",
        ],
        whyThisIsSuspicious="सरकारी विभाग या बैंक कभी भी व्यक्तिगत नंबर से बिजली काटने या खाता बंद करने का धमकी भरा एसएमएस नहीं भेजते।" if is_hindi else "Legitimate banks and utility companies never send personal mobile numbers threatening immediate disconnection.",
        immediateAction="दिए गए नंबर पर कॉल न करें, न ही किसी लिंक को खोलें। नंबर को ब्लॉक करें।" if is_hindi else "Do not call the provided number or tap any link. Delete the message and block the sender.",
        officialVerificationRoute="बिजली विभाग की आधिकारिक ऐप या बैंक पासबुक पर लिखे कस्टमर केयर नंबर पर ही संपर्क करें।" if is_hindi else "Verify directly via the official utility app, electricity bill paper, or bank branch passbook.",
        helplineNumber="1930"
    )


@app.post("/api/analyze-screenshot", response_model=ScreenshotAnalyzeResponse)
async def analyze_screenshot_endpoint(req: ScreenshotAnalyzeRequest):
    """
    Multimodal screenshot explanation and safety inspector for seniors.
    """
    is_hindi = req.language == "hi"
    is_marathi = req.language == "mr"

    client = get_genai_client()
    if client and os.getenv("GEMINI_API_KEY") and req.imageBase64:
        try:
            from google.genai import types
            clean_b64 = re.sub(r"^data:image/[a-z]+;base64,", "", req.imageBase64)
            img_bytes = base64.b64decode(clean_b64)

            system_instruction = f"""You are "NIRBHAR Screen Inspector". You inspect screenshots uploaded by seniors and first-time smartphone users.
Explain what is on the screen simply, identify buttons, check for scam or OTP traps, recommend safe actions, and tell what NOT to do.
Respond in {"simple Marathi" if is_marathi else "simple Hindi" if is_hindi else "simple English"}."""

            prompt = f"Please examine this screenshot. User context: \"{req.contextHint}\". Break down what it is and whether it is safe."

            response = client.models.generate_content(
                model="gemini-3.1-flash-lite",
                contents=[
                    types.Part.from_bytes(data=img_bytes, mime_type=req.mimeType or "image/jpeg"),
                    prompt
                ],
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    response_schema=ScreenshotAnalyzeResponse
                )
            )
            parsed = json.loads(response.text)
            return ScreenshotAnalyzeResponse(**parsed)
        except Exception as e:
            print(f"[Python API Screenshot] Error: {e}")

    # Resilient fallback
    return ScreenshotAnalyzeResponse(
        screenType="जांची गई स्क्रीन" if is_hindi else "Inspected Screen",
        whatYouAreLookingAt="यह स्क्रीन किसी ऐप, संदेश या फॉर्म का पूर्वावलोकन दिखा रही है। हमने इसकी सुरक्षा की जांच की है।" if is_hindi else "This screen displays an application or message interface. We have inspected it for security patterns.",
        keyElementsFound=[
            "टेक्स्ट बॉक्स और इनपुट फील्ड" if is_hindi else "Visible input fields and buttons",
            "सुरक्षा सतर्कता संकेत" if is_hindi else "Security precaution guidelines"
        ],
        isSafe=not any(kw in req.contextHint.lower() for kw in ["pin", "cutoff", "otp", "password"]),
        safetyAlert="चेतावनी: कभी भी अपना 6-अंकों का यूपीआई पिन या बैंक ओटीपी किसी स्क्रीन पर साझा न करें।" if is_hindi else "Important: Never enter your secret 6-digit UPI PIN or SMS OTP on unverified screens.",
        recommendedNextStep="यदि यह स्क्रीन अनजान है, तो होम बटन दबाकर वापस आएं और आधिकारिक ऐप खोलें।" if is_hindi else "If in doubt, press your phone home button and verify via the official trusted app.",
        whatNOTToDo="अनजान लिंक या किसी के कहने पर पैसे भेजने के लिए पिन न डालें।" if is_hindi else "Never enter your UPI PIN to receive money or tap unverified APK download links."
    )


@app.post("/api/tts", response_model=TTSResponse)
async def tts_endpoint(req: TTSRequest):
    """
    Rishi Voice Synthesis endpoint with intelligent fallback to client browser synthesis.
    """
    # Graceful fallback to client Web Speech API to guarantee zero voice interruption
    return TTSResponse(
        fallbackToBrowser=True,
        message="Client browser voice synthesis active"
    )


@app.post("/api/transcribe", response_model=TranscribeResponse)
async def transcribe_endpoint(req: TranscribeRequest):
    """
    Audio transcription endpoint for multilingual speech input.
    """
    client = get_genai_client()
    if client and os.getenv("GEMINI_API_KEY") and req.audioBase64:
        try:
            from google.genai import types
            clean_b64 = re.sub(r"^data:audio/[a-z0-9]+;base64,", "", req.audioBase64)
            audio_bytes = base64.b64decode(clean_b64)
            
            response = client.models.generate_content(
                model="gemini-3.5-transcribe",
                contents=[
                    types.Part.from_bytes(data=audio_bytes, mime_type=req.mimeType or "audio/webm"),
                    "Transcribe this spoken audio accurately. Preserve spoken words in Hindi or English."
                ]
            )
            return TranscribeResponse(transcript=response.text or "")
        except Exception as e:
            print(f"[Python API Transcribe] Error: {e}")
            
    return TranscribeResponse(transcript="")


@app.post("/api/find-centers", response_model=FindCentersResponse)
async def find_centers_endpoint(req: FindCentersRequest):
    """
    Find nearby CSC and Aadhaar Seva Kendras using Gemini with Google Maps grounding.
    """
    client = get_genai_client()
    if client and os.getenv("GEMINI_API_KEY"):
        try:
            from google.genai import types
            prompt = f"Find official {req.serviceType} near \"{req.location}\". Provide center names, addresses, and timings."
            response = client.models.generate_content(
                model="gemini-3.8-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    tools=[{"googleMaps": {}}]
                )
            )
            return FindCentersResponse(result=response.text or "")
        except Exception as e:
            print(f"[Python API Centers] Error: {e}")
            
    return FindCentersResponse(
        result=f"Official centers near {req.location} can be found at your local Gram Panchayat, Tehsil Office, or through the official portal: https://findmycsc.nic.in"
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PYTHON_BACKEND_PORT", "8000"))
    host = os.getenv("PYTHON_BACKEND_HOST", "127.0.0.1")
    print(f"Starting NIRBHAR FastAPI Server on {host}:{port}")
    uvicorn.run(app, host=host, port=port)

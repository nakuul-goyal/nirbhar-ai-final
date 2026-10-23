import { Language } from '../types';

export type RishiLanguageCode =
  | 'hi'
  | 'en'
  | 'mr'
  | 'gu'
  | 'bn'
  | 'ta'
  | 'te'
  | 'kn'
  | 'ml'
  | 'pa'
  | 'or'
  | 'as';

export interface RishiLanguageOption {
  code: RishiLanguageCode;
  nameEn: string;
  nativeName: string;
  bcp47: string;
}

export const RISHI_LANGUAGES: RishiLanguageOption[] = [
  { code: 'hi', nameEn: 'Hindi', nativeName: 'हिन्दी', bcp47: 'hi-IN' },
  { code: 'en', nameEn: 'English / Hinglish', nativeName: 'English', bcp47: 'en-IN' },
  { code: 'mr', nameEn: 'Marathi', nativeName: 'मराठी', bcp47: 'mr-IN' },
  { code: 'gu', nameEn: 'Gujarati', nativeName: 'ગુજરાતી', bcp47: 'gu-IN' },
  { code: 'bn', nameEn: 'Bengali', nativeName: 'বাংলা', bcp47: 'bn-IN' },
  { code: 'ta', nameEn: 'Tamil', nativeName: 'தமிழ்', bcp47: 'ta-IN' },
  { code: 'te', nameEn: 'Telugu', nativeName: 'తెలుగు', bcp47: 'te-IN' },
  { code: 'kn', nameEn: 'Kannada', nativeName: 'ಕನ್ನಡ', bcp47: 'kn-IN' },
  { code: 'ml', nameEn: 'Malayalam', nativeName: 'മലയാളം', bcp47: 'ml-IN' },
  { code: 'pa', nameEn: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', bcp47: 'pa-IN' },
  { code: 'or', nameEn: 'Odia', nativeName: 'ଓଡ଼ିଆ', bcp47: 'or-IN' },
  { code: 'as', nameEn: 'Assamese', nativeName: 'অসমীয়া', bcp47: 'as-IN' },
];

export function getBcp47ForLanguage(lang: string): string {
  const found = RISHI_LANGUAGES.find((l) => l.code === lang);
  return found ? found.bcp47 : 'en-IN';
}

export function checkLanguageVoiceSupport(langCode: string): {
  speechRecognitionSupported: boolean;
  speechSynthesisSupported: boolean;
  hasNativeBrowserVoice: boolean;
} {
  if (typeof window === 'undefined') {
    return {
      speechRecognitionSupported: false,
      speechSynthesisSupported: false,
      hasNativeBrowserVoice: false,
    };
  }

  const speechRecognitionSupported = !!(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
  const speechSynthesisSupported = 'speechSynthesis' in window;

  let hasNativeBrowserVoice = false;
  if (speechSynthesisSupported) {
    const voices = window.speechSynthesis.getVoices();
    const prefix = langCode.toLowerCase();
    hasNativeBrowserVoice = voices.some((v) =>
      v.lang.toLowerCase().startsWith(prefix)
    );
  }

  return {
    speechRecognitionSupported,
    speechSynthesisSupported,
    hasNativeBrowserVoice,
  };
}

let currentUtterance: SpeechSynthesisUtterance | null = null;
let currentAudioElement: HTMLAudioElement | null = null;
let serverTTSAvailable = false; // Prioritize fast, free, offline-capable browser speech synthesis

// Warm up voices on client
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    try {
      window.speechSynthesis.getVoices();
    } catch {}
  };
}

export function stopSpeaking() {
  if (typeof window !== 'undefined') {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (currentAudioElement) {
      currentAudioElement.pause();
      currentAudioElement = null;
    }
  }
}

export async function speakText(
  text: string,
  lang: Language | RishiLanguageCode = 'en',
  onStart?: () => void,
  onEnd?: () => void,
  rate: number = 0.85
): Promise<void> {
  stopSpeaking();

  if (!text || typeof window === 'undefined') return;

  const bcp47 = getBcp47ForLanguage(lang);

  // 1. Primary engine: Browser Web Speech Synthesis (instant, free, unlimited quota, zero latency)
  if ('speechSynthesis' in window) {
    try {
      const voices = window.speechSynthesis.getVoices();
      const prefix = lang.toLowerCase();

      // Find best matching voice for the language
      let match = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));

      // Devanagari fallback: Hindi voice speaks Marathi Devanagari text with accurate pronunciation if mr-IN is not downloaded
      if (!match && lang === 'mr') {
        match = voices.find((v) => v.lang.toLowerCase().startsWith('hi'));
      }

      // English fallback
      if (!match && lang === 'en') {
        match = voices.find(
          (v) =>
            v.lang.toLowerCase().includes('en-in') ||
            v.lang.toLowerCase().includes('en-gb') ||
            v.lang.toLowerCase().includes('en-us')
        );
      }

      // Default voice if regional voice isn't explicitly listed in voices array
      if (!match && voices.length > 0) {
        match = voices.find((v) => v.default) || voices[0];
      }

      const utterance = new SpeechSynthesisUtterance(text);
      currentUtterance = utterance;
      utterance.lang = bcp47;
      utterance.rate = rate;
      utterance.pitch = 1.0;

      if (match) {
        utterance.voice = match;
      }

      utterance.onstart = () => {
        onStart?.();
      };

      utterance.onend = () => {
        onEnd?.();
        currentUtterance = null;
      };

      utterance.onerror = () => {
        onEnd?.();
        currentUtterance = null;
      };

      // Ensure synthesizer is not in a paused state
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(utterance);
      return;
    } catch {
      // If speechSynthesis fails unexpectedly, attempt server TTS if enabled
      if (serverTTSAvailable) {
        await tryServerTTS(text, lang, onStart, onEnd);
        return;
      }
      onEnd?.();
      return;
    }
  }

  // Fallback to server TTS only if window.speechSynthesis is completely absent in the environment
  await tryServerTTS(text, lang, onStart, onEnd);
}

async function tryServerTTS(
  text: string,
  lang: string,
  onStart?: () => void,
  onEnd?: () => void
) {
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: lang }),
    });

    if (!res.ok) {
      serverTTSAvailable = false;
      onEnd?.();
      return;
    }

    const data = await res.json();
    if (data.fallbackToBrowser) {
      serverTTSAvailable = false;
      // Synthesize using device browser speech
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = getBcp47ForLanguage(lang);
        utterance.rate = 0.85;
        utterance.onstart = () => onStart?.();
        utterance.onend = () => onEnd?.();
        utterance.onerror = () => onEnd?.();
        window.speechSynthesis.speak(utterance);
        return;
      }
      onEnd?.();
      return;
    }

    if (data.audioBase64) {
      serverTTSAvailable = true;
      const audioUrl = `data:audio/wav;base64,${data.audioBase64}`;
      const audio = new Audio(audioUrl);
      currentAudioElement = audio;
      onStart?.();
      audio.onended = () => {
        onEnd?.();
        currentAudioElement = null;
      };
      audio.onerror = () => {
        onEnd?.();
        currentAudioElement = null;
      };
      await audio.play();
      return;
    }

    onEnd?.();
  } catch {
    serverTTSAvailable = false;
    onEnd?.();
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function createSpeechRecognizer(
  lang: Language | RishiLanguageCode,
  onResult: (transcript: string, isFinal: boolean) => void,
  onError?: (error: string) => void,
  onEnd?: () => void
) {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = getBcp47ForLanguage(lang);
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const res = event.results[i];
      if (res.isFinal) {
        finalTranscript += res[0].transcript;
      } else {
        interimTranscript += res[0].transcript;
      }
    }

    if (finalTranscript.trim()) {
      onResult(finalTranscript.trim(), true);
    } else if (interimTranscript.trim()) {
      onResult(interimTranscript.trim(), false);
    }
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition error:', event.error);
    onError?.(event.error || 'speech-error');
  };

  recognition.onend = () => {
    onEnd?.();
  };

  return recognition;
}

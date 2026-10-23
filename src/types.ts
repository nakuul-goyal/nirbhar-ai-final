export type Language = 'en' | 'hi' | 'mr';

export type TextScale = 'normal' | 'large' | 'xl';

export interface AccessibilitySettings {
  language: Language;
  textScale: TextScale;
  highContrast: boolean;
  lowBandwidth: boolean;
  autoReadAloud: boolean;
  simpleMode?: boolean;
}

export interface AssistantResponse {
  replyText: string;
  steps: string[];
  safetyTip: string;
  suggestedActions?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  steps?: string[];
  safetyTip?: string;
  suggestedActions?: string[];
  timestamp: number;
}

export interface ScreenshotAnalysis {
  screenType: string;
  whatYouAreLookingAt: string;
  keyElementsFound: string[];
  isSafe: boolean;
  safetyAlert: string;
  recommendedNextStep: string;
  whatNOTToDo: string;
}

export interface ScamAnalysis {
  riskLevel: 'HIGH_RISK_SCAM' | 'SUSPICIOUS_UNVERIFIED' | 'CAUTION_PROCEED_CAREFULLY';
  riskScore: number;
  headline: string;
  redFlags: string[];
  whyThisIsSuspicious: string;
  immediateAction: string;
  officialVerificationRoute: string;
  helplineNumber: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonModule {
  id: string;
  title: string;
  titleHi: string;
  category: string;
  description: string;
  descriptionHi: string;
  badgeName: string;
  badgeIcon: string;
  keyTakeaways: string[];
  keyTakeawaysHi: string[];
  practicalTips: string[];
  practicalTipsHi: string[];
  quiz: QuizQuestion[];
}

export interface GovtService {
  id: string;
  name: string;
  nameHi: string;
  department: string;
  officialPortal: string;
  purpose: string;
  purposeHi: string;
  requiredDocuments: { name: string; nameHi: string; mandatory: boolean }[];
  stepByStepGuide: { step: string; stepHi: string }[];
  commonMistakes: string[];
  commonMistakesHi: string[];
  isFreeOrCost: string;
}

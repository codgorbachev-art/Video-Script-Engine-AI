export interface Attachment {
  name: string;
  mimeType: string;
  dataBase64: string;
}

export interface GenerateInput {
  text: string;
  attachments: Attachment[];
}

export interface GenerateOptions {
  style: "storytelling" | "provocative" | "educational" | "entertaining";
  direction: "sale" | "expertise" | "ads" | "engagement";
  durationSec: number;
  platform: "tiktok" | "reels" | "shorts" | "youtube";
  ctaStrength: "soft" | "hard";
}

export interface GenerateRequest {
  input: GenerateInput;
  options: GenerateOptions;
  client: {
    tz: string;
    uiVersion: string;
  };
}

export interface Shot {
  t: string;
  frame: string;
  onScreenText: string;
  voiceOver: string;
  broll: string;
}

export interface GenerateResult {
  extractedText: string;
  titleOptions: string[];
  hookOptions: string[];
  scriptMarkdown: string;
  shots: Shot[];
  thumbnailIdeas: string[];
  hashtags: string[];
  checklist: string[];
}

export interface Limits {
  isPro: boolean;
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
}

export interface GenerateResponse {
  ok: boolean;
  requestId: string;
  limits: Limits;
  result: GenerateResult;
  usage: {
    model: string;
  };
  errors: string[];
}
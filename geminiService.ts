
import { GoogleGenAI, Type } from "@google/genai";
import { GenerateRequest, GenerateResult, GroundingSource } from "../types";
import { stripCodeFences, extractJson } from "../utils";

const SYSTEM_INSTRUCTION = `Ты — элитный бизнес-аналитик и ведущий сценарист для индустриальных и технологических рынков. 

ТВОЯ МИССИЯ: Превратить скучный технический запрос в виральный, экспертный контент, базируясь на РЕАЛЬНЫХ данных.

ТВОЙ АЛГОРИТМ (ULTRA-RESEARCH MODE):
1. ИДЕНТИФИКАЦИЯ КОНТЕКСТА: 
   - Если видишь "Гранд 2", "Putzmeister", "PFT G4" — это штукатурные станции.
   - Если видишь "АСК", "ERP", "SaaS" — это IT-решения.
   - Используй Google Search, чтобы вытащить: ТТХ, цену, страну бренда, ключевых конкурентов.

2. АНАЛИЗ ЦЕЛЕВОЙ АУДИТОРИИ (ЦА):
   - Определи, кто это смотрит: Прораб (важна скорость и надежность), Инвестор (важна окупаемость), Мастер (важна эргономика).
   - Найди реальные "боли" из отзывов и форумов.

3. СЦЕНАРНАЯ ИНЖЕНЕРИЯ:
   - Структура должна быть "железной": Крючок (Hook) -> Проблема -> Решение через объект запроса -> Техническое доказательство -> Призыв (CTA).
   - Используй профессиональный сленг индустрии, но делай его понятным.

ТРЕБОВАНИЯ К JSON:
- extractedText: Полный технический паспорт объекта + анализ рынка в 2-3 абзацах.
- scriptMarkdown: Профессиональная разметка с указанием интонаций и пауз.
- shots: Минимум один кадр на 10 секунд. Описывай свет, фокусное расстояние (например, "крупный план форсунки") и движение камеры.
`;

export async function generateScenario(req: GenerateRequest): Promise<GenerateResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const duration = req.options.durationSec;
  const wordsPerMinute = 135; // Чуть быстрее для динамики
  const targetWordCount = Math.floor((duration / 60) * wordsPerMinute);
  const minShots = Math.max(6, Math.ceil(duration / 8));

  const promptParts: any[] = [];
  
  if (req.input.attachments?.length) {
    req.input.attachments.forEach(a => {
      promptParts.push({ inlineData: { mimeType: a.mimeType, data: a.dataBase64 } });
    });
  }

  const promptText = `
ПРИКАЗ НА ГЕНЕРАЦИЮ (ГЛУБОКИЙ РЕЖИМ):
ОБЪЕКТ: "${req.input.text || "Анализ файлов"}"
ПЛАТФОРМА: ${req.options.platform}
ТАЙМИНГ: ${duration} сек.
СТИЛЬ: ${req.options.style}
ЦЕЛЬ: ${req.options.direction}

ИНСТРУКЦИЯ:
1. Выполни поиск в Google: найди актуальные спецификации, отзывы и конкурентов объекта.
2. Составь "Техническую справку" (extractedText), которая докажет пользователю, что ты "в теме".
3. Напиши сценарий на ~${targetWordCount} слов. Используй триггеры экспертности.
4. Создай визуальный ряд из ${minShots} сцен.

ВЕРНИ СТРОГИЙ JSON:
{
  "extractedText": "Deep Research Report: ТТХ, боли аудитории, рыночное сравнение...",
  "titleOptions": ["3 варианта заголовка для профи"],
  "hookOptions": ["3 мощных зацепки"],
  "scriptMarkdown": "Текст сценария...",
  "shots": [{ "t": "00:00", "frame": "Описание кадра", "onScreenText": "Текст", "voiceOver": "Диктор", "broll": "SFX/Music" }],
  "thumbnailIdeas": ["Идеи для обложек"],
  "hashtags": ["Теги"],
  "checklist": ["Советы по съемке этого объекта"]
}
  `.trim();

  promptParts.push({ text: promptText });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ parts: promptParts }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 31000 },
      tools: [{ googleSearch: {} }]
    }
  });

  const rawText = response.text || "{}";
  const result = JSON.parse(extractJson(stripCodeFences(rawText))) as GenerateResult;

  const sources: GroundingSource[] = [];
  const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
  const chunks = groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
    });
  }

  return { ...result, sources: sources.length > 0 ? sources : undefined };
}

export async function generateThumbnailVisual(idea: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: [{ parts: [{ text: `High-end commercial videography style, 8k resolution, cinematic lighting: ${idea}. Professional color grading, sharp focus.` }] }],
    config: {
      imageConfig: { aspectRatio: "16:9", imageSize: "1K" }
    }
  });

  const candidates = response.candidates;
  if (candidates && candidates.length > 0) {
    const parts = candidates[0].content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
  }
  
  throw new Error("Не удалось сгенерировать изображение. Попробуйте другой запрос.");
}


export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function formatMMSS(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function stripCodeFences(s: string) {
  const t = s.trim();
  if (t.startsWith("```")) {
    return t.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
  }
  return t;
}

/**
 * Находит первый '{' и последний '}' и возвращает подстроку между ними.
 * Это помогает, если модель добавила текст до или после JSON.
 */
export function extractJson(s: string): string {
  const firstBrace = s.indexOf('{');
  const lastBrace = s.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return s.substring(firstBrace, lastBrace + 1);
  }
  return s;
}

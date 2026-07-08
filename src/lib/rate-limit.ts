import { headers } from "next/headers";

/**
 * הגבלת קצב פשוטה, בזיכרון תהליך יחיד — מספיקה ל-MVP.
 * בפריסת serverless מרובת instances (כמו Vercel) זו הגנה best-effort
 * בלבד, לא אכיפה מבוזרת אמיתית; אם התעבורה תגדל, לשקול Upstash/Vercel KV.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) {
    return false;
  }
  bucket.count += 1;
  return true;
}

async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export const RATE_LIMIT_MESSAGE = "יותר מדי בקשות. נסו שוב בעוד כמה דקות.";

export async function rateLimit(action: string, limit: number, windowMs: number) {
  const ip = await getClientIp();
  return checkRateLimit(`${action}:${ip}`, limit, windowMs);
}

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { EDUCATION_STAGES, JOB_SCOPES, SUBJECTS } from "@/lib/taxonomy";
import type { RawListing } from "./sources/types";

const client = new Anthropic();

// Haiku 4.5: cheap, high-volume classification/extraction, not deep reasoning —
// same model choice already used for the sibling free-text-search feature (AGENTS.md).
const MODEL = "claude-haiku-4-5";

const PositionSchema = z.object({
  title: z.string(),
  subject: z.enum(SUBJECTS),
  education_stage: z.enum(EDUCATION_STAGES),
  scope: z.enum(JOB_SCOPES),
  city: z.string(),
  description: z.string(),
});

const NormalizationResultSchema = z.object({
  is_teaching_position: z.boolean(),
  positions: z.array(PositionSchema),
});

export type NormalizedPosition = z.infer<typeof PositionSchema>;

const SYSTEM_PROMPT = `אתה מנרמל מודעות דרושים גולמיות מאתרי חיצוניים לפורמט קבוע של לוח משרות הוראה ישראלי.

עבור כל מודעה, קבע האם היא מתארת משרת הוראה בכיתה (מורה/מחנך/גננת) בבית ספר/גן — לא תפקידי מנהלה, אחזקה, גבייה, משאבי אנוש וכו'. אם לא — is_teaching_position=false ו-positions ריק.

אם כן, חלץ עמדה אחת לכל שילוב מקצוע (מודעה יכולה לכלול כמה מקצועות — למשל "דרושים מורים למתמטיקה, אנגלית" הופכת לשתי עמדות נפרדות). לכל עמדה:
- title: כותרת קצרה וברורה
- subject: התאם למקצוע המדויק מהרשימה הסגורה בלבד
- education_stage: התאם לשלב החינוכי מהרשימה הסגורה בלבד (הסק מהקשר — למשל "חטיבה"/"חט"ב" = חטיבת ביניים)
- scope: התאם להיקף המשרה מהרשימה הסגורה בלבד (הסק "מלאה/חלקית" מהטקסט; ברירת מחדל "משרה מלאה" אם לא צוין)
- city: שם היישוב כפי שמופיע בטקסט המקורי, בדיוק כפי שנכתב — אל תנסה לתקן או לנרמל אותו
- description: תיאור מלא הכולל את כל פרטי הקשר המקוריים (שם איש קשר, טלפון, אימייל) כפי שמופיעים בטקסט — אל תשמיט אותם`;

export async function normalizeListing(listing: RawListing): Promise<NormalizedPosition[]> {
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 1500,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: listing.rawText }],
    output_config: { format: zodOutputFormat(NormalizationResultSchema) },
  });

  const parsed = response.parsed_output;
  if (!parsed || !parsed.is_teaching_position) return [];
  return parsed.positions;
}

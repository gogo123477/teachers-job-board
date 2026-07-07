import { put } from "@vercel/blob";

type UploadOptions = {
  folder: string;
  maxSizeMb: number;
  allowedTypes: string[];
};

/**
 * מעלה קובץ ל-Vercel Blob אחרי ולידציה בסיסית (סוג/גודל).
 * זורק שגיאה עם הודעה בעברית שמתאימה להצגה ישירה למשתמש.
 */
export async function uploadFile(file: File, { folder, maxSizeMb, allowedTypes }: UploadOptions) {
  if (!allowedTypes.includes(file.type)) {
    throw new Error("סוג הקובץ אינו נתמך");
  }
  if (file.size > maxSizeMb * 1024 * 1024) {
    throw new Error(`הקובץ גדול מדי (מקסימום ${maxSizeMb}MB)`);
  }

  const blob = await put(`${folder}/${crypto.randomUUID()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return blob.url;
}

/**
 * מקור האמת היחיד לרשימות הערכים הסגורות של המערכת.
 * שינוי ברשימות אלה אחרי שיש נתונים בייצור מחייב מיגרציית נתונים (mismach_techni.md §8) —
 * לא להוסיף/להסיר ערכים בלי לחשוב על נתונים קיימים שכבר משתמשים בהם.
 */

export const INSTITUTION_TYPES = [
  "גן",
  "יסודי",
  "חטיבת ביניים",
  "תיכון",
] as const;
export type InstitutionType = (typeof INSTITUTION_TYPES)[number];

export const EDUCATION_STAGES = [
  "גן",
  "יסודי",
  "חטיבת ביניים",
  "תיכון",
] as const;
export type EducationStage = (typeof EDUCATION_STAGES)[number];

export const SUBJECTS = [
  "מתמטיקה",
  "אנגלית",
  "עברית",
  "ערבית",
  "תנ\"ך",
  "היסטוריה",
  "אזרחות",
  "גיאוגרפיה",
  "ספרות",
  "ביולוגיה",
  "כימיה",
  "פיזיקה",
  "מדעים",
  "מדעי המחשב",
  "חינוך גופני",
  "אמנות",
  "מוזיקה",
  "תיאטרון",
  "חינוך מיוחד",
  "גיל רך / גננות",
] as const;
export type Subject = (typeof SUBJECTS)[number];

export const REGIONS = [
  "צפון",
  "חיפה והקריות",
  "מרכז",
  "תל אביב והמרכז",
  "ירושלים",
  "שפלה",
  "דרום",
  "יהודה ושומרון",
] as const;
export type Region = (typeof REGIONS)[number];

export const JOB_SCOPES = [
  "משרה מלאה",
  "משרה חלקית",
  "שעות בודדות",
] as const;
export type JobScope = (typeof JOB_SCOPES)[number];

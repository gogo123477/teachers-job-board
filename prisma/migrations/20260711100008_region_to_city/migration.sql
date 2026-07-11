-- מעבר מאזורים ליישובים מדויקים (רשימת הלמ"ס).
-- RENAME משמר את הנתונים הקיימים; אחריו ממפים ערכי אזור ישנים ליישוב מייצג.

ALTER TABLE "Institution" RENAME COLUMN "region" TO "city";
ALTER TABLE "JobPosting" RENAME COLUMN "region" TO "city";
ALTER TABLE "Teacher" RENAME COLUMN "preferred_regions" TO "preferred_cities";

-- בית הספר "פסגת אמיר" נמצא בפועל בחריש (נוצר לפני המעבר עם אזור בלבד)
UPDATE "Institution" SET "city" = 'חריש' WHERE "name" = 'פסגת אמיר';
UPDATE "JobPosting" jp
SET "city" = 'חריש'
FROM "Institution" i
WHERE jp."institution_id" = i."id" AND i."name" = 'פסגת אמיר';

-- מיפוי גנרי של שאר ערכי האזור הישנים ליישוב מייצג
UPDATE "Institution" SET "city" = CASE "city"
  WHEN 'צפון' THEN 'טבריה'
  WHEN 'חיפה והקריות' THEN 'חיפה'
  WHEN 'מרכז' THEN 'פתח תקווה'
  WHEN 'תל אביב והמרכז' THEN 'תל אביב - יפו'
  WHEN 'ירושלים' THEN 'ירושלים'
  WHEN 'שפלה' THEN 'רחובות'
  WHEN 'דרום' THEN 'באר שבע'
  WHEN 'יהודה ושומרון' THEN 'אריאל'
  ELSE "city"
END;

UPDATE "JobPosting" SET "city" = CASE "city"
  WHEN 'צפון' THEN 'טבריה'
  WHEN 'חיפה והקריות' THEN 'חיפה'
  WHEN 'מרכז' THEN 'פתח תקווה'
  WHEN 'תל אביב והמרכז' THEN 'תל אביב - יפו'
  WHEN 'ירושלים' THEN 'ירושלים'
  WHEN 'שפלה' THEN 'רחובות'
  WHEN 'דרום' THEN 'באר שבע'
  WHEN 'יהודה ושומרון' THEN 'אריאל'
  ELSE "city"
END;

UPDATE "Teacher" SET "preferred_cities" = ARRAY(
  SELECT CASE r
    WHEN 'צפון' THEN 'טבריה'
    WHEN 'חיפה והקריות' THEN 'חיפה'
    WHEN 'מרכז' THEN 'פתח תקווה'
    WHEN 'תל אביב והמרכז' THEN 'תל אביב - יפו'
    WHEN 'ירושלים' THEN 'ירושלים'
    WHEN 'שפלה' THEN 'רחובות'
    WHEN 'דרום' THEN 'באר שבע'
    WHEN 'יהודה ושומרון' THEN 'אריאל'
    ELSE r
  END
  FROM unnest("preferred_cities") AS r
);

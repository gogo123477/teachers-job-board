import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SEED_PASSWORD = "password123";

async function main() {
  const password_hash = await bcrypt.hash(SEED_PASSWORD, 12);

  // --- אדמין ---
  await prisma.user.upsert({
    where: { email: "admin@seed.local" },
    update: {},
    create: { email: "admin@seed.local", password_hash, role: "admin" },
  });

  // --- מוסדות ---
  const institutionsData = [
    {
      email: "school-a@seed.local",
      name: "תיכון אורות",
      institution_type: "תיכון",
      city: "תל אביב - יפו",
      contact_name: "רונית לוי",
      description: "תיכון עירוני עם דגש על מדעים וטכנולוגיה.",
    },
    {
      email: "school-b@seed.local",
      name: "בית ספר יסודי הרימון",
      institution_type: "יסודי",
      city: "חיפה",
      contact_name: "משה כהן",
      description: "בית ספר יסודי קהילתי בשכונת הדר.",
    },
    {
      email: "school-c@seed.local",
      name: "גן ילדים ניצנים",
      institution_type: "גן",
      city: "ירושלים",
      contact_name: "דנה אברהם",
      description: "גן ילדים פרטי בשכונת בקעה.",
    },
  ];

  const institutions = [];
  for (const data of institutionsData) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: { email: data.email, password_hash, role: "institution" },
    });
    const institution = await prisma.institution.upsert({
      where: { user_id: user.id },
      update: {},
      create: {
        user_id: user.id,
        name: data.name,
        institution_type: data.institution_type,
        city: data.city,
        contact_name: data.contact_name,
        description: data.description,
      },
    });
    institutions.push(institution);
  }

  // --- מורים ---
  const teachersData = [
    {
      email: "teacher-a@seed.local",
      full_name: "יעל שפירא",
      subjects: ["מתמטיקה", "פיזיקה"],
      education_stages: ["תיכון", "חטיבת ביניים"],
      preferred_cities: ["תל אביב - יפו", "פתח תקווה"],
      bio: "מורה למתמטיקה ופיזיקה עם 8 שנות ניסיון.",
    },
    {
      email: "teacher-b@seed.local",
      full_name: "אבי מזרחי",
      subjects: ["עברית", "ספרות"],
      education_stages: ["יסודי", "חטיבת ביניים"],
      preferred_cities: ["חיפה"],
      bio: "מורה לעברית וספרות, מתמחה בהוראה מותאמת אישית.",
    },
    {
      email: "teacher-c@seed.local",
      full_name: "מיכל בן דוד",
      subjects: ["גיל רך / גננות"],
      education_stages: ["גן"],
      preferred_cities: ["ירושלים", "רחובות"],
      bio: "גננת מוסמכת עם ניסיון בגילאי 3-6.",
    },
    {
      email: "teacher-d@seed.local",
      full_name: "עומר גולדברג",
      subjects: ["מדעי המחשב", "מתמטיקה"],
      education_stages: ["תיכון"],
      preferred_cities: ["תל אביב - יפו"],
      bio: "מורה למדעי המחשב, רקע בתעשיית ההייטק.",
    },
  ];

  const teachers = [];
  for (const data of teachersData) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: { email: data.email, password_hash, role: "teacher" },
    });
    const teacher = await prisma.teacher.upsert({
      where: { user_id: user.id },
      update: {},
      create: {
        user_id: user.id,
        full_name: data.full_name,
        subjects: data.subjects,
        education_stages: data.education_stages,
        preferred_cities: data.preferred_cities,
        bio: data.bio,
      },
    });
    teachers.push(teacher);
  }

  // --- משרות ---
  const [schoolA, schoolB, schoolC] = institutions;
  const jobsData = [
    {
      institution: schoolA,
      title: "מורה למתמטיקה - תיכון",
      subject: "מתמטיקה",
      education_stage: "תיכון",
      scope: "משרה מלאה",
      city: "תל אביב - יפו",
      description: "דרוש/ה מורה למתמטיקה לכיתות י-יב, ניסיון בהוראת 5 יחידות יתרון.",
      status: "published" as const,
      moderation_status: "approved" as const,
    },
    {
      institution: schoolA,
      title: "מורה למדעי המחשב",
      subject: "מדעי המחשב",
      education_stage: "תיכון",
      scope: "משרה חלקית",
      city: "תל אביב - יפו",
      description: "משרה חלקית להוראת מדעי המחשב, כולל ליווי פרויקט גמר.",
      status: "published" as const,
      moderation_status: "pending" as const,
    },
    {
      institution: schoolB,
      title: "מורה לעברית - יסודי",
      subject: "עברית",
      education_stage: "יסודי",
      scope: "משרה מלאה",
      city: "חיפה",
      description: "דרוש/ה מורה לעברית לכיתות ד-ו, יחס אישי לתלמידים.",
      status: "published" as const,
      moderation_status: "approved" as const,
    },
    {
      institution: schoolB,
      title: "מורה לחינוך גופני",
      subject: "חינוך גופני",
      education_stage: "יסודי",
      scope: "שעות בודדות",
      city: "חיפה",
      description: "שעות בודדות בחינוך גופני, גמישות בשעות.",
      status: "closed" as const,
      moderation_status: "approved" as const,
    },
    {
      institution: schoolC,
      title: "גננת/גנן",
      subject: "גיל רך / גננות",
      education_stage: "גן",
      scope: "משרה מלאה",
      city: "ירושלים",
      description: "דרוש/ה גננת מוסמכת לגן חדש שנפתח, אווירה חמה ותומכת.",
      status: "published" as const,
      moderation_status: "approved" as const,
    },
    {
      institution: schoolC,
      title: "סייעת גן",
      subject: "גיל רך / גננות",
      education_stage: "גן",
      scope: "משרה מלאה",
      city: "ירושלים",
      description: "דרושה סייעת לגן ילדים, תואר ראשון יתרון.",
      status: "published" as const,
      moderation_status: "pending" as const,
    },
  ];

  const jobs = [];
  for (const data of jobsData) {
    const existing = await prisma.jobPosting.findFirst({
      where: { title: data.title, institution_id: data.institution.id },
    });
    const job =
      existing ??
      (await prisma.jobPosting.create({
        data: {
          institution_id: data.institution.id,
          title: data.title,
          subject: data.subject,
          education_stage: data.education_stage,
          scope: data.scope,
          city: data.city,
          description: data.description,
          status: data.status,
          moderation_status: data.moderation_status,
        },
      }));
    jobs.push(job);
  }

  // --- מועמדויות (רק על משרות מאושרות ומפורסמות) ---
  const [jobMathA, , jobHebrewB, , jobKindergartenC] = jobs;
  const [teacherA, teacherB, , teacherD] = teachers;

  const applicationsData = [
    { job: jobMathA, teacher: teacherA, status: "VIEWED" as const, message: "אשמח לשמוע פרטים נוספים." },
    { job: jobMathA, teacher: teacherD, status: "IN_PROGRESS" as const, message: null },
    { job: jobHebrewB, teacher: teacherB, status: "ACCEPTED" as const, message: "מצפה לתחילת העבודה!" },
    { job: jobKindergartenC, teacher: teacherB, status: "REJECTED" as const, message: null },
  ];

  for (const data of applicationsData) {
    await prisma.application.upsert({
      where: {
        job_posting_id_teacher_id: {
          job_posting_id: data.job.id,
          teacher_id: data.teacher.id,
        },
      },
      update: {},
      create: {
        job_posting_id: data.job.id,
        teacher_id: data.teacher.id,
        status: data.status,
        message: data.message,
      },
    });
  }

  console.log("✅ Seed complete.");
  console.log(`   כל המשתמשים עם סיסמה: ${SEED_PASSWORD}`);
  console.log("   אדמין: admin@seed.local");
  console.log("   מוסדות: school-a@seed.local, school-b@seed.local, school-c@seed.local");
  console.log(
    "   מורים: teacher-a@seed.local, teacher-b@seed.local, teacher-c@seed.local, teacher-d@seed.local"
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

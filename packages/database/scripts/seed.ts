import { createHash, randomBytes } from 'node:crypto';

import { prisma } from '../src/client';
import {
  COURSE_ADJECTIVES,
  COURSE_DESCRIPTIONS,
  COURSE_SUBJECTS,
  FIRST_NAMES,
  LAST_NAMES,
} from './seed-data';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClassRuleInput {
  courseId: string;
  startDate: Date;
  intervalDays: number | null;
  endDate: Date | null;
  startTime: Date;
  endTime: Date;
  room?: string | null;
}

// ---------------------------------------------------------------------------
// Course seed data generators
// ---------------------------------------------------------------------------

function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length];
}

function pseudoRandom(seed: number): number {
  // MurmurHash3 finalizer — fast integer hash, no Math.sin
  let h = seed | 0;
  h = ((h ^ (h >>> 16)) * 0x85ebca6b) | 0;
  h = ((h ^ (h >>> 13)) * 0xc2b2ae35) | 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

function buildCourse(index: number, userId: string) {
  const adj = pick(COURSE_ADJECTIVES, index);
  const subject = pick(COURSE_SUBJECTS, Math.floor(index / COURSE_ADJECTIVES.length));
  const descIdx = Math.floor(pseudoRandom(index) * COURSE_DESCRIPTIONS.length);
  const description = COURSE_DESCRIPTIONS[descIdx];
  const status = pseudoRandom(index + 1000) > 0.15 ? 'ACTIVE' : 'DISABLED';

  return { name: `${adj} ${subject}`, description, status, userId } as const;
}

// ---------------------------------------------------------------------------
// Password helpers (SHA-256 with salt, matching apps/api passwordService)
// ---------------------------------------------------------------------------

async function generateSalt(): Promise<string> {
  return randomBytes(16).toString('hex');
}

async function hash(password: string, salt: string): Promise<string> {
  return createHash('sha256').update(`${salt}${password}`, 'utf8').digest('hex');
}

// ---------------------------------------------------------------------------
// Mock student data generators
// ---------------------------------------------------------------------------

function buildStudent(index: number, userId: string) {
  const firstName = pick(FIRST_NAMES, index);
  const lastName = pick(LAST_NAMES, Math.floor(index / FIRST_NAMES.length) + index);
  const padded = String(index + 1).padStart(4, '0');

  return {
    userId,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    phone: `555-${padded}`,
  };
}

// ---------------------------------------------------------------------------
// Time slot templates
// ---------------------------------------------------------------------------

const TIME_SLOTS: { startHour: number; startMin: number; endHour: number; endMin: number }[] = [
  { startHour: 9, startMin: 0, endHour: 10, endMin: 30 },
  { startHour: 10, startMin: 45, endHour: 12, endMin: 15 },
  { startHour: 14, startMin: 0, endHour: 15, endMin: 30 },
  { startHour: 16, startMin: 0, endHour: 17, endMin: 30 },
  { startHour: 19, startMin: 0, endHour: 20, endMin: 30 },
];

const INTERVAL_OPTIONS = [7, 14, 30] as const;
const MS_PER_DAY = 86_400_000;
const SEED_BASE_DATE = new Date('2026-01-05T00:00:00');

// ---------------------------------------------------------------------------
// Class rule generators
// ---------------------------------------------------------------------------

function makeTime(hour: number, min: number): Date {
  return new Date(1970, 0, 1, hour, min, 0);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ---------------------------------------------------------------------------
// Date generation helper (used for creating ClassSession records)
// ---------------------------------------------------------------------------

function generateDates(
  startDate: Date,
  intervalDays: number | null,
  endDate: Date | null,
  maxDays: number,
): Date[] {
  if (!intervalDays) {
    return [new Date(startDate)];
  }

  const dates: Date[] = [];
  const maxEnd = endDate ?? new Date(startDate.getTime() + maxDays * MS_PER_DAY);
  let current = new Date(startDate);

  while (current <= maxEnd) {
    dates.push(new Date(current));
    current = new Date(current.getTime() + intervalDays * MS_PER_DAY);
  }

  return dates;
}

// ---------------------------------------------------------------------------
// Class rule batch insert helpers
// ---------------------------------------------------------------------------

const RULE_CHUNK_SIZE = 3000;

/**
 * Generate 2–3 ClassRule inputs for a given course.
 *
 * Rule type breakdown (per course):
 * - 1 固定上课 (single): intervalDays=null, endDate=null
 * - 1 循环上课 (cyclic): intervalDays=7, endDate set
 * - 1 无限循环上课 (infinite cyclic): intervalDays=7|14, endDate=null (optional)
 */
function buildRules(courseId: string, seed: number): ClassRuleInput[] {
  const count = 2 + Math.floor(pseudoRandom(seed + 5000) * 1); // 2 or 3
  const rules: ClassRuleInput[] = [];

  // Pick a random base date in 2026
  const dayOffset = Math.floor(pseudoRandom(seed + 6000) * 365);
  const courseStart = addDays(SEED_BASE_DATE, dayOffset);

  // --- Rule 1: 固定上课 (single) ---
  {
    const slotIdx = Math.floor(pseudoRandom(seed + 7000) * TIME_SLOTS.length);
    const slot = TIME_SLOTS[slotIdx];
    rules.push({
      courseId,
      startDate: courseStart,
      intervalDays: null,
      endDate: null,
      startTime: makeTime(slot.startHour, slot.startMin),
      endTime: makeTime(slot.endHour, slot.endMin),
    });
  }

  // --- Rule 2: 循环上课 (cyclic with end, weekly) ---
  {
    const slotIdx = Math.floor(pseudoRandom(seed + 8000) * TIME_SLOTS.length);
    const slot = TIME_SLOTS[slotIdx];
    const ruleStart = addDays(courseStart, 7);
    const ruleEnd = addDays(ruleStart, 60 + Math.floor(pseudoRandom(seed + 9000) * 31));
    rules.push({
      courseId,
      startDate: ruleStart,
      intervalDays: 7,
      endDate: ruleEnd,
      startTime: makeTime(slot.startHour, slot.startMin),
      endTime: makeTime(slot.endHour, slot.endMin),
    });
  }

  // --- Optional Rule 3: 无限循环上课 (infinite cyclic) ---
  if (count === 3) {
    const slotIdx = Math.floor(pseudoRandom(seed + 10000) * TIME_SLOTS.length);
    const slot = TIME_SLOTS[slotIdx];
    const interval =
      INTERVAL_OPTIONS[Math.floor(pseudoRandom(seed + 12000) * INTERVAL_OPTIONS.length)];
    const ruleStart = addDays(courseStart, 14);
    rules.push({
      courseId,
      startDate: ruleStart,
      intervalDays: interval,
      endDate: null,
      startTime: makeTime(slot.startHour, slot.startMin),
      endTime: makeTime(slot.endHour, slot.endMin),
    });
  }

  return rules;
}

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

const log = (msg: string) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);

async function main() {
  log('Seeding database...');

  // 1. Clean existing data
  log('Cleaning existing data...');
  await prisma.sessionParticipant.deleteMany();
  await prisma.classSession.deleteMany();
  await prisma.classRule.deleteMany();
  await prisma.studentCourse.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();
  log('Existing data cleaned');

  // 2. Create admin user
  log('Creating admin user...');
  const salt = await generateSalt();
  const passwordHash = await hash('123456', salt);

  const user = await prisma.user.create({
    data: {
      name: '管理员',
      phone: '12345678911',
      passwordHash,
      passwordSalt: salt,
    },
  });
  log('Admin user created');

  // 3. Create 1,000 students
  log('Generating student data...');
  const students = Array.from({ length: 1_000 }, (_, i) => buildStudent(i, user.id));
  log('Student data generated');

  log('Writing to database...');
  const STUDENT_CHUNK_SIZE = 200;
  for (let i = 0; i < students.length; i += STUDENT_CHUNK_SIZE) {
    const chunk = students.slice(i, i + STUDENT_CHUNK_SIZE);
    await prisma.student.createMany({ data: chunk, skipDuplicates: true });
  }
  log(`Created ${students.length} students`);

  // 4. Create 1,000 courses
  log('Generating course data...');
  const courses = Array.from({ length: 1_000 }, (_, i) => buildCourse(i, user.id));
  log('Course data generated');

  log('Writing to database...');
  const COURSE_CHUNK_SIZE = 200;
  for (let i = 0; i < courses.length; i += COURSE_CHUNK_SIZE) {
    const chunk = courses.slice(i, i + COURSE_CHUNK_SIZE);
    await prisma.course.createMany({ data: chunk, skipDuplicates: true });
  }
  log(`Created ${courses.length} courses`);

  // 5. Assign random courses to each student
  log('Assigning courses to students...');
  await prisma.studentCourse.deleteMany();
  const allStudents = await prisma.student.findMany({ select: { id: true } });
  const allCourseIds = (
    await prisma.course.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true },
    })
  ).map((c) => c.id);
  const enrollments: { studentId: string; courseId: string }[] = [];

  for (let si = 0; si < allStudents.length; si++) {
    const count = 10 + Math.floor(pseudoRandom(si + 3000) * 11); // 10–20
    const picked = new Set<number>();

    let attempt = 0;
    while (picked.size < count && picked.size < allCourseIds.length) {
      picked.add(Math.floor(pseudoRandom(si * 10007 + attempt * 13 + 4000) * allCourseIds.length));
      attempt++;
    }

    for (const ci of picked) {
      enrollments.push({ studentId: allStudents[si].id, courseId: allCourseIds[ci] });
    }
  }
  log('Enrollment data generated');

  log('Writing to database...');
  // Batch insert in chunks
  const ENROLLMENT_CHUNK_SIZE = 500;
  for (let i = 0; i < enrollments.length; i += ENROLLMENT_CHUNK_SIZE) {
    const chunk = enrollments.slice(i, i + ENROLLMENT_CHUNK_SIZE);
    await prisma.studentCourse.createMany({ data: chunk, skipDuplicates: true });
  }
  log(`Created ${enrollments.length} enrollments`);

  // 6. Create class rules for each course (generate + insert in batches)
  log('Generating class rules...');

  const allCourses = await prisma.course.findMany({ select: { id: true } });
  let totalRules = 0;
  let ruleBatch: ClassRuleInput[] = [];
  for (let ci = 0; ci < allCourses.length; ci++) {
    const courseRules = buildRules(allCourses[ci].id, ci);
    ruleBatch.push(...courseRules);

    if (ruleBatch.length >= RULE_CHUNK_SIZE) {
      await prisma.classRule.createMany({ data: ruleBatch, skipDuplicates: true });
      totalRules += ruleBatch.length;
      ruleBatch = [];
    }
  }
  if (ruleBatch.length > 0) {
    await prisma.classRule.createMany({ data: ruleBatch, skipDuplicates: true });
    totalRules += ruleBatch.length;
  }
  log(`Created ${totalRules} class rules`);

  // 7. Generate ClassSessions from rules (180 days worth)
  log('Generating class sessions...');

  const SESSION_DAYS = 180;
  let totalSessions = 0;
  let sessionBatch: {
    classRuleId: string;
    courseId: string;
    occurrenceDate: Date;
    startTime: Date;
    endTime: Date;
    state: string;
  }[] = [];

  let ruleCursor: string | undefined;
  const PAGE_SIZE = 3000;

  while (true) {
    const page = await prisma.classRule.findMany({
      select: {
        id: true,
        courseId: true,
        startDate: true,
        endDate: true,
        intervalDays: true,
        startTime: true,
        endTime: true,
      },
      take: PAGE_SIZE,
      orderBy: { id: 'asc' },
      ...(ruleCursor ? { skip: 1, cursor: { id: ruleCursor } } : {}),
    });

    if (page.length === 0) break;

    for (const rule of page) {
      const dates = generateDates(rule.startDate, rule.intervalDays, rule.endDate, SESSION_DAYS);
      for (const d of dates) {
        sessionBatch.push({
          classRuleId: rule.id,
          courseId: rule.courseId,
          occurrenceDate: d,
          startTime: rule.startTime,
          endTime: rule.endTime,
          state: 'SCHEDULED',
        });
      }
    }

    if (sessionBatch.length >= RULE_CHUNK_SIZE) {
      await prisma.classSession.createMany({ data: sessionBatch, skipDuplicates: true });
      totalSessions += sessionBatch.length;
      sessionBatch = [];
    }

    ruleCursor = page[page.length - 1].id;
  }

  if (sessionBatch.length > 0) {
    await prisma.classSession.createMany({ data: sessionBatch, skipDuplicates: true });
    totalSessions += sessionBatch.length;
  }
  log(`Created ${totalSessions} class sessions`);

  // 8. Create SessionParticipants linking students to sessions
  log('Generating session participants...');

  let totalParticipants = 0;
  let participantBatch: {
    classSessionId: string;
    studentId: string;
  }[] = [];
  const SESSION_PAGE_SIZE = 2000;

  let sessionCursor: string | undefined;
  while (true) {
    const sessionPage = await prisma.classSession.findMany({
      select: { id: true, courseId: true },
      take: SESSION_PAGE_SIZE,
      orderBy: { id: 'asc' },
      ...(sessionCursor ? { skip: 1, cursor: { id: sessionCursor } } : {}),
    });

    if (sessionPage.length === 0) break;

    for (const sess of sessionPage) {
      // Find all enrolled students for this course
      const enrolled = await prisma.studentCourse.findMany({
        where: { courseId: sess.courseId, deletedAt: null },
        select: { studentId: true },
      });

      for (const enr of enrolled) {
        participantBatch.push({
          classSessionId: sess.id,
          studentId: enr.studentId,
        });
      }
    }

    if (participantBatch.length >= 5000) {
      await prisma.sessionParticipant.createMany({ data: participantBatch, skipDuplicates: true });
      totalParticipants += participantBatch.length;
      participantBatch = [];
    }

    sessionCursor = sessionPage[sessionPage.length - 1].id;
  }

  if (participantBatch.length > 0) {
    await prisma.sessionParticipant.createMany({ data: participantBatch, skipDuplicates: true });
    totalParticipants += participantBatch.length;
  }
  log(`Created ${totalParticipants} session participants`);

  log('Seed complete');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

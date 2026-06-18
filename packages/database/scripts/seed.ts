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
  studentCourseId: string;
  startDate: Date;
  intervalDays: number | null;
  endDate: Date | null;
  startTime: Date;
  endTime: Date;
}

// ---------------------------------------------------------------------------
// Course seed data generators
// ---------------------------------------------------------------------------

function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length];
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
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
// COPY helpers for batch-inserting class rules
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Class rule batch insert helpers
// ---------------------------------------------------------------------------

const RULE_CHUNK_SIZE = 500;

/**
 * Generate 4–5 ClassRule inputs for a given enrollment.
 *
 * Rule type breakdown (per enrollment):
 * - 1 固定上课 (single): intervalDays=null, endDate=null
 * - 1–2 循环上课 (cyclic with end): intervalDays=7|14, endDate set
 * - 2  无限循环上课 (infinite cyclic): intervalDays=7|14|30, endDate=null
 */
function buildRules(studentCourseId: string, seed: number): ClassRuleInput[] {
  const count = 4 + Math.floor(pseudoRandom(seed + 5000) * 2); // 4 or 5
  const rules: ClassRuleInput[] = [];

  // Pick a random base date in 2026
  const baseDate = new Date('2026-01-05T00:00:00');
  const dayOffset = Math.floor(pseudoRandom(seed + 6000) * 365);
  const enrollmentStart = addDays(baseDate, dayOffset);

  // --- Rule 1: 固定上课 (single) ---
  {
    const slotIdx = Math.floor(pseudoRandom(seed + 7000) * TIME_SLOTS.length);
    const slot = TIME_SLOTS[slotIdx];
    rules.push({
      studentCourseId,
      startDate: enrollmentStart,
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
    const ruleStart = addDays(enrollmentStart, 7);
    const ruleEnd = addDays(ruleStart, 60 + Math.floor(pseudoRandom(seed + 9000) * 31)); // 60–90 days
    rules.push({
      studentCourseId,
      startDate: ruleStart,
      intervalDays: 7,
      endDate: ruleEnd,
      startTime: makeTime(slot.startHour, slot.startMin),
      endTime: makeTime(slot.endHour, slot.endMin),
    });
  }

  // --- Rule 3: 无限循环上课 (infinite cyclic, weekly) ---
  {
    const slotIdx = Math.floor(pseudoRandom(seed + 10000) * TIME_SLOTS.length);
    const slot = TIME_SLOTS[slotIdx];
    const ruleStart = addDays(enrollmentStart, 14);
    rules.push({
      studentCourseId,
      startDate: ruleStart,
      intervalDays: 7,
      endDate: null,
      startTime: makeTime(slot.startHour, slot.startMin),
      endTime: makeTime(slot.endHour, slot.endMin),
    });
  }

  // --- Rule 4: 无限循环上课 (infinite cyclic, bi-weekly or monthly) ---
  {
    const slotIdx = Math.floor(pseudoRandom(seed + 11000) * TIME_SLOTS.length);
    const slot = TIME_SLOTS[slotIdx];
    const interval =
      INTERVAL_OPTIONS[Math.floor(pseudoRandom(seed + 12000) * INTERVAL_OPTIONS.length)];
    const ruleStart = addDays(enrollmentStart, 21);
    rules.push({
      studentCourseId,
      startDate: ruleStart,
      intervalDays: interval,
      endDate: null,
      startTime: makeTime(slot.startHour, slot.startMin),
      endTime: makeTime(slot.endHour, slot.endMin),
    });
  }

  // --- Optional 5th rule: 循环上课 (cyclic with end, bi-weekly) ---
  if (count === 5) {
    const slotIdx = Math.floor(pseudoRandom(seed + 13000) * TIME_SLOTS.length);
    const slot = TIME_SLOTS[slotIdx];
    const ruleStart = addDays(enrollmentStart, 28);
    const ruleEnd = addDays(ruleStart, 30 + Math.floor(pseudoRandom(seed + 14000) * 61)); // 30–90 days
    rules.push({
      studentCourseId,
      startDate: ruleStart,
      intervalDays: 14,
      endDate: ruleEnd,
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
  await prisma.classSessionOverride.deleteMany();
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

  // 6. Create class rules for each enrollment (generate + insert in batches)
  log('Generating class rules...');

  const allEnrollments = await prisma.studentCourse.findMany({ select: { id: true } });
  let totalRules = 0;
  let ruleBatch: ClassRuleInput[] = [];
  for (let ei = 0; ei < allEnrollments.length; ei++) {
    const enrollmentRules = buildRules(allEnrollments[ei].id, ei);
    ruleBatch.push(...enrollmentRules);

    // Flush batch when it reaches chunk size
    if (ruleBatch.length >= RULE_CHUNK_SIZE) {
      await prisma.classRule.createMany({ data: ruleBatch, skipDuplicates: true });
      totalRules += ruleBatch.length;
      ruleBatch = [];
    }
  }
  // Flush remaining
  if (ruleBatch.length > 0) {
    await prisma.classRule.createMany({ data: ruleBatch, skipDuplicates: true });
    totalRules += ruleBatch.length;
  }
  log(`Created ${totalRules} class rules`);

  // 7. Add ClassSessionOverride for roughly half of the rules (batch pagination)
  log('Generating session overrides...');

  const STATES: ('COMPLETED' | 'LEAVE' | 'CANCELLED' | 'RESCHEDULED')[] = [
    'COMPLETED',
    'LEAVE',
    'CANCELLED',
    'RESCHEDULED',
  ];

  const PAGE_SIZE = 500;
  const MAX_END = new Date('2027-01-01');
  let processedRules = 0;
  let totalOverrides = 0;
  let cursor: string | undefined;

  while (true) {
    const page = await prisma.classRule.findMany({
      select: { id: true, startDate: true, endDate: true, intervalDays: true },
      take: PAGE_SIZE,
      orderBy: { id: 'asc' },
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    if (page.length === 0) break;

    const batchOverrides: {
      classRuleId: string;
      occurrenceDate: Date;
      state: 'COMPLETED' | 'LEAVE' | 'CANCELLED' | 'RESCHEDULED';
      rescheduledDate?: Date;
      rescheduledStartTime?: Date;
      rescheduledEndTime?: Date;
      reason?: string;
    }[] = [];
    for (let ri = 0; ri < page.length; ri++) {
      const globalIndex = processedRules + ri;
      if (pseudoRandom(globalIndex + 20000) < 0.5) continue;

      const rule = page[ri];
      const count = 1 + Math.floor(pseudoRandom(globalIndex + 21000) * 2);

      const maxEnd = rule.endDate ?? MAX_END;
      let totalDates: number;
      if (rule.intervalDays === null) {
        totalDates = 1;
      } else {
        const diffMs = maxEnd.getTime() - rule.startDate.getTime();
        totalDates = Math.floor(diffMs / (86_400_000 * rule.intervalDays)) + 1;
      }
      if (totalDates <= 0) continue;

      const usedIndices = new Set<number>();
      for (let c = 0; c < count && usedIndices.size < totalDates; c++) {
        let idx: number;
        let attempts = 0;
        do {
          idx = Math.floor(pseudoRandom(globalIndex * 10007 + c * 13 + 22000) * totalDates);
          attempts++;
          if (attempts > 100) break; // safety valve
        } while (usedIndices.has(idx));
        usedIndices.add(idx);

        const selectedDate =
          rule.intervalDays === null
            ? new Date(rule.startDate)
            : new Date(rule.startDate.getTime() + idx * rule.intervalDays * 86_400_000);

        const state =
          STATES[Math.floor(pseudoRandom(globalIndex + 23000 + c * 100) * STATES.length)];

        const override: Record<string, unknown> = {
          classRuleId: rule.id,
          occurrenceDate: selectedDate,
          state,
          reason: `Seed: ${state.toLowerCase()}`,
        };

        if (state === 'RESCHEDULED') {
          const slotIdx = Math.floor(
            pseudoRandom(globalIndex + 24000 + c * 100) * TIME_SLOTS.length,
          );
          const slot = TIME_SLOTS[slotIdx];
          override.rescheduledDate = addDays(selectedDate, 1);
          override.rescheduledStartTime = makeTime(slot.startHour, slot.startMin);
          override.rescheduledEndTime = makeTime(slot.endHour, slot.endMin);
        }

        batchOverrides.push(override as (typeof batchOverrides)[number]);
      }
    }

    // 立即插入这一批的 override
    if (batchOverrides.length > 0) {
      const CHUNK = 2_000;
      for (let i = 0; i < batchOverrides.length; i += CHUNK) {
        await prisma.classSessionOverride.createMany({
          data: batchOverrides.slice(i, i + CHUNK),
          skipDuplicates: true,
        });
      }
      totalOverrides += batchOverrides.length;
    }

    processedRules += page.length;

    cursor = page[page.length - 1].id;
  }

  log(`Created ${totalOverrides} session overrides`);

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

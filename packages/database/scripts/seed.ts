import { createHash, randomBytes } from 'node:crypto';

import { Pool } from 'pg';

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

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fmtTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

// Minimal ULID generator (10-char timestamp + 16-char random, Crockford Base32)
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function ulid(): string {
  const now = Date.now();
  // Timestamp part (10 chars): encode 48-bit timestamp in Crockford Base32
  let ts = '';
  let t = now;
  for (let i = 0; i < 10; i++) {
    ts = CROCKFORD[t & 0x1f] + ts;
    t = Math.floor(t / 32);
  }
  // Random part (16 chars = 80 bits): use a bit buffer over 10 random bytes
  const bytes = randomBytes(10);
  let rand = '';
  let bits = 0;
  let buffer = 0;
  let byteIdx = 0;
  for (let i = 0; i < 16; i++) {
    if (bits < 5) {
      buffer = (buffer << 8) | bytes[byteIdx++];
      bits += 8;
    }
    bits -= 5;
    rand += CROCKFORD[(buffer >>> bits) & 0x1f];
  }
  return ts + rand;
}

async function bulkInsertRules(pool: Pool, rules: ClassRuleInput[]): Promise<void> {
  const client = await pool.connect();
  try {
    const BATCH = 1_000;
    const COLS = [
      'id',
      'student_course_id',
      'start_date',
      'interval_days',
      'end_date',
      'start_time',
      'end_time',
      'created_at',
      'updated_at',
    ];
    const COL_NAMES = COLS.join(', ');
    const PARAMS_PER_ROW = 9;
    const now = new Date().toISOString();

    for (let i = 0; i < rules.length; i += BATCH) {
      const batch = rules.slice(i, i + BATCH);

      const rowsSql = batch
        .map((_, ri) => {
          const base = ri * PARAMS_PER_ROW;
          return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9})`;
        })
        .join(', ');

      const params: (string | number | null)[] = [];
      for (const r of batch) {
        params.push(
          ulid(), // id
          r.studentCourseId, // student_course_id
          fmtDate(r.startDate), // start_date
          r.intervalDays, // interval_days
          r.endDate ? fmtDate(r.endDate) : null, // end_date
          fmtTime(r.startTime), // start_time
          fmtTime(r.endTime), // end_time
          now, // created_at
          now, // updated_at
        );
      }

      const sql = `INSERT INTO class_rule (${COL_NAMES}) VALUES ${rowsSql}`;
      await client.query(sql, params);
    }
  } finally {
    client.release();
  }
}

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

async function main() {
  console.log('🌱 Seeding database …');

  // 1. Clean existing data
  await prisma.course.deleteMany();
  await prisma.user.deleteMany(); // CASCADE will remove related students
  console.log('  ✓ Cleared existing data');

  // 2. Create admin user
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
  console.log(`  ✓ Created user`);

  // 3. Create 10,000 students
  const students = Array.from({ length: 10_000 }, (_, i) => buildStudent(i, user.id));

  await prisma.student.createMany({
    data: students,
    skipDuplicates: true,
  });
  console.log(`  ✓ Created ${students.length} students`);

  // 4. Create 10,000 courses
  const courses = Array.from({ length: 10_000 }, (_, i) => buildCourse(i, user.id));

  // Batch insert in chunks to avoid overwhelming the database
  const CHUNK_SIZE = 500;
  for (let i = 0; i < courses.length; i += CHUNK_SIZE) {
    const chunk = courses.slice(i, i + CHUNK_SIZE);
    await prisma.course.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }
  console.log(`  ✓ Created ${courses.length} courses`);

  // 5. Assign random courses to each student
  await prisma.studentCourse.deleteMany();
  const allStudents = await prisma.student.findMany({ select: { id: true } });
  const allCourseIds = (
    await prisma.course.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true },
    })
  ).map((c) => c.id);
  console.log(`  ✓ Found ${allStudents.length} students, ${allCourseIds.length} active courses`);

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

  // Batch insert in chunks
  const ENROLLMENT_CHUNK_SIZE = 1_000;
  for (let i = 0; i < enrollments.length; i += ENROLLMENT_CHUNK_SIZE) {
    const chunk = enrollments.slice(i, i + ENROLLMENT_CHUNK_SIZE);
    await prisma.studentCourse.createMany({ data: chunk, skipDuplicates: true });
  }
  console.log(`  ✓ Created ${enrollments.length} course enrollments`);

  // 6. Create class rules for each enrollment
  console.log('  Generating class rules …');
  await prisma.classException.deleteMany();
  await prisma.classRule.deleteMany();
  console.log('  ✓ Cleared existing class rules and exceptions');

  const allEnrollments = await prisma.studentCourse.findMany({ select: { id: true } });
  console.log(`  ✓ Found ${allEnrollments.length} enrollments for rule generation`);

  const allRules: ClassRuleInput[] = [];
  for (let ei = 0; ei < allEnrollments.length; ei++) {
    const enrollmentRules = buildRules(allEnrollments[ei].id, ei);
    allRules.push(...enrollmentRules);
  }
  console.log(`  ✓ Generated ${allRules.length} class rules`);

  // Batch insert rules via PostgreSQL COPY (much faster than createMany)
  const pgPool = new Pool({ connectionString: process.env.DIRECT_URL });
  await bulkInsertRules(pgPool, allRules);
  await pgPool.end();
  console.log(`  ✓ Created ${allRules.length} class rules`);

  console.log('✅ Seed complete');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

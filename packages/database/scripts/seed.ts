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
  const status = pseudoRandom(index + 2000) > 0.15 ? 'ACTIVE' : 'DISABLED';

  return {
    userId,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    phone: `555-${padded}`,
    status,
  };
}

// ---------------------------------------------------------------------------
// Class rule generators
// ---------------------------------------------------------------------------

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

  // 3. Create 100 students
  log('Generating student data...');
  const students = Array.from({ length: 100 }, (_, i) => buildStudent(i, user.id));
  log('Student data generated');

  log('Writing to database...');
  const STUDENT_CHUNK_SIZE = 200;
  for (let i = 0; i < students.length; i += STUDENT_CHUNK_SIZE) {
    const chunk = students.slice(i, i + STUDENT_CHUNK_SIZE);
    await prisma.student.createMany({ data: chunk, skipDuplicates: true });
  }
  log(`Created ${students.length} students`);

  // 4. Create 100 courses
  log('Generating course data...');
  const courses = Array.from({ length: 100 }, (_, i) => buildCourse(i, user.id));
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
  const enrollments: { studentId: string; courseId: string; userId: string }[] = [];

  for (let si = 0; si < allStudents.length; si++) {
    const count = 10 + Math.floor(pseudoRandom(si + 3000) * 11); // 10–20
    const picked = new Set<number>();

    let attempt = 0;
    while (picked.size < count && picked.size < allCourseIds.length) {
      picked.add(Math.floor(pseudoRandom(si * 10007 + attempt * 13 + 4000) * allCourseIds.length));
      attempt++;
    }

    for (const ci of picked) {
      enrollments.push({
        studentId: allStudents[si].id,
        courseId: allCourseIds[ci],
        userId: user.id,
      });
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

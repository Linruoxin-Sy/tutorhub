import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '../src/client';

// ---------------------------------------------------------------------------
// Course seed data generators
// ---------------------------------------------------------------------------

const COURSE_ADJECTIVES = [
  'Advanced',
  'Introduction to',
  'Fundamentals of',
  'Principles of',
  'Modern',
  'Applied',
  'Comprehensive',
  'Essential',
  'Practical',
  'Theoretical',
  'Intermediate',
  'Foundations of',
  'Advanced Topics in',
  'Special Topics in',
  'Survey of',
] as const;

const COURSE_SUBJECTS = [
  'Algebra',
  'Geometry',
  'Calculus',
  'Statistics',
  'Physics',
  'Chemistry',
  'Biology',
  'Astronomy',
  'Geology',
  'English Literature',
  'World History',
  'Philosophy',
  'Psychology',
  'Sociology',
  'Economics',
  'Computer Science',
  'Data Structures',
  'Algorithms',
  'Machine Learning',
  'Artificial Intelligence',
  'Web Development',
  'Database Systems',
  'Network Security',
  'Software Engineering',
  'Operating Systems',
  'Linear Algebra',
  'Discrete Mathematics',
  'Probability Theory',
  'Thermodynamics',
  'Quantum Mechanics',
  'Organic Chemistry',
  'Cell Biology',
  'Genetics',
  'Ecology',
  'Neuroscience',
  'Linguistics',
  'Anthropology',
  'Political Science',
  'Art History',
  'Music Theory',
] as const;

const COURSE_DESCRIPTIONS = [
  'A comprehensive exploration of core concepts and modern applications.',
  'Build a strong foundation with hands-on projects and real-world examples.',
  'Covers both theoretical frameworks and practical implementation strategies.',
  'An in-depth study designed for learners seeking advanced knowledge.',
  'Learn essential techniques and best practices from industry experts.',
  'Combines rigorous theory with practical exercises to reinforce learning.',
  'Designed to provide a thorough understanding of key principles.',
  'Explores cutting-edge developments and emerging trends in the field.',
  'A structured approach to mastering complex topics step by step.',
  'Focuses on developing critical thinking and problem-solving skills.',
] as const;

function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length];
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function buildCourse(index: number) {
  const adj = pick(COURSE_ADJECTIVES, index);
  const subject = pick(COURSE_SUBJECTS, Math.floor(index / COURSE_ADJECTIVES.length));
  const descIdx = Math.floor(pseudoRandom(index) * COURSE_DESCRIPTIONS.length);
  const description = COURSE_DESCRIPTIONS[descIdx];
  const status = pseudoRandom(index + 1000) > 0.15 ? 'ACTIVE' : 'DISABLED';

  return { name: `${adj} ${subject}`, description, status } as const;
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

const FIRST_NAMES = [
  'Alice',
  'Bob',
  'Carol',
  'David',
  'Eva',
  'Frank',
  'Grace',
  'Henry',
  'Ivy',
  'Jack',
  'Karen',
  'Leo',
  'Mia',
  'Noah',
  'Olivia',
  'Patrick',
  'Quinn',
  'Rachel',
  'Samuel',
  'Tina',
  'Uma',
  'Victor',
  'Wendy',
  'Xavier',
  'Yara',
  'Zane',
] as const;

const LAST_NAMES = [
  'Johnson',
  'Smith',
  'White',
  'Lee',
  'Martinez',
  'Wilson',
  'Kim',
  'Brown',
  'Chen',
  'Davis',
  'Taylor',
  'Garcia',
  'Anderson',
  'Thomas',
  'Jackson',
  'Harris',
  'Martin',
  'Moore',
  'Clark',
  'Rodriguez',
] as const;

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
  const courses = Array.from({ length: 10_000 }, (_, i) => buildCourse(i));

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

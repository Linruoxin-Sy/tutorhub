import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '../src/client';

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

const GRADES = ['9th Grade', '10th Grade', '11th Grade', '12th Grade'] as const;

function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length];
}

function buildStudent(index: number, userId: string) {
  const firstName = pick(FIRST_NAMES, index);
  const lastName = pick(LAST_NAMES, Math.floor(index / FIRST_NAMES.length) + index);
  const padded = String(index + 1).padStart(4, '0');

  return {
    userId,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    phone: `555-${padded}`,
    grade: pick(GRADES, index),
  };
}

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function main() {
  console.log('🌱 Seeding database …');

  // 1. Clean existing data (CASCADE will remove related students)
  await prisma.user.deleteMany();
  console.log('  ✓ Cleared existing users');

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

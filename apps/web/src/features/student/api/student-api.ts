import type { Student } from '@tutorhub/database';

// ---------------------------------------------------------------------------
// Mock data generator — 200 fake students for local testing
// TODO Phase B: replace with `request.get('/student/list', { params })`
// ---------------------------------------------------------------------------

const TOTAL = 200;
const PAGE_SIZE = 20;

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
];

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
];

const GRADES = ['9th Grade', '10th Grade', '11th Grade', '12th Grade'];

function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length];
}

function buildMockStudent(index: number): Student {
  const firstName = pick(FIRST_NAMES, index);
  const lastName = pick(LAST_NAMES, Math.floor(index / FIRST_NAMES.length) + index);
  const padded = String(index + 1).padStart(4, '0');

  return {
    id: `mock-s${padded}`,
    createdAt: new Date(Date.UTC(2026, 0, 1) + index * 86_400_000 * 3),
    updatedAt: new Date(Date.UTC(2026, 4, 1) + index * 86_400_000),
    userId: 'mock-user-1',
    name: `${firstName} ${lastName}`,
    avatarUrl: null,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    phone: `555-${padded}`,
    grade: pick(GRADES, index),
    description: null,
  };
}

/** Pre-built full mock dataset */
const ALL_MOCK_STUDENTS: Student[] = Array.from({ length: TOTAL }, (_, i) => buildMockStudent(i));

export interface StudentListResponse {
  items: Student[];
  nextCursor: string | null;
  total: number;
}

/**
 * Mock cursor-based paginated fetch.
 *
 * Phase B: replace body with
 *   `const { data } = await request.get<StudentListResponse>('/student/list', { params }); return data;`
 */
export async function fetchStudents(params: {
  cursor?: string;
  limit?: number;
}): Promise<StudentListResponse> {
  const { cursor, limit = PAGE_SIZE } = params;

  // Simulate network latency
  await new Promise((r) => setTimeout(r, 1));

  const startIndex = cursor ? ALL_MOCK_STUDENTS.findIndex((s) => s.id === cursor) + 1 : 0;

  if (startIndex < 0 || startIndex >= ALL_MOCK_STUDENTS.length) {
    return { items: [], nextCursor: null, total: TOTAL };
  }

  const items = ALL_MOCK_STUDENTS.slice(startIndex, startIndex + limit);
  const lastItem = items.at(-1);
  const hasMore = startIndex + limit < ALL_MOCK_STUDENTS.length;

  return {
    items,
    nextCursor: hasMore && lastItem ? lastItem.id : null,
    total: TOTAL,
  };
}

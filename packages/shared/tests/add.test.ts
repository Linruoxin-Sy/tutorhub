import { add } from '@/add';

describe('add', () => {
  it('should be calculate the right result', () => {
    expect(add(1, 2)).toBe(3);
  });
});

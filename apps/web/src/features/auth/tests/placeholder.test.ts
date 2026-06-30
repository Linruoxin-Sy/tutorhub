import { expect, test } from 'vitest';

test('window and document are available in browser mode', () => {
  expect(window).toBeDefined();
  expect(document).toBeDefined();
});

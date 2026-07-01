import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-vue';

import AvatarUploader from '@/components/AvatarUploader.vue';

// Mock browser-image-compression
vi.mock('browser-image-compression', () => ({
  default: vi.fn(async () => {
    // Return a mock compressed blob
    return new Blob(['compressed'], { type: 'image/webp' });
  }),
}));

test('renders camera icon placeholder when no name or avatar', async () => {
  const screen = await render(AvatarUploader, {
    props: { name: '', avatarUrl: null },
  });

  await expect.element(screen.getByText('Click to change avatar')).toBeVisible();
  const cameraIcon = document.querySelector('.i-lucide-camera');
  expect(cameraIcon).toBeDefined();
});

test('renders initials when name is provided without avatar', async () => {
  const screen = await render(AvatarUploader, {
    props: { name: 'Alice', avatarUrl: null },
  });

  // After debounce (300ms), the gradient avatar should appear
  await new Promise((r) => setTimeout(r, 400));

  // Should show the first letter - use exact text match to avoid matching 'Click to change avatar'
  const letterEl = screen.getByText('A', { exact: true });
  await expect.element(letterEl).toBeVisible();
});

test('renders avatar image when avatarUrl is provided', async () => {
  const screen = await render(AvatarUploader, {
    props: { name: 'Alice', avatarUrl: 'https://example.com/avatar.jpg' },
  });

  const img = screen.getByAltText('Avatar').element() as HTMLImageElement;
  expect(img.src).toContain('example.com/avatar.jpg');
});

test('emits pendingFile when a file is selected', async () => {
  const onPendingFile = vi.fn();

  await render(AvatarUploader, {
    props: { name: 'Test', avatarUrl: null },
    attrs: { onPendingFile: onPendingFile },
  });

  // Trigger file selection
  const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
  expect(fileInput).toBeDefined();

  if (fileInput) {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fileInput.dispatchEvent(new Event('change'));
  }

  // Wait for async compression
  await new Promise((r) => setTimeout(r, 100));

  expect(onPendingFile).toHaveBeenCalledOnce();
  expect(onPendingFile.mock.calls[0]![0]).toBeInstanceOf(Blob);
});

test('shows local preview immediately after selecting a file', async () => {
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-preview');

  const screen = await render(AvatarUploader, {
    props: { name: 'Test', avatarUrl: null },
  });

  const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
  expect(fileInput).toBeDefined();

  if (fileInput) {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fileInput.dispatchEvent(new Event('change'));
  }

  await new Promise((r) => setTimeout(r, 50));

  const previewImg = screen.getByAltText('Avatar preview').element() as HTMLImageElement;
  expect(previewImg.src).toContain('blob:mock-preview');

  vi.restoreAllMocks();
});

test('ignores non-image file selection', async () => {
  const onPendingFile = vi.fn();

  await render(AvatarUploader, {
    props: { name: 'Test', avatarUrl: null },
    attrs: { onPendingFile: onPendingFile },
  });

  const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
  expect(fileInput).toBeDefined();

  if (fileInput) {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    Object.defineProperty(fileInput, 'files', { value: [file] });
    fileInput.dispatchEvent(new Event('change'));
  }

  await new Promise((r) => setTimeout(r, 50));
  expect(onPendingFile).not.toHaveBeenCalled();
});

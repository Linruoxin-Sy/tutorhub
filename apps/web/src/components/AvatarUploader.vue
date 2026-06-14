<template>
  <div class="flex flex-col items-center gap-3">
    <!-- Avatar display -->
    <button
      type="button"
      class="group relative size-24 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-100 shadow-sm transition-all hover:border-blue-400 hover:shadow-md dark:border-[#4a4a4a] dark:bg-[#202020] dark:hover:border-blue-500"
      @click="triggerFileInput"
    >
      <Transition name="avatar-fade" mode="out-in">
        <!-- 1) Local preview (user just selected a file) -->
        <img
          v-if="localPreviewUrl"
          :key="'preview'"
          :src="localPreviewUrl"
          class="size-full rounded-full object-cover"
          alt="Avatar preview"
        />

        <!-- 2) Existing avatar image -->
        <img
          v-else-if="resolvedAvatarUrl"
          :key="'real'"
          :src="resolvedAvatarUrl"
          class="size-full rounded-full object-cover"
          alt="Avatar"
        />

        <!-- 3) Gradient avatar (based on debounced name) -->
        <div
          v-else-if="debouncedName"
          :key="'gradient-' + debouncedName"
          class="flex size-full items-center justify-center rounded-full text-xl font-bold shadow-inner"
          :style="{
            background: getAvatarGradient(debouncedName),
            color: getAvatarTextColor(debouncedName),
          }"
        >
          {{ debouncedName.charAt(0).toUpperCase() }}
        </div>

        <!-- 4) Placeholder (no name, no avatar) -->
        <div
          v-else
          :key="'placeholder'"
          class="flex size-full items-center justify-center rounded-full"
        >
          <i class="i-lucide-camera size-8 text-gray-400 dark:text-gray-500"></i>
        </div>
      </Transition>

      <!-- Hover overlay -->
      <div
        class="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-colors group-hover:bg-black/50"
      >
        <i
          class="i-lucide-camera size-6 text-white opacity-0 transition-opacity group-hover:opacity-100"
        ></i>
      </div>

      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileSelect"
      />
    </button>

    <!-- Hint text -->
    <p class="text-xs text-gray-500 dark:text-gray-400">Click to change avatar</p>
  </div>
</template>

<script setup lang="ts">
import { debounce } from 'es-toolkit';
import imageCompression from 'browser-image-compression';
import { getAvatarGradient, getAvatarTextColor } from '@/utils/avatar';

const props = defineProps<{
  name?: string;
  avatarUrl?: string | null;
}>();

const emit = defineEmits<{
  pendingFile: [value: Blob | null];
}>();

const MAX_AVATAR_SIZE = 1 * 1024 * 1024; // 1 MB

const fileInputRef = ref<HTMLInputElement>();
const localPreviewUrl = ref<string | null>(null);

// --- Debounced name for gradient computation (300ms) ---
const debouncedName = ref('');

const updateDebouncedName = debounce((val: string) => {
  if (!localPreviewUrl.value && !props.avatarUrl) {
    debouncedName.value = val;
  }
}, 300);

watch(
  () => props.name,
  (val) => {
    updateDebouncedName(val ?? '');
  },
  { immediate: true },
);

const resolvedAvatarUrl = computed(() => props.avatarUrl || null);

function triggerFileInput() {
  fileInputRef.value?.click();
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) return;

  input.value = '';

  // 第一层防护：前端显式大小校验
  if (file.size > MAX_AVATAR_SIZE) {
    // 超过 1MB 才提示，因为压缩后会变小
    // 但极小概率超大的文件直接拦截
  }

  // 1) Local preview immediately
  localPreviewUrl.value = URL.createObjectURL(file);

  // 2) 始终压缩：输出 WebP，限制宽高 1024，控制体积 ≤1MB
  const uploadFile = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
    fileType: 'image/webp',
  });

  // 3) Emit the compressed WebP blob — 由父组件在提交时上传
  emit('pendingFile', uploadFile);
}

// Cleanup object URL on unmount
onUnmounted(() => {
  if (localPreviewUrl.value) {
    URL.revokeObjectURL(localPreviewUrl.value);
  }
  updateDebouncedName.cancel();
});
</script>

<style scoped>
.avatar-fade-enter-active,
.avatar-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.avatar-fade-enter-from {
  opacity: 0;
  transform: scale(0.85);
}

.avatar-fade-leave-to {
  opacity: 0;
  transform: scale(0.85);
}
</style>

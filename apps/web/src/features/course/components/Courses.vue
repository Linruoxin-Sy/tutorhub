<template>
  <section
    class="flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
  >
    <div class="shrink-0 border-b border-gray-200 px-5 py-4 dark:border-[#343434]">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Courses</h1>
        </div>

        <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div class="grid gap-3 sm:grid-cols-2 lg:min-w-136 lg:grid-cols-[1fr_12rem]">
            <label class="relative block">
              <i
                class="i-lucide-search absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              ></i>
              <input
                v-model="search"
                type="text"
                placeholder="Search courses..."
                class="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
              />
            </label>

            <select
              v-model="status"
              class="select w-full cursor-pointer rounded-xl border border-gray-200 bg-white py-2.5 text-sm text-gray-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white"
            >
              <option value="">All status</option>
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </div>

          <button
            type="button"
            class="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            @click="router.push({ name: 'course.create' })"
          >
            <i class="i-lucide-plus size-4"></i>
            Add Course
          </button>
        </div>
      </div>
    </div>

    <CourseList :search-term="debouncedSearch" :status-term="status" />
  </section>
</template>

<script setup lang="ts">
import { debounce } from 'es-toolkit';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import CourseList from '@/features/course/components/CourseList.vue';

const router = useRouter();

const search = ref('');
const status = ref<'ACTIVE' | 'DISABLED' | ''>('');
const debouncedSearch = ref('');

const updateDebouncedSearch = debounce((val: string) => {
  debouncedSearch.value = val;
}, 300);

watch(search, (val) => {
  updateDebouncedSearch(val);
});

onUnmounted(() => {
  updateDebouncedSearch.cancel();
});
</script>

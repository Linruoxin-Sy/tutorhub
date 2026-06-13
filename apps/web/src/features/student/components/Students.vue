<template>
  <CardSection class="flex flex-1 flex-col overflow-hidden">
    <div class="shrink-0 border-b border-gray-200 px-5 py-4 dark:border-[#343434]">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
        </div>
        <div class="flex items-center gap-3">
          <div class="sm:max-w-xs sm:min-w-80">
            <label class="relative block">
              <i
                class="i-lucide-search absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              ></i>
              <input
                v-model="searchInput"
                type="text"
                placeholder="Search students..."
                class="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-10 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
              />
            </label>
          </div>
          <button
            type="button"
            class="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            @click="router.push({ name: 'student.create' })"
          >
            <i class="i-lucide-plus size-4"></i>
            Add Student
          </button>
        </div>
      </div>
    </div>

    <StudentList :search-term="debouncedSearch" />
  </CardSection>
</template>

<script setup lang="ts">
import { debounce } from 'es-toolkit';
import { useRouter } from 'vue-router';
import StudentList from '@/features/student/components/StudentList.vue';

const router = useRouter();

const searchInput = ref('');
const debouncedSearch = ref('');

const updateDebouncedSearch = debounce((val: string) => {
  debouncedSearch.value = val;
}, 300);

watch(searchInput, (val) => {
  updateDebouncedSearch(val);
});

onUnmounted(() => {
  updateDebouncedSearch.cancel();
});
</script>

<template>
  <section
    class="flex-1 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
  >
    <div class="shrink-0 border-b border-gray-200 px-5 py-4 dark:border-[#343434]">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
        </div>
        <div class="flex items-center gap-3">
          <!-- <div class="sm:min-w-80 sm:max-w-xs">
            <label class="relative block">
              <i
                class="i-lucide-search absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              ></i>
              <input
                type="text"
                placeholder="Search students..."
                class="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
              />
            </label>
          </div> -->
          <button
            type="button"
            class="inline-flex shrink-0 items-center cursor-pointer gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <i class="i-lucide-plus size-4"></i>
            Add Student
          </button>
        </div>
      </div>
    </div>

    <StudentList />
  </section>
</template>

<script setup lang="ts">
import StudentList from '@/features/student/components/StudentList.vue';
</script>

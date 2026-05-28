<template>
  <section
    class="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c] sm:flex-row sm:items-center sm:justify-between"
  >
    <div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Students</h2>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Search, review, and manage student records
      </p>
    </div>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div class="relative w-full sm:w-80">
        <i
          class="i-lucide-search absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
        ></i>
        <input
          type="text"
          placeholder="Search students..."
          class="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#2c2c2c] dark:text-white dark:placeholder:text-gray-500"
        />
      </div>

      <button
        type="button"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
      >
        <i class="i-lucide-plus size-4"></i>
        Add Student
      </button>
    </div>
  </section>
</template>

<script setup lang="ts"></script>

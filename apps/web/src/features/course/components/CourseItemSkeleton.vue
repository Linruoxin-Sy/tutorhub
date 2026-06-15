<template>
  <article
    class="flex h-36 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm dark:border-[#2f2f2f] dark:bg-[#202020]"
  >
    <div class="bg-linear-to-r from-blue-500 to-indigo-600 px-5 py-4">
      <div class="h-5 w-48 animate-pulse rounded bg-white/30"></div>
    </div>
    <div class="flex flex-1 items-start justify-between gap-4 px-5 py-4">
      <div class="min-w-0 flex-1 space-y-3">
        <div class="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-[#343434]"></div>
        <div class="h-3 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-[#343434]"></div>
      </div>
      <div class="flex shrink-0 gap-2 self-end">
        <div class="h-8 w-16 animate-pulse rounded-lg bg-gray-200 dark:bg-[#343434]"></div>
        <div class="h-8 w-18 animate-pulse rounded-lg bg-gray-200 dark:bg-[#343434]"></div>
      </div>
    </div>
  </article>
</template>

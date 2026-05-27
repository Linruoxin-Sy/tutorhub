<template>
  <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="space-y-6">
      <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="stat in stats"
          :key="stat.label"
          class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
        >
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
              <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {{ stat.value }}
              </p>
            </div>

            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-2xl shadow-sm dark:border-[#3a3a3a] dark:bg-[#202020]"
            >
              <i :class="stat.icon"></i>
            </div>
          </div>
        </article>
      </section>

      <section class="space-y-6">
        <article
          class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
        >
          <header
            class="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-5 py-4 dark:border-[#343434] dark:bg-[#232323]"
          >
            <div
              class="flex size-9 items-center justify-center rounded-xl bg-gray-200 text-gray-700 shadow-sm dark:bg-[#3a3a3a] dark:text-gray-200"
            >
              <i class="i-lucide-bot text-base"></i>
            </div>
            <div>
              <h2 class="text-sm font-semibold text-gray-900 dark:text-white">
                TutorHub AI Assistant
              </h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Smart analytics · Teaching guidance
              </p>
            </div>

            <div
              class="ml-auto flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs text-gray-600 shadow-sm ring-1 ring-black/5 dark:bg-[#202020] dark:text-gray-300 dark:ring-white/10"
            >
              <span class="size-2 rounded-full bg-gray-400 dark:bg-gray-500"></span>
              Online
            </div>
          </header>

          <div class="flex min-h-80 flex-col">
            <div class="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
              <div
                v-for="message in assistantMessages"
                :key="message.id"
                class="flex gap-3"
                :class="message.from === 'assistant' ? '' : 'justify-end'"
              >
                <div
                  v-if="message.from === 'assistant'"
                  class="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-700 shadow-sm dark:bg-[#3a3a3a] dark:text-gray-200"
                >
                  <i class="i-lucide-bot text-sm"></i>
                </div>

                <div
                  class="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-line"
                  :class="
                    message.from === 'assistant'
                      ? 'rounded-tl-sm bg-gray-100 text-gray-800 dark:bg-[#202020] dark:text-gray-200'
                      : 'rounded-tr-sm bg-gray-700 text-white dark:bg-[#4a4a4a]'
                  "
                >
                  {{ message.text }}
                </div>
              </div>
            </div>

            <div class="border-t border-gray-100 px-4 pb-3 pt-2 dark:border-[#343434]">
              <div class="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter a question, e.g. How are the students performing?"
                  class="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
                />
                <button
                  type="button"
                  class="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-gray-700 text-white transition hover:bg-gray-800 dark:bg-[#4a4a4a] dark:hover:bg-[#5a5a5a]"
                  aria-label="Send question"
                >
                  <i class="i-lucide-send text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </article>

        <article
          class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
        >
          <header class="border-b border-gray-100 px-5 py-4 dark:border-[#343434]">
            <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Recent Sessions</h2>
          </header>

          <div class="space-y-3 p-4 sm:p-5">
            <div
              v-for="session in recentSessions"
              :key="session.title + session.date"
              class="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-[#202020]"
            >
              <div
                :class="[
                  'flex size-9 shrink-0 items-center justify-center rounded-xl bg-gray-200 text-gray-700 shadow-sm dark:bg-[#3a3a3a] dark:text-gray-200',
                ]"
              >
                <i class="i-lucide-book-open text-sm"></i>
              </div>

              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {{ session.title }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ session.date }}</p>
              </div>

              <span class="shrink-0 text-sm font-medium text-gray-700 dark:text-gray-200">{{
                session.duration
              }}</span>
            </div>
          </div>
        </article>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
const stats = [
  {
    label: 'Active Students',
    value: '4',
    icon: 'i-lucide-users text-blue-600 dark:text-blue-300',
  },
  {
    label: 'Total Hours',
    value: '6.8h',
    icon: 'i-lucide-clock-3 text-violet-600 dark:text-violet-300',
  },
  {
    label: 'Total Sessions',
    value: '6',
    icon: 'i-lucide-calendar-days text-pink-600 dark:text-pink-300',
  },
  {
    label: 'Active Courses',
    value: '4',
    icon: 'i-lucide-book-open text-orange-600 dark:text-orange-300',
  },
];

const assistantMessages = [
  {
    id: 1,
    from: 'assistant',
    text: 'Hello! I am the TutorHub AI Assistant 🎓\nI can help analyze student data, look up course information, or provide teaching guidance. How can I help you today?',
  },
  {
    id: 2,
    from: 'user',
    text: 'How many students are active right now?',
  },
  {
    id: 3,
    from: 'assistant',
    text: 'There are currently 4 active students, with each student attending an average of 1.5 classes this week.\nIf needed, I can also break down participation by subject.',
  },
];

const recentSessions = [
  {
    title: 'Physics Fundamentals',
    date: '2026-04-02',
    duration: '60m',
  },
  {
    title: 'Advanced Mathematics',
    date: '2026-03-31',
    duration: '90m',
  },
  {
    title: 'English Literature',
    date: '2026-03-30',
    duration: '45m',
  },
  {
    title: 'Physics Fundamentals',
    date: '2026-03-29',
    duration: '90m',
  },
];
</script>

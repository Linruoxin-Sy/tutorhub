<template>
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
        <h2 class="text-sm font-semibold text-gray-900 dark:text-white">TutorHub AI Assistant</h2>
        <p class="text-xs text-gray-500 dark:text-gray-400">Smart analytics · Teaching guidance</p>
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

      <div class="border-t border-gray-100 px-4 pt-2 pb-3 dark:border-[#343434]">
        <div class="flex gap-2">
          <input
            type="text"
            placeholder="Enter a question, e.g. How are the students performing?"
            class="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 transition outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
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
</template>

<script setup lang="ts">
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
</script>

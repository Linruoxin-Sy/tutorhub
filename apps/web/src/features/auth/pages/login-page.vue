<template>
  <main class="flex h-full items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
    <section
      class="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
    >
      <div class="px-6 py-5">
        <p
          class="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300"
        >
          Welcome back
        </p>
        <h1 class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Sign in to TutorHub</h1>
      </div>

      <form class="space-y-4 px-6 py-6" @submit.prevent="submit">
        <div class="space-y-2">
          <label for="identifier" class="text-sm font-medium text-gray-700 dark:text-gray-200">
            Email or phone
          </label>
          <input
            id="identifier"
            v-model.trim="data.identifier"
            type="text"
            autocomplete="username"
            placeholder="Enter your email or phone number"
            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        <div class="space-y-2">
          <label for="password" class="text-sm font-medium text-gray-700 dark:text-gray-200">
            Password
          </label>
          <input
            id="password"
            v-model="data.password"
            type="password"
            autocomplete="current-password"
            placeholder="Enter your password"
            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span v-if="isSubmitting">Signing in...</span>
          <span v-else>Sign in</span>
        </button>

        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          No account yet?
          <RouterLink
            to="/register"
            class="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-300"
          >
            Create one
          </RouterLink>
        </p>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useLoginData } from '@/features/auth/hooks/useLoginData';

const { data, submit, isSubmitting } = useLoginData();
</script>

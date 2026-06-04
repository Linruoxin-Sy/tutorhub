<template>
  <main class="flex h-full items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
    <section
      class="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[#2f2f2f] dark:bg-[#2c2c2c]"
    >
      <div class="px-6 py-5">
        <p
          class="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300"
        >
          Create account
        </p>
        <h1 class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Register for TutorHub</h1>
      </div>

      <form class="space-y-4 px-6 py-6" @submit.prevent="submit">
        <div class="space-y-2">
          <label for="name" class="text-sm font-medium text-gray-700 dark:text-gray-200"
            >Name</label
          >
          <input
            id="name"
            v-model.trim="data.name"
            type="text"
            autocomplete="name"
            placeholder="Your name"
            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        <div class="space-y-2">
          <label for="email" class="text-sm font-medium text-gray-700 dark:text-gray-200"
            >Email</label
          >
          <input
            id="email"
            v-model.trim="data.email"
            type="email"
            autocomplete="email"
            placeholder="name@example.com"
            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        <div class="space-y-2">
          <label for="phone" class="text-sm font-medium text-gray-700 dark:text-gray-200"
            >Phone</label
          >
          <input
            id="phone"
            v-model.trim="data.phone"
            type="text"
            inputmode="numeric"
            autocomplete="tel"
            placeholder="11-digit phone number"
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
            autocomplete="new-password"
            placeholder="Create a password"
            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        <div class="space-y-2">
          <label for="rePassword" class="text-sm font-medium text-gray-700 dark:text-gray-200">
            Confirm Password
          </label>
          <input
            id="rePassword"
            v-model="data.rePassword"
            type="password"
            autocomplete="new-password"
            placeholder="Confirm your password"
            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span v-if="isSubmitting">Creating account...</span>
          <span v-else>Create account</span>
        </button>

        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?
          <RouterLink
            to="/login"
            class="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-300"
          >
            Sign in
          </RouterLink>
        </p>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useRegisterData } from '@/features/auth/hooks/useRegisterData';

const { data, submit, isSubmitting } = useRegisterData();
</script>

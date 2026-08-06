<template>
  <main class="flex h-full items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
    <CardSection class="w-full max-w-md overflow-hidden">
      <div class="px-6 py-5">
        <p
          class="text-xs font-semibold tracking-[0.2em] text-blue-600 uppercase dark:text-blue-300"
        >
          <T keypath="auth.login.eyebrow" />
        </p>
        <h1 class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          <T keypath="auth.login.title" />
        </h1>
      </div>

      <form class="space-y-4 px-6 py-6" @submit.prevent="submit">
        <div class="space-y-2">
          <label for="identifier" class="text-sm font-medium text-gray-700 dark:text-gray-200">
            <T keypath="auth.login.emailOrPhone" />
          </label>
          <input
            id="identifier"
            v-model.trim="data.identifier"
            type="text"
            autocomplete="username"
            :placeholder="t('auth.login.emailOrPhonePlaceholder')"
            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        <div class="space-y-2">
          <label for="password" class="text-sm font-medium text-gray-700 dark:text-gray-200">
            <T keypath="auth.login.password" />
          </label>
          <input
            id="password"
            v-model="data.password"
            type="password"
            autocomplete="current-password"
            :placeholder="t('auth.login.passwordPlaceholder')"
            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span v-if="isSubmitting">
            <T keypath="auth.login.signingIn" />
          </span>
          <span v-else>
            <T keypath="auth.login.signIn" />
          </span>
        </button>

        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          <T keypath="auth.login.noAccount" />
          <RouterLink
            :to="{ name: 'auth.register' }"
            class="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-300"
          >
            <T keypath="auth.login.createOne" />
          </RouterLink>
        </p>
      </form>
    </CardSection>
  </main>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { useLoginData } from '@/features/auth/hooks/useLoginData';

const { t } = useI18n();
const { data, submit, isSubmitting } = useLoginData();
</script>

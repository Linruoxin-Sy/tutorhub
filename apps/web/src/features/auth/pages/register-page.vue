<template>
  <main class="flex h-full items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
    <CardSection class="w-full max-w-md overflow-hidden">
      <div class="px-6 py-5">
        <p
          class="text-xs font-semibold tracking-[0.2em] text-blue-600 uppercase dark:text-blue-300"
        >
          <T keypath="auth.register.eyebrow" />
        </p>
        <h1 class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
          <T keypath="auth.register.title" />
        </h1>
      </div>

      <form class="space-y-4 px-6 py-6" @submit.prevent="submit">
        <div class="space-y-2">
          <label for="name" class="text-sm font-medium text-gray-700 dark:text-gray-200"
            ><T keypath="auth.register.name"
          /></label>
          <input
            id="name"
            v-model.trim="data.name"
            type="text"
            autocomplete="name"
            :placeholder="t('auth.register.namePlaceholder')"
            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        <div class="space-y-2">
          <label for="email" class="text-sm font-medium text-gray-700 dark:text-gray-200"
            ><T keypath="auth.register.email"
          /></label>
          <input
            id="email"
            v-model.trim="data.email"
            type="email"
            autocomplete="email"
            :placeholder="t('auth.register.emailPlaceholder')"
            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        <div class="space-y-2">
          <label for="phone" class="text-sm font-medium text-gray-700 dark:text-gray-200"
            ><T keypath="auth.register.phone"
          /></label>
          <input
            id="phone"
            v-model.trim="data.phone"
            type="text"
            inputmode="numeric"
            autocomplete="tel"
            :placeholder="t('auth.register.phonePlaceholder')"
            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        <div class="space-y-2">
          <label for="password" class="text-sm font-medium text-gray-700 dark:text-gray-200">
            <T keypath="auth.register.password" />
          </label>
          <input
            id="password"
            v-model="data.password"
            type="password"
            autocomplete="new-password"
            :placeholder="t('auth.register.passwordPlaceholder')"
            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        <div class="space-y-2">
          <label for="rePassword" class="text-sm font-medium text-gray-700 dark:text-gray-200">
            <T keypath="auth.register.confirmPassword" />
          </label>
          <input
            id="rePassword"
            v-model="data.rePassword"
            type="password"
            autocomplete="new-password"
            :placeholder="t('auth.register.confirmPasswordPlaceholder')"
            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-[#3a3a3a] dark:bg-[#202020] dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span v-if="isSubmitting">
            <T keypath="auth.register.creating" />
          </span>
          <span v-else>
            <T keypath="auth.register.create" />
          </span>
        </button>

        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          <T keypath="auth.register.hasAccount" />
          <RouterLink
            :to="{ name: 'auth.login' }"
            class="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-300"
          >
            <T keypath="auth.register.signIn" />
          </RouterLink>
        </p>
      </form>
    </CardSection>
  </main>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { useRegisterData } from '@/features/auth/hooks/useRegisterData';

const { t } = useI18n();
const { data, submit, isSubmitting } = useRegisterData();
</script>

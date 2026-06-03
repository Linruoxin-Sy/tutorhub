<template>
  <div class="dropdown dropdown-end">
    <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
      <div class="w-10 rounded-full">
        <!-- img placeholder -->
        <div class="flex size-full items-center justify-center bg-gray-100 dark:bg-[#202020]"></div>
        <!-- img -->
        <AppImage src="" />
      </div>
    </div>
    <ul
      tabindex="-1"
      class="menu menu-sm dropdown-content bg-gray-100 dark:bg-[#202020] rounded-box z-1 mt-3 w-52 p-2 shadow"
    >
      <li @click="logout">
        <a class="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >Logout</a
        >
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/features/auth/stores/user';

const router = useRouter();
const userStore = useUserStore();

const logout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<template>
  <nav
    class="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 p-1 shadow-sm dark:border-[#2f2f2f] dark:bg-[#202020]"
    aria-label="Primary navigation"
  >
    <RouterLink
      v-for="item in navItems"
      :key="item.name"
      :to="item.to"
      class="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition"
      :class="isActive(item.to) ? activeClass : inactiveClass"
    >
      <i :class="item.icon"></i>
      <span>{{ item.name }}</span>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
type NavItem = {
  name: string;
  to: string;
  icon: string;
};

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    to: '/dashboard',
    icon: 'i-mdi-view-dashboard-outline',
  },
  {
    name: 'Student',
    to: '/student/list',
    icon: 'i-lucide-users',
  },
  {
    name: 'Course',
    to: '/course/list',
    icon: 'i-lucide-book-open',
  },
  {
    name: 'Session',
    to: '/session',
    icon: 'i-mdi-timer-outline',
  },
];

const route = useRoute();

const activeClass =
  'bg-white text-gray-900 shadow-sm ring-1 ring-black/5 dark:bg-[#2e2e2e] dark:text-white dark:ring-white/10';
const inactiveClass =
  'text-gray-500 hover:bg-white hover:text-gray-900 dark:text-gray-400 dark:hover:bg-[#2a2a2a] dark:hover:text-white';

const activePath = computed(() => route.path);

function isActive(path: string) {
  return activePath.value === path || activePath.value.startsWith(`${path}/`);
}
</script>

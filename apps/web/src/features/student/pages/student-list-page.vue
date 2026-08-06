<template>
  <main class="mx-auto h-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <div class="flex h-full flex-col gap-6">
      <ListPageShell title-key="student.pageTitle">
        <template #filters>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-[max-content_12rem]">
            <SearchInput v-model="searchInput" :placeholder="t('student.searchPlaceholder')" />

            <SelectInput v-model="status">
              <option value=""><T keypath="common.status.all" /></option>
              <option value="ACTIVE"><T keypath="common.status.active" /></option>
              <option value="DISABLED"><T keypath="common.status.disabled" /></option>
            </SelectInput>
          </div>
        </template>
        <template #actions>
          <AppButton @click="router.push({ name: 'student.create' })">
            <i class="i-lucide-plus size-4"></i>
            <span><T keypath="common.actions.addStudent" /></span>
          </AppButton>
        </template>

        <VirtualList
          :query="sparseQuery"
          :estimate-size="70"
          :overscan="10"
          row-class="border-b border-gray-200 transition hover:bg-gray-50 dark:border-[#343434] dark:hover:bg-[#202020]"
          :row-style="{ display: 'flex' }"
        >
          <template #header>
            <div
              class="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 dark:border-[#343434] dark:bg-[#202020]"
              style="display: grid; grid-template-columns: 1.5fr 2fr 1.2fr 1fr 1.2fr 1fr"
            >
              <div
                v-for="column in columns"
                :key="column"
                class="truncate px-6 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-gray-600 uppercase dark:text-gray-400"
              >
                <T>{{ column }}</T>
              </div>
            </div>
          </template>

          <template #loading>
            <div class="divide-y divide-gray-200 dark:divide-[#343434]">
              <StudentItem v-for="index in 8" :key="index" loading />
            </div>
          </template>

          <template #item="{ item, isLoaded }">
            <StudentItem
              :student="item!"
              :loading="!isLoaded"
              :actions="['edit', 'delete']"
              @view="router.push({ name: 'student.detail', params: { id: item!.id } })"
              @edit="router.push({ name: 'student.edit', params: { id: item!.id } })"
              @delete="handleDelete(item!)"
            />
          </template>

          <template #empty>
            <div
              class="flex flex-1 items-center justify-center px-5 py-10 text-sm text-gray-500 dark:text-gray-400"
            >
              <T keypath="student.empty" />
            </div>
          </template>
        </VirtualList>
      </ListPageShell>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { refDebounced } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStudentDelete } from '@/features/student/hooks/useStudentDelete';
import { useSparseQuery } from '@/hooks/useSparseQuery';
import { fetchStudents, type StudentListResponse } from '@/features/student/api/student-api';
import StudentItem from '@/features/student/components/StudentItem.vue';
import VirtualList from '@/components/VirtualList.vue';
import SelectInput from '@/components/SelectInput.vue';

type StudentItemType = StudentListResponse['items'][number];

const { t, tm } = useI18n();
const router = useRouter();
const { confirmAndDelete } = useStudentDelete();

const searchInput = ref('');
const debouncedSearch = refDebounced(searchInput, 300);

const status = ref<'ACTIVE' | 'DISABLED' | ''>('ACTIVE');

const columns = computed(() => tm('student.columns'));

const searchRef = computed(() => debouncedSearch.value ?? '');
const statusRef = computed(() => status.value ?? '');
const courseIdRef = computed(() => '');

const sparseQuery = useSparseQuery<StudentItemType>({
  queryKeyPrefix: ['students'],
  fetchFn: (params) => fetchStudents(params as Parameters<typeof fetchStudents>[0]),
  filters: { name: searchRef, status: statusRef, courseId: courseIdRef },
});

async function handleDelete(item: StudentItemType) {
  try {
    await confirmAndDelete({ id: item.id, name: item.name });
  } catch {
    // User cancelled or delete failed — nothing to do
  }
}
</script>

<template>
  <main class="mx-auto flex h-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <PageHeader
      title-key="course.addStudent.pageTitle"
      description-key="course.addStudent.pageDescription"
    />

    <ListPageShell title-key="course.addStudent.availableTitle">
      <template #filters>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-[max-content_12rem]">
          <SearchInput v-model="search" :placeholder="t('course.addStudent.searchPlaceholder')" />

          <SelectInput v-model="status">
            <option value=""><T keypath="common.status.all" /></option>
            <option value="ACTIVE"><T keypath="common.status.active" /></option>
            <option value="DISABLED"><T keypath="common.status.disabled" /></option>
          </SelectInput>
        </div>
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
            :actions="[]"
            :selected="!!item && selectedIds.has(item.id)"
            @view="item && toggleItem(item.id)"
          />
        </template>

        <template #empty>
          <div
            class="flex flex-1 items-center justify-center px-5 py-10 text-sm text-gray-500 dark:text-gray-400"
          >
            <T keypath="course.addStudent.empty" />
          </div>
        </template>
      </VirtualList>
    </ListPageShell>

    <!-- 底部提交栏 -->
    <CardSection class="flex items-center justify-end gap-4 px-6 py-4">
      <span class="text-sm text-gray-500 dark:text-gray-400">
        <T keypath="course.addStudent.selected" :params="{ count: selectedIds.size }" />
      </span>
      <AppButton :disabled="selectedIds.size === 0 || isSubmitting" @click="submit">
        <T v-if="isSubmitting" keypath="common.actions.adding" />
        <T v-else keypath="common.actions.addToCourse" />
      </AppButton>
    </CardSection>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { refDebounced } from '@vueuse/core';
import { toast } from 'vue-sonner';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { useQueryClient } from '@tanstack/vue-query';
import { useSparseQuery } from '@/hooks/useSparseQuery';
import { fetchAvailableStudents, createEnrollment } from '@/features/enrollment/api/enrollment-api';
import StudentItem from '@/features/student/components/StudentItem.vue';
import { i18n } from '@/locales';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import PageHeader from '@/components/PageHeader.vue';
import SearchInput from '@/components/SearchInput.vue';
import SelectInput from '@/components/SelectInput.vue';
import type { Student } from '@tutorhub/database';

const router = useRouter();
const route = useRoute();
const queryClient = useQueryClient();
const id = (route.params as Record<string, string>).id;

const { t, tm } = useI18n();
const columns = computed(() => tm('course.columns'));

const search = ref('');
const debouncedSearch = refDebounced(search, 300);
const searchRef = computed(() => debouncedSearch.value ?? '');

const status = ref<'ACTIVE' | 'DISABLED' | ''>('ACTIVE');
const statusRef = computed(() => status.value ?? '');

const sparseQuery = useSparseQuery<Student>({
  queryKeyPrefix: ['available-students', id],
  fetchFn: (params) => fetchAvailableStudents(id, params),
  filters: { name: searchRef, status: statusRef },
});

/** 使用 Set 存储已选项的 ID，O(1) 查找 */
const selectedIds = ref(new Set<string>());

function toggleItem(itemId: string) {
  const next = new Set(selectedIds.value);
  if (next.has(itemId)) {
    next.delete(itemId);
  } else {
    next.add(itemId);
  }
  selectedIds.value = next;
}

const isSubmitting = ref(false);

async function submit() {
  if (selectedIds.value.size === 0) return;
  isSubmitting.value = true;

  try {
    const selectedArray = Array.from(selectedIds.value);
    await Promise.all(selectedArray.map((studentId) => createEnrollment(studentId, id)));
    queryClient.invalidateQueries({ queryKey: ['course-enrollments', id] });
    toast.success(i18n.global.t('course.addStudent.success', { count: selectedArray.length }));
    router.push({ name: 'course.edit', params: { id } });
  } catch {
    toast.error(i18n.global.t('course.addStudent.error'));
  } finally {
    isSubmitting.value = false;
  }
}
</script>

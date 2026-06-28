<template>
  <main class="mx-auto flex h-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <PageHeader title="Add Courses" description="Select courses to enroll the student in." />

    <ListPageShell title="Available Courses">
      <template #filters>
        <SearchInput v-model="search" placeholder="Search courses..." />
        <SelectInput v-model="status">
          <option value="">All status</option>
          <option value="ACTIVE">Active</option>
          <option value="DISABLED">Disabled</option>
        </SelectInput>
      </template>

      <VirtualList
        :query="sparseQuery"
        :estimate-size="164"
        :overscan="5"
        scroll-class="flex-1 overflow-x-hidden overflow-y-auto p-5"
      >
        <template #loading>
          <div class="flex flex-col gap-5">
            <CourseItem v-for="index in 4" :key="index" loading />
          </div>
        </template>

        <template #item="{ item, isLoaded }">
          <CourseItem
            :course="item!"
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
            <div
              class="rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center dark:border-[#3a3a3a]"
            >
              No available courses found.
            </div>
          </div>
        </template>
      </VirtualList>
    </ListPageShell>

    <!-- 底部提交栏 -->
    <CardSection class="flex items-center justify-end gap-4 px-6 py-4">
      <span class="text-sm text-gray-500 dark:text-gray-400">
        {{ selectedIds.size }} course(s) selected
      </span>
      <AppButton :disabled="selectedIds.size === 0 || isSubmitting" @click="submit">
        <span v-if="isSubmitting">Adding...</span>
        <span v-else>Add to Student</span>
      </AppButton>
    </CardSection>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { refDebounced } from '@vueuse/core';
import { toast } from 'vue-sonner';
import { useRouter, useRoute } from 'vue-router';
import { useSparseQuery } from '@/hooks/useSparseQuery';
import { fetchAvailableCourses, createEnrollment } from '@/features/enrollment/api/enrollment-api';
import CourseItem from '@/features/course/components/CourseItem.vue';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import PageHeader from '@/components/PageHeader.vue';
import SearchInput from '@/components/SearchInput.vue';
import SelectInput from '@/components/SelectInput.vue';
import type { Course } from '@tutorhub/database';

const router = useRouter();
const route = useRoute();
const id = (route.params as Record<string, string>).id;

const search = ref('');
const status = ref<'ACTIVE' | 'DISABLED' | ''>('ACTIVE');
const debouncedSearch = refDebounced(search, 300);

const searchRef = computed(() => debouncedSearch.value ?? '');
const statusRef = computed(() => status.value ?? '');

const sparseQuery = useSparseQuery<Course>({
  queryKeyPrefix: ['available-courses', id],
  fetchFn: (params) => fetchAvailableCourses(id, params),
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
    await Promise.all(selectedArray.map((courseId) => createEnrollment(id, courseId)));
    toast.success(`Successfully added ${selectedArray.length} course(s)!`);
    router.push({ name: 'student.edit', params: { id } });
  } catch {
    toast.error('Failed to add courses');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

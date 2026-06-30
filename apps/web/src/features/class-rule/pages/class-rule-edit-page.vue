<template>
  <main class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <PageHeader
      title="Edit Class Rule"
      description="Modify the class schedule rule for this enrollment."
    />

    <!-- Loading -->
    <CardSection v-if="isInitialLoading" class="shrink-0 p-6">
      <LoadingIndicator text="Loading class rule data..." />
    </CardSection>

    <!-- Form card -->
    <CardSection v-else class="shrink-0 space-y-5 p-6">
      <ClassRuleForm v-model="formData">
        <template #actions>
          <Transition
            mode="out-in"
            enter-active-class="transition duration-250"
            leave-active-class="transition duration-150"
            enter-from-class="opacity-0 scale-[0.92]"
            leave-to-class="opacity-0 scale-[0.92]"
          >
            <button
              v-if="!conflictPassed && !hasChanges"
              key="no-changes"
              disabled
              class="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-blue-600/70 px-4 py-3 text-sm font-medium text-white"
            >
              No changes
            </button>
            <button
              v-else-if="!conflictPassed && hasChanges"
              key="conflict-check"
              :disabled="!canSubmit"
              class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              @click="runConflictCheck"
            >
              <span v-if="isSubmitting">Checking...</span>
              <span v-else>Conflict Check</span>
            </button>
            <button
              v-else
              key="update"
              :disabled="!canSubmit"
              class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              @click="doUpdate"
            >
              <span v-if="isSubmitting">Saving...</span>
              <span v-else>Update Class Rule</span>
            </button>
          </Transition>
        </template>
      </ClassRuleForm>
    </CardSection>

    <!-- Generated sessions -->
    <ListPageShell v-if="conflictPassed && generatedSessions.length > 0" title="Generated Sessions">
      <template #actions>
        <span v-if="!isInfinite" class="text-sm text-gray-500 dark:text-gray-400">
          {{ generatedSessions.length }} session(s)
        </span>
      </template>

      <div class="flex flex-col">
        <VirtualList
          :query="sessionQuery"
          :estimate-size="90"
          :overscan="10"
          scroll-class="h-125 overflow-x-hidden overflow-y-auto scrollbar-none p-5"
        >
          <template #item="{ item }">
            <SessionItem
              v-if="item"
              course-name="Course"
              :date="item.occurrenceDate"
              :start-time="item.startTime"
              :end-time="item.endTime"
              :status="item.status"
              :price="item.price"
            />
          </template>
        </VirtualList>
      </div>
    </ListPageShell>

    <!-- Conflicts -->
    <ListPageShell
      v-if="conflictResult && conflictResult.hasConflict"
      title="Schedule Conflicts Detected"
    >
      <div class="flex flex-col">
        <div class="flex h-125 flex-col gap-3 overflow-y-auto p-5">
          <div
            v-for="conflict in conflictResult.conflicts"
            :key="conflict.date + conflict.startTime"
          >
            <SessionItem
              :course-name="conflict.courseName"
              :date="conflict.date"
              :start-time="conflict.startTime"
              :end-time="conflict.endTime"
              :conflict="true"
            />
            <div
              v-if="conflict.studentNames?.length"
              class="mt-1 px-5 text-xs text-gray-500 dark:text-gray-400"
            >
              Students: {{ conflict.studentNames.join(', ') }}
            </div>
          </div>
        </div>
      </div>
    </ListPageShell>

    <!-- Assigned Students -->
    <ListPageShell title="Assigned Students">
      <template #filters>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-[max-content_12rem]">
          <SearchInput v-model="studentSearch" placeholder="Search students..." />

          <SelectInput v-model="studentStatus">
            <option value="">All status</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
          </SelectInput>
        </div>
      </template>
      <template #actions>
        <AppButton
          @click="
            router.push({ name: 'class-rule.add-student', params: { ruleId }, query: { courseId } })
          "
        >
          <i class="i-lucide-plus size-4"></i>
          <span>Add Student</span>
        </AppButton>
      </template>

      <div class="flex h-125 flex-col">
        <VirtualList
          :query="studentQuery"
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
                v-for="column in studentColumns"
                :key="column"
                class="truncate px-6 py-3 text-left text-xs font-semibold tracking-wider whitespace-nowrap text-gray-600 uppercase dark:text-gray-400"
              >
                {{ column }}
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
              :student="item!.student"
              :loading="!isLoaded"
              :actions="['delete']"
              @view="router.push({ name: 'student.detail', params: { id: item!.student.id } })"
              @delete="handleRemoveStudent(item!)"
            />
          </template>

          <template #empty>
            <div
              class="flex flex-1 items-center justify-center px-5 py-10 text-sm text-gray-500 dark:text-gray-400"
            >
              No students found.
            </div>
          </template>
        </VirtualList>
      </div>
    </ListPageShell>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { refDebounced } from '@vueuse/core';
import { useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';
import { useRouter } from 'vue-router';
import SessionItem from '@/features/session/components/SessionItem.vue';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import LoadingIndicator from '@/components/LoadingIndicator.vue';
import SearchInput from '@/components/SearchInput.vue';
import SelectInput from '@/components/SelectInput.vue';
import AppButton from '@/components/AppButton.vue';
import StudentItem from '@/features/student/components/StudentItem.vue';
import ClassRuleForm from '@/features/class-rule/components/ClassRuleForm.vue';
import { useClassRuleEditForm } from '@/features/class-rule/hooks/useClassRuleEditForm';
import { useSparseQuery } from '@/hooks/useSparseQuery';
import { useDialog } from '@/hooks/useDialog';
import {
  fetchClassRuleStudents,
  removeClassRuleStudent,
} from '@/features/class-rule/api/class-rule-api';
import type { ClassRuleStudentListResponse } from '@tutorhub/schema';

type ClassRuleStudentItem = ClassRuleStudentListResponse['items'][number];

const props = defineProps<{
  courseId: string;
  ruleId: string;
}>();

const {
  formData,
  hasChanges,
  isInitialLoading,
  conflictResult,
  conflictPassed,
  generatedSessions,
  sessionQuery,
  canSubmit,
  isInfinite,
  isSubmitting,
  runConflictCheck,
  doUpdate,
} = useClassRuleEditForm(props.courseId, props.ruleId);

// ---- Assigned Students ----

const router = useRouter();
const queryClient = useQueryClient();
const { confirm } = useDialog();

const studentColumns = ['Name', 'Email', 'Phone', 'Status', 'Created At', 'Actions'];

const studentSearch = ref('');
const debouncedStudentSearch = refDebounced(studentSearch, 300);
const studentSearchRef = computed(() => debouncedStudentSearch.value ?? '');

const studentStatus = ref<'ACTIVE' | 'DISABLED' | ''>('ACTIVE');
const studentStatusRef = computed(() => studentStatus.value ?? '');

const studentQuery = useSparseQuery<ClassRuleStudentItem>({
  queryKeyPrefix: ['class-rule-students', props.ruleId],
  fetchFn: (params) => fetchClassRuleStudents(props.ruleId, params),
  filters: { name: studentSearchRef, status: studentStatusRef },
});

async function handleRemoveStudent(item: ClassRuleStudentItem) {
  const confirmed = await confirm({
    title: 'Remove Student',
    message: `Are you sure you want to remove "${item.student.name}" from this class rule?`,
    confirmText: 'Remove',
    variant: 'danger',
  });

  if (!confirmed) return;

  try {
    await removeClassRuleStudent(item.id);
    toast.success('Student removed from class rule successfully!');
    queryClient.invalidateQueries({ queryKey: ['class-rule-students', props.ruleId] });
  } catch {
    toast.error('Failed to remove student from class rule');
  }
}
</script>

<template>
  <main class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <PageHeader
      title="Create Class Rule"
      description="Define a new class schedule rule for this course."
    />

    <!-- Form card -->
    <CardSection class="shrink-0 space-y-5 p-6">
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
              v-if="!conflictPassed"
              key="conflict-check"
              :disabled="!isFormComplete || isSubmitting"
              class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-600/70"
              @click="runConflictCheck"
            >
              <span v-if="isSubmitting">Checking...</span>
              <span v-else>Conflict Check</span>
            </button>
            <button
              v-else
              key="create"
              :disabled="isSubmitting"
              class="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-600/70"
              @click="doCreate"
            >
              <span v-if="isSubmitting">Creating...</span>
              <span v-else>Create Class Rule</span>
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
  </main>
</template>

<script setup lang="ts">
import SessionItem from '@/features/session/components/SessionItem.vue';
import VirtualList from '@/components/VirtualList.vue';
import ListPageShell from '@/components/ListPageShell.vue';
import ClassRuleForm from '@/features/class-rule/components/ClassRuleForm.vue';
import { useClassRuleCreateForm } from '@/features/class-rule/hooks/useClassRuleCreateForm';

const props = defineProps<{
  courseId: string;
}>();

const {
  formData,
  conflictResult,
  conflictPassed,
  generatedSessions,
  sessionQuery,
  isInfinite,
  isFormComplete,
  isSubmitting,
  runConflictCheck,
  doCreate,
} = useClassRuleCreateForm(props.courseId);
</script>

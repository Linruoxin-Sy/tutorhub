import { useQueryClient } from '@tanstack/vue-query';
import { cloneDeep, isEqual, isNil, mapValues, merge, pick } from 'es-toolkit';
import { toast } from 'vue-sonner';

import { studentUpdateSchema } from '@tutorhub/schema';

import { uploadAvatarFile } from '@/features/student/api/avatar-upload';
import { fetchStudentById, updateStudent } from '@/features/student/api/student-api';
import { useLoading } from '@/hooks/useLoading';
import {
  DEFAULT_FORM_DATA,
  FORM_DATA_KEYS,
  type StudentFormData,
} from '@/features/student/types/studentForm';

export function useStudentEditForm(id: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const isInitialLoading = ref(true);

  const originalData = ref<StudentFormData>(cloneDeep(DEFAULT_FORM_DATA));

  const formData = ref<StudentFormData>(cloneDeep(DEFAULT_FORM_DATA));

  /** 当前展示的头像 URL（加载时的原始值） */
  const currentAvatarUrl = ref<string | null>(null);

  /** 暂存的待上传文件 */
  const pendingFile = ref<Blob | null>(null);

  const hasChanged = computed(() => {
    if (pendingFile.value !== null) return true;
    return !isEqual(formData.value, originalData.value);
  });

  // Load existing student data
  onMounted(async () => {
    try {
      const student = await fetchStudentById(id);
      // Only retain the fields related to the form and convert null values to ''
      originalData.value = mapValues(pick(student, FORM_DATA_KEYS), (v) => (isNil(v) ? '' : v));
      formData.value = cloneDeep(originalData.value);
      currentAvatarUrl.value = student.avatarUrl ?? null;
    } catch {
      toast.error('Failed to load student data');
      router.push({ name: 'student.list' });
    } finally {
      isInitialLoading.value = false;
    }
  });

  const verify = (): boolean => {
    const result = studentUpdateSchema.safeParse(formData.value);
    if (!result.success) {
      for (const { message } of result.error.issues) {
        toast.warning(message);
      }
      return false;
    }
    return true;
  };

  const { withLoading, isLoadingRef: isSubmitting } = useLoading();
  const submit = withLoading(async () => {
    if (!verify()) return;

    // 如果有待上传的头像文件，先上传到 MinIO
    const avatarKeyObj: { avatarKey?: string } = {};
    if (pendingFile.value) {
      try {
        avatarKeyObj.avatarKey = await uploadAvatarFile(pendingFile.value);
      } catch {
        toast.error('Avatar upload failed, please try again.');
        return;
      }
    }

    const payload = merge(cloneDeep(formData.value), avatarKeyObj);
    await updateStudent(id, payload);
    toast.success('Student updated successfully!');
    queryClient.invalidateQueries({ queryKey: ['students'] });
    router.push({ name: 'student.list' });
  });

  /** 用户选择头像后暂存文件，不立即上传到 MinIO */
  function handlePendingFile(file: Blob | null) {
    pendingFile.value = file;
  }

  return {
    formData,
    originalData,
    currentAvatarUrl,
    hasChanged,
    isInitialLoading,
    submit,
    isSubmitting,
    pendingFile,
    handlePendingFile,
  };
}

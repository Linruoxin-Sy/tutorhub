import { cloneDeep, isEqual } from 'es-toolkit';
import { studentUpdateSchema } from '@tutorhub/schema';
import { useLoading } from '@/hooks/useLoading';
import { fetchStudentById, updateStudent } from '@/features/student/api/student-api';
import { uploadAvatarFile } from '@/features/student/api/avatar-upload';
import { useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  description: string;
}

const DEFAULT_FORM_DATA: StudentFormData = {
  name: '',
  email: '',
  phone: '',
  description: '',
};

function fromStudent(student: Awaited<ReturnType<typeof fetchStudentById>>): StudentFormData {
  return {
    name: student.name,
    email: student.email ?? '',
    phone: student.phone ?? '',
    description: student.description ?? '',
  };
}

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
      originalData.value = fromStudent(student);
      formData.value = cloneDeep(originalData.value);
      currentAvatarUrl.value = student.avatarUrl ?? null;
    } catch {
      toast.error('Failed to load student data');
      router.push('/student');
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
    if (pendingFile.value) {
      try {
        await uploadAvatarFile(pendingFile.value);
      } catch {
        toast.error('Avatar upload failed, please try again.');
        return;
      }
    }

    const payload = cloneDeep(formData.value);
    await updateStudent(id, payload);
    toast.success('Student updated successfully!');
    queryClient.invalidateQueries({ queryKey: ['students'] });
    router.push('/student');
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

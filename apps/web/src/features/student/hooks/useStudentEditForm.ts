import { studentUpdateSchema } from '@tutorhub/schema';
import { useLoading } from '@/hooks/useLoading';
import { fetchStudentById, updateStudent } from '@/features/student/api/student-api';
import { uploadAvatarFile } from '@/features/student/api/avatar-upload';
import { useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

export function useStudentEditForm(id: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const isInitialLoading = ref(true);

  const originalData = reactive({
    name: '',
    email: null as string | null,
    phone: null as string | null,
    avatarKey: null as string | null,
    description: null as string | null,
  });

  const formData = reactive({
    name: '',
    email: '',
    phone: '',
    description: '',
  });

  /** 当前展示的头像 URL（加载时的原始值） */
  const currentAvatarUrl = ref<string | null>(null);

  /** 暂存的待上传文件 */
  const pendingFile = ref<Blob | null>(null);

  /** 暂存的待提交头像 key */
  const pendingAvatarKey = ref<string | null>(null);

  const hasChanged = computed(() => {
    return (
      formData.name !== originalData.name ||
      formData.email !== (originalData.email ?? '') ||
      formData.phone !== (originalData.phone ?? '') ||
      formData.description !== (originalData.description ?? '') ||
      pendingAvatarKey.value !== originalData.avatarKey
    );
  });

  // Load existing student data
  onMounted(async () => {
    try {
      const student = await fetchStudentById(id);
      originalData.name = student.name;
      originalData.email = student.email;
      originalData.phone = student.phone;
      originalData.avatarKey = student.avatarKey as string | null;
      originalData.description = student.description;
      formData.name = student.name;
      formData.email = student.email ?? '';
      formData.phone = student.phone ?? '';
      formData.description = student.description ?? '';
      currentAvatarUrl.value = student.avatarUrl ?? null;
      pendingAvatarKey.value = originalData.avatarKey;
    } catch {
      toast.error('Failed to load student data');
      router.push('/student');
    } finally {
      isInitialLoading.value = false;
    }
  });

  const verify = (): boolean => {
    const payload = {
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      avatarKey: pendingAvatarKey.value,
      description: formData.description || null,
    };
    const result = studentUpdateSchema.safeParse(payload);
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
    let finalAvatarKey = pendingAvatarKey.value;
    if (pendingFile.value) {
      try {
        finalAvatarKey = await uploadAvatarFile(pendingFile.value);
      } catch {
        toast.error('头像上传失败，请重试');
        return;
      }
    }

    const payload = {
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      avatarKey: finalAvatarKey,
      description: formData.description || null,
    };
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

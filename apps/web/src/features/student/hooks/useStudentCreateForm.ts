import { studentCreateSchema } from '@tutorhub/schema';
import { useLoading } from '@/hooks/useLoading';
import { createStudent } from '@/features/student/api/student-api';
import { uploadAvatarFile } from '@/features/student/api/avatar-upload';
import { useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

export function useStudentCreateForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const formData = reactive({
    name: '',
    email: '',
    phone: '',
    description: '',
  });

  const pendingFile = ref<Blob | null>(null);
  const avatarKey = ref<string | null>(null);

  const verify = (): boolean => {
    const payload = {
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      avatarKey: avatarKey.value,
      description: formData.description || null,
    };
    const result = studentCreateSchema.safeParse(payload);
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

    // 如果有待上传的头像，先上传到 MinIO
    let finalAvatarKey = avatarKey.value;
    if (pendingFile.value) {
      try {
        finalAvatarKey = await uploadAvatarFile(pendingFile.value);
      } catch {
        toast.error('Avatar upload failed, please try again.');
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
    await createStudent(payload);
    toast.success('Student created successfully!');
    queryClient.invalidateQueries({ queryKey: ['students'] });
    router.push('/student');
  });

  function handlePendingFile(file: Blob | null) {
    pendingFile.value = file;
  }

  return {
    data: formData,
    submit,
    isSubmitting,
    pendingFile,
    handlePendingFile,
  };
}

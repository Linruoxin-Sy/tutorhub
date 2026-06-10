import { cloneDeep, merge } from 'es-toolkit';
import { studentCreateSchema } from '@tutorhub/schema';
import { useLoading } from '@/hooks/useLoading';
import { createStudent } from '@/features/student/api/student-api';
import { uploadAvatarFile } from '@/features/student/api/avatar-upload';
import { useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

const DEFAULT_FORM_DATA = {
  name: '',
  email: '',
  phone: '',
  description: '',
};

type StudentFormData = typeof DEFAULT_FORM_DATA;

export function useStudentCreateForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const formData = ref<StudentFormData>(cloneDeep(DEFAULT_FORM_DATA));

  const pendingFile = ref<Blob | null>(null);

  const verify = (): boolean => {
    const result = studentCreateSchema.safeParse(formData.value);
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

    // 如果有待上传的头像，先上传到 MinIO 获取 objectKey
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

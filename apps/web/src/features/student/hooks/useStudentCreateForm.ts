import { studentCreateSchema } from '@tutorhub/schema';
import { useLoading } from '@/hooks/useLoading';
import { createStudent } from '@/features/student/api/student-api';
import { useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

export function useStudentCreateForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const formData = reactive({
    name: '',
    email: '',
    phone: '',
    avatarUrl: '',
    description: '',
  });

  const verify = (): boolean => {
    const payload = {
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      avatarUrl: formData.avatarUrl || null,
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
    const payload = {
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      avatarUrl: formData.avatarUrl || null,
      description: formData.description || null,
    };
    await createStudent(payload);
    toast.success('Student created successfully!');
    queryClient.invalidateQueries({ queryKey: ['students'] });
    router.push('/student');
  });

  return {
    data: formData,
    submit,
    isSubmitting,
  };
}

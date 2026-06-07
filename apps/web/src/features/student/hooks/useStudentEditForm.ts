import { studentUpdateSchema } from '@tutorhub/schema';
import { useLoading } from '@/hooks/useLoading';
import { fetchStudentById, updateStudent } from '@/features/student/api/student-api';
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
    avatarUrl: null as string | null,
    description: null as string | null,
  });

  const formData = reactive({
    name: '',
    email: '',
    phone: '',
    avatarUrl: '',
    description: '',
  });

  const hasChanged = computed(() => {
    return (
      formData.name !== originalData.name ||
      formData.email !== (originalData.email ?? '') ||
      formData.phone !== (originalData.phone ?? '') ||
      formData.avatarUrl !== (originalData.avatarUrl ?? '') ||
      formData.description !== (originalData.description ?? '')
    );
  });

  // Load existing student data
  onMounted(async () => {
    try {
      const student = await fetchStudentById(id);
      originalData.name = student.name;
      originalData.email = student.email;
      originalData.phone = student.phone;
      originalData.avatarUrl = student.avatarUrl;
      originalData.description = student.description;
      formData.name = student.name;
      formData.email = student.email ?? '';
      formData.phone = student.phone ?? '';
      formData.avatarUrl = student.avatarUrl ?? '';
      formData.description = student.description ?? '';
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
      avatarUrl: formData.avatarUrl || null,
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
    const payload = {
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      avatarUrl: formData.avatarUrl || null,
      description: formData.description || null,
    };
    await updateStudent(id, payload);
    toast.success('Student updated successfully!');
    queryClient.invalidateQueries({ queryKey: ['students'] });
    router.push('/student');
  });

  return {
    formData,
    originalData,
    hasChanged,
    isInitialLoading,
    submit,
    isSubmitting,
  };
}

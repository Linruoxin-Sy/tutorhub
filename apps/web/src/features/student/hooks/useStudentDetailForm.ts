import { fetchStudentById } from '@/features/student/api/student-api';
import {
  DEFAULT_FORM_DATA,
  FORM_DATA_KEYS,
  type StudentForm,
} from '@/features/student/types/studentForm';
import { cloneDeep, isNil, mapValues, pick } from 'es-toolkit';
import { toast } from 'vue-sonner';

export function useStudentDetailForm(id: string) {
  const router = useRouter();

  const isInitialLoading = ref(true);

  const formData = ref<StudentForm>(cloneDeep(DEFAULT_FORM_DATA));

  const currentAvatarUrl = ref<string | null>(null);

  onMounted(async () => {
    try {
      const student = await fetchStudentById(id);
      formData.value = mapValues(pick(student, FORM_DATA_KEYS), (v) => (isNil(v) ? '' : v));
      currentAvatarUrl.value = student.avatarUrl;
    } catch {
      toast.error('Failed to load student data');
      router.push({ name: 'student.list' });
    } finally {
      isInitialLoading.value = false;
    }
  });

  return {
    data: formData,
    avatarUrl: currentAvatarUrl,
    isInitialLoading,
  };
}

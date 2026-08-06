import { useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

import { deleteStudent } from '@/features/student/api/student-api';
import { useDialog } from '@/hooks/useDialog';
import { i18n } from '@/locales';

export function useStudentDelete() {
  const queryClient = useQueryClient();
  const isDeleting = ref(false);
  const { confirm } = useDialog();

  const confirmAndDelete = async (student: { id: string; name: string }): Promise<void> => {
    const confirmed = await confirm({
      title: i18n.global.t('student.delete.title'),
      message: i18n.global.t('student.delete.message', { name: student.name }),
      confirmText: i18n.global.t('common.actions.delete'),
      variant: 'danger',
    });

    if (!confirmed) return;

    isDeleting.value = true;
    try {
      await deleteStudent(student.id);
      toast.success(i18n.global.t('student.delete.success'));
      queryClient.invalidateQueries({ queryKey: ['students'] });
    } catch {
      toast.error(i18n.global.t('student.delete.error'));
      throw new Error('Delete failed');
    } finally {
      isDeleting.value = false;
    }
  };

  return { confirmAndDelete, isDeleting };
}

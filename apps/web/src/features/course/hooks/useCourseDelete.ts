import { useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

import { deleteCourse } from '@/features/course/api/course-api';
import { useDialog } from '@/hooks/useDialog';
import { i18n } from '@/locales';

export function useCourseDelete() {
  const queryClient = useQueryClient();
  const isDeleting = ref(false);
  const { confirm } = useDialog();

  const confirmAndDelete = async (course: { id: string; name: string }): Promise<void> => {
    const confirmed = await confirm({
      title: i18n.global.t('course.delete.title'),
      message: i18n.global.t('course.delete.message', { course: course.name }),
      confirmText: i18n.global.t('common.actions.delete'),
      variant: 'danger',
    });

    if (!confirmed) return;

    isDeleting.value = true;
    try {
      await deleteCourse(course.id);
      toast.success(i18n.global.t('course.delete.success'));
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    } catch {
      // Axios 拦截器已显示错误 toast，此处仅阻止后续流程
    } finally {
      isDeleting.value = false;
    }
  };

  return { confirmAndDelete, isDeleting };
}

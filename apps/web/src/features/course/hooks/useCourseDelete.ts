import { deleteCourse } from '@/features/course/api/course-api';
import { useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';
import { useDialog } from '@/hooks/useDialog';

export function useCourseDelete() {
  const queryClient = useQueryClient();
  const isDeleting = ref(false);
  const { confirm } = useDialog();

  const confirmAndDelete = async (course: { id: string; name: string }): Promise<void> => {
    const confirmed = await confirm({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete "${course.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
    });

    if (!confirmed) return;

    isDeleting.value = true;
    try {
      await deleteCourse(course.id);
      toast.success('Course deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    } catch {
      toast.error('Failed to delete course');
      throw new Error('Delete failed');
    } finally {
      isDeleting.value = false;
    }
  };

  return { confirmAndDelete, isDeleting };
}

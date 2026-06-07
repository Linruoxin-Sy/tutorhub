import { deleteStudent } from '@/features/student/api/student-api';
import { useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';
import { useDialog } from '@/hooks/useDialog';

export function useStudentDelete() {
  const queryClient = useQueryClient();
  const isDeleting = ref(false);
  const { confirm } = useDialog();

  const confirmAndDelete = async (student: { id: string; name: string }): Promise<void> => {
    const confirmed = await confirm({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete ${student.name}? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
    });

    if (!confirmed) return;

    isDeleting.value = true;
    try {
      await deleteStudent(student.id);
      toast.success('Student deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['students'] });
    } catch {
      toast.error('Failed to delete student');
      throw new Error('Delete failed');
    } finally {
      isDeleting.value = false;
    }
  };

  return { confirmAndDelete, isDeleting };
}

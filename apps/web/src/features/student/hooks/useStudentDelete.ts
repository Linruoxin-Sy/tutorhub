import { deleteStudent } from '@/features/student/api/student-api';
import { useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

export function useStudentDelete() {
  const queryClient = useQueryClient();
  const isDeleting = ref(false);

  const confirmAndDelete = async (student: { id: string; name: string }): Promise<void> => {
    // Create and show the confirm modal
    const modal = document.createElement('dialog');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-box rounded-2xl border border-gray-200 dark:border-[#2f2f2f] dark:bg-[#2c2c2c]">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Confirm Deletion</h3>
        <p class="py-4 text-sm text-gray-600 dark:text-gray-300">
          Are you sure you want to delete <strong>${escapeHtml(student.name)}</strong>? This action cannot be undone.
        </p>
        <div class="modal-action">
          <button class="btn btn-ghost btn-sm rounded-lg text-sm cancel-btn">Cancel</button>
          <button class="btn btn-error btn-sm rounded-lg text-sm confirm-btn">Delete</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.showModal();

    return new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        modal.close();
        modal.remove();
      };

      modal.querySelector('.cancel-btn')?.addEventListener('click', () => {
        cleanup();
        reject(new Error('Cancelled'));
      });

      modal.querySelector('.confirm-btn')?.addEventListener('click', async () => {
        cleanup();
        isDeleting.value = true;
        try {
          await deleteStudent(student.id);
          toast.success('Student deleted successfully!');
          queryClient.invalidateQueries({ queryKey: ['students'] });
          resolve();
        } catch {
          toast.error('Failed to delete student');
          reject(new Error('Delete failed'));
        } finally {
          isDeleting.value = false;
        }
      });

      modal.addEventListener('close', () => {
        modal.remove();
        reject(new Error('Cancelled'));
      });
    });
  };

  return { confirmAndDelete, isDeleting };
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

import { useLoading } from '@/hooks/useLoading';
import { client } from '@/utils';
import { registerSchema } from '@tutorhub/schema';
import { toast } from 'vue-sonner';

export function useRegisterData() {
  const router = useRouter();

  const data = reactive({
    name: '',
    email: '',
    phone: '',
    password: '',
    rePassword: '',
  });

  const verify = () => {
    const result = registerSchema.safeParse(data);
    if (!result.success) {
      for (const { message } of result.error.issues) {
        toast.warning(message);
      }
      return false;
    }
    if (!data.email.length && !data.phone.length) {
      toast.warning('Either email or phone number is required');
      return false;
    }
    if (data.password !== data.rePassword) {
      toast.warning('Passwords do not match');
      return false;
    }
    return true;
  };

  const { withLoading, isLoadingRef: isSubmitting } = useLoading();
  const submit = withLoading(async () => {
    if (!verify()) return;
    await client.auth.register!.$post({ json: data });
    toast.success('Registration successful!');
    router.push('/login');
  });

  return {
    data,
    verify,
    submit,
    isSubmitting,
  };
}

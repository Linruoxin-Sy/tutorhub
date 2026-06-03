import { useLoading } from '@/hooks/useLoading';
import { request } from '@/utils/request';
import { registerSchema, type RegisterResponse } from '@tutorhub/schema';
import { toast } from 'vue-sonner';

export function useRegisterData() {
  const router = useRouter();

  const loginData = reactive({
    name: '',
    email: '',
    phone: '',
    password: '',
    rePassword: '',
  });

  const verify = () => {
    const result = registerSchema.safeParse(loginData);
    if (!result.success) {
      for (const { message } of result.error.issues) {
        toast.warning(message);
      }
      return false;
    }
    if (!loginData.email.length && !loginData.phone.length) {
      toast.warning('Either email or phone number is required');
      return false;
    }
    if (loginData.password !== loginData.rePassword) {
      toast.warning('Passwords do not match');
      return false;
    }
    return true;
  };

  const { withLoading, isLoadingRef: isSubmitting } = useLoading();
  const submit = withLoading(async () => {
    if (!verify()) return;
    await request.post<RegisterResponse>('/auth/register', loginData);
    toast.success('Registration successful!');
    router.push('/login');
  });

  return {
    data: loginData,
    verify,
    submit,
    isSubmitting,
  };
}

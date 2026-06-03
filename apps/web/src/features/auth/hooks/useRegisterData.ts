import { useLoading } from '@/hooks/useLoading';
import { request } from '@/utils/request';
import { registerSchema, type RegisterResponse } from '@tutorhub/schema';
import { toast } from 'vue-sonner';

export function useRegisterData() {
  const router = useRouter();

  const registerData = reactive({
    name: '',
    email: '',
    phone: '',
    password: '',
    rePassword: '',
  });

  const verify = () => {
    const result = registerSchema.safeParse(registerData);
    if (!result.success) {
      for (const { message } of result.error.issues) {
        toast.warning(message);
      }
      return false;
    }
    if (!registerData.email.length && !registerData.phone.length) {
      toast.warning('Either email or phone number is required');
      return false;
    }
    if (registerData.password !== registerData.rePassword) {
      toast.warning('Passwords do not match');
      return false;
    }
    return true;
  };

  const { withLoading, isLoadingRef: isSubmitting } = useLoading();
  const submit = withLoading(async () => {
    if (!verify()) return;
    await request.post<RegisterResponse>('/auth/register', registerData);
    toast.success('Registration successful!');
    router.push('/login');
  });

  return {
    data: registerData,
    verify,
    submit,
    isSubmitting,
  };
}

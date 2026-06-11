import { toast } from 'vue-sonner';
import { z } from 'zod';

import { emailLoginSchema, loginSchema, phoneLoginSchema } from '@tutorhub/schema';

import { useUserStore } from '@/features/auth/stores/user';
import { useLoading } from '@/hooks/useLoading';

export function useLoginData() {
  const router = useRouter();
  const userStore = useUserStore();

  const loginData = reactive({
    identifier: '',
    password: '',
  });

  const isEmail = () => loginData.identifier.includes('@');

  const loginPayload = (): z.infer<typeof loginSchema> =>
    isEmail()
      ? { email: loginData.identifier, password: loginData.password }
      : { phone: loginData.identifier, password: loginData.password };

  const verify = () => {
    const schema = isEmail() ? emailLoginSchema : phoneLoginSchema;
    const result = schema.safeParse(loginPayload());
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
    await userStore.login(loginPayload());
    toast.success('Login successful!');
    router.push('/');
  });

  return {
    data: loginData,
    submit,
    isSubmitting,
  };
}

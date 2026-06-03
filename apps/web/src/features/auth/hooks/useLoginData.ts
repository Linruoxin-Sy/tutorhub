import { client } from '@/utils';
import { loginSchema } from '@tutorhub/schema';
import { toast } from 'vue-sonner';

export function useLoginData() {
  const router = useRouter();

  const data = reactive({
    identifier: '',
    password: '',
  });

  const verify = () => {
    const result = loginSchema.safeParse(data);
    if (!result.success) {
      for (const { message } of result.error.issues) {
        toast.warning(message);
      }
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!verify()) return;
    const res = await client.auth.login!.$post({ json: data });
    if (res.ok) {
      toast.success('Login successful!');
      router.push('/');
      const user = await res.json();
      return user;
    }
  };

  return {
    data,
    verify,
    submit,
  };
}

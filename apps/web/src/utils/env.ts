type envs = ['BASE_URL'];

type EnvKey = envs[number];

export function getEnv(key: EnvKey): string {
  return import.meta.env[`VITE_${key}`] ?? '';
}

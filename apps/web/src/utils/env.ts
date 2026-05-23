type envs = ['ASSETS_URL'];

type EnvKey = envs[number];

export function getEnv(key: EnvKey): string {
  return import.meta.env[`VITE_${key}`] ?? '';
}

const envs = ['ASSETS_URL'] as const;

type EnvKey = (typeof envs)[number];

export function getEnv(key: EnvKey): string {
  return import.meta.env[`VITE_${key}`] ?? '';
}

// We don't use import.meta.env for environment variables when building the app, but instead load them dynamically.
// This allows for more flexible use of a Dockerfile for multiple environments.
declare global {
  interface Window {
    __ENV_CONFIG__: {
      VITE_ENABLE_EXTRA_ENTRIES: boolean;
      VITE_ENABLE_KOMPASSI_INTEGRATION: boolean;
      VITE_ENTRA_CLIENT_ID: string;
      VITE_ENTRA_REDIRECT_URI: string;
      VITE_ENTRA_TENANT_ID: string;
    };
  }
}

type EnvConfig = Window['__ENV_CONFIG__'];

export const ENV_VARS = {
  VITE_ENABLE_EXTRA_ENTRIES: 'VITE_ENABLE_EXTRA_ENTRIES',
  VITE_ENABLE_KOMPASSI_INTEGRATION: 'VITE_ENABLE_KOMPASSI_INTEGRATION',
  VITE_ENTRA_CLIENT_ID: 'VITE_ENTRA_CLIENT_ID',
  VITE_ENTRA_REDIRECT_URI: 'VITE_ENTRA_REDIRECT_URI',
  VITE_ENTRA_TENANT_ID: 'VITE_ENTRA_TENANT_ID',
} as const satisfies Record<keyof EnvConfig, keyof EnvConfig>;

export function getEnvConfig<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
  return (window.__ENV_CONFIG__?.[key] ?? import.meta.env[key]) as EnvConfig[K];
}

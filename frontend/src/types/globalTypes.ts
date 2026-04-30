export {};

// We don't use import.meta.env for environment variables when building the app, but instead load them dynamically.
// This allows for more flexible use of a Dockerfile for multiple environments.
declare global {
  interface Window {
    __ENV_CONFIG__: {
      VITE_API_URL: string;
      VITE_USE_ALT_ERR_MSG: boolean;
    };
  }
}

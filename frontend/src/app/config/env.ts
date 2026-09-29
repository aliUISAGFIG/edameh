export const apiBase = (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(
  /\/$/,
  '',
);
// A production build defaults to real HTTP. Mock demos can explicitly opt in.
export const useMockApi =
  import.meta.env.VITE_USE_MOCK_API === 'true' ||
  (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API !== 'false');

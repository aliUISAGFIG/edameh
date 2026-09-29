import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
export function renderPage(element: ReactNode, initialPath = '/', extra: RouteObject[] = []) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  const router = createMemoryRouter([{ path: '/', element }, ...extra], {
    initialEntries: [initialPath],
  });
  return {
    ...render(
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    ),
    client,
    router,
  };
}

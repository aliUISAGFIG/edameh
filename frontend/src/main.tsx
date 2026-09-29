import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { Providers } from './app/providers/Providers';
import { router } from './app/router/router';
import { useMockApi } from './app/config/env';
import './styles/index.css';

async function start() {
  if (useMockApi) {
    const { worker } = await import('./mocks/browser');
    await worker.start({ quiet: true });
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </StrictMode>,
  );
}
start().catch(() => {
  const root = document.getElementById('root');
  if (root)
    root.textContent = 'Die Anwendung konnte nicht gestartet werden. Bitte lade die Seite erneut.';
});

import { apiBase } from '@/app/config/env';
import type { ApiFehler } from '@/types/api';
export class ApiError extends Error {
  constructor(public readonly details: ApiFehler) {
    super(details.message);
  }
  get status() {
    return this.details.status;
  }
}
let csrfToken: string | undefined;
export const resetCsrf = () => {
  csrfToken = undefined;
};
async function response(path: string, init: RequestInit = {}) {
  const method = init.method ?? 'GET';
  const headers = new Headers(init.headers);
  if (init.body) headers.set('Content-Type', 'application/json');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    if (!csrfToken) csrfToken = (await json<{ token: string }>('/api/csrf')).token;
    headers.set('X-XSRF-TOKEN', csrfToken);
  }
  let result: Response;
  try {
    result = await fetch(`${apiBase}${path}`, { ...init, headers, credentials: 'include' });
  } catch {
    throw new Error('Keine Verbindung zum Server. Bitte erneut versuchen.');
  }
  if (!result.ok) {
    const body: unknown = await result.json().catch(() => null);
    const details =
      body && typeof body === 'object' && 'message' in body
        ? (body as ApiFehler)
        : {
            timestamp: new Date().toISOString(),
            status: result.status,
            code: 'HTTP_ERROR',
            message: 'Die Anfrage konnte nicht verarbeitet werden.',
            path,
            fieldErrors: {},
          };
    if (result.status === 401 && !['/api/benutzer/ich', '/api/anmeldung'].includes(path))
      window.dispatchEvent(new Event('edameh:session-expired'));
    throw new ApiError(details);
  }
  return result;
}
export async function json<T>(path: string, init?: RequestInit): Promise<T> {
  return (await response(path, init)).json() as Promise<T>;
}
// Some successful responses have no specified body in the contract. Never invent one.
export async function empty(path: string, init?: RequestInit): Promise<void> {
  await response(path, init);
}
export const body = (method: string, value?: unknown): RequestInit => ({
  method,
  ...(value === undefined ? {} : { body: JSON.stringify(value) }),
});

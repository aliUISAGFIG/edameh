import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
export const arbeitsweisen = { REMOTE: 'Remote', VOR_ORT: 'Vor Ort', HYBRID: 'Hybrid' };
export const anzeigentypen = {
  UNTERSTUETZUNG_GESUCHT: 'Suche Unterstützung',
  PROJEKT_GESUCHT: 'Suche ein Projekt',
};
export const projektstaende = {
  IDEE_PLANUNG: 'Idee / Planung',
  IN_ENTWICKLUNG: 'In Entwicklung',
  PROTOTYP_VORHANDEN: 'Prototyp vorhanden',
};
const kategorien: Record<string, string> = {
  BACKEND: 'Backend',
  FRONTEND: 'Frontend',
  FULL_STACK: 'Full Stack',
  MOBILE: 'Mobile',
  DEVOPS: 'DevOps',
  UI_UX: 'UI / UX',
  SONSTIGES: 'Sonstiges',
};
export const kategorieName = (name: string) => kategorien[name] ?? name;
export const datum = (value: string, pattern = 'dd. MMM yyyy') =>
  format(parseISO(value), pattern, { locale: de });
export function safeLink(value: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
export function safeReturn(value: string | null) {
  return value?.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\') &&
    !/^\/(anmelden|registrieren)/.test(value)
    ? value
    : '/anzeigen';
}

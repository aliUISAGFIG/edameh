import { body, empty, json, resetCsrf, ApiError } from './client';
import type {
  Anmeldung,
  Registrierung,
  Benutzer,
  Profil,
  EigenesProfil,
  ProfilEingabe,
  Anzeige,
  AnzeigeListe,
  OeffentlicheAnzeige,
  AnzeigeEingabe,
  Seite,
  Katalogeintrag,
  UnterhaltungVorschau,
  Nachricht,
} from '@/types/api';
export const api = {
  me: async () => {
    try {
      return await json<Benutzer>('/api/benutzer/ich');
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return null;
      throw e;
    }
  },
  login: async (data: Anmeldung) => {
    const user = await json<Benutzer>('/api/anmeldung', body('POST', data));
    resetCsrf();
    return user;
  },
  register: async (data: Registrierung) => {
    const user = await json<Benutzer>('/api/registrierung', body('POST', data));
    resetCsrf();
    return user;
  },
  logout: async () => {
    await empty('/api/abmeldung', body('POST'));
    resetCsrf();
  },
  profile: () => json<EigenesProfil>('/api/profile/ich'),
  publicProfile: (id: number) => json<Profil>(`/api/profile/${id}`),
  updateProfile: (data: ProfilEingabe) => empty('/api/profile/ich', body('PUT', data)),
  categories: () => json<Katalogeintrag[]>('/api/kategorien'),
  technologies: () => json<Katalogeintrag[]>('/api/technologien'),
  anzeigen: (query: string) => json<Seite<OeffentlicheAnzeige>>(`/api/anzeigen?${query}`),
  meine: (query: string) => json<Seite<AnzeigeListe>>(`/api/anzeigen/meine?${query}`),
  anzeige: (id: number) => json<Anzeige>(`/api/anzeigen/${id}`),
  createAnzeige: (data: AnzeigeEingabe) =>
    json<{ id: number }>('/api/anzeigen', body('POST', data)),
  updateAnzeige: (id: number, data: AnzeigeEingabe) =>
    empty(`/api/anzeigen/${id}`, body('PUT', data)),
  closeAnzeige: (id: number) => empty(`/api/anzeigen/${id}/schliessen`, body('POST')),
  deleteAnzeige: (id: number) => empty(`/api/anzeigen/${id}`, body('DELETE')),
  conversations: () => json<UnterhaltungVorschau[]>('/api/unterhaltungen'),
  conversationAccess: (id: number) => empty(`/api/unterhaltungen/${id}`),
  startConversation: (id: number) =>
    json<{ id: number; anzeigeId: number }>(`/api/anzeigen/${id}/unterhaltungen`, body('POST')),
  messages: (id: number, page: number) =>
    json<Seite<Nachricht>>(`/api/unterhaltungen/${id}/nachrichten?page=${page}&size=50`),
  sendMessage: (id: number, inhalt: string) =>
    empty(`/api/unterhaltungen/${id}/nachrichten`, body('POST', { inhalt })),
  readMessages: (id: number) => empty(`/api/unterhaltungen/${id}/gelesen`, body('PATCH')),
};

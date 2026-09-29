import { describe, it, expect } from 'vitest';
import { api } from '@/api/endpoints';
import { apiBase } from '@/app/config/env';
import { db } from '@/mocks/data';
describe('Vertragsregeln der Mock API', () => {
  it('verbirgt eigene, geschlossene und gelöschte Anzeigen öffentlich', async () => {
    db.sessionId = 1;
    const list = await api.anzeigen('size=50');
    expect(list.content.every((a) => ![1, 5, 9, 99].includes(a.id))).toBe(true);
    expect((await api.meine('')).content.map((a) => a.id)).toContain(9);
    await expect(api.anzeige(99)).rejects.toMatchObject({ status: 404 });
  });
  it('erlaubt geschlossene Details nur Beteiligten und verweigert immer neue Starts', async () => {
    db.sessionId = 3;
    expect((await api.anzeige(9)).id).toBe(9);
    await expect(api.startConversation(9)).rejects.toMatchObject({ status: 409 });
    await expect(api.startConversation(99)).rejects.toMatchObject({ status: 409 });
    db.sessionId = 4;
    await expect(api.anzeige(9)).rejects.toMatchObject({ status: 403 });
    await expect(api.messages(1, 0)).rejects.toMatchObject({ status: 403 });
  });
  it('verweigert eigene Anfragen und verwendet bestehende aktive Unterhaltungen wieder', async () => {
    db.sessionId = 1;
    await expect(api.startConversation(1)).rejects.toMatchObject({ status: 409 });
    db.sessionId = 2;
    const one = await api.startConversation(1),
      two = await api.startConversation(1);
    expect(one).toEqual(two);
    expect(db.conversations).toHaveLength(3);
  });
  it('schützt Änderungen mit CSRF und gibt öffentliche Profile ohne E-Mail aus', async () => {
    db.sessionId = 1;
    const denied = await fetch(`${apiBase}/api/anzeigen/1`, { method: 'DELETE' });
    expect(denied.status).toBe(403);
    expect(await api.publicProfile(1)).not.toHaveProperty('eMail');
  });
  it('hält Anzeigename, Session und Profil nach Bearbeitung konsistent', async () => {
    db.sessionId = 1;
    await api.updateProfile({
      anzeigename: 'Lena Beispiel',
      ueberMich: null,
      standort: null,
      arbeitsweise: null,
      githubLink: null,
      linkedinLink: null,
      technologieIds: [],
    });
    expect((await api.me())?.anzeigename).toBe('Lena Beispiel');
    expect((await api.anzeige(1)).eigentuemer.anzeigename).toBe('Lena Beispiel');
  });
});

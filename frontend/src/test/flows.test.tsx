import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderPage } from './render';
import { LoginForm, RegisterForm } from '@/features/auth/AuthPage';
import { DiscoverPage } from '@/features/anzeigen/DiscoverPage';
import { DetailPage } from '@/features/anzeigen/DetailPage';
import { Protected } from '@/features/auth/Protected';
import { Conversation } from '@/features/unterhaltungen/Conversation';
import { db, demoPassword } from '@/mocks/data';
import { api } from '@/api/endpoints';

describe('Authentifizierung', () => {
  it('validiert die Registrierung und erstellt bei Erfolg ein leeres Profil mit Session', async () => {
    const user = userEvent.setup();
    renderPage(<RegisterForm />, '/', [
      { path: '/anzeigen', element: <p>Registrierung erfolgreich</p> },
    ]);
    await user.type(screen.getByLabelText('Anzeigename'), 'Jo');
    await user.type(screen.getByLabelText('E-Mail'), 'neu@example.com');
    await user.type(screen.getByLabelText('Passwort', { exact: true }), 'Passwort123');
    await user.type(screen.getByLabelText('Passwort bestätigen'), 'Anders123');
    await user.click(screen.getByRole('button', { name: 'Registrieren' }));
    expect(await screen.findByText('Anzeigename: mindestens 3 Zeichen.')).toBeVisible();
    expect(screen.getByText('Die Passwörter stimmen nicht überein.')).toBeVisible();
    expect(db.sessionId).toBeNull();
    await user.clear(screen.getByLabelText('Anzeigename'));
    await user.type(screen.getByLabelText('Anzeigename'), 'Johanna');
    await user.clear(screen.getByLabelText('Passwort bestätigen'));
    await user.type(screen.getByLabelText('Passwort bestätigen'), 'Passwort123');
    await user.click(screen.getByRole('button', { name: 'Registrieren' }));
    expect(await screen.findByText('Registrierung erfolgreich')).toBeVisible();
    expect((await api.profile()).technologien).toEqual([]);
  });
  it('zeigt falsche Zugangsdaten und kehrt nach Anmeldung zum Ziel zurück', async () => {
    const user = userEvent.setup();
    renderPage(<LoginForm />, '/?weiter=%2Fziel', [{ path: '/ziel', element: <p>Zielanzeige</p> }]);
    await user.type(screen.getByLabelText('E-Mail'), 'lena@example.com');
    await user.type(screen.getByLabelText('Passwort'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Anmelden' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'E-Mail oder Passwort ist nicht korrekt.',
    );
    await user.clear(screen.getByLabelText('Passwort'));
    await user.type(screen.getByLabelText('Passwort'), demoPassword);
    await user.click(screen.getByRole('button', { name: 'Anmelden' }));
    expect(await screen.findByText('Zielanzeige')).toBeVisible();
    expect(db.sessionId).toBe(1);
  });
  it('leitet Gäste von geschützten Seiten zur Anmeldung weiter', async () => {
    const result = renderPage(<Protected />, '/', [
      { path: '/anmelden', element: <p>Bitte anmelden</p> },
    ]);
    expect(await screen.findByText('Bitte anmelden')).toBeVisible();
    expect(result.router.state.location.search).toContain('weiter=');
  });
});
describe('Anzeigen', () => {
  it('wendet Suche und Technologie-AND-Filter über HTTP an', async () => {
    const user = userEvent.setup();
    renderPage(<DiscoverPage />);
    expect(
      await screen.findByRole('heading', { name: 'Gemeinsam eine Lernplattform weiterbauen' }),
    ).toBeVisible();
    await user.click(screen.getByRole('checkbox', { name: 'React' }));
    await user.click(screen.getByRole('checkbox', { name: 'Spring Boot' }));
    await waitFor(() => expect(screen.getByText('2 passende Anzeigen')).toBeVisible());
    expect(
      screen.queryByRole('heading', { name: 'Open Source für eine grünere Stadt' }),
    ).not.toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Anzeigen suchen' }), 'nirgendwo');
    expect(await screen.findByText('Keine passenden Anzeigen gefunden')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Filter zurücksetzen' }));
    expect(
      await screen.findByRole('heading', { name: 'Gemeinsam eine Lernplattform weiterbauen' }),
    ).toBeVisible();
  });
  it('zeigt Eigentümeraktionen statt Kontakt und bestätigt Schließen', async () => {
    db.sessionId = 1;
    const user = userEvent.setup();
    renderPage(<p />, '/anzeigen/1', [{ path: '/anzeigen/:id', element: <DetailPage /> }]);
    expect(await screen.findByRole('heading', { name: 'Deine Anzeige' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Nachricht senden' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Schließen' }));
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(db.ads[0]!.data.status).toBe('ACTIVE');
    await user.click(screen.getByRole('button', { name: 'Anzeige schließen' }));
    await waitFor(() => expect(db.ads[0]!.data.status).toBe('CLOSED'));
    expect(await screen.findByText('Geschlossen')).toBeVisible();
  });
});
describe('Nachrichten', () => {
  it('sendet Text über die API und markiert nur fremde Nachrichten als gelesen', async () => {
    db.sessionId = 1;
    const user = userEvent.setup();
    const preview = (await api.conversations())[0]!;
    renderPage(<Conversation id={1} preview={preview} />);
    expect(
      await screen.findByText(
        'Das passt gut. Gibt es schon erste Entwürfe, die ich mir anschauen kann?',
      ),
    ).toBeInTheDocument();
    await waitFor(() => expect(db.conversations[0]!.nachrichten[2]!.gelesen).toBe(true));
    await user.type(
      screen.getByLabelText('Nachricht', { exact: true }),
      'Ja, ich schicke dir gleich die Entwürfe.',
    );
    await user.click(screen.getByRole('button', { name: 'Senden' }));
    expect(await screen.findByText('Ja, ich schicke dir gleich die Entwürfe.')).toBeInTheDocument();
    const last = db.conversations[0]!.nachrichten.at(-1)!;
    expect(last.absender.id).toBe(1);
    expect(last.gelesen).toBe(false);
    expect(screen.getByLabelText('Nachricht', { exact: true })).toHaveValue('');
  });
});

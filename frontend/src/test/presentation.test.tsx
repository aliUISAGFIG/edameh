import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, Input } from '@/components/shared/common';
import { Dialog } from '@/components/ui/dialog';
import { DiscoverPage } from '@/features/anzeigen/DiscoverPage';
import { InboxPage } from '@/features/unterhaltungen/InboxPage';
import { db } from '@/mocks/data';
import { renderPage } from './render';

describe('Zugängliche Darstellung', () => {
  it('verknüpft Feldhinweise und Fehler mit dem Eingabefeld', () => {
    const view = (error?: string) => (
      <Field id="titel" label="Titel" hint="5–120 Zeichen." error={error}>
        <Input id="titel" />
      </Field>
    );
    const { rerender } = render(view());
    const input = screen.getByRole('textbox', { name: 'Titel' });
    expect(input).toHaveAccessibleDescription('5–120 Zeichen.');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    rerender(view('Bitte einen längeren Titel eingeben.'));
    expect(input).toHaveAccessibleDescription('Bitte einen längeren Titel eingeben.');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    rerender(view());
    expect(input).toHaveAccessibleDescription('5–120 Zeichen.');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('gibt nach Escape den Fokus an den Dialogauslöser zurück', async () => {
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Filter öffnen</button>
          <Dialog sheet open={open} onOpenChange={setOpen} title="Filter">
            <input aria-label="Standort" />
          </Dialog>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Filter öffnen' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('zeigt auf der Anzeigenroute die Suche ohne Startseiten-Hero', async () => {
    renderPage(<p />, '/anzeigen', [{ path: '/anzeigen', element: <DiscoverPage /> }]);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Anzeigen entdecken' }),
    ).toBeVisible();
    expect(screen.queryByText('Gute Ideen verdienen')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Anzeigen suchen' })).toBeVisible();
  });

  it('aktualisiert beim manuellen Neuladen auch das geöffnete Gespräch', async () => {
    db.sessionId = 1;
    db.conversations[0]!.nachrichten.forEach((message) => {
      message.gelesen = true;
    });
    const user = userEvent.setup();
    renderPage(<p />, '/nachrichten/1', [{ path: '/nachrichten/:id', element: <InboxPage /> }]);
    const history = await screen.findByRole('region', { name: 'Nachrichtenverlauf' });
    const conversation = db.conversations[0]!;
    const last = conversation.nachrichten.at(-1)!;
    conversation.nachrichten.push({
      ...last,
      id: 9999,
      inhalt: 'Eine neu eingetroffene Antwort.',
      gelesen: true,
    });
    await user.click(screen.getByRole('button', { name: 'Aktualisieren' }));
    expect(await within(history).findByText('Eine neu eingetroffene Antwort.')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Zurück zum Postfach' })).toHaveAttribute(
      'href',
      '/nachrichten',
    );
  });
});

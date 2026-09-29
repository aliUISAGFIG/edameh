import { describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderPage } from './render';
import { AnzeigeFormPage } from '@/features/anzeigen/AnzeigeFormPage';
import { AnzeigeCard } from '@/features/anzeigen/AnzeigeCard';
import { DetailPage } from '@/features/anzeigen/DetailPage';
import { anzeigeSchema } from '@/lib/validation';
import { arbeitsweisen as labels } from '@/lib/labels';
import { api } from '@/api/endpoints';
import { body, empty } from '@/api/client';
import { db } from '@/mocks/data';
import type { Arbeitsweise } from '@/types/api';

const valid = {
  titel: 'Gemeinsam ein Projekt entwickeln',
  beschreibung: 'Wir entwickeln eine barrierefreie Anwendung mit React.',
  anzeigentyp: 'UNTERSTUETZUNG_GESUCHT' as const,
  kategorieId: 1,
  projektstand: 'IDEE_PLANUNG' as const,
  arbeitsweisen: ['REMOTE'] as Arbeitsweise[],
  standort: '',
  projektlink: '',
  technologieIds: [1],
};
const combinations: Arbeitsweise[][] = [
  ['REMOTE'],
  ['VOR_ORT'],
  ['HYBRID'],
  ['REMOTE', 'VOR_ORT'],
  ['REMOTE', 'HYBRID'],
  ['VOR_ORT', 'HYBRID'],
  ['REMOTE', 'VOR_ORT', 'HYBRID'],
];

describe('Arbeitsweisen: Schema und HTTP', () => {
  it.each(combinations.map((values) => ({ values })))('akzeptiert $values', ({ values }) => {
    expect(
      anzeigeSchema.safeParse({ ...valid, arbeitsweisen: values, standort: 'Berlin' }).success,
    ).toBe(true);
  });
  it('akzeptiert ausschließlich Remote ohne Standort', () => {
    expect(anzeigeSchema.safeParse(valid).success).toBe(true);
  });
  it.each([
    { values: [], field: 'arbeitsweisen' },
    { values: ['REMOTE', 'REMOTE'], field: 'arbeitsweisen' },
    { values: ['UNBEKANNT'], field: 'arbeitsweisen' },
    { values: ['REMOTE', 'VOR_ORT'], field: 'standort' },
    { values: ['REMOTE', 'HYBRID'], field: 'standort' },
  ])('verweigert $values ohne Standort im Schema und bei POST/PUT', async ({ values, field }) => {
    db.sessionId = 1;
    const data = { ...valid, arbeitsweisen: values };
    const parsed = anzeigeSchema.safeParse(data);
    expect(parsed.success).toBe(false);
    if (!parsed.success)
      expect(parsed.error.issues.some((issue) => issue.path[0] === field)).toBe(true);
    const before = structuredClone(db.ads);
    for (const [path, method] of [
      ['/api/anzeigen', 'POST'],
      ['/api/anzeigen/1', 'PUT'],
    ] as const) {
      await expect(empty(path, body(method, data))).rejects.toMatchObject({ status: 400 });
    }
    expect(db.ads).toEqual(before);
  });
  it('filtert weiterhin mit einem einzelnen arbeitsweise-Parameter auf Array-Mitgliedschaft', async () => {
    const result = await api.anzeigen('arbeitsweise=REMOTE&size=50');
    expect(result.content.map((a) => a.id)).toEqual(expect.arrayContaining([1, 2, 3, 4]));
    expect(result.content.every((a) => a.arbeitsweisen.includes('REMOTE'))).toBe(true);
    expect(result.content.map((a) => a.id)).not.toContain(5);
    expect(result.content.every((a) => !('arbeitsweise' in a))).toBe(true);
    expect((await api.publicProfile(1)).arbeitsweise).toBe('REMOTE');
  });
});

async function createForm() {
  db.sessionId = 1;
  renderPage(<AnzeigeFormPage />, '/', [
    { path: '/anzeigen/:id', element: <p>Anzeige gespeichert</p> },
  ]);
  await screen.findByRole('option', { name: 'Backend' });
  fireEvent.change(screen.getByLabelText('Titel'), { target: { value: valid.titel } });
  fireEvent.change(screen.getByLabelText('Beschreibung'), {
    target: { value: valid.beschreibung },
  });
  fireEvent.change(screen.getByLabelText('Kategorie'), { target: { value: '1' } });
  fireEvent.click(await screen.findByRole('checkbox', { name: 'Java' }));
  return userEvent.setup();
}

describe('Arbeitsweisen: Formulare und Anzeige', () => {
  it.each(combinations.slice(3).map((values) => ({ values })))(
    'sendet $values als Array über das Erstellformular',
    async ({ values }) => {
      const user = await createForm();
      if (!values.includes('REMOTE'))
        await user.click(screen.getByRole('checkbox', { name: 'Remote' }));
      for (const value of values.filter((v) => v !== 'REMOTE'))
        await user.click(screen.getByRole('checkbox', { name: labels[value] }));
      fireEvent.change(screen.getByLabelText('Standort'), { target: { value: 'Berlin' } });
      await user.click(screen.getByRole('button', { name: 'Anzeige veröffentlichen' }));
      expect(await screen.findByText('Anzeige gespeichert')).toBeInTheDocument();
      const saved = db.ads.at(-1)!.data;
      expect(saved.arbeitsweisen).toEqual(values);
      expect(saved).not.toHaveProperty('arbeitsweise');
      expect((await api.anzeige(saved.id)).arbeitsweisen).toEqual(values);
      expect((await api.meine('')).content.find((a) => a.id === saved.id)?.arbeitsweisen).toEqual(
        values,
      );
    },
  );
  it('verhindert Absenden ohne Auswahl und verknüpft den Fehler mit Checkboxen', async () => {
    const user = await createForm();
    const before = db.ads.length;
    await user.click(screen.getByRole('checkbox', { name: 'Remote' }));
    await user.click(screen.getByRole('button', { name: 'Anzeige veröffentlichen' }));
    expect(await screen.findByText('Bitte wähle mindestens eine Arbeitsweise aus.')).toBeVisible();
    expect(screen.getByRole('checkbox', { name: 'Remote' })).toHaveAccessibleDescription(
      'Bitte wähle mindestens eine Arbeitsweise aus.',
    );
    expect(db.ads).toHaveLength(before);
  });
  it.each(['VOR_ORT', 'HYBRID'] as const)(
    'zeigt Standortfehler für %s und behält die Auswahl',
    async (value) => {
      const user = await createForm();
      await user.click(screen.getByRole('checkbox', { name: labels[value] }));
      await user.click(screen.getByRole('button', { name: 'Anzeige veröffentlichen' }));
      expect(await screen.findByText('Bitte gib einen Standort an.')).toBeVisible();
      expect(screen.getByRole('checkbox', { name: labels[value] })).toBeChecked();
    },
  );
  it('belegt mehrere Werte im Edit-Formular vor und speichert Änderungen', async () => {
    db.sessionId = 1;
    const user = userEvent.setup();
    renderPage(<p />, '/anzeigen/1/bearbeiten', [
      { path: '/anzeigen/:id/bearbeiten', element: <AnzeigeFormPage /> },
      { path: '/anzeigen/:id', element: <p>Änderung gespeichert</p> },
    ]);
    const remote = await screen.findByRole('checkbox', { name: 'Remote' });
    expect(remote).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Hybrid' })).toBeChecked();
    await user.click(screen.getByRole('checkbox', { name: 'Vor Ort' }));
    await user.click(screen.getByRole('button', { name: 'Änderungen speichern' }));
    expect(await screen.findByText('Änderung gespeichert')).toBeInTheDocument();
    expect((await api.anzeige(1)).arbeitsweisen).toEqual(['REMOTE', 'HYBRID', 'VOR_ORT']);
  });
  it('zeigt mehrere Arbeitsweisen auf Karten', async () => {
    const ad = (await api.anzeigen('size=50')).content.find((a) => a.id === 3)!;
    renderPage(<AnzeigeCard anzeige={ad} />);
    const badges = screen.getByLabelText('Arbeitsweisen');
    for (const label of Object.values(labels))
      expect(within(badges).getByText(label)).toBeVisible();
  });
  it('zeigt mehrere Arbeitsweisen in Details', async () => {
    renderPage(<p />, '/anzeigen/3', [{ path: '/anzeigen/:id', element: <DetailPage /> }]);
    expect(await screen.findByText('Remote, Vor Ort, Hybrid')).toBeVisible();
    for (const label of Object.values(labels))
      expect(screen.getByText(label, { exact: true })).toBeVisible();
  });
  it('öffnet Information per Hover, Tastaturfokus und Klick ohne die Auswahl zu ändern', async () => {
    const user = await createForm();
    const info = screen.getByRole('button', { name: 'Information zu Remote' });
    await user.hover(info);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Die Zusammenarbeit findet vollständig online statt.',
    );
    await user.unhover(info);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
    fireEvent.focus(info);
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    fireEvent.blur(info);
    await user.keyboard('{Escape}');
    await user.click(info);
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Remote' })).toBeChecked();
  });
});

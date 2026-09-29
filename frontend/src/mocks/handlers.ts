import { http, HttpResponse, delay, passthrough } from 'msw';
import { z } from 'zod';
import { apiBase } from '@/app/config/env';
import {
  anzeigeSchema,
  loginSchema,
  nachrichtSchema,
  profilSchema,
  registrationSchema,
} from '@/lib/validation';
import type { Anzeige, ApiFehler, Benutzer, Profil, Seite } from '@/types/api';
import { categories, db, technologies, type MockUnterhaltung } from './data';

const path = (suffix: string) => `${apiBase}/api${suffix}`;
const csrf = 'edameh-demo-csrf';
class Failure extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}
const fail = (status: number, code: string, message: string): never => {
  throw new Failure(status, code, message);
};
function current(): Benutzer {
  return (
    db.accounts.find((a) => a.user.id === db.sessionId)?.user ??
    fail(401, 'UNAUTHORIZED', 'Bitte melde dich an.')
  );
}
function ad(id: number) {
  return (
    db.ads.find((a) => a.data.id === id && !a.geloeschtAm) ??
    fail(404, 'NOT_FOUND', 'Diese Anzeige ist nicht verfügbar.')
  );
}
function ownAd(id: number) {
  const user = current();
  const a = ad(id);
  if (a.data.eigentuemer.id !== user.id)
    fail(403, 'FORBIDDEN', 'Nur der Eigentümer darf diese Anzeige ändern.');
  return a;
}
function conversation(id: number) {
  const user = current();
  const c =
    db.conversations.find((c) => c.id === id) ??
    fail(404, 'NOT_FOUND', 'Unterhaltung nicht gefunden.');
  if (![c.eigentuemerId, c.interessentId].includes(user.id))
    fail(403, 'FORBIDDEN', 'Du bist kein Teilnehmer dieser Unterhaltung.');
  return c;
}
function profile(id: number): Profil {
  const a =
    db.accounts.find((a) => a.user.id === id) ?? fail(404, 'NOT_FOUND', 'Profil nicht gefunden.');
  return { ...a.profil, anzeigename: a.user.anzeigename };
}
function ownProfile() {
  const user = current();
  const account = db.accounts.find((a) => a.user.id === user.id)!;
  return {
    ...profile(user.id),
    statistik: {
      aktiveAnzeigen: db.ads.filter(
        (a) => !a.geloeschtAm && a.data.eigentuemer.id === user.id && a.data.status === 'ACTIVE',
      ).length,
      unterhaltungen: db.conversations.filter((c) =>
        [c.eigentuemerId, c.interessentId].includes(user.id),
      ).length,
      mitgliedSeit: account.mitgliedSeit,
    },
  };
}
async function validated<T>(request: Request, schema: z.ZodType<T>) {
  const result = schema.safeParse(await request.json());
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) fields[String(issue.path[0])] = issue.message;
    throw new Failure(400, 'VALIDATION_ERROR', 'Bitte prüfe deine Angaben.', fields);
  }
  return result.data;
}
function catalogs(category: number | undefined, ids: number[]) {
  if (category !== undefined && !categories.some((c) => c.id === category))
    throw new Failure(400, 'VALIDATION_ERROR', 'Kategorie nicht gefunden.', {
      kategorieId: 'Bitte eine gültige Kategorie wählen.',
    });
  if (ids.some((id) => !technologies.some((t) => t.id === id)))
    throw new Failure(400, 'VALIDATION_ERROR', 'Technologie nicht gefunden.', {
      technologieIds: 'Bitte gültige Technologien wählen.',
    });
}
function paginated<T>(items: T[], query: URLSearchParams, defaultSize = 20, max = 50): Seite<T> {
  const page = Number(query.get('page') ?? 0),
    size = Number(query.get('size') ?? defaultSize);
  if (!Number.isInteger(page) || page < 0 || !Number.isInteger(size) || size < 1 || size > max)
    fail(400, 'VALIDATION_ERROR', 'Ungültige Seitenauswahl.');
  return {
    content: items.slice(page * size, (page + 1) * size),
    page,
    size,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / size),
  };
}
const publicPerson = (id: number) => {
  const u = db.accounts.find((a) => a.user.id === id)!.user;
  return { id: u.id, anzeigename: u.anzeigename };
};
function details(a: Anzeige) {
  return { ...a, eigentuemer: publicPerson(a.eigentuemer.id) };
}
function listItem(a: Anzeige) {
  return {
    id: a.id,
    titel: a.titel,
    beschreibungKurz: a.beschreibung.slice(0, 155),
    kategorie: a.kategorie,
    technologien: a.technologien,
    projektstand: a.projektstand,
    arbeitsweisen: a.arbeitsweisen,
    standort: a.standort,
    status: a.status,
    erstelltAm: a.erstelltAm,
  };
}
function preview(c: MockUnterhaltung) {
  const last = c.nachrichten.at(-1)!;
  return {
    id: c.id,
    anzeige: { id: c.anzeigeId, titel: db.ads.find((a) => a.data.id === c.anzeigeId)!.data.titel },
    anderePerson: publicPerson(
      c.eigentuemerId === db.sessionId ? c.interessentId : c.eigentuemerId,
    ),
    letzteNachricht: { inhalt: last.inhalt, gesendetAm: last.gesendetAm },
    ungeleseneNachrichten: c.nachrichten.filter((m) => m.absender.id !== db.sessionId && !m.gelesen)
      .length,
  };
}
type Action = (
  request: Request,
  params: Record<string, string | readonly string[] | undefined>,
) => Response | Promise<Response>;
function handler(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  suffix: string,
  action: Action,
) {
  return http[method](path(suffix), async ({ request, params }) => {
    try {
      if (import.meta.env.MODE !== 'test') await delay(db.slow ? 1800 : 240);
      if (db.failNext && suffix !== '/csrf') {
        db.failNext = false;
        fail(
          409,
          'CONFLICT',
          'Die Anfrage konnte nicht abgeschlossen werden. Bitte versuche es erneut.',
        );
      }
      if (method !== 'get' && request.headers.get('X-XSRF-TOKEN') !== csrf)
        fail(
          403,
          'FORBIDDEN',
          'Die Sicherheitsprüfung ist fehlgeschlagen. Bitte lade die Seite neu.',
        );
      return await action(request, params);
    } catch (e) {
      if (e instanceof Failure) {
        const error: ApiFehler = {
          timestamp: new Date().toISOString(),
          status: e.status,
          code: e.code,
          message: e.message,
          path: new URL(request.url).pathname,
          fieldErrors: e.fields,
        };
        return HttpResponse.json(error, { status: e.status });
      }
      throw e;
    }
  });
}
// Normalize nullable DTO fields to empty form values before using the same UX constraints.
const adRequest = z.preprocess((value) => {
  const v = value as Record<string, unknown>;
  return { ...v, standort: v?.standort ?? '', projektlink: v?.projektlink ?? '' };
}, anzeigeSchema);
const profileRequest = z.preprocess((value) => {
  const v = value as Record<string, unknown>;
  return {
    ...v,
    ueberMich: v?.ueberMich ?? '',
    standort: v?.standort ?? '',
    arbeitsweise: v?.arbeitsweise ?? '',
    githubLink: v?.githubLink ?? '',
    linkedinLink: v?.linkedinLink ?? '',
  };
}, profilSchema);
export const handlers = [
  handler('get', '/csrf', () =>
    HttpResponse.json(
      { token: csrf },
      { headers: { 'Set-Cookie': `XSRF-TOKEN=${csrf}; Path=/; SameSite=Lax` } },
    ),
  ),
  handler('get', '/benutzer/ich', () => HttpResponse.json(current())),
  handler('post', '/anmeldung', async (request) => {
    const data = await validated(request, loginSchema);
    const a = db.accounts.find((a) => a.user.eMail === data.eMail && a.passwort === data.passwort);
    if (!a) fail(401, 'INVALID_CREDENTIALS', 'E-Mail oder Passwort ist nicht korrekt.');
    db.sessionId = a!.user.id;
    return HttpResponse.json(a!.user);
  }),
  handler('post', '/registrierung', async (request) => {
    const data = await validated(request, registrationSchema);
    if (db.accounts.some((a) => a.user.eMail.toLowerCase() === data.eMail.toLowerCase()))
      throw new Failure(
        409,
        'EMAIL_ALREADY_EXISTS',
        'Diese E-Mail-Adresse ist bereits registriert.',
        { eMail: 'Diese E-Mail-Adresse ist bereits registriert.' },
      );
    const user = { id: db.nextId++, eMail: data.eMail, anzeigename: data.anzeigename };
    db.accounts.push({
      user,
      passwort: data.passwort,
      mitgliedSeit: new Date().toISOString().slice(0, 10),
      profil: {
        benutzerId: user.id,
        anzeigename: user.anzeigename,
        ueberMich: null,
        standort: null,
        arbeitsweise: null,
        githubLink: null,
        linkedinLink: null,
        technologien: [],
      },
    });
    db.sessionId = user.id;
    return HttpResponse.json(user, { status: 201 });
  }),
  handler('post', '/abmeldung', () => {
    current();
    db.sessionId = null;
    return new HttpResponse(null, { status: 204 });
  }),
  handler('get', '/profile/ich', () => HttpResponse.json(ownProfile())),
  handler('put', '/profile/ich', async (request) => {
    const user = current();
    const data = await validated(request, profileRequest);
    catalogs(undefined, data.technologieIds);
    const a = db.accounts.find((a) => a.user.id === user.id)!;
    a.user.anzeigename = data.anzeigename;
    a.profil = {
      benutzerId: user.id,
      anzeigename: data.anzeigename,
      ueberMich: data.ueberMich || null,
      standort: data.standort || null,
      arbeitsweise: data.arbeitsweise || null,
      githubLink: data.githubLink || null,
      linkedinLink: data.linkedinLink || null,
      technologien: technologies.filter((t) => data.technologieIds.includes(t.id)),
    };
    return new HttpResponse(null, { status: 200 });
  }),
  handler('get', '/profile/:id', (_, p) => HttpResponse.json(profile(Number(p.id)))),
  handler('get', '/kategorien', () => HttpResponse.json(categories)),
  handler('get', '/technologien', (request) => {
    const term = new URL(request.url).searchParams.get('suchbegriff')?.toLowerCase() ?? '';
    return HttpResponse.json(technologies.filter((t) => t.name.toLowerCase().includes(term)));
  }),
  handler('get', '/anzeigen', (request) => {
    const q = new URL(request.url).searchParams;
    const tech = (q.get('technologieIds') ?? '').split(',').filter(Boolean).map(Number);
    const term = (q.get('suchbegriff') ?? '').toLowerCase();
    let rows = db.ads
      .filter(
        (a) =>
          !a.geloeschtAm && a.data.status === 'ACTIVE' && a.data.eigentuemer.id !== db.sessionId,
      )
      .map((a) => a.data);
    rows = rows.filter(
      (a) =>
        (!q.get('kategorieId') || a.kategorie.id === Number(q.get('kategorieId'))) &&
        (!q.get('arbeitsweise') ||
          a.arbeitsweisen.some((value) => value === q.get('arbeitsweise'))) &&
        (!q.get('standort') ||
          (a.standort ?? '').toLowerCase().includes(q.get('standort')!.toLowerCase())) &&
        `${a.titel} ${a.beschreibung}`.toLowerCase().includes(term) &&
        tech.every((id) => a.technologien.some((t) => t.id === id)),
    );
    rows.sort(
      (a, b) =>
        a.erstelltAm.localeCompare(b.erstelltAm) * (q.get('sort') === 'erstelltAm,asc' ? 1 : -1),
    );
    return HttpResponse.json(
      paginated(
        rows.map((a) => ({
          ...listItem(a),
          anzeigename: publicPerson(a.eigentuemer.id).anzeigename,
        })),
        q,
      ),
    );
  }),
  handler('get', '/anzeigen/meine', (request) => {
    const user = current();
    const q = new URL(request.url).searchParams;
    const rows = db.ads
      .filter(
        (a) =>
          !a.geloeschtAm &&
          a.data.eigentuemer.id === user.id &&
          (!q.get('status') || a.data.status === q.get('status')),
      )
      .map((a) => a.data)
      .sort(
        (a, b) =>
          a.erstelltAm.localeCompare(b.erstelltAm) * (q.get('sort') === 'erstelltAm,asc' ? 1 : -1),
      );
    return HttpResponse.json(paginated(rows.map(listItem), q));
  }),
  handler('get', '/anzeigen/:id', (_, p) => {
    const a = ad(Number(p.id));
    if (a.data.status === 'CLOSED') {
      const user = current();
      if (
        a.data.eigentuemer.id !== user.id &&
        !db.conversations.some(
          (c) => c.anzeigeId === a.data.id && [c.eigentuemerId, c.interessentId].includes(user.id),
        )
      )
        fail(403, 'FORBIDDEN', 'Diese geschlossene Anzeige ist nur für Beteiligte sichtbar.');
    }
    return HttpResponse.json(details(a.data));
  }),
  handler('post', '/anzeigen', async (request) => {
    const user = current();
    const data = await validated(request, adRequest);
    catalogs(data.kategorieId, data.technologieIds);
    const id = db.nextId++;
    db.ads.push({
      geloeschtAm: null,
      data: {
        id,
        titel: data.titel,
        beschreibung: data.beschreibung,
        anzeigentyp: data.anzeigentyp,
        projektstand: data.projektstand,
        arbeitsweisen: data.arbeitsweisen,
        standort: data.standort || null,
        projektlink: data.projektlink || null,
        kategorie: categories.find((c) => c.id === data.kategorieId)!,
        technologien: technologies.filter((t) => data.technologieIds.includes(t.id)),
        eigentuemer: publicPerson(user.id),
        status: 'ACTIVE',
        erstelltAm: new Date().toISOString(),
        aktualisiertAm: new Date().toISOString(),
      },
    });
    return HttpResponse.json({ id }, { status: 201 });
  }),
  handler('put', '/anzeigen/:id', async (request, p) => {
    const a = ownAd(Number(p.id));
    const data = await validated(request, adRequest);
    catalogs(data.kategorieId, data.technologieIds);
    a.data = {
      ...a.data,
      titel: data.titel,
      beschreibung: data.beschreibung,
      anzeigentyp: data.anzeigentyp,
      projektstand: data.projektstand,
      arbeitsweisen: data.arbeitsweisen,
      standort: data.standort || null,
      projektlink: data.projektlink || null,
      kategorie: categories.find((c) => c.id === data.kategorieId)!,
      technologien: technologies.filter((t) => data.technologieIds.includes(t.id)),
      aktualisiertAm: new Date().toISOString(),
    };
    return new HttpResponse(null, { status: 200 });
  }),
  handler('post', '/anzeigen/:id/schliessen', (_, p) => {
    ownAd(Number(p.id)).data.status = 'CLOSED';
    return new HttpResponse(null, { status: 204 });
  }),
  handler('delete', '/anzeigen/:id', (_, p) => {
    ownAd(Number(p.id)).geloeschtAm = new Date().toISOString();
    return new HttpResponse(null, { status: 204 });
  }),
  // New empty conversations are deliberately deferred pending a documented preview shape.
  handler('post', '/anzeigen/:id/unterhaltungen', (_, p) => {
    const user = current();
    const a =
      db.ads.find((a) => a.data.id === Number(p.id)) ??
      fail(404, 'NOT_FOUND', 'Anzeige nicht gefunden.');
    if (a.geloeschtAm || a.data.status === 'CLOSED')
      fail(409, 'ADVERTISEMENT_CLOSED', 'Diese Anzeige nimmt keine neuen Anfragen an.');
    if (a.data.eigentuemer.id === user.id)
      fail(409, 'CONFLICT', 'Du kannst dich nicht selbst kontaktieren.');
    const existing = db.conversations.find(
      (c) => c.anzeigeId === a.data.id && c.interessentId === user.id,
    );
    if (existing) return HttpResponse.json({ id: existing.id, anzeigeId: a.data.id });
    return passthrough();
  }),
  handler('get', '/unterhaltungen', () => {
    const user = current();
    return HttpResponse.json(
      db.conversations
        .filter((c) => [c.eigentuemerId, c.interessentId].includes(user.id))
        .map(preview),
    );
  }),
  handler('get', '/unterhaltungen/:id', (_, p) => {
    conversation(Number(p.id));
    return new HttpResponse(null, { status: 200 });
  }),
  handler('get', '/unterhaltungen/:id/nachrichten', (request, p) =>
    HttpResponse.json(
      paginated(
        conversation(Number(p.id)).nachrichten.map((m) => ({
          ...m,
          absender: publicPerson(m.absender.id),
        })),
        new URL(request.url).searchParams,
        50,
        100,
      ),
    ),
  ),
  handler('post', '/unterhaltungen/:id/nachrichten', async (request, p) => {
    const c = conversation(Number(p.id));
    const data = await validated(request, nachrichtSchema);
    c.nachrichten.push({
      id: db.nextId++,
      absender: publicPerson(current().id),
      inhalt: data.inhalt,
      gesendetAm: new Date().toISOString(),
      gelesen: false,
    });
    return new HttpResponse(null, { status: 201 });
  }),
  handler('patch', '/unterhaltungen/:id/gelesen', (_, p) => {
    const c = conversation(Number(p.id));
    c.nachrichten.forEach((m) => {
      if (m.absender.id !== db.sessionId) m.gelesen = true;
    });
    return new HttpResponse(null, { status: 204 });
  }),
];

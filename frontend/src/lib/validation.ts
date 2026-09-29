import { z } from 'zod';
const text = (min: number, max: number, name: string) =>
  z
    .string()
    .trim()
    .min(min, `${name}: mindestens ${min} Zeichen.`)
    .max(max, `${name}: höchstens ${max} Zeichen.`);
const email = z
  .email('Bitte eine gültige E-Mail-Adresse eingeben.')
  .max(254, 'Höchstens 254 Zeichen.');
const passwort = z.string().min(8, 'Mindestens 8 Zeichen.').max(100, 'Höchstens 100 Zeichen.');
const arbeitsweise = z.enum(['REMOTE', 'VOR_ORT', 'HYBRID'], {
  error: 'Bitte eine Arbeitsweise wählen.',
});
const optionalUrl = z.union([
  z.literal(''),
  z.url('Bitte eine gültige URL eingeben.').max(500, 'Höchstens 500 Zeichen.'),
]);
export const loginSchema = z.object({
  eMail: email,
  passwort: z.string().min(1, 'Bitte Passwort eingeben.'),
});
export const registrationSchema = z
  .object({
    eMail: email,
    anzeigename: text(3, 50, 'Anzeigename'),
    passwort,
    passwortBestaetigung: z.string(),
  })
  .refine((data) => data.passwort === data.passwortBestaetigung, {
    path: ['passwortBestaetigung'],
    message: 'Die Passwörter stimmen nicht überein.',
  });
export const anzeigeSchema = z
  .object({
    titel: text(5, 120, 'Titel'),
    beschreibung: text(20, 5000, 'Beschreibung'),
    anzeigentyp: z.enum(['UNTERSTUETZUNG_GESUCHT', 'PROJEKT_GESUCHT']),
    kategorieId: z.number().positive('Bitte eine Kategorie wählen.'),
    projektstand: z.enum(['IDEE_PLANUNG', 'IN_ENTWICKLUNG', 'PROTOTYP_VORHANDEN']),
    arbeitsweisen: z
      .array(arbeitsweise, { error: 'Bitte wähle mindestens eine Arbeitsweise aus.' })
      .min(1, 'Bitte wähle mindestens eine Arbeitsweise aus.')
      .refine(
        (values) => new Set(values).size === values.length,
        'Jede Arbeitsweise darf nur einmal ausgewählt werden.',
      ),
    standort: z.string().trim().max(120, 'Höchstens 120 Zeichen.'),
    projektlink: optionalUrl,
    technologieIds: z
      .array(z.number())
      .min(1, 'Bitte mindestens eine Technologie wählen.')
      .max(10, 'Höchstens 10 Technologien.'),
  })
  .refine(
    (data) =>
      !data.arbeitsweisen.some((value) => value === 'VOR_ORT' || value === 'HYBRID') ||
      data.standort.length > 0,
    {
      path: ['standort'],
      message: 'Bitte gib einen Standort an.',
    },
  );
export const profilSchema = z.object({
  anzeigename: text(3, 50, 'Anzeigename'),
  ueberMich: z.string().max(1000, 'Höchstens 1000 Zeichen.'),
  standort: z.string().max(120, 'Höchstens 120 Zeichen.'),
  arbeitsweise: z.union([arbeitsweise, z.literal('')]),
  githubLink: optionalUrl,
  linkedinLink: optionalUrl,
  technologieIds: z.array(z.number()).max(20, 'Höchstens 20 Technologien.'),
});
export const nachrichtSchema = z.object({ inhalt: text(1, 2000, 'Nachricht') });
export type AnzeigeForm = z.infer<typeof anzeigeSchema>;
export type ProfilForm = z.infer<typeof profilSchema>;

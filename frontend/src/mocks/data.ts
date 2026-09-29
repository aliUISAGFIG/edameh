import type { Anzeige, Benutzer, Nachricht, Profil } from '@/types/api';

export const demoPassword = 'EdamehDemo2026!'; // Public, fictional demo credential only.
export const categories = [
  'BACKEND',
  'FRONTEND',
  'FULL_STACK',
  'MOBILE',
  'DEVOPS',
  'UI_UX',
  'SONSTIGES',
].map((name, index) => ({ id: index + 1, name }));
export const technologies = [
  'Java',
  'Spring Boot',
  'PostgreSQL',
  'React',
  'TypeScript',
  'Docker',
  'Python',
  'Angular',
  'Vue',
  'Node.js',
  'Kotlin',
  'Flutter',
  'AWS',
  'Git',
  'Figma',
].map((name, index) => ({ id: index + 1, name }));
export const demoUsers: Benutzer[] = [
  { id: 1, anzeigename: 'Lena Hoffmann', eMail: 'lena@example.com' },
  { id: 2, anzeigename: 'Jonas Weber', eMail: 'jonas@example.com' },
  { id: 3, anzeigename: 'Mia Schneider', eMail: 'mia@example.com' },
  { id: 4, anzeigename: 'Noah Fischer', eMail: 'noah@example.com' },
  { id: 5, anzeigename: 'Clara Neumann', eMail: 'clara@example.com' },
];
export interface MockAccount {
  user: Benutzer;
  passwort: string;
  profil: Profil;
  mitgliedSeit: string;
}
export interface MockAnzeige {
  data: Anzeige;
  geloeschtAm: string | null;
}
export interface MockUnterhaltung {
  id: number;
  anzeigeId: number;
  eigentuemerId: number;
  interessentId: number;
  nachrichten: Nachricht[];
}
const ideas: [string, number, number[], string][] = [
  [
    'Gemeinsam eine Lernplattform weiterbauen',
    2,
    [4, 5, 2],
    'Das Backend steht. Jetzt fehlt ein zugängliches React-Frontend, das Lernen einfacher macht. Ich suche jemanden mit Freude an durchdachten Oberflächen und guten Ideen.',
  ],
  [
    'Open Source für eine grünere Stadt',
    3,
    [5, 10, 3],
    'Wir machen lokale Umweltinitiativen sichtbar. Für unsere offene Plattform suchen wir Unterstützung beim Datenmodell und bei der Umsetzung der Kartenansicht.',
  ],
  [
    'Java-Backend für ein gemeinsames Lernprojekt',
    1,
    [1, 2, 3],
    'Du möchtest Spring Boot an einem echten Projekt ausprobieren? Lass uns einen kleinen Projektplaner mit REST-API und PostgreSQL entwickeln und voneinander lernen.',
  ],
  [
    'Eine kleine App für große Wanderungen',
    4,
    [11, 12],
    'Ich baue ein digitales Wandertagebuch. Gesucht wird Unterstützung für eine verständliche Navigation und eine zuverlässige Offline-Nutzung.',
  ],
  [
    'Python-Kenntnisse suchen ein sinnvolles Projekt',
    1,
    [7, 3, 14],
    'Ich möchte meine Python-Erfahrung in ein gemeinsames Lernprojekt einbringen. Besonders interessieren mich offene Daten und kleine Werkzeuge für den Alltag.',
  ],
  [
    'Design trifft Code: barrierefreies UI-Kit',
    6,
    [4, 5, 15],
    'Ein UI-Kit, das wirklich für alle funktioniert. Ich suche jemanden, der Tastaturbedienung und klare Gestaltung genauso wichtig findet wie sauberen Code.',
  ],
  [
    'Deployments, die sich einfach anfühlen',
    5,
    [6, 13, 14],
    'Für unser Hobbyprojekt möchten wir eine nachvollziehbare Deployment-Pipeline aufbauen. Hast du Lust, Docker und automatisierte Checks gemeinsam einzurichten?',
  ],
  [
    'Vue-Dashboard für den eigenen Garten',
    2,
    [9, 5, 10],
    'Unsere Sensoren liefern bereits Daten. Hilf uns, daraus ein übersichtliches Dashboard zu machen und Bewässerung verständlich darzustellen.',
  ],
  [
    'Angular-Projekt zum gemeinsamen Lernen gesucht',
    2,
    [8, 5],
    'Ich suche ein kleines Team für ein Angular-Projekt. Ich bringe erste Praxiserfahrung mit und möchte gemeinsam gut strukturierte Komponenten entwickeln.',
  ],
  [
    'Bücher teilen in der Nachbarschaft',
    3,
    [4, 10, 3],
    'Wir möchten eine einfache Plattform zum Teilen von Büchern entwickeln. Das Konzept steht; für den ersten Prototyp suchen wir Menschen mit Backend-Erfahrung.',
  ],
  [
    'Flutter-App für kreative Routinen',
    4,
    [12, 14],
    'Eine kleine App für tägliche kreative Übungen. Gemeinsam möchten wir einen ersten Prototyp bauen und die Bedienung mit echten Nutzern testen.',
  ],
  [
    'Ein offener Projektplaner für Lerngruppen',
    3,
    [1, 2, 4, 5],
    'Aufgaben, Notizen und gemeinsame Ziele an einem Ort. Wir arbeiten in kleinen Schritten und freuen uns auf jemanden, der TypeScript oder Java mitbringt.',
  ],
];
function seed() {
  const accounts: MockAccount[] = demoUsers.map((user, i) => ({
    user: { ...user },
    passwort: demoPassword,
    mitgliedSeit: '2026-03-01',
    profil: {
      benutzerId: user.id,
      anzeigename: user.anzeigename,
      ueberMich:
        i === 4
          ? null
          : 'Ich entwickle gerne Dinge, die im Alltag helfen. Hier suche ich Menschen, mit denen ich Ideen ausprobieren, Wissen teilen und gemeinsam weiterbauen kann.',
      standort: i === 4 ? null : ['Berlin', 'Hamburg', 'Köln', 'Dortmund'][i]!,
      arbeitsweise: i === 4 ? null : 'REMOTE',
      githubLink: null,
      linkedinLink: null,
      technologien: i === 4 ? [] : technologies.filter((t) => [1, 2, 4, 5].includes(t.id)),
    },
  }));
  const ads: MockAnzeige[] = ideas.map(([titel, category, tech, beschreibung], i) => ({
    geloeschtAm: null,
    data: {
      id: i + 1,
      titel,
      beschreibung,
      kategorie: categories.find((c) => c.id === category)!,
      technologien: technologies.filter((t) => tech.includes(t.id)),
      eigentuemer: demoUsers[i % 4]!,
      anzeigentyp: [4, 8].includes(i) ? 'PROJEKT_GESUCHT' : 'UNTERSTUETZUNG_GESUCHT',
      projektstand:
        i % 3 === 0 ? 'PROTOTYP_VORHANDEN' : i % 3 === 1 ? 'IN_ENTWICKLUNG' : 'IDEE_PLANUNG',
      arbeitsweisen:
        i === 0
          ? ['REMOTE', 'HYBRID']
          : i === 1
            ? ['REMOTE', 'VOR_ORT']
            : i === 2
              ? ['REMOTE', 'VOR_ORT', 'HYBRID']
              : i % 3 === 0
                ? ['REMOTE']
                : i % 3 === 1
                  ? ['HYBRID']
                  : ['VOR_ORT'],
      standort: i > 2 && i % 3 === 0 ? null : ['Berlin', 'Hamburg', 'Köln'][i % 3]!,
      status: i === 8 ? 'CLOSED' : 'ACTIVE',
      projektlink: null,
      erstelltAm: `2026-09-${String(28 - i).padStart(2, '0')}T10:30:00`,
      aktualisiertAm: `2026-09-${String(28 - i).padStart(2, '0')}T10:30:00`,
    },
  }));
  ads.push({
    geloeschtAm: '2026-09-28T12:00:00',
    data: { ...ads[0]!.data, id: 99, titel: 'Archiviertes Projekt' },
  });
  const conversations: MockUnterhaltung[] = [
    {
      id: 1,
      anzeigeId: 1,
      eigentuemerId: 1,
      interessentId: 2,
      nachrichten: [
        {
          id: 1,
          absender: demoUsers[1]!,
          inhalt:
            'Hallo Lena! Deine Lernplattform klingt spannend. Ich arbeite mit React und würde gerne mithelfen.',
          gesendetAm: '2026-09-28T10:15:00',
          gelesen: true,
        },
        {
          id: 2,
          absender: demoUsers[0]!,
          inhalt:
            'Hallo Jonas, das freut mich! Das Backend steht bereits. Als Nächstes möchten wir die Kursübersicht gestalten.',
          gesendetAm: '2026-09-28T10:20:00',
          gelesen: true,
        },
        {
          id: 3,
          absender: demoUsers[1]!,
          inhalt: 'Das passt gut. Gibt es schon erste Entwürfe, die ich mir anschauen kann?',
          gesendetAm: '2026-09-28T10:24:00',
          gelesen: false,
        },
      ],
    },
    {
      id: 2,
      anzeigeId: 9,
      eigentuemerId: 1,
      interessentId: 3,
      nachrichten: [
        {
          id: 4,
          absender: demoUsers[2]!,
          inhalt:
            'Vielen Dank für den Austausch! Wir können hier weiter über die nächsten Schritte sprechen.',
          gesendetAm: '2026-09-27T16:00:00',
          gelesen: false,
        },
      ],
    },
    {
      id: 3,
      anzeigeId: 2,
      eigentuemerId: 2,
      interessentId: 1,
      nachrichten: [
        {
          id: 5,
          absender: demoUsers[1]!,
          inhalt: 'Hallo Lena, schön, dass du unser Stadtprojekt unterstützen möchtest.',
          gesendetAm: '2026-09-26T09:00:00',
          gelesen: true,
        },
      ],
    },
  ];
  return {
    accounts,
    ads,
    conversations,
    sessionId: null as number | null,
    nextId: 100,
    slow: false,
    failNext: false,
  };
}
export const db = seed();
export function resetDb() {
  Object.assign(db, seed());
}

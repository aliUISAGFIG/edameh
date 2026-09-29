# Edameh Frontend

Deutschsprachige React-SPA für die Zusammenarbeit an Softwareprojekten. Die Oberfläche nutzt derzeit MSW; fachliche Spring-Boot-Endpunkte sind noch nicht implementiert. Verbindliche API-Quelle: [API Contract](../docs/design/api-contract.md).

## Start

Voraussetzung: Node.js 24 oder neuer und npm.

```powershell
cd frontend
npm install
npm run dev
```

Die Anwendung läuft unter http://127.0.0.1:5173. Im Development ist der Mock-Modus standardmäßig aktiv; es werden weder PostgreSQL noch ein laufendes Backend benötigt. Die Lockdatei gehört zum Projekt. Für eine reproduzierbare Installation kann `npm ci` verwendet werden.

| Befehl                 | Zweck                                           |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Entwicklungsserver                              |
| `npm run lint`         | ESLint ohne tolerierte Warnungen                |
| `npm test`             | Vitest und React Testing Library mit MSW        |
| `npm run test:watch`   | Tests während der Entwicklung                   |
| `npm run build`        | Strenge TypeScript-Prüfung und Produktionsbuild |
| `npm run preview`      | Lokale Vorschau des letzten Builds              |
| `npm run format`       | Prettier anwenden                               |
| `npm run format:check` | Formatierung prüfen                             |

## Stack und Struktur

React, TypeScript (strict), Vite, React Router, Tailwind CSS, shadcn/ui und Radix, TanStack Query, React Hook Form/Zod, MSW, Lucide, Motion, Sonner und date-fns. Inter wird lokal ausgeliefert. ESLint, Prettier, Vitest und Testing Library sichern die Entwicklung ab. TypeScript 6 wird verwendet, weil die eingesetzte typescript-eslint-Version TypeScript 7 noch nicht unterstützt. Konkrete Versionen stehen in `package-lock.json`.

- `src/app`: Router, Provider, Umgebungsvariablen.
- `src/features`: Authentifizierung, Anzeigen, Profile, Unterhaltungen.
- `src/components`: Gemeinsames Layout, Formularelemente, Zustände und UI-Primitives.
- `src/api`: Zentraler HTTP-Client, Endpunktfunktionen und Query-Hooks.
- `src/types`: DTOs des API-Vertrags.
- `src/mocks`: MSW-Handler, isolierte Demodaten, Development-Werkzeug.
- `src/lib`: Validierung, Beschriftungen und Hilfsfunktionen.
- `src/styles`: Gemeinsame Design-Tokens für helles und dunkles Design.
- `src/test`: Verhaltenstests über die HTTP-Schicht.

Alle Requests verwenden `credentials: 'include'`. Vor schreibenden Requests lädt der Client `GET /api/csrf` und sendet den erhaltenen Token als `X-XSRF-TOKEN`. Nach Anmeldung, Registrierung und Abmeldung wird der CSRF-Cache verworfen. Authentifizierungstoken werden nicht im Browser-Speicher abgelegt; nur die Design-Präferenz wird in localStorage gespeichert.

## Seiten und Routen

| Route                              | Seite                                              |
| ---------------------------------- | -------------------------------------------------- |
| `/`, `/anzeigen`                   | Entdecken, Suche, Filter und Seitennavigation      |
| `/anzeigen/:id`                    | Anzeigendetails und erlaubte Aktionen              |
| `/anmelden`, `/registrieren`       | Anmeldung und Registrierung                        |
| `/profile/:id`                     | Öffentliches Profil ohne E-Mail                    |
| `/anzeigen/neu`                    | Anzeige aufgeben, geschützt                        |
| `/anzeigen/:id/bearbeiten`         | Eigene Anzeige bearbeiten, geschützt               |
| `/meine-anzeigen`                  | Eigene aktive und geschlossene Anzeigen, geschützt |
| `/profil`, `/profil/bearbeiten`    | Eigenes Profil und Bearbeitung, geschützt          |
| `/nachrichten`, `/nachrichten/:id` | Postfach und bestehende Unterhaltung, geschützt    |
| sonstige Pfade                     | 404-Seite                                          |

Die Oberfläche bietet Formularfehler, Skeletons, leere Zustände, Wiederholen bei API-Fehlern, Bestätigungsdialoge, mobiles Menü und Filter-Sheet. Geschützte Seiten führen Gäste mit einem internen Rücksprungziel zur Anmeldung. UI-Zugriffskontrollen ersetzen keine Backend-Autorisierung.

## Mock-API und Demo-Sitzungen

MSW fängt die dokumentierten HTTP-Anfragen ab. Komponenten enthalten keine Seed-Daten. Der Mock hält Benutzer, Profile, Anzeigen und Nachrichten ausschließlich im Arbeitsspeicher. Ein Reload stellt den Ausgangszustand wieder her und meldet die Demo-Sitzung ab. Registrierung legt ein leeres Profil an und meldet automatisch an. Anmeldung prüft Demo-Zugangsdaten; dies ist keine produktive Authentifizierung.

Demo-Passwort für alle Seed-Konten: `EdamehDemo2026!` (öffentliches Testdatum, kein Secret).

| E-Mail              | Szenario                                                    |
| ------------------- | ----------------------------------------------------------- |
| `lena@example.com`  | Eigene ACTIVE/CLOSED-Anzeigen und mehrere Unterhaltungen    |
| `jonas@example.com` | Anderer Benutzer mit Anzeigen und bestehenden Gesprächen    |
| `mia@example.com`   | Teilnehmerin eines Gesprächs zu einer geschlossenen Anzeige |
| `noah@example.com`  | Weiterer Benutzer                                           |
| `clara@example.com` | Leeres Profil und Postfach                                  |

Die kleine Werkzeugleiste „Entwicklung · Mock“ schaltet Demo-Sitzungen um, setzt Daten zurück und simuliert langsame Antworten oder einen Fehler. Sie existiert nur im Development. Geschäftsregeln wie eigene Anzeigen aus der öffentlichen Liste auszublenden, Technologie-AND-Filter, Eigentümerrechte, CLOSED-Zugriff und Soft-Delete-404 werden auch im Mock geprüft.

### Abgedeckte Endpunkte

Alle Pfade beginnen mit `/api`:

| Methode          | Pfad                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| GET              | `/csrf`, `/benutzer/ich`                                                                                                        |
| POST             | `/registrierung`, `/anmeldung`, `/abmeldung`                                                                                    |
| GET, PUT         | `/profile/ich`                                                                                                                  |
| GET              | `/profile/{id}`, `/kategorien`, `/technologien`                                                                                 |
| GET, POST        | `/anzeigen`                                                                                                                     |
| GET              | `/anzeigen/meine`                                                                                                               |
| GET, PUT, DELETE | `/anzeigen/{id}`                                                                                                                |
| POST             | `/anzeigen/{id}/schliessen`                                                                                                     |
| POST             | `/anzeigen/{id}/unterhaltungen` – bestehendes Gespräch wiederverwenden und dokumentierte Konflikte prüfen; Neuanlage ausgesetzt |
| GET              | `/unterhaltungen`, `/unterhaltungen/{id}`                                                                                       |
| GET, POST        | `/unterhaltungen/{id}/nachrichten`                                                                                              |
| PATCH            | `/unterhaltungen/{id}/gelesen`                                                                                                  |

### Bewusst offene Vertragsstellen

Auf ausdrücklichen Wunsch bleibt der unklare Gesprächsteil vorerst ausgesetzt:

- Der Vertrag legt die Vorschau einer neuen Unterhaltung ohne letzte Nachricht nicht fest. Deshalb erzeugt der Mock keine neuen leeren Unterhaltungen. Der Kontaktknopf ist dafür in der Mock-Vorschau deaktiviert. Bestehende Gespräche können geöffnet, gelesen und fortgesetzt werden. Für CLOSED/gelöschte Anzeigen bleibt der Start-Endpoint immer bei 409.
- Die Reihenfolge von Nachrichtenseiten ist nicht festgelegt. Die Oberfläche zeigt die erste Seite in der gelieferten Reihenfolge; das Nachladen weiterer Seiten bleibt ausgesetzt. Die Seed-Gespräche passen vollständig auf eine Seite. Keine Sortiergarantie für die spätere API wird angenommen.
- Für einige erfolgreiche Schreiboperationen und `GET /unterhaltungen/{id}` fehlt ein konkreter Response-Body. Der Client wertet dort nur den Status aus und lädt dokumentierte Leseansichten erneut. Es wird kein zusätzliches Response-Modell erfunden.
- `anzeigentyp` fehlt in der Listen-Antwort. Karten lesen ihn über den vorhandenen Detail-Endpunkt mit Query-Caching. Das verursacht zusätzliche Detailanfragen; eine spätere Vertragserweiterung wäre eine separate Entscheidung.

Der API Contract wurde nicht verändert. Ältere Wireframe-Elemente außerhalb des MVP (z. B. Benachrichtigungen/Uploads) wurden nicht übernommen.

## Umgebungsvariablen und echtes Backend

`.env.example` dokumentiert die öffentlichen Variablen. Optional nach `.env.local` kopieren:

```dotenv
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=
```

- `VITE_USE_MOCK_API=true`: MSW aktivieren. `false`: echte HTTP-Anfragen. Ohne Wert: im Development aktiv, im Produktionsbuild inaktiv.
- `VITE_API_BASE_URL`: Origin ohne `/api`, z. B. `http://localhost:8080`. Leer verwendet dieselbe Origin wie das Frontend. Niemals Secrets in Vite-Variablen speichern.

Für die Backend-Anbindung:

1. Benutzer/Registrierung, Session-Authentifizierung und CSRF im Java-Backend gemäß Vertrag implementieren, danach die weiteren Features.
2. Im Frontend `VITE_USE_MOCK_API=false` setzen und den Entwicklungsserver neu starten. Der Vite-Proxy leitet `/api` bei gleicher Origin nach `http://localhost:8080` weiter.
3. Session-Cookie, CSRF-Cookie/Header und Statuscodes gegen das reale Backend testen. Bei getrennten Origins muss das Backend passende Credential-CORS-Regeln und Cookie-Einstellungen bereitstellen.
4. Die dokumentierten Unklarheiten bei neuen Gesprächen und Nachrichtenseiten separat klären, bevor diese Flows aktiviert werden.
5. Features schrittweise integrieren. Bei einer zeitweisen Mischung können nur die noch fehlenden MSW-Handler registriert werden; der globale Flag schaltet den gesamten Mock ab. API-Client und Komponenten behalten dieselben dokumentierten Endpunkte.

Produktionshosting muss unbekannte SPA-Routen auf `index.html` abbilden und `/api` an Spring Boot weiterleiten. `npm run preview` ersetzt dieses Hosting nicht. Es wurde keine Bereitstellung vorgenommen.

## Tests

Die Tests prüfen Registrierung und Passwortbestätigung, fehlgeschlagene/erfolgreiche Anmeldung mit Rücksprung, geschützte Seiten, Suche und Technologie-AND-Filter, Eigentümeraktionen mit Bestätigung sowie Senden und Gelesen-Status bestehender Nachrichten. Zusätzliche HTTP-Tests prüfen CLOSED-/Soft-Delete-Zugriffe, Konflikte des Start-Endpunkts, CSRF, öffentliche Profildaten und die Bearbeitung des Anzeigenamens.

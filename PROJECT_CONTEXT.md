# Project Context – Edameh

## Aktueller Stand
Das Backend verwendet Java 25, Spring Boot 4.1.2 und Maven. Die Architektur bleibt ein modularer Monolith mit Package-by-Feature-Struktur.
PostgreSQL 17 läuft für die lokale Entwicklung über Docker Compose (Host-Port 5433). Flyway verwaltet die Datenbankstruktur: `V1__initial_schema.sql`, `V2__support_multiple_arbeitsweisen.sql` und `V3__benutzer_email_case_insensitive_unique.sql`.
Die Migration V3 fügt einen eindeutigen Index auf `lower(benutzer.e_mail)` hinzu, damit E-Mail-Adressen unabhängig von Groß-/Kleinschreibung eindeutig sind.

Implementierte Authentifizierungs- und Benutzer-Endpunkte:
- `GET /api/csrf`: CSRF-Token bereitstellen.
- `POST /api/registrierung`: Benutzer und leeres Profil transaktional erstellen, Passwort mit BCrypt kodieren und automatisch per HTTP-Session anmelden (`201 Created`).
- `POST /api/anmeldung`: vorhandenen Benutzer anhand E-Mail laden und Passwort mit `PasswordEncoder.matches(...)` prüfen; bei Erfolg HTTP-Session herstellen (`200 OK`), bei ungültigen Zugangsdaten `401`.
- `POST /api/abmeldung`: Session/SecurityContext beenden und CSRF-Token löschen (`204 No Content`).
- `GET /api/benutzer/ich`: Benutzeridentität aus der Session verwenden und aktuelle Daten als `BenutzerResponse` ohne Passwort/Hash liefern (ohne Anmeldung `401`).

Spring Security verwendet `JSESSIONID`, einen serverseitigen `SecurityContext`, Cookie-basierten CSRF-Schutz (`XSRF-TOKEN`/`X-XSRF-TOKEN`) mit `csrf.spa()` sowie CORS für `http://localhost:5173`; kein JWT. Die zentrale API-Fehlerbehandlung umfasst Validierungs-, Anmeldungs-, Autorisierungs- und Datenbankfehler. SQLSTATE `23505` wird nur bei den bekannten E-Mail-Eindeutigkeitsbedingungen als `409 EMAIL_ALREADY_EXISTS` behandelt.
Integrationstests verwenden MockMvc und eine isolierte PostgreSQL-Instanz mittels Testcontainers (Profil `test`, dynamische DataSource-Konfiguration). Laut Entwickler wurden nach der letzten Korrektur **16 Backend-Tests erfolgreich** mit `./mvnw test` ausgeführt (Stand 2026-11-20). Diese Angabe beruht auf dem gemeldeten lokalen Testlauf; sie wurde beim Dokumentations-Update nicht selbst erneut ausgeführt.

Unter `frontend/` ist eine React-/TypeScript-SPA mit Vite, deutscher Oberfläche, responsiven Ansichten und hellem/dunklem Design implementiert.
Die kontrollierte Frontend-Designüberarbeitung vom 30.09.2026 ist dokumentiert; die Browser-Abnahme bleibt offen (`docs/design/frontend-review.md`). Das Frontend verwendet aktuell eine separate MSW-Mock-API. Die echte Frontend-Backend-Anbindung wurde noch nicht abgeschlossen.
`docs/design/api-contract.md` bleibt die verbindliche API-Quelle. Die spätere Anbindung erfolgt Feature für Feature über den zentralen HTTP-Client mit Cookie-Session und CSRF.

Folgende Dokumente sind vorhanden:

- `docs/product/problem-statement.md`
- `docs/product/mvp.md`
- `docs/product/user-flows.md`
- `docs/design/api-contract.md`
- `docs/design/domaenenmodell.md`
- `docs/design/datenbankentwurf.md`
- `docs/design/projektvorbereitung.md`
- `docs/design/frontend-vorgaben.md`

Das Spring-Boot-Projekt liegt unter `backend/` (Java 25, Spring Boot 4.1.2). Entwicklungsprofil `local` und Testprofil `test` verwenden getrennte PostgreSQL-Instanzen. Die Module `auth`, `benutzer` und die initiale Profilanlage sind implementiert; Fachfunktionen für Profilbearbeitung, Kategorien, Technologien, Anzeigen, Unterhaltungen und Nachrichten folgen.

---

## Wichtige Architekturentscheidungen

- Architektur: Modularer Monolith
- Backend: Java + Spring Boot
- Build-System: Maven
- Datenbank: PostgreSQL
- Datenbankmigrationen: Flyway
- Persistenz: Spring Data JPA
- Security: Spring Security
- Authentifizierung: Session-basiert
- API-Stil: REST
- Package-Struktur: Package by Feature
- Lokale Datenbank: Docker Compose
- Integrationstests: MockMvc mit Testcontainers/PostgreSQL 17, `@ActiveProfiles("test")` über `de.edameh.auth.AbstractPostgresIntegrationTest` und `@DynamicPropertySource`; keine Verwendung der Entwicklungsdatenbank für die migrierten Tests

---
## Umgesetzte Backend-Module und Authentifizierungsfluss (Stand 2026-11-20)

- `de.edameh.auth.controller`: `RegistrierungController` (`POST /api/registrierung`), `AnmeldungController` (`POST /api/anmeldung`), `AbmeldungController` (`POST /api/abmeldung`) und `CsrfController` (`GET /api/csrf`).
- `de.edameh.auth.dto`: `RegistrierungRequest`, `AnmeldungRequest`, `CsrfResponse`; `de.edameh.benutzer.dto.BenutzerResponse` ist das sichere API-Ausgabeformat ohne Passwort/Hash.
- `RegistrierungService.registrierung(...)`: prüft Passwortbestätigung und bestehende E-Mail, kodiert das Passwort mit BCrypt und speichert `Benutzer` sowie ein leeres `Profil` in einer Transaktion.
- `AnmeldungService.anmelden(...)`: sucht den vorhandenen Benutzer über `BenutzerRepository.findByeMailIgnoreCase(...)`, validiert das Passwort per `PasswordEncoder.matches(...)` und liefert einen sicheren Benutzer-DTO; der eigentliche Session-Aufbau erfolgt danach im Controller.
- `SessionAnmeldungService.anmelden(...)`: erstellt/rotiert die Session-ID, setzt `AngemeldeterBenutzer(id)` als Authentifizierungsidentität, speichert den `SecurityContext` über `HttpSessionSecurityContextRepository` und erneuert den CSRF-Token. Wird nach Registrierung und normaler Anmeldung wiederverwendet.
- `SessionAbmeldungService.abmelden(...)`: verwendet `CsrfLogoutHandler` und `SecurityContextLogoutHandler`, um CSRF-Zustand und Login-Session zu beenden. Kein Löschen von `Benutzer` oder `Profil`.
- `BenutzerController` / `BenutzerService`: `GET /api/benutzer/ich` liest die ID aus dem authentifizierten Principal, lädt den Benutzer über `findById(...)` neu aus der Datenbank und gibt `BenutzerResponse` zurück.
- `SecurityConfig`: `SecurityFilterChain`, öffentliche CSRF-/Registrierungs-/Anmeldungsrouten, sonst Authentifizierung erforderlich; CORS für Vite, `csrf.spa()`, Cookie-CSRF-Repository und Session-SecurityContext-Repository. Form-Login und HTTP Basic deaktiviert.
- `PasswordConfig`: stellt `BCryptPasswordEncoder` als `PasswordEncoder`-Bean bereit.
- `GlobalExceptionHandler` / `ApiFehlerResponse`: einheitliche Fehlerdarstellung für ungültige Eingaben (`400`), doppelte E-Mail (`409`), ungültige Zugangsdaten (`401`), Security-/HTTP-Fehler und Datenbankfehler. Bei `DataIntegrityViolationException` werden SQLSTATE und Constraint-Name geprüft; unbekannte Datenbankfehler werden nicht fälschlich als doppelte E-Mail eingestuft.
- `BenutzerRepository` und `ProfilRepository`: Spring Data JPA; die physische Profiltabelle heißt `profile` und das Package ebenfalls `profile`.
- Flyway V3: Unique-Index `uq_benutzer_email_lower` auf `lower(e_mail)`; frühere Flyway-Dateien bleiben unverändert.
- Tests: `RegistrierungIntegrationTest`, `AnmeldungAbmeldungIntegrationTest`, `RegistrierungFehlerIntegrationTest`, `RegistrierungRollbackIntegrationTest`, `BenutzerEmailUniqueIntegrationTest`, `RegistrierungHttpFehlerIntegrationTest`, `TestDatenbankIntegrationTest` sowie `EdamehApplicationTests` (Context-Start). Dazu gehören Session-/CSRF-Lebenszyklus, Login/Logout, fehlerhafte Eingaben, simuliertes Profil-Speicherproblem mit Transaktions-Rollback, echte PostgreSQL-Unique-Verletzung und HTTP-Fehlerzuordnung.
- Testinfrastruktur: `de.edameh.auth.AbstractPostgresIntegrationTest` startet ein PostgreSQL-17-Testcontainer und gibt JDBC-Verbindungsdaten über `@DynamicPropertySource` weiter; `backend/src/test/resources/application-test.properties` aktiviert Flyway und Schema-Validierung. Alle Integrationstests und der Context-Test sollen ausschließlich das Testprofil verwenden. Der Entwickler bestätigt **16/16 erfolgreiche Tests** nach Anpassung des Context-Tests; die letzte hochgeladene ZIP-Kopie zeigt diese letzte lokale Anpassung noch nicht.

---

## Verbindliche Quellen

Für die REST-API ist ausschließlich folgende Datei die Source of Truth:

`docs/design/api-contract.md`

Für fachliche Regeln und Datenmodell gelten zusätzlich:

- `docs/design/domaenenmodell.md`
- `docs/design/datenbankentwurf.md`
- `docs/product/mvp.md`
- `docs/product/user-flows.md`

Für das Frontend gelten:

- `docs/design/frontend-vorgaben.md`
- die vorhandenen Wireframes und Mockups

---

## Wichtige fachliche Entscheidungen

### Anzeigen
Anzeigen unterstützen mehrere Arbeitsweisen gleichzeitig.
Eine Anzeige kann `REMOTE`, `VOR_ORT` und/oder `HYBRID` enthalten.
Die Zuordnung wird über `anzeige_arbeitsweisen` gespeichert.
Das API-Feld für Anzeigen heißt `arbeitsweisen`.
- Anzeigen besitzen genau einen Eigentümer.
- neue Anzeigen erhalten den Status `ACTIVE`.
- Mögliche Statuswerte:
  - `ACTIVE`
  - `CLOSED`
- Eigene Anzeigen werden nicht in der öffentlichen Anzeigenliste angezeigt.
- Eigene Anzeigen werden unter „Meine Anzeigen“ verwaltet.
- Details aktiver, nicht gelöschter Anzeigen sind öffentlich sichtbar.
- Details geschlossener, nicht gelöschter Anzeigen sind nur für den Eigentümer und Benutzer sichtbar, die bereits Teilnehmer einer Unterhaltung zu dieser Anzeige sind.
- Soft-gelöschte Anzeigen liefern bei `GET /api/anzeigen/{id}` für alle Benutzer `404 Not Found`.
- Anzeigen werden im MVP per Soft Delete gelöscht.
- Gelöschte Anzeigen verwenden `geloescht\_am`.

### Anzeigentyp

- `UNTERSTUETZUNG\_GESUCHT`
- `PROJEKT\_GESUCHT`

### Projektstand

- `IDEE\_PLANUNG`
- `IN\_ENTWICKLUNG`
- `PROTOTYP\_VORHANDEN`

### Arbeitsweise

- `REMOTE`
- `VOR\_ORT`
- `HYBRID`

### Unterhaltungen

- Eine Unterhaltung gehört zu genau einer Anzeige.
- Eine Unterhaltung besteht aus dem Eigentümer und einem Interessenten.
- Für dieselbe Anzeige und denselben Interessenten darf höchstens eine Unterhaltung existieren.
- Nur Teilnehmer dürfen Nachrichten lesen und senden.
- `POST /api/anzeigen/{anzeigeId}/unterhaltungen` darf nur bei `ACTIVE`, nicht gelöschten Anzeigen verwendet werden; nur dann wird eine bestehende Unterhaltung wiederverwendet.
- Bei `CLOSED` oder gelöschten Anzeigen liefert der Start-Endpoint immer `409 Conflict`, auch wenn bereits eine Unterhaltung existiert.
- Bestehende Unterhaltungen bleiben nach dem Schließen einer Anzeige verfügbar.
- Bestehende Unterhaltungen werden direkt über die Unterhaltungs-Endpunkte geöffnet, insbesondere `GET /api/unterhaltungen/{id}`, nicht über den Start-Endpoint bei geschlossenen Anzeigen.
### Anzeigename und Profilbearbeitung
- Der Anzeigename darf über `PUT /api/profile/ich` als `anzeigename` bearbeitet werden.
- Die Validierung bleibt bei 3–50 Zeichen.
- Der Anzeigename wird weiterhin in `benutzer.anzeigename` gespeichert, nicht in `profile`.

### Technologien

- Technologien werden zentral gespeichert.
- Anzeigen und Profile können mehrere Technologien besitzen.
- Technologien werden nicht als Freitext gespeichert.

---

## Nicht Teil des MVP

- Microservices
- WebSocket
- Echtzeit-Chat
- Datei-Upload im Chat
- Gruppenchat
- Notification-System
- Profilbild-Upload
- Redis
- Kafka
- Elasticsearch
- Kubernetes
- KI-Matching
- Bezahlsystem

---

## Aktueller Arbeitsschritt

Authentifizierung und Basis-Benutzerfunktionen einschließlich Registrierung, Login, Logout, Auto-Login, HTTP-Session, CSRF/CORS, zentralem Fehlerformat sowie PostgreSQL-Eindeutigkeit der E-Mail sind implementiert. Die Testinfrastruktur ist auf eine isolierte Testcontainers-PostgreSQL-Datenbank umgestellt. Laut letztem Entwicklerbericht laufen **16 Backend-Tests erfolgreich** (Stand 2026-11-20). Die echte React-Backend-Integration ist noch offen.

---

## Nächster Schritt

1. Einen reproduzierbaren Integrationstest für zwei konkurrierende Registrierungen mit derselben E-Mail entwickeln (echte getrennte Transaktionen; kein gemeinsam genutzter, durch `@Transactional` der Testmethode verfälschter Transaktionskontext). Prüfen, dass die Datenbank höchstens einen Benutzer zulässt und der zweite Versuch fachlich korrekt als `409 EMAIL_ALREADY_EXISTS` beantwortet wird. Den bestehenden HTTP-Test mit simulierter Service-Exception nicht mit einem echten Parallelitätstest verwechseln.
2. Vor größeren Änderungen den bestandenen Teststand und diese Dokumentation in Git sichern. Lokale Secrets und `application-local.properties` dürfen nicht eingecheckt werden. Neue/angepasste Dateien und `git diff --cached` vor dem Commit gezielt prüfen.
3. Danach mit der nächsten MVP-Funktion fortfahren: Profilbearbeitung bzw. Kategorien/Technologien und `Anzeigen` anhand von `docs/design/api-contract.md`, Domänenmodell und Datenbankentwurf; bestehende Architekturentscheidungen und bereits angewendete Flyway-Migrationen beibehalten.
4. Die reale Frontend-Backend-Anbindung mit Session-Cookies, CSRF und dem zentralen API-Client separat integrieren und testen.

---

## Offene Entscheidungen

Keine neue Architekturentscheidung nötig. Zwei Vertragsdetails für Unterhaltungen sind offen: Darstellung der letzten Nachricht bei einem neu angelegten, leeren Gespräch und Reihenfolge der Nachrichtenseiten. Auf ausdrücklichen Benutzerwunsch werden Neuanlage leerer Gespräche im Mock und weiterführende Nachrichtenpagination vorerst nicht implementiert. Bestehende Seed-Gespräche können gelesen und fortgesetzt werden. Der API Contract wurde nicht geändert.

Neue wichtige Entscheidungen sollen hier dokumentiert werden, sobald sie während der Implementierung entstehen.

---

## Änderungsprotokoll
### 2026-11-20 – Spring Boot 4.1.2, Auth-Fehlerfälle und isolierte Testdatenbank

- Spring Boot auf `4.1.2` aktualisiert; Java 25 und Maven bleiben unverändert.
- Registrierung, Anmeldung, Abmeldung, Session-/CSRF-Lebenszyklus und einheitliche Fehlerantworten weiter abgesichert.
- Migration V3 (`uq_benutzer_email_lower` auf `lower(benutzer.e_mail)`) vorhanden; reale Unique-Constraint-Verletzung und gezielte Zuordnung zu HTTP `409 EMAIL_ALREADY_EXISTS` in Tests berücksichtigt.
- Rollback nach simuliertem Fehler bei der Profilanlage geprüft. Der echte HTTP-Fehlerpfad wird zusätzlich mit MockMvc und simulierter Service-Exception abgedeckt; dies ist **kein** echter konkurrierender Registrierungstest.
- Testcontainers PostgreSQL 17 als isolierte Datenbank unter Profil `test` eingerichtet; `AbstractPostgresIntegrationTest`, `@DynamicPropertySource` und `application-test.properties` werden verwendet. Der Context-Test wurde nach Entwicklerangabe ebenfalls auf die Testdatenbank umgestellt.
- Laut Entwickler letzter gesamter Maven-Testlauf: **16 Tests erfolgreich, 0 Fehler**. Keine erneute Ausführung durch die Dokumentationsaktualisierung.
- Bekannter ausstehender Schritt: parallele Registrierungsanfragen unter echter Datenbankkonkurrenz testen. Frontend nutzt noch MSW; keine bestätigte React-Backend-Integration.

### 2026-11-17 – Benutzerregistrierung, Session/CSRF und erster Integrationstest-Stand dokumentiert
`auth`/`benutzer`/`profile`-Klassen und ihre tatsächlichen Verantwortlichkeiten aus dem bereitgestellten ZIP dokumentiert; bestehende Architektur, Migrationen und API-Contract nicht geändert.
`POST /api/registrierung`, `GET /api/csrf`, `GET /api/benutzer/ich`, automatische Anmeldung nach Registrierung, Session-Speicherung, CSRF/CORS, BCrypt und globale Fehlerbehandlung als implementierter Stand eingetragen.
Vorhandene MockMvc-Tests: erfolgreicher Registrierungs-/Sessionfluss, `401` ohne Session, `403` ohne CSRF; der Entwickler meldet nach Korrekturen erfolgreiche Testläufe. Die älteren ZIP-Dateien enthalten die zwei jüngsten Code-Korrekturen noch nicht.
Nächste Arbeiten: `POST /api/anmeldung`, `POST /api/abmeldung`, Fehler-/Sicherheits-/Rollback-Tests und isolierte Testdatenbank (Testcontainers). Keine neue Migration und keine automatische Git-Änderung durch diese Dokumentationsaktualisierung.

### 2026-09-30 – Kontrollierte Frontend-Designüberarbeitung
Vorhandene Komponenten und Architektur erhalten; Start und Anzeigenliste gezielter gewichtet, Navigation und mobile Aktionen lesbarer gestaltet, wiederholte dekorative Flächen reduziert.
Gemeinsame Design-Tokens, Feldkontraste, Fehler-/Hinweiszuordnung und Dialogfokus verbessert. Kurze CSS-Übergänge ergänzen das vorhandene Motion-Setup mit Reduced-Motion-Unterstützung.
Kontakt-/Verwaltungsaktionen erscheinen mobil vor langen Anzeigentexten. Postfach und Verlauf scrollen getrennt; explizites Aktualisieren lädt auch die Nachrichten des geöffneten Gesprächs.
API-Vertrag, API-Client, DTOs, MSW, Validierung, Backend und Migrationen unverändert. Keine neue Projekt-Dependency. Bereits vorhandene Backend-Arbeitsdateien nicht bearbeitet.
Prüfung: ESLint erfolgreich, TypeScript strict erfolgreich, 40/40 Tests erfolgreich, Produktionsbuild erfolgreich, Diff ohne Whitespace-Fehler.
Visuelle Desktop-/Mobile-Abnahme ist offen: Browserzugriff auf die lokale Vorschau wurde abgelehnt. Nächster Designschritt ist die Browserprüfung beider Themes und der dokumentierten Größen. Details: `docs/design/frontend-review.md`.
Bei der Prüfung fiel die vorhandene Abweichung `arbeitsweise` im eigenen Profil gegenüber `arbeitsweisen` im API-Vertrag auf. Keine Shape-Änderung im Designauftrag; vor Backend-Anbindung separat abstimmen. Der nächste fachliche Backend-Schritt bleibt Benutzer/Registrierung.
### 2026-09-29 – Frontend mit Mock-API
Feature-orientierte React-SPA unter `frontend/` erstellt, einschließlich Anzeigen, Authentifizierung, Profilen und bestehenden Unterhaltungen.
MSW-Daten und Demo-Sitzungen bleiben im Arbeitsspeicher; keine Authentifizierungstoken in localStorage. Backend, Docker und Migrationen unverändert.
Zentraler API-Client, Formularvalidierung, Query-Caching und Verhaltenstests eingerichtet. Abweichende ältere Wireframe-Funktionen außerhalb des MVP nicht übernommen.
API-Vertrag unverändert; offene Gesprächsdetails auf Benutzerwunsch zurückgestellt. Nächster fachlicher Schritt bleibt Java-Backend: Benutzer und Registrierung.
### 2026-09-28 – Lokale PostgreSQL-Verbindung
- Authentifizierungsfehler auf einen Portkonflikt mit dem laufenden Windows-PostgreSQL 18 zurückgeführt; Compose-Port auf `5433:5432` und lokale Spring-URL entsprechend angepasst.
- TCP-Anmeldung von Windows und einem temporären PostgreSQL-Client-Container über den Host-Port erfolgreich gegen PostgreSQL 17.11 geprüft.
- Start mit Profil `local` inklusive Hikari, Flyway und JPA erfolgreich; `Started EdamehApplication` bestätigt und Anwendung anschließend gestoppt. Flyway hat seine History-Tabelle angelegt; fachliche Migrationen sind noch nicht vorhanden.
- `mvnw test`: ein Test, ein Fehler wegen fehlender DataSource-Konfiguration im Default-Profil. Keine Test-Workarounds, Dependency-Änderungen oder Passwortänderungen vorgenommen.
### 2026-09-27 – Fachliche Präzisierungen
- Zugriff auf Anzeigendetails nach Status, Soft Delete und Unterhaltungsteilnahme festgelegt.
- Start-Endpoint auf aktive, nicht gelöschte Anzeigen begrenzt; bei geschlossenen oder gelöschten Anzeigen immer `409 Conflict`, auch bei bestehender Unterhaltung.
- Direkter Zugriff auf bestehende Unterhaltungen über die Unterhaltungs-Endpunkte dokumentiert.
- Bearbeitung des Anzeigenamens über den Profil-Endpoint bei unveränderter Speicherung in `benutzer` und Validierung von 3–50 Zeichen festgelegt.
- API-Vertrag, Domänenmodell, User Flows, Datenbankentwurf und Frontend-Vorgaben abgeglichen. Die Backend-Implementierung hat weiterhin nicht begonnen.
### 2026-11-19 – Authentifizierung und E-Mail-Eindeutigkeit

- Registrierung mit automatischer Anmeldung, Anmeldung bestehender Benutzer und Abmeldung über HTTP-Session implementiert.
- Session-, Cookie- und CSRF-Verhalten durch Integrationstests geprüft.
- Fehlerfälle für doppelte E-Mail-Adressen, ungültige Eingaben und falsche Passwörter getestet.
- Transaktionales Rollback bei simuliertem Fehler während der Profilspeicherung erfolgreich getestet.
- Alle 12 Backend-Tests erfolgreich ausgeführt.
- Flyway-Migration V3 ergänzt: eindeutiger Index auf `lower(benutzer.e_mail)` zur Durchsetzung der E-Mail-Eindeutigkeit unabhängig von Groß-/Kleinschreibung.
- Nächster Schritt: Datenbankseitige Unique-Constraint-Verletzungen gezielt behandeln und als `409 Conflict` zurückgeben; anschließend Integrationstests mit echter PostgreSQL-Constraint-Verletzung.

### Initialer Stand

- MVP definiert
- User Flows definiert
- Domänenmodell definiert
- Datenbankentwurf definiert
- API Contract definiert
- Frontend-Vorgaben definiert
- Backend-Architektur vorbereitet
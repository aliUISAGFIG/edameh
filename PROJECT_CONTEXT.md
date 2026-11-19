# Project Context – Edameh

## Aktueller Stand
Das Spring-Boot-Backend ist eingerichtet.
PostgreSQL 17 läuft über Docker Compose.
Die Anwendung kann erfolgreich eine Verbindung zur Datenbank herstellen.
Flyway ist eingerichtet.
Die initiale Datenbankstruktur wurde mit `V1__initial_schema.sql` erstellt; `V2__support_multiple_arbeitsweisen.sql` ergänzt mehrere Arbeitsweisen für Anzeigen.
Beide Flyway-Migrationen wurden erfolgreich angewendet und validiert.
Unter `frontend/` ist eine React-/TypeScript-SPA mit Vite, deutscher Oberfläche, responsiven Ansichten und hellem/dunklem Design implementiert.
Kontrollierte Frontend-Designüberarbeitung am 30.09.2026 umgesetzt; Browser-Abnahme nach verweigerter lokaler Browserfreigabe noch offen. Umfang und Prüfgrenzen: `docs/design/frontend-review.md`.
Das Frontend arbeitet derzeit mit einer separaten MSW-Mock-API; eine echte Frontend-Backend-Integration wurde noch nicht abgenommen.
Im Backend sind `POST /api/registrierung`, `GET /api/csrf` und `GET /api/benutzer/ich` implementiert.
Die Registrierung legt `Benutzer` und ein leeres `Profil` gemeinsam an, kodiert Passwörter mit BCrypt und meldet den Benutzer danach automatisch per HTTP-Session an.
Spring Security nutzt `JSESSIONID`, `SecurityContext` in der HTTP-Session, Cookie-basierten CSRF-Schutz (`XSRF-TOKEN`/`X-XSRF-TOKEN`) und eine CORS-Konfiguration für `http://localhost:5173`.
Globale API-Fehlerbehandlung und erste MockMvc-Integrationstests für Registrierung, Auto-Login, geschützte Endpunkte und CSRF sind vorhanden. Die Tests wurden nach Angabe des Entwicklers erfolgreich ausgeführt.
`docs/design/api-contract.md` bleibt die verbindliche API-Quelle. Die reale Backend-Anbindung erfolgt später Feature für Feature über dieselbe zentrale HTTP-Schicht (Session und CSRF).

Folgende Dokumente sind vorhanden:

- `docs/product/problem-statement.md`
- `docs/product/mvp.md`
- `docs/product/user-flows.md`
- `docs/design/api-contract.md`
- `docs/design/domaenenmodell.md`
- `docs/design/datenbankentwurf.md`
- `docs/design/projektvorbereitung.md`
- `docs/design/frontend-vorgaben.md`

Das Spring-Boot-Projekt liegt unter `backend/` (Java 25, Spring Boot 4.1.1). Der Start mit Profil `local` und PostgreSQL 17 über Docker Compose wurde erfolgreich geprüft. Die ersten fachlichen Module `auth`, `benutzer` und `profile` sind implementiert; Anzeigen, Gespräche und weitere Fachmodule im Backend noch nicht.

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
- Integrationstests: Testcontainers als Zielarchitektur; aktuell MockMvc-Integrationstests mit `@ActiveProfiles("local")` und lokaler PostgreSQL-Datenbank

---
## Umgesetzte Backend-Module und Authentifizierungsfluss (Stand 2026-11-17)
`de.edameh.auth.controller`: `RegistrierungController` (`POST /api/registrierung`) und `CsrfController` (`GET /api/csrf`).
`de.edameh.auth.dto`: `RegistrierungRequest`, `CsrfResponse`; `de.edameh.benutzer.dto.BenutzerResponse` ist das sichere API-Ausgabeformat ohne Passwort/Hash.
`de.edameh.auth.service.RegistrierungService`: validiert Passwortbestätigung und E-Mail-Duplikate, kodiert das Passwort, speichert `Benutzer` und das leere `Profil` in einer Transaktion.
`de.edameh.auth.service.SessionAnmeldungService`: erstellt/rotiert die HTTP-Session-ID, setzt die authentifizierte Identität `AngemeldeterBenutzer(id)`, speichert den `SecurityContext` über `HttpSessionSecurityContextRepository` und erneuert den CSRF-Token.
`de.edameh.benutzer.controller.BenutzerController` und `de.edameh.benutzer.service.BenutzerService`: `GET /api/benutzer/ich` verwendet die authentifizierte Identität zur erneuten Benutzerabfrage und liefert `BenutzerResponse`.
`de.edameh.config.SecurityConfig`: `SecurityFilterChain`, öffentliche CSRF-/Registrierungsroute (und Freigabe für die noch nicht implementierte Anmeldung), sonst Authentifizierung erforderlich; CORS für den lokalen Vite-Origin, `csrf.spa()` und Cookie-basierter CSRF-Token-Speicher. Form-Login und HTTP Basic deaktiviert, kein JWT.
`de.edameh.config.PasswordConfig`: stellt `BCryptPasswordEncoder` als `PasswordEncoder`-Bean bereit.
`de.edameh.common.exceptions.GlobalExceptionHandler` / `ApiFehlerResponse`: einheitliche Behandlung von API-Validierungs-, Registrierungs- und HTTP-Fehlern; Security-Fehler werden über `HandlerExceptionResolver` zugeleitet.
`de.edameh.benutzer.repository.BenutzerRepository` und `de.edameh.profile.repository.ProfilRepository` basieren auf Spring Data JPA. Die physische Profil-Tabelle heißt `profile`; das Java-Package heißt ebenfalls `profile`.
Vorhandener Test `RegistrierungIntegrationTest`: erfolgreiche Registrierung mit Session und anschließendem `/api/benutzer/ich`, `403` ohne CSRF sowie `401` ohne Session; `EdamehApplicationTests` prüft den Context-Start. Tests laut Entwickler erfolgreich nicht innerhalb dieses Dokumentations-Updates ausgeführt.
Registrierung und automatische Anmeldung sind umgesetzt, aber `POST /api/anmeldung` und `POST /api/abmeldung` sind noch nicht implementiert. Die Freigabe des Login-Pfads in `SecurityConfig` ist kein implementierter Endpoint.
Die E-Mail-Validierungsgrenze ist 254 Zeichen; die korrigierte Entity-Spaltenlänge und der HTTP-Status 400 bei abweichender Passwortbestätigung wurden vom Entwickler bestätigt, stehen aber noch nicht in der hochgeladenen älteren ZIP-Kopie.
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

Benutzer/Registrierung inkl. Auto-Login, Session, CSRF, CORS, Fehlerformat und erster Integrationstests umgesetzt. Laut Entwickler laufen die bisherigen Tests erfolgreich; die beiden zuletzt gemeldeten Korrekturen (`PasswortBestaetigungException` -> HTTP 400 und E-Mail-Spaltenlänge 254) wurden lokal vorgenommen, sind aber im zuletzt hochgeladenen ZIP noch nicht enthalten. Aktuell folgt die Implementierung von Anmeldung/Abmeldung und erweiterter Authentifizierungstests.

---

## Nächster Schritt

`POST /api/anmeldung` implementieren: vorhandenen Benutzer anhand E-Mail laden, Passwort mit `PasswordEncoder.matches(...)` prüfen, bei Erfolg denselben `SessionAnmeldungService` wie bei der Registrierung verwenden; Erfolg `200` mit `BenutzerResponse`, ungültige Zugangsdaten `401` mit `INVALID_CREDENTIALS`.
`POST /api/abmeldung` implementieren: authentifizierte Session beenden, `SecurityContext` löschen, CSRF-Token erneuern bzw. invalidieren; Erfolg `204 No Content`.
Integrationstests erweitern: gültige/ungültige Anmeldung, Abmeldung, Session-Persistenz, CSRF vor und nach Authentifizierungswechseln, doppelte E-Mail, Passwortbestätigung, Transaktions-Rollback und Fehlerformat.
Test-Infrastruktur auf eine isolierte Datenbank, vorzugsweise Testcontainers, umstellen (aktuell laufen Tests mit Profil `local`).
Danach die weiteren Module `profile`, Kategorien/Technologien, Anzeigen, Suche/Filter sowie Unterhaltungen/Nachrichten ausbauen.

---

## Offene Entscheidungen

Keine neue Architekturentscheidung nötig. Zwei Vertragsdetails für Unterhaltungen sind offen: Darstellung der letzten Nachricht bei einem neu angelegten, leeren Gespräch und Reihenfolge der Nachrichtenseiten. Auf ausdrücklichen Benutzerwunsch werden Neuanlage leerer Gespräche im Mock und weiterführende Nachrichtenpagination vorerst nicht implementiert. Bestehende Seed-Gespräche können gelesen und fortgesetzt werden. Der API Contract wurde nicht geändert.

Neue wichtige Entscheidungen sollen hier dokumentiert werden, sobald sie während der Implementierung entstehen.

---

## Änderungsprotokoll
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

### Initialer Stand

- MVP definiert
- User Flows definiert
- Domänenmodell definiert
- Datenbankentwurf definiert
- API Contract definiert
- Frontend-Vorgaben definiert
- Backend-Architektur vorbereitet
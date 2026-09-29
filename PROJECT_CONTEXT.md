\# Project Context – Edameh



\## Aktueller Stand

- Das Spring-Boot-Backend ist eingerichtet.
- PostgreSQL 17 läuft über Docker Compose.
- Die Anwendung kann erfolgreich eine Verbindung zur Datenbank herstellen.
- Flyway ist eingerichtet.
- Die initiale Datenbankstruktur wurde mit `V1__initial_schema.sql` erstellt.
- Die erste Flyway-Migration wurde erfolgreich ausgeführt.
- Unter `frontend/` ist eine React-/TypeScript-SPA mit Vite, deutscher Oberfläche, responsiven Ansichten und hellem/dunklem Design implementiert.
- Das Frontend arbeitet derzeit mit einer separaten MSW-Mock-API; die fachlichen Backend-Endpunkte sind weiterhin noch nicht implementiert.
- `docs/design/api-contract.md` bleibt die verbindliche API-Quelle. Die reale Backend-Anbindung erfolgt später Feature für Feature über dieselbe zentrale HTTP-Schicht (Session und CSRF).



Folgende Dokumente sind vorhanden:



\- `docs/product/problem-statement.md`

\- `docs/product/mvp.md`

\- `docs/product/user-flows.md`

\- `docs/design/api-contract.md`

\- `docs/design/domaenenmodell.md`

\- `docs/design/datenbankentwurf.md`

\- `docs/design/projektvorbereitung.md`

\- `docs/design/frontend-vorgaben.md`



Das Spring-Boot-Grundprojekt liegt unter `backend/` (Java 25, Spring Boot 4.1.1). Der Start mit dem Profil `local` und PostgreSQL 17 über Docker Compose wurde erfolgreich geprüft. Fachliche Module sind noch nicht implementiert.



\---



\## Wichtige Architekturentscheidungen



\- Architektur: Modularer Monolith

\- Backend: Java + Spring Boot

\- Build-System: Maven

\- Datenbank: PostgreSQL

\- Datenbankmigrationen: Flyway

\- Persistenz: Spring Data JPA

\- Security: Spring Security

\- Authentifizierung: Session-basiert

\- API-Stil: REST

\- Package-Struktur: Package by Feature

\- Lokale Datenbank: Docker Compose

\- Integrationstests: Testcontainers



\---



\## Verbindliche Quellen



Für die REST-API ist ausschließlich folgende Datei die Source of Truth:



`docs/design/api-contract.md`



Für fachliche Regeln und Datenmodell gelten zusätzlich:



\- `docs/design/domaenenmodell.md`

\- `docs/design/datenbankentwurf.md`

\- `docs/product/mvp.md`

\- `docs/product/user-flows.md`



Für das Frontend gelten:



\- `docs/design/frontend-vorgaben.md`

\- die vorhandenen Wireframes und Mockups



\---



\## Wichtige fachliche Entscheidungen



\### Anzeigen

- Anzeigen unterstützen mehrere Arbeitsweisen gleichzeitig.

- Eine Anzeige kann `REMOTE`, `VOR_ORT` und/oder `HYBRID` enthalten.

- Die Zuordnung wird über `anzeige_arbeitsweisen` gespeichert.

- Das API-Feld für Anzeigen heißt `arbeitsweisen`.

\- Anzeigen besitzen genau einen Eigentümer.

\- neue Anzeigen erhalten den Status `ACTIVE`.

\- Mögliche Statuswerte:

&#x20; - `ACTIVE`

&#x20; - `CLOSED`

\- Eigene Anzeigen werden nicht in der öffentlichen Anzeigenliste angezeigt.

\- Eigene Anzeigen werden unter „Meine Anzeigen“ verwaltet.

\- Details aktiver, nicht gelöschter Anzeigen sind öffentlich sichtbar.

\- Details geschlossener, nicht gelöschter Anzeigen sind nur für den Eigentümer und Benutzer sichtbar, die bereits Teilnehmer einer Unterhaltung zu dieser Anzeige sind.

\- Soft-gelöschte Anzeigen liefern bei `GET /api/anzeigen/{id}` für alle Benutzer `404 Not Found`.

\- Anzeigen werden im MVP per Soft Delete gelöscht.

\- Gelöschte Anzeigen verwenden `geloescht\_am`.



\### Anzeigentyp



\- `UNTERSTUETZUNG\_GESUCHT`

\- `PROJEKT\_GESUCHT`



\### Projektstand



\- `IDEE\_PLANUNG`

\- `IN\_ENTWICKLUNG`

\- `PROTOTYP\_VORHANDEN`



\### Arbeitsweise



\- `REMOTE`

\- `VOR\_ORT`

\- `HYBRID`



\### Unterhaltungen



\- Eine Unterhaltung gehört zu genau einer Anzeige.

\- Eine Unterhaltung besteht aus dem Eigentümer und einem Interessenten.

\- Für dieselbe Anzeige und denselben Interessenten darf höchstens eine Unterhaltung existieren.

\- Nur Teilnehmer dürfen Nachrichten lesen und senden.

\- `POST /api/anzeigen/{anzeigeId}/unterhaltungen` darf nur bei `ACTIVE`, nicht gelöschten Anzeigen verwendet werden; nur dann wird eine bestehende Unterhaltung wiederverwendet.

\- Bei `CLOSED` oder gelöschten Anzeigen liefert der Start-Endpoint immer `409 Conflict`, auch wenn bereits eine Unterhaltung existiert.

\- Bestehende Unterhaltungen bleiben nach dem Schließen einer Anzeige verfügbar.

\- Bestehende Unterhaltungen werden direkt über die Unterhaltungs-Endpunkte geöffnet, insbesondere `GET /api/unterhaltungen/{id}`, nicht über den Start-Endpoint bei geschlossenen Anzeigen.

\### Anzeigename und Profilbearbeitung

\- Der Anzeigename darf über `PUT /api/profile/ich` als `anzeigename` bearbeitet werden.

\- Die Validierung bleibt bei 3–50 Zeichen.

\- Der Anzeigename wird weiterhin in `benutzer.anzeigename` gespeichert, nicht in `profile`.



\### Technologien



\- Technologien werden zentral gespeichert.

\- Anzeigen und Profile können mehrere Technologien besitzen.

\- Technologien werden nicht als Freitext gespeichert.



\---



\## Nicht Teil des MVP



\- Microservices

\- WebSocket

\- Echtzeit-Chat

\- Datei-Upload im Chat

\- Gruppenchat

\- Notification-System

\- Profilbild-Upload

\- Redis

\- Kafka

\- Elasticsearch

\- Kubernetes

\- KI-Matching

\- Bezahlsystem



\---



\## Aktueller Arbeitsschritt


Frontend-Anwendung und Mock-API erstellt; Backend-Arbeit anschließend mit Benutzer/Registrierung fortsetzen. Anleitung, Routen und Einschränkungen stehen in `frontend/README.md`.



\---



\## Nächster Schritt


Die Funktion `Benutzer` und die Registrierung implementieren.



Danach:



1\. Projektstruktur einrichten

2\. PostgreSQL mit Docker Compose starten

3\. Flyway konfigurieren

4\. Benutzer und Registrierung implementieren

5\. Session-basierte Authentifizierung mit Spring Security umsetzen

6\. Profil implementieren

7\. Kategorien und Technologien implementieren

8\. Anzeigen implementieren

9\. Suche und Filter implementieren

10\. Unterhaltungen und Nachrichten implementieren



\---



\## Offene Entscheidungen



Keine neue Architekturentscheidung nötig. Zwei Vertragsdetails für Unterhaltungen sind offen: Darstellung der letzten Nachricht bei einem neu angelegten, leeren Gespräch und Reihenfolge der Nachrichtenseiten. Auf ausdrücklichen Benutzerwunsch werden Neuanlage leerer Gespräche im Mock und weiterführende Nachrichtenpagination vorerst nicht implementiert. Bestehende Seed-Gespräche können gelesen und fortgesetzt werden. Der API Contract wurde nicht geändert.



Neue wichtige Entscheidungen sollen hier dokumentiert werden, sobald sie während der Implementierung entstehen.



\---



\## Änderungsprotokoll

\### 2026-09-29 – Frontend mit Mock-API

- Feature-orientierte React-SPA unter `frontend/` erstellt, einschließlich Anzeigen, Authentifizierung, Profilen und bestehenden Unterhaltungen.
- MSW-Daten und Demo-Sitzungen bleiben im Arbeitsspeicher; keine Authentifizierungstoken in localStorage. Backend, Docker und Migrationen unverändert.
- Zentraler API-Client, Formularvalidierung, Query-Caching und Verhaltenstests eingerichtet. Abweichende ältere Wireframe-Funktionen außerhalb des MVP nicht übernommen.
- API-Vertrag unverändert; offene Gesprächsdetails auf Benutzerwunsch zurückgestellt. Nächster fachlicher Schritt bleibt Java-Backend: Benutzer und Registrierung.

\### 2026-09-28 – Lokale PostgreSQL-Verbindung

\- Authentifizierungsfehler auf einen Portkonflikt mit dem laufenden Windows-PostgreSQL 18 zurückgeführt; Compose-Port auf `5433:5432` und lokale Spring-URL entsprechend angepasst.

\- TCP-Anmeldung von Windows und einem temporären PostgreSQL-Client-Container über den Host-Port erfolgreich gegen PostgreSQL 17.11 geprüft.

\- Start mit Profil `local` inklusive Hikari, Flyway und JPA erfolgreich; `Started EdamehApplication` bestätigt und Anwendung anschließend gestoppt. Flyway hat seine History-Tabelle angelegt; fachliche Migrationen sind noch nicht vorhanden.

\- `mvnw test`: ein Test, ein Fehler wegen fehlender DataSource-Konfiguration im Default-Profil. Keine Test-Workarounds, Dependency-Änderungen oder Passwortänderungen vorgenommen.

\### 2026-09-27 – Fachliche Präzisierungen

\- Zugriff auf Anzeigendetails nach Status, Soft Delete und Unterhaltungsteilnahme festgelegt.

\- Start-Endpoint auf aktive, nicht gelöschte Anzeigen begrenzt; bei geschlossenen oder gelöschten Anzeigen immer `409 Conflict`, auch bei bestehender Unterhaltung.

\- Direkter Zugriff auf bestehende Unterhaltungen über die Unterhaltungs-Endpunkte dokumentiert.

\- Bearbeitung des Anzeigenamens über den Profil-Endpoint bei unveränderter Speicherung in `benutzer` und Validierung von 3–50 Zeichen festgelegt.

\- API-Vertrag, Domänenmodell, User Flows, Datenbankentwurf und Frontend-Vorgaben abgeglichen. Die Backend-Implementierung hat weiterhin nicht begonnen.



\### Initialer Stand



\- MVP definiert

\- User Flows definiert

\- Domänenmodell definiert

\- Datenbankentwurf definiert

\- API Contract definiert

\- Frontend-Vorgaben definiert

\- Backend-Architektur vorbereitet


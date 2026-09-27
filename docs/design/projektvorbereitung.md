# Projektvorbereitung – Edameh

Dieses Dokument beschreibt die technischen Grundentscheidungen vor Beginn der Backend-Implementierung.

## 1. Source of Truth

Für die REST-API ist ausschließlich:

`docs/design/api-contract.md`

verbindlich.

Ältere API-Entwürfe mit anderen Pfaden, Versionierungen oder Enum-Namen sind nicht mehr gültig.

Weitere fachliche Quellen:

- `docs/product/problem-statement.md`
- `docs/product/mvp.md`
- `docs/product/user-flows.md`
- `docs/design/domaenenmodell.md`
- `docs/design/datenbankentwurf.md`
- `docs/design/frontend-vorgaben.md`

---

## 2. Architektur

Edameh wird als modularer Monolith umgesetzt:

- eine Spring-Boot-Anwendung
- eine PostgreSQL-Datenbank
- eine Deployment-Einheit
- klare fachliche Module
- keine Microservices im MVP

---

## 3. Fachbereiche

- Authentifizierung
- Benutzer
- Profil
- Anzeige
- Kategorie
- Technologie
- Unterhaltung
- Nachricht

---

## 4. Package-Struktur

```text
de.edameh
├── auth
├── benutzer
├── profil
├── anzeige
├── kategorie
├── technologie
├── unterhaltung
├── nachricht
├── config
└── shared
```

Beispiel:

```text
anzeige
├── controller
├── service
├── repository
├── dto
└── domain
```

### Regeln

- Controller: HTTP und Request/Response
- Service: Geschäftslogik
- Repository: Persistenz
- DTO: API-Grenze
- Domain: Entities und Enums
- JPA-Entities werden nicht direkt als API-Responses verwendet.

---

## 5. Technologie-Stack

- Java
- Spring Boot
- Spring MVC / Spring Web
- Spring Data JPA
- Spring Security
- Bean Validation
- PostgreSQL
- Flyway
- Maven
- Docker Compose
- JUnit 5
- Mockito
- Testcontainers
- OpenAPI / Swagger
- Git / GitHub
- GitHub Actions

Nicht vorgesehen, solange kein konkreter Bedarf entsteht:

- Microservices
- Kafka
- RabbitMQ
- Redis
- Elasticsearch
- Kubernetes
- WebFlux
- WebSocket

---

## 6. Enums

### AnzeigenStatus

- `ACTIVE`
- `CLOSED`

### Arbeitsweise

- `REMOTE`
- `VOR_ORT`
- `HYBRID`

### Anzeigentyp

- `UNTERSTUETZUNG_GESUCHT`
- `PROJEKT_GESUCHT`

### Projektstand

- `IDEE_PLANUNG`
- `IN_ENTWICKLUNG`
- `PROTOTYP_VORHANDEN`

Diese Werte müssen in Domain, Datenbankentwurf, API und Frontend identisch verwendet werden.

---

## 7. Authentifizierung und Security

Das MVP verwendet Session-Authentifizierung.

### Session

- `JSESSIONID`
- `HttpOnly`
- `Secure` in Produktion
- `SameSite=Lax`
- Frontend verwendet `credentials: "include"`.

### CSRF

Spring Security schützt zustandsändernde Requests.

Geplant:

- `CookieCsrfTokenRepository`
- Cookie: `XSRF-TOKEN`
- Header: `X-XSRF-TOKEN`
- Initialisierung über `GET /api/csrf`

### CORS in Entwicklung

Erlaubter Frontend-Origin:

`http://localhost:5173`

Credentials sind erlaubt. Keine Wildcard-Origin-Konfiguration zusammen mit Credentials.

### Autorisierung

- nur Eigentümer dürfen eigene Anzeigen ändern
- nur Teilnehmer dürfen Unterhaltungen lesen
- nur Teilnehmer dürfen Nachrichten senden
- Frontend-Sichtbarkeit ist kein Sicherheitsmechanismus

---

## 8. Validierung

Bean Validation wird für technische Request-Regeln verwendet; fachliche Regeln werden im Service geprüft.

Verbindliche Grenzen stehen im `api-contract.md`.

Beispiele:

- `@NotBlank`
- `@NotNull`
- `@Email`
- `@Size`

Fachliches Beispiel:

`VOR_ORT` oder `HYBRID` → Standort erforderlich.

---

## 9. Fehlerbehandlung

Eine zentrale Fehlerbehandlung mit `@ControllerAdvice` wird verwendet.

Das JSON-Fehlerformat ist im `api-contract.md` verbindlich definiert.

Typische Statuscodes:

- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`

Interne Stacktraces oder sensible technische Details werden nicht an Clients ausgegeben.

---

## 10. Datenbank und Migrationen

PostgreSQL läuft lokal über Docker Compose.

Alle Schemaänderungen werden mit Flyway verwaltet.

Beispiel:

```text
V1__initial_schema.sql
V2__add_indexes.sql
V3__seed_categories_and_technologies.sql
```

JPA `ddl-auto` wird nicht als Ersatz für Migrationen verwendet.

---

## 11. Katalogdaten

Kategorien und Technologien werden serverseitig verwaltet.

Das Frontend lädt sie über:

- `GET /api/kategorien`
- `GET /api/technologien`

Sie werden nicht im React-Code als alleinige Source of Truth hardcodiert.

---

## 12. Suche und Pagination

Öffentliche Anzeigen werden paginiert.

Verbindliche Semantik:

- Suchbegriff: Titel + Beschreibung
- Technologie-Mehrfachfilter: AND
- Default-Sortierung: `erstelltAm,desc`
- Default `page`: 0
- Default `size`: 20
- Maximum `size`: 50

Nachrichten:

- Default `size`: 50
- Maximum `size`: 100

Pagination-Metadaten werden berechnet und nicht gespeichert.

---

## 13. Soft Delete

Anzeigen werden im MVP per Soft Delete gelöscht.

`geloescht_am` markiert die Löschung.

Bestehende Unterhaltungen und Nachrichten bleiben erhalten.

---

## 14. Tests

### Unit-Tests

JUnit 5; Mockito nur dort, wo Isolation sinnvoll ist.

### Integrationstests

Testcontainers mit echtem PostgreSQL.

### Besonders wichtige Tests

- Registrierung und Login
- Duplicate E-Mail
- Eigentümer-Prüfungen
- öffentliche Sichtbarkeit eigener Anzeigen
- Anzeige schließen
- Soft Delete
- Filter und Pagination
- Unterhaltung nur für Teilnehmer
- keine Unterhaltung mit eigener Anzeige
- keine neue Unterhaltung für CLOSED
- Nachrichtenberechtigungen
- Validierungsfehler

---

## 15. Frontend-Integration

Die Mockups sind visuelle Referenz.

Für das Frontend gelten zusätzlich die Regeln in:

`docs/design/frontend-vorgaben.md`

Das Frontend darf keine API-Endpunkte erfinden, die nicht im `api-contract.md` stehen.

Nicht funktionale MVP-Elemente:

- Notification-Bell
- Profilbild-Upload
- Datei-Anhang im Chat

---

## 16. Implementierungsreihenfolge

```text
Spring Initializr
↓
Projektstruktur
↓
PostgreSQL + Docker Compose
↓
Flyway
↓
Benutzer + Registrierung
↓
Session Security + CSRF + CORS
↓
Profil
↓
Kategorien + Technologien
↓
Anzeigen
↓
Suche + Filter + Pagination
↓
Unterhaltungen
↓
Nachrichten
↓
Testcontainers
↓
OpenAPI / Swagger
↓
GitHub Actions
↓
Backend dockerisieren
```

---

## 17. Nächster Schritt

Nach Abschluss dieser Dokumentation kann das Backend mit Spring Initializr erstellt werden.

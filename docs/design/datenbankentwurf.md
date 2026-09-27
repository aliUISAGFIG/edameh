# Datenbankentwurf – Edameh

## Übersicht

```text
benutzer
├── profile
│   └── profil_technologien
│       └── technologien
└── anzeigen
    ├── kategorien
    ├── anzeige_technologien
    │   └── technologien
    └── unterhaltungen
        └── nachrichten
```

Die Längenangaben dienen als verbindliche Grundlage für Validierung und Datenbankschema. Die endgültige SQL-Umsetzung erfolgt mit Flyway.

---

## Tabelle: benutzer

| Spalte | Typ | Regeln | Beschreibung |
|---|---|---|---|
| id | BIGINT | PRIMARY KEY | Eindeutige ID |
| e_mail | VARCHAR(254) | NOT NULL, UNIQUE | E-Mail für Anmeldung |
| passwort_hash | VARCHAR(255) | NOT NULL | Passwort-Hash |
| anzeigename | VARCHAR(50) | NOT NULL | Öffentlicher Anzeigename |
| erstellt_am | TIMESTAMP | NOT NULL | Registrierung |
| aktualisiert_am | TIMESTAMP | NOT NULL | Letzte Änderung |

### Geschäftsregeln

- `e_mail` ist eindeutig.
- Anzeigename: 3–50 Zeichen.
- Änderungen über `PUT /api/profile/ich` werden weiterhin in `benutzer.anzeigename` gespeichert; `profile` erhält dafür keine zusätzliche Spalte.
- Passwort wird niemals im Klartext gespeichert.
- Passwortbestätigung wird nicht gespeichert.

---

## Tabelle: profile

| Spalte | Typ | Regeln | Beschreibung |
|---|---|---|---|
| id | BIGINT | PRIMARY KEY | Eindeutige Profil-ID |
| benutzer_id | BIGINT | NOT NULL, UNIQUE, FOREIGN KEY | Verweis auf `benutzer.id` |
| ueber_mich | VARCHAR(1000) | optional | Profilbeschreibung |
| standort | VARCHAR(120) | optional | Standort |
| arbeitsweise | VARCHAR(20) | optional | Bevorzugte Arbeitsweise |
| github_link | VARCHAR(500) | optional | GitHub-Link |
| linkedin_link | VARCHAR(500) | optional | LinkedIn-Link |
| erstellt_am | TIMESTAMP | NOT NULL | Profilerstellung |
| aktualisiert_am | TIMESTAMP | NOT NULL | Letzte Änderung |

### Geschäftsregeln

- Pro Benutzer existiert genau ein Profil.
- `arbeitsweise`: `REMOTE`, `VOR_ORT` oder `HYBRID`.
- Beim Registrieren wird ein leeres Profil erstellt.

---

## Tabelle: kategorien

| Spalte | Typ | Regeln | Beschreibung |
|---|---|---|---|
| id | BIGINT | PRIMARY KEY | Eindeutige Kategorie-ID |
| name | VARCHAR(50) | NOT NULL, UNIQUE | Kategoriename |

### Beispiele

- BACKEND
- FRONTEND
- FULL_STACK
- MOBILE
- DEVOPS
- UI_UX
- SONSTIGES

---

## Tabelle: anzeigen

| Spalte | Typ | Regeln | Beschreibung |
|---|---|---|---|
| id | BIGINT | PRIMARY KEY | Eindeutige Anzeige-ID |
| eigentuemer_id | BIGINT | NOT NULL, FOREIGN KEY | Verweis auf `benutzer.id` |
| kategorie_id | BIGINT | NOT NULL, FOREIGN KEY | Verweis auf `kategorien.id` |
| titel | VARCHAR(120) | NOT NULL | Titel |
| beschreibung | VARCHAR(5000) | NOT NULL | Beschreibung |
| anzeigentyp | VARCHAR(40) | NOT NULL | Art der Anzeige |
| projektstand | VARCHAR(40) | NOT NULL | Projektstand |
| arbeitsweise | VARCHAR(20) | NOT NULL | Zusammenarbeit |
| standort | VARCHAR(120) | optional | Standort |
| projektlink | VARCHAR(500) | optional | Projektlink |
| status | VARCHAR(20) | NOT NULL | `ACTIVE` oder `CLOSED` |
| erstellt_am | TIMESTAMP | NOT NULL | Erstellung |
| aktualisiert_am | TIMESTAMP | NOT NULL | Letzte Änderung |
| geschlossen_am | TIMESTAMP | optional | Zeitpunkt des Schließens |
| geloescht_am | TIMESTAMP | optional | Zeitpunkt des Soft Deletes |

### Erlaubte Werte

`anzeigentyp`:

- `UNTERSTUETZUNG_GESUCHT`
- `PROJEKT_GESUCHT`

`projektstand`:

- `IDEE_PLANUNG`
- `IN_ENTWICKLUNG`
- `PROTOTYP_VORHANDEN`

`arbeitsweise`:

- `REMOTE`
- `VOR_ORT`
- `HYBRID`

`status`:

- `ACTIVE`
- `CLOSED`

### Geschäftsregeln

- Titel: 5–120 Zeichen.
- Beschreibung: 20–5000 Zeichen.
- Kategorie ist erforderlich.
- Projektstand ist erforderlich.
- Mindestens eine und höchstens zehn Technologien werden einer Anzeige zugeordnet.
- Bei `VOR_ORT` und `HYBRID` ist `standort` erforderlich.
- Neue Anzeigen erhalten `ACTIVE`.
- Geschlossene Anzeigen setzen `geschlossen_am`.
- Löschen erfolgt als Soft Delete über `geloescht_am`.
- Gelöschte Anzeigen werden in normalen Benutzerabfragen ausgeschlossen.
- Anzeigendetails mit `status = ACTIVE` und ohne `geloescht_am` sind öffentlich sichtbar.
- Anzeigendetails mit `status = CLOSED` und ohne `geloescht_am` sind nur für den Eigentümer oder Teilnehmer einer bestehenden Unterhaltung zu dieser Anzeige sichtbar. Die Berechtigung wird anhand von `eigentuemer_id` und `unterhaltungen` geprüft.
- Ist `geloescht_am` gesetzt, liefert der Detailabruf immer `404 Not Found`, unabhängig von Eigentümerschaft oder Unterhaltungsteilnahme.

---

## Tabelle: technologien

| Spalte | Typ | Regeln | Beschreibung |
|---|---|---|---|
| id | BIGINT | PRIMARY KEY | Eindeutige Technologie-ID |
| name | VARCHAR(80) | NOT NULL, UNIQUE | Name |

Technologien werden kontrolliert gepflegt und im MVP nicht als freier Benutzertext angelegt.

---

## Tabelle: anzeige_technologien

| Spalte | Typ | Regeln | Beschreibung |
|---|---|---|---|
| anzeige_id | BIGINT | NOT NULL, FOREIGN KEY | Verweis auf `anzeigen.id` |
| technologie_id | BIGINT | NOT NULL, FOREIGN KEY | Verweis auf `technologien.id` |

**Primärschlüssel:** (`anzeige_id`, `technologie_id`)

Dies verhindert doppelte Technologie-Zuordnungen innerhalb derselben Anzeige.

---

## Tabelle: profil_technologien

| Spalte | Typ | Regeln | Beschreibung |
|---|---|---|---|
| profil_id | BIGINT | NOT NULL, FOREIGN KEY | Verweis auf `profile.id` |
| technologie_id | BIGINT | NOT NULL, FOREIGN KEY | Verweis auf `technologien.id` |

**Primärschlüssel:** (`profil_id`, `technologie_id`)

Für ein Profil sind im MVP höchstens 20 Technologien vorgesehen.

---

## Tabelle: unterhaltungen

| Spalte | Typ | Regeln | Beschreibung |
|---|---|---|---|
| id | BIGINT | PRIMARY KEY | Eindeutige Unterhaltung-ID |
| anzeige_id | BIGINT | NOT NULL, FOREIGN KEY | Verweis auf `anzeigen.id` |
| eigentuemer_id | BIGINT | NOT NULL, FOREIGN KEY | Verweis auf `benutzer.id` |
| interessent_id | BIGINT | NOT NULL, FOREIGN KEY | Verweis auf `benutzer.id` |
| erstellt_am | TIMESTAMP | NOT NULL | Erstellung |
| aktualisiert_am | TIMESTAMP | NOT NULL | Letzte Änderung |

### Constraints

- `UNIQUE (anzeige_id, interessent_id)`
- `eigentuemer_id <> interessent_id`
- `eigentuemer_id` muss zum Eigentümer der referenzierten Anzeige passen; diese fachliche Konsistenz wird im Service geprüft.

### Geschäftsregeln

- Eine geschlossene oder gelöschte Anzeige erlaubt keine neue Unterhaltung.
- Der Start-Endpoint prüft `status = ACTIVE` und ein nicht gesetztes `geloescht_am` vor einer Wiederverwendung. Bei geschlossenen oder gelöschten Anzeigen liefert er immer `409 Conflict`, auch wenn bereits eine Unterhaltung existiert.
- Bestehende Unterhaltungen bleiben erhalten.
- Nach dem Schließen bleiben bestehende Unterhaltungen nutzbar und werden direkt über die Unterhaltungs-Endpunkte geöffnet.
- Nur Eigentümer und Interessent dürfen zugreifen.

---

## Tabelle: nachrichten

| Spalte | Typ | Regeln | Beschreibung |
|---|---|---|---|
| id | BIGINT | PRIMARY KEY | Eindeutige Nachricht-ID |
| unterhaltung_id | BIGINT | NOT NULL, FOREIGN KEY | Verweis auf `unterhaltungen.id` |
| absender_id | BIGINT | NOT NULL, FOREIGN KEY | Verweis auf `benutzer.id` |
| inhalt | VARCHAR(2000) | NOT NULL | Textnachricht |
| gesendet_am | TIMESTAMP | NOT NULL | Versandzeitpunkt |
| gelesen | BOOLEAN | NOT NULL | Lesestatus |

### Geschäftsregeln

- Nachrichteninhalt: 1–2000 Zeichen.
- Eine neue Nachricht startet mit `gelesen = false`.
- `absender_id` muss Teilnehmer der Unterhaltung sein.

---

## Wichtige Indizes

- `anzeigen(eigentuemer_id)`
- `anzeigen(kategorie_id)`
- `anzeigen(status, geloescht_am)`
- `anzeigen(erstellt_am)`
- `anzeige_technologien(technologie_id, anzeige_id)`
- `unterhaltungen(anzeige_id)`
- `unterhaltungen(eigentuemer_id)`
- `unterhaltungen(interessent_id)`
- `nachrichten(unterhaltung_id, gesendet_am)`
- `nachrichten(unterhaltung_id, gelesen)`

Die konkrete Umsetzung erfolgt mit Flyway.

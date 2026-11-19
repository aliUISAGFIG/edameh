# Datenbankentwurf – Edameh

## Übersicht

```text
benutzer
├── profile
│   └── profil\\\_technologien
│       └── technologien
└── anzeigen
    ├── kategorien
    ├── anzeige\\\_technologien
    │   └── technologien
    └── unterhaltungen
        └── nachrichten
```

Die Längenangaben dienen als verbindliche Grundlage für Validierung und Datenbankschema. Die endgültige SQL-Umsetzung erfolgt mit Flyway.

\---

## Tabelle: benutzer

|Spalte|Typ|Regeln|Beschreibung|
|-|-|-|-|
|id|BIGINT|PRIMARY KEY|Eindeutige ID|
|e\_mail|VARCHAR(254)|NOT NULL, UNIQUE|E-Mail für Anmeldung|
|passwort\_hash|VARCHAR(255)|NOT NULL|Passwort-Hash|
|anzeigename|VARCHAR(50)|NOT NULL|Öffentlicher Anzeigename|
|erstellt\_am|TIMESTAMP|NOT NULL|Registrierung|
|aktualisiert\_am|TIMESTAMP|NOT NULL|Letzte Änderung|

### Geschäftsregeln

* `e\\\_mail` ist eindeutig.
* Anzeigename: 3–50 Zeichen.
* Änderungen über `PUT /api/profile/ich` werden weiterhin in `benutzer.anzeigename` gespeichert; `profile` erhält dafür keine zusätzliche Spalte.
* Passwort wird niemals im Klartext gespeichert.
* Passwortbestätigung wird nicht gespeichert.

\---

## Tabelle: profile

|Spalte|Typ|Regeln|Beschreibung|
|-|-|-|-|
|id|BIGINT|PRIMARY KEY|Eindeutige Profil-ID|
|benutzer\_id|BIGINT|NOT NULL, UNIQUE, FOREIGN KEY|Verweis auf `benutzer.id`|
|ueber\_mich|VARCHAR(1000)|optional|Profilbeschreibung|
|standort|VARCHAR(120)|optional|Standort|
|arbeitsweise|VARCHAR(20)|optional|Bevorzugte Arbeitsweise|
|github\_link|VARCHAR(500)|optional|GitHub-Link|
|linkedin\_link|VARCHAR(500)|optional|LinkedIn-Link|
|erstellt\_am|TIMESTAMP|NOT NULL|Profilerstellung|
|aktualisiert\_am|TIMESTAMP|NOT NULL|Letzte Änderung|

### Geschäftsregeln

* Pro Benutzer existiert genau ein Profil.
* `arbeitsweise`: `REMOTE`, `VOR\\\_ORT` oder `HYBRID`.
* Beim Registrieren wird ein leeres Profil erstellt.

\---

## Tabelle: kategorien

|Spalte|Typ|Regeln|Beschreibung|
|-|-|-|-|
|id|BIGINT|PRIMARY KEY|Eindeutige Kategorie-ID|
|name|VARCHAR(50)|NOT NULL, UNIQUE|Kategoriename|

### Beispiele

* BACKEND
* FRONTEND
* FULL\_STACK
* MOBILE
* DEVOPS
* UI\_UX
* SONSTIGES

\---

## Tabelle: anzeigen

|Spalte|Typ|Regeln|Beschreibung|
|-|-|-|-|
|id|BIGINT|PRIMARY KEY|Eindeutige Anzeige-ID|
|eigentuemer\_id|BIGINT|NOT NULL, FOREIGN KEY|Verweis auf `benutzer.id`|
|kategorie\_id|BIGINT|NOT NULL, FOREIGN KEY|Verweis auf `kategorien.id`|
|titel|VARCHAR(120)|NOT NULL|Titel|
|beschreibung|VARCHAR(5000)|NOT NULL|Beschreibung|
|anzeigentyp|VARCHAR(40)|NOT NULL|Art der Anzeige|
|projektstand|VARCHAR(40)|NOT NULL|Projektstand|
|arbeitsweise|VARCHAR(20)|NOT NULL|Zusammenarbeit|
|standort|VARCHAR(120)|optional|Standort|
|projektlink|VARCHAR(500)|optional|Projektlink|
|status|VARCHAR(20)|NOT NULL|`ACTIVE` oder `CLOSED`|
|erstellt\_am|TIMESTAMP|NOT NULL|Erstellung|
|aktualisiert\_am|TIMESTAMP|NOT NULL|Letzte Änderung|
|geschlossen\_am|TIMESTAMP|optional|Zeitpunkt des Schließens|
|geloescht\_am|TIMESTAMP|optional|Zeitpunkt des Soft Deletes|

### Erlaubte Werte

`anzeigentyp`:

* `UNTERSTUETZUNG\\\_GESUCHT`
* `PROJEKT\\\_GESUCHT`

`projektstand`:

* `IDEE\\\_PLANUNG`
* `IN\\\_ENTWICKLUNG`
* `PROTOTYP\\\_VORHANDEN`

`arbeitsweise`:

* `REMOTE`
* `VOR\\\_ORT`
* `HYBRID`

`status`:

* `ACTIVE`
* `CLOSED`

### Geschäftsregeln

* Titel: 5–120 Zeichen.
* Beschreibung: 20–5000 Zeichen.
* Kategorie ist erforderlich.
* Projektstand ist erforderlich.
* Mindestens eine und höchstens zehn Technologien werden einer Anzeige zugeordnet.
* Bei `VOR\\\_ORT` und `HYBRID` ist `standort` erforderlich.
* Neue Anzeigen erhalten `ACTIVE`.
* Geschlossene Anzeigen setzen `geschlossen\\\_am`.
* Löschen erfolgt als Soft Delete über `geloescht\\\_am`.
* Gelöschte Anzeigen werden in normalen Benutzerabfragen ausgeschlossen.
* Anzeigendetails mit `status = ACTIVE` und ohne `geloescht\\\_am` sind öffentlich sichtbar.
* Anzeigendetails mit `status = CLOSED` und ohne `geloescht\\\_am` sind nur für den Eigentümer oder Teilnehmer einer bestehenden Unterhaltung zu dieser Anzeige sichtbar. Die Berechtigung wird anhand von `eigentuemer\\\_id` und `unterhaltungen` geprüft.
* Ist `geloescht\\\_am` gesetzt, liefert der Detailabruf immer `404 Not Found`, unabhängig von Eigentümerschaft oder Unterhaltungsteilnahme.

\---

## Tabelle: technologien

|Spalte|Typ|Regeln|Beschreibung|
|-|-|-|-|
|id|BIGINT|PRIMARY KEY|Eindeutige Technologie-ID|
|name|VARCHAR(80)|NOT NULL, UNIQUE|Name|

Technologien werden kontrolliert gepflegt und im MVP nicht als freier Benutzertext angelegt.

\---

## Tabelle: anzeige\_technologien

|Spalte|Typ|Regeln|Beschreibung|
|-|-|-|-|
|anzeige\_id|BIGINT|NOT NULL, FOREIGN KEY|Verweis auf `anzeigen.id`|
|technologie\_id|BIGINT|NOT NULL, FOREIGN KEY|Verweis auf `technologien.id`|

**Primärschlüssel:** (`anzeige\\\_id`, `technologie\\\_id`)

Dies verhindert doppelte Technologie-Zuordnungen innerhalb derselben Anzeige.

\---

## Tabelle: profil\_technologien

|Spalte|Typ|Regeln|Beschreibung|
|-|-|-|-|
|profil\_id|BIGINT|NOT NULL, FOREIGN KEY|Verweis auf `profile.id`|
|technologie\_id|BIGINT|NOT NULL, FOREIGN KEY|Verweis auf `technologien.id`|

**Primärschlüssel:** (`profil\\\_id`, `technologie\\\_id`)

Für ein Profil sind im MVP höchstens 20 Technologien vorgesehen.

\---

## Tabelle: unterhaltungen

|Spalte|Typ|Regeln|Beschreibung|
|-|-|-|-|
|id|BIGINT|PRIMARY KEY|Eindeutige Unterhaltung-ID|
|anzeige\_id|BIGINT|NOT NULL, FOREIGN KEY|Verweis auf `anzeigen.id`|
|eigentuemer\_id|BIGINT|NOT NULL, FOREIGN KEY|Verweis auf `benutzer.id`|
|interessent\_id|BIGINT|NOT NULL, FOREIGN KEY|Verweis auf `benutzer.id`|
|erstellt\_am|TIMESTAMP|NOT NULL|Erstellung|
|aktualisiert\_am|TIMESTAMP|NOT NULL|Letzte Änderung|

### Constraints

* `UNIQUE (anzeige\\\_id, interessent\\\_id)`
* `eigentuemer\\\_id <> interessent\\\_id`
* `eigentuemer\\\_id` muss zum Eigentümer der referenzierten Anzeige passen; diese fachliche Konsistenz wird im Service geprüft.

### Geschäftsregeln

* Eine geschlossene oder gelöschte Anzeige erlaubt keine neue Unterhaltung.
* Der Start-Endpoint prüft `status = ACTIVE` und ein nicht gesetztes `geloescht\\\_am` vor einer Wiederverwendung. Bei geschlossenen oder gelöschten Anzeigen liefert er immer `409 Conflict`, auch wenn bereits eine Unterhaltung existiert.
* Bestehende Unterhaltungen bleiben erhalten.
* Nach dem Schließen bleiben bestehende Unterhaltungen nutzbar und werden direkt über die Unterhaltungs-Endpunkte geöffnet.
* Nur Eigentümer und Interessent dürfen zugreifen.

\---

## Tabelle: nachrichten

|Spalte|Typ|Regeln|Beschreibung|
|-|-|-|-|
|id|BIGINT|PRIMARY KEY|Eindeutige Nachricht-ID|
|unterhaltung\_id|BIGINT|NOT NULL, FOREIGN KEY|Verweis auf `unterhaltungen.id`|
|absender\_id|BIGINT|NOT NULL, FOREIGN KEY|Verweis auf `benutzer.id`|
|inhalt|VARCHAR(2000)|NOT NULL|Textnachricht|
|gesendet\_am|TIMESTAMP|NOT NULL|Versandzeitpunkt|
|gelesen|BOOLEAN|NOT NULL|Lesestatus|

### Geschäftsregeln

* Nachrichteninhalt: 1–2000 Zeichen.
* Eine neue Nachricht startet mit `gelesen = false`.
* `absender\\\_id` muss Teilnehmer der Unterhaltung sein.

\---

## Wichtige Indizes

* `anzeigen(eigentuemer\\\_id)`
* `anzeigen(kategorie\\\_id)`
* `anzeigen(status, geloescht\\\_am)`
* `anzeigen(erstellt\\\_am)`
* `anzeige\\\_technologien(technologie\\\_id, anzeige\\\_id)`
* `unterhaltungen(anzeige\\\_id)`
* `unterhaltungen(eigentuemer\\\_id)`
* `unterhaltungen(interessent\\\_id)`
* `nachrichten(unterhaltung\\\_id, gesendet\\\_am)`
* `nachrichten(unterhaltung\\\_id, gelesen)`

Die konkrete Umsetzung erfolgt mit Flyway.


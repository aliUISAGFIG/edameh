# API Contract – Edameh

Dieses Dokument ist die **verbindliche Source of Truth** für die REST-API des MVP.

Ältere API-Entwürfe, insbesondere abweichende `/api/v1/...`-Varianten oder englische Endpoint-Namen, gelten als überholt.

**Basis-Pfad:** `/api`

\---

## 1\. Gemeinsame Regeln

### 1.1 Authentifizierung

Das MVP verwendet serverseitige Sessions.

* Session-Cookie: `JSESSIONID`
* `HttpOnly`: Ja
* `Secure`: Ja in Produktion
* `SameSite`: `Lax`
* Frontend-Requests verwenden `credentials: "include"`.

JWT ist im MVP nicht vorgesehen.

### 1.2 CSRF

Für zustandsändernde Requests wird CSRF-Schutz verwendet.

**Endpoint zum Initialisieren/Abrufen des Tokens**

`GET /api/csrf`

**Authentifizierung erforderlich:** Nein

Beispielantwort:

```json
{
  "token": "..."
}
```

Der Server verwendet zusätzlich das Cookie `XSRF-TOKEN`. Das Frontend sendet den Token bei `POST`, `PUT`, `PATCH` und `DELETE` im Header:

`X-XSRF-TOKEN`

### 1.3 CORS in der Entwicklung

Für die lokale Entwicklung darf das React-Frontend unter:

`http://localhost:5173`

auf das Spring-Backend zugreifen.

CORS erlaubt nur den konfigurierten Frontend-Origin und verwendet `allowCredentials = true`.

### 1.4 Einheitliches Fehlerformat

Alle API-Fehler folgen grundsätzlich diesem Format:

```json
{
  "timestamp": "2026-09-27T18:30:00Z",
  "status": 400,
  "code": "VALIDATION\\\\\\\_ERROR",
  "message": "Die Eingabedaten sind ungültig.",
  "path": "/api/anzeigen",
  "fieldErrors": {
    "titel": "Titel muss zwischen 5 und 120 Zeichen lang sein."
  }
}
```

`fieldErrors` kann leer sein.

Typische Codes:

* `VALIDATION\\\\\\\_ERROR`
* `UNAUTHORIZED`
* `FORBIDDEN`
* `NOT\\\\\\\_FOUND`
* `CONFLICT`
* `EMAIL\\\\\\\_ALREADY\\\\\\\_EXISTS`
* `INVALID\\\\\\\_CREDENTIALS`
* `ADVERTISEMENT\\\\\\\_CLOSED`

\---

## 2\. Validierungsgrenzen

|Feld|Regel|
|-|-|
|eMail|gültige E-Mail, max. 254 Zeichen|
|anzeigename|3–50 Zeichen|
|passwort|8–100 Zeichen|
|ueberMich|max. 1000 Zeichen|
|standort|max. 120 Zeichen|
|githubLink / linkedinLink|gültige URL, max. 500 Zeichen|
|titel|5–120 Zeichen|
|beschreibung|20–5000 Zeichen|
|projektlink|gültige URL, max. 500 Zeichen|
|technologieIds pro Anzeige|1–10|
|technologieIds pro Profil|0–20|
|nachrichteninhalt|1–2000 Zeichen|
|suchbegriff|max. 100 Zeichen|

\---

## 3\. Feste Enum-Werte

### Anzeigentyp

* `UNTERSTUETZUNG\\\\\\\_GESUCHT`
* `PROJEKT\\\\\\\_GESUCHT`

### Projektstand

* `IDEE\\\\\\\_PLANUNG`
* `IN\\\\\\\_ENTWICKLUNG`
* `PROTOTYP\\\\\\\_VORHANDEN`

### Arbeitsweise

* `REMOTE`
* `VOR\\\\\\\_ORT`
* `HYBRID`

### Anzeigenstatus

* `ACTIVE`
* `CLOSED`

\---

## 4\. Authentifizierung

### Registrierung

`POST /api/registrierung`

**Authentifizierung erforderlich:** Nein

```json
{
  "eMail": "ali@example.com",
  "anzeigename": "Ali",
  "passwort": "MeinSicheresPasswort123",
  "passwortBestaetigung": "MeinSicheresPasswort123"
}
```

**Erfolg:** `201 Created`

```json
{
  "id": 1,
  "eMail": "ali@example.com",
  "anzeigename": "Ali"
}
```

Nach erfolgreicher Registrierung wird der Benutzer automatisch angemeldet und ein leeres Profil erstellt.

**Fehler:** `400`, `409`

\---

### Anmeldung

`POST /api/anmeldung`

**Authentifizierung erforderlich:** Nein

```json
{
  "eMail": "ali@example.com",
  "passwort": "MeinSicheresPasswort123"
}
```

**Erfolg:** `200 OK`

```json
{
  "id": 1,
  "eMail": "ali@example.com",
  "anzeigename": "Ali"
}
```

**Fehler:** `400`, `401`

\---

### Abmeldung

`POST /api/abmeldung`

**Authentifizierung erforderlich:** Ja

**Erfolg:** `204 No Content`

\---

### Aktuell angemeldeter Benutzer

`GET /api/benutzer/ich`

**Authentifizierung erforderlich:** Ja

**Erfolg:** `200 OK`

```json
{
  "id": 1,
  "eMail": "ali@example.com",
  "anzeigename": "Ali"
}
```

\---

## 5\. Profile

### Eigenes Profil

`GET /api/profile/ich`

**Authentifizierung erforderlich:** Ja

**Erfolg:** `200 OK`

```json
{
  "benutzerId": 1,
  "anzeigename": "Ali",
  "ueberMich": "Ich interessiere mich für Backend- und Lernprojekte.",
  "standort": "Dortmund",
  "arbeitsweise": "REMOTE",
  "githubLink": "https://github.com/beispiel",
  "linkedinLink": null,
  "technologien": \\\\\\\[
    { "id": 1, "name": "Java" },
    { "id": 2, "name": "Spring Boot" }
  ],
  "statistik": {
    "aktiveAnzeigen": 3,
    "unterhaltungen": 12,
    "mitgliedSeit": "2026-03-01"
  }
}
```

Die Statistikwerte werden berechnet und nicht als eigene Profilfelder gespeichert.

\---

### Eigenes Profil bearbeiten

`PUT /api/profile/ich`

**Authentifizierung erforderlich:** Ja

```json
{
  "anzeigename": "Ali",
  "ueberMich": "Ich interessiere mich für Backend- und Lernprojekte.",
  "standort": "Dortmund",
  "arbeitsweise": "REMOTE",
  "githubLink": "https://github.com/beispiel",
  "linkedinLink": null,
  "technologieIds": \\\\\\\[1, 2, 3]
}
```

`anzeigename` darf hier bearbeitet werden und muss 3–50 Zeichen lang sein. Der Wert wird weiterhin in `benutzer.anzeigename` gespeichert, nicht in `profile`.

**Erfolg:** `200 OK`

**Fehler:** `400`, `401`, `404`

\---

### Öffentliches Profil

`GET /api/profile/{benutzerId}`

**Authentifizierung erforderlich:** Nein

**Erfolg:** `200 OK`

```json
{
  "benutzerId": 5,
  "anzeigename": "Leon",
  "ueberMich": "Ich arbeite gerne an Webprojekten.",
  "standort": "Dortmund",
  "arbeitsweise": "HYBRID",
  "githubLink": null,
  "linkedinLink": null,
  "technologien": \\\\\\\[
    { "id": 1, "name": "Java" }
  ]
}
```

Die E-Mail-Adresse wird im öffentlichen Profil nicht ausgegeben.

\---

## 6\. Auswahldaten

### Kategorien laden

`GET /api/kategorien`

**Authentifizierung erforderlich:** Nein

```json
\\\\\\\[
  { "id": 1, "name": "BACKEND" },
  { "id": 2, "name": "FRONTEND" },
  { "id": 3, "name": "FULL\\\\\\\_STACK" }
]
```

\---

### Technologien laden

`GET /api/technologien`

**Authentifizierung erforderlich:** Nein

Optional:

`GET /api/technologien?suchbegriff=spring`

`suchbegriff` filtert Technologien case-insensitiv nach Name.

```json
\\\\\\\[
  { "id": 1, "name": "Java" },
  { "id": 2, "name": "Spring Boot" }
]
```

Frontend-Formulare verwenden diese Endpoints statt hardcodierter Kategorien oder Technologien.

\---

## 7\. Anzeigen

### Öffentliche Anzeigenliste

`GET /api/anzeigen`

**Authentifizierung erforderlich:** Nein

### Query-Parameter

|Parameter|Bedeutung|Standard|
|-|-|-|
|suchbegriff|Suche in `titel` und `beschreibung`, case-insensitiv|–|
|kategorieId|exakte Kategorie|–|
|technologieIds|kommaseparierte IDs; **AND-Semantik**|–|
|standort|case-insensitive Textsuche|–|
|arbeitsweise|exakter Enum-Wert|–|
|page|Seitennummer, ab 0|`0`|
|size|Seitengröße|`20`|
|sort|erlaubte Sortierung|`erstelltAm,desc`|

**Maximale Seitengröße:** `50`

Erlaubte Sortierungen:

* `erstelltAm,desc`
* `erstelltAm,asc`

Beispiel:

`GET /api/anzeigen?suchbegriff=java\\\\\\\&kategorieId=1\\\\\\\&technologieIds=1,2\\\\\\\&arbeitsweise=REMOTE\\\\\\\&page=0\\\\\\\&size=20\\\\\\\&sort=erstelltAm,desc`

Bei mehreren `technologieIds` muss eine Anzeige **alle** ausgewählten Technologien enthalten.

**Erfolg:** `200 OK`

```json
{
  "content": \\\\\\\[
    {
      "id": 15,
      "titel": "Backend-Unterstützung für Lernprojekt gesucht",
      "beschreibungKurz": "Ich suche Unterstützung für mein Spring-Boot-Projekt.",
      "anzeigename": "Leon",
      "kategorie": { "id": 1, "name": "BACKEND" },
      "technologien": \\\\\\\[
        { "id": 1, "name": "Java" },
        { "id": 2, "name": "Spring Boot" }
      ],
      "projektstand": "IN\\\\\\\_ENTWICKLUNG",
      "arbeitsweise": "REMOTE",
      "standort": null,
      "status": "ACTIVE",
      "erstelltAm": "2026-09-26T15:30:00"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

### Sichtbarkeitsregeln

* Gäste sehen alle `ACTIVE`, nicht gelöschten Anzeigen.
* Angemeldete Benutzer sehen öffentlich nur `ACTIVE`, nicht gelöschte Anzeigen **anderer** Benutzer.
* In Anzeigenlisten erscheinen eigene Anzeigen ausschließlich unter `/api/anzeigen/meine`. Der Detailabruf folgt den untenstehenden Zugriffsregeln.

\---

### Anzeigendetails

`GET /api/anzeigen/{id}`

**Authentifizierung erforderlich:** Für `ACTIVE` und nicht gelöschte Anzeigen nein; für `CLOSED` und nicht gelöschte Anzeigen ja.

### Zugriffsregeln

* `ACTIVE` und nicht gelöscht: öffentlich sichtbar.
* `CLOSED` und nicht gelöscht: ausschließlich für den Eigentümer und Benutzer sichtbar, die bereits Teilnehmer einer Unterhaltung zu dieser Anzeige sind.
* Soft-gelöscht: `404 Not Found`, auch für Eigentümer und bisherige Unterhaltungsteilnehmer. Diese Regel hat Vorrang vor dem Anzeigenstatus.

**Erfolg:** `200 OK`

```json
{
  "id": 15,
  "eigentuemer": {
    "id": 5,
    "anzeigename": "Leon"
  },
  "kategorie": {
    "id": 1,
    "name": "BACKEND"
  },
  "titel": "Backend-Unterstützung für Lernprojekt gesucht",
  "beschreibung": "Ich suche Unterstützung für mein Spring-Boot-Projekt.",
  "anzeigentyp": "UNTERSTUETZUNG\\\\\\\_GESUCHT",
  "projektstand": "IN\\\\\\\_ENTWICKLUNG",
  "arbeitsweise": "REMOTE",
  "standort": null,
  "projektlink": null,
  "status": "ACTIVE",
  "technologien": \\\\\\\[
    { "id": 1, "name": "Java" },
    { "id": 2, "name": "Spring Boot" }
  ],
  "erstelltAm": "2026-09-26T15:30:00",
  "aktualisiertAm": "2026-09-26T15:30:00"
}
```

Gelöschte Anzeigen liefern `404 Not Found`.

\---

### Anzeige erstellen

`POST /api/anzeigen`

**Authentifizierung erforderlich:** Ja

```json
{
  "titel": "Backend-Unterstützung für Lernprojekt gesucht",
  "beschreibung": "Ich suche Unterstützung für mein Spring-Boot-Projekt.",
  "anzeigentyp": "UNTERSTUETZUNG\\\\\\\_GESUCHT",
  "kategorieId": 1,
  "projektstand": "IN\\\\\\\_ENTWICKLUNG",
  "arbeitsweise": "REMOTE",
  "standort": null,
  "projektlink": null,
  "technologieIds": \\\\\\\[1, 2, 3]
}
```

**Erfolg:** `201 Created`

```json
{
  "id": 15
}
```

### Geschäftsregeln

* Eigentümer wird aus der Session bestimmt.
* `eigentuemerId` wird vom Client nicht akzeptiert.
* Neue Anzeige erhält `ACTIVE`.
* `VOR\\\\\\\_ORT` und `HYBRID` benötigen `standort`.
* Kategorie und alle Technologie-IDs müssen existieren.

\---

### Meine Anzeigen

`GET /api/anzeigen/meine`

**Authentifizierung erforderlich:** Ja

Optionale Parameter:

* `status=ACTIVE`
* `status=CLOSED`
* `page=0`
* `size=20`
* `sort=erstelltAm,desc`

**Erfolg:** `200 OK`

```json
{
  "content": \\\\\\\[
    {
      "id": 15,
      "titel": "React-Frontend für Lernplattform gesucht",
      "beschreibungKurz": "Das Backend mit Spring Boot steht bereits.",
      "kategorie": { "id": 2, "name": "FRONTEND" },
      "technologien": \\\\\\\[
        { "id": 8, "name": "React" },
        { "id": 9, "name": "TypeScript" },
        { "id": 2, "name": "Spring Boot" }
      ],
      "projektstand": "PROTOTYP\\\\\\\_VORHANDEN",
      "arbeitsweise": "REMOTE",
      "standort": null,
      "status": "ACTIVE",
      "erstelltAm": "2026-03-12T10:00:00"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

Damit enthält die Response alle Daten, die die aktuelle „Meine Anzeigen“-UI pro Zeile benötigt.

\---

### Anzeige bearbeiten

`PUT /api/anzeigen/{id}`

**Authentifizierung erforderlich:** Ja

Request entspricht fachlich dem Erstellen-Request.

**Erfolg:** `200 OK`

**Fehler:** `400`, `401`, `403`, `404`

Nur der Eigentümer darf bearbeiten. Eigentümer und Status können hier nicht geändert werden.

\---

### Anzeige schließen

`POST /api/anzeigen/{id}/schliessen`

**Authentifizierung erforderlich:** Ja

**Erfolg:** `204 No Content`

* Nur Eigentümer.
* Status wird `CLOSED`.
* `geschlossen\\\\\\\_am` wird gesetzt.
* Keine neuen Unterhaltungen.
* Bestehende Unterhaltungen bleiben nutzbar.

\---

### Anzeige löschen

`DELETE /api/anzeigen/{id}`

**Authentifizierung erforderlich:** Ja

**Erfolg:** `204 No Content`

Das Löschen ist ein Soft Delete. `geloescht\\\\\\\_am` wird gesetzt.

\---

## 8\. Unterhaltungen

### Unterhaltung starten

`POST /api/anzeigen/{anzeigeId}/unterhaltungen`

**Authentifizierung erforderlich:** Ja

Kein Request-Body.

Der Endpoint darf ausschließlich für `ACTIVE`, nicht gelöschte Anzeigen verwendet werden.

**Neue Unterhaltung bei aktiver Anzeige:** `201 Created`

**Bereits vorhanden bei aktiver Anzeige:** `200 OK`

```json
{
  "id": 7,
  "anzeigeId": 15
}
```

### Geschäftsregeln

* Eigene Anzeige: `409 Conflict`.
* Geschlossene oder gelöschte Anzeige: immer `409 Conflict`, auch wenn bereits eine Unterhaltung existiert. Diese Prüfung erfolgt vor einer Wiederverwendung.
* Pro Anzeige und Interessent höchstens eine Unterhaltung.
* Bestehende Unterhaltung wird nur bei `ACTIVE`, nicht gelöschter Anzeige wiederverwendet.
* Bestehende Unterhaltungen werden direkt über die Unterhaltungs-Endpunkte geöffnet, insbesondere `GET /api/unterhaltungen/{id}`. Bei geschlossenen Anzeigen wird dazu nicht dieser Start-Endpoint verwendet.

\---

### Eigene Unterhaltungen

`GET /api/unterhaltungen`

**Authentifizierung erforderlich:** Ja

**Erfolg:** `200 OK`

```json
\\\\\\\[
  {
    "id": 7,
    "anzeige": {
      "id": 15,
      "titel": "Java-Projekt zum Mitmachen"
    },
    "anderePerson": {
      "id": 5,
      "anzeigename": "Leon"
    },
    "letzteNachricht": {
      "inhalt": "Klingt interessant!",
      "gesendetAm": "2026-09-26T16:10:00"
    },
    "ungeleseneNachrichten": 2
  }
]
```

\---

### Unterhaltung anzeigen

`GET /api/unterhaltungen/{id}`

**Authentifizierung erforderlich:** Ja

Nur Teilnehmer erhalten die Unterhaltung.

Bestehende Unterhaltungen werden direkt über diesen Endpoint geöffnet, auch nach dem Schließen der Anzeige. Die Übersicht wird über `GET /api/unterhaltungen` geladen.

**Fehler:** `401`, `403`, `404`

\---

## 9\. Nachrichten

### Nachrichten laden

`GET /api/unterhaltungen/{id}/nachrichten?page=0\\\\\\\&size=50`

**Authentifizierung erforderlich:** Ja

Standard:

* `page = 0`
* `size = 50`
* maximale `size = 100`

**Erfolg:** `200 OK`

```json
{
  "content": \\\\\\\[
    {
      "id": 101,
      "absender": {
        "id": 12,
        "anzeigename": "Ali"
      },
      "inhalt": "Hallo, dein Projekt klingt interessant.",
      "gesendetAm": "2026-09-26T16:00:00",
      "gelesen": true
    }
  ],
  "page": 0,
  "size": 50,
  "totalElements": 1,
  "totalPages": 1
}
```

`page`, `size`, `totalElements` und `totalPages` sind Pagination-Metadaten und werden nicht als Nachrichtenspalten gespeichert.

\---

### Nachricht senden

`POST /api/unterhaltungen/{id}/nachrichten`

**Authentifizierung erforderlich:** Ja

```json
{
  "inhalt": "Hallo, dein Projekt klingt interessant."
}
```

**Erfolg:** `201 Created`

Der Absender wird aus der Session bestimmt. `absenderId` wird nicht vom Client akzeptiert.

\---

### Als gelesen markieren

`PATCH /api/unterhaltungen/{id}/gelesen`

**Authentifizierung erforderlich:** Ja

**Erfolg:** `204 No Content`

Nur Nachrichten des anderen Teilnehmers werden als gelesen markiert.

\---

## 10\. UI-Funktionen ohne Backend im MVP

Die folgenden Elemente der Mockups besitzen im MVP bewusst keinen funktionalen Backend-Endpoint:

* Notification-Bell
* Profilbild-/Kamera-Upload
* Datei-Anhang im Nachrichtenbereich

Das Frontend soll diese Elemente für die erste Version ausblenden oder deaktiviert darstellen. Es darf dafür keine nicht dokumentierten Endpoints erfinden.


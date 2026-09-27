# Domänenmodell – Edameh

## 1. Zweck

Dieses Dokument beschreibt die zentralen fachlichen Konzepte von Edameh, ihre Beziehungen und die wichtigsten Geschäftsregeln. Das Modell ist unabhängig von JPA und der konkreten Datenbankimplementierung.

## 2. Zentrale Domänenobjekte

- Benutzer
- Profil
- Anzeige
- Kategorie
- Technologie
- Unterhaltung
- Nachricht

---

## 3. Benutzer

Ein `Benutzer` repräsentiert ein registriertes Konto.

### Wichtige Eigenschaften

- id
- eMail
- passwortHash
- anzeigename
- erstelltAm
- aktualisiertAm

### Beziehungen

- Ein Benutzer besitzt genau ein Profil.
- Ein Benutzer kann mehrere Anzeigen erstellen.
- Ein Benutzer kann an mehreren Unterhaltungen beteiligt sein.
- Ein Benutzer kann mehrere Nachrichten senden.

---

## 4. Profil

Ein `Profil` enthält die öffentlich sichtbaren Informationen eines Benutzers.

### Wichtige Eigenschaften

- id
- ueberMich
- standort
- arbeitsweise
- githubLink
- linkedinLink
- erstelltAm
- aktualisiertAm

### Beziehungen

- Jedes Profil gehört genau zu einem Benutzer.
- Ein Profil kann mehrere Technologien enthalten.

### Geschäftsregeln

- Beim Erstellen eines Benutzerkontos wird ein leeres Profil angelegt.
- Der Anzeigename darf über die Profilbearbeitung geändert werden (3–50 Zeichen). Er bleibt eine Eigenschaft des Benutzers und wird in `benutzer.anzeigename` gespeichert.
- E-Mail und Passwort gehören nicht in das öffentliche Profil.
- Im MVP existiert kein Profilbild-Upload; Initialen werden aus dem Anzeigenamen erzeugt.

---

## 5. Kategorie

Eine `Kategorie` ordnet eine Anzeige einem fachlichen Bereich zu.

### Beispiele

- BACKEND
- FRONTEND
- MOBILE
- DEVOPS
- UI_UX
- FULL_STACK
- SONSTIGES

### Wichtige Eigenschaften

- id
- name

### Beziehungen

- Eine Kategorie kann mehreren Anzeigen zugeordnet sein.
- Jede Anzeige gehört genau zu einer Kategorie.

---

## 6. Anzeige

Eine `Anzeige` repräsentiert ein Kooperationsgesuch.

### Wichtige Eigenschaften

- id
- titel
- beschreibung
- anzeigentyp
- projektstand
- arbeitsweise
- standort
- projektlink
- status
- erstelltAm
- aktualisiertAm
- geschlossenAm
- geloeschtAm

### Anzeigentyp

- `UNTERSTUETZUNG_GESUCHT`
- `PROJEKT_GESUCHT`

### Projektstand

- `IDEE_PLANUNG`
- `IN_ENTWICKLUNG`
- `PROTOTYP_VORHANDEN`

### Arbeitsweise

- `REMOTE`
- `VOR_ORT`
- `HYBRID`

### Status

- `ACTIVE`
- `CLOSED`

### Beziehungen

- Jede Anzeige besitzt genau einen Eigentümer.
- Jede Anzeige gehört genau zu einer Kategorie.
- Eine Anzeige kann mehrere Technologien enthalten.
- Zu einer Anzeige können mehrere Unterhaltungen entstehen.

### Geschäftsregeln

- Neue Anzeigen starten mit `ACTIVE`.
- Nur der Eigentümer darf bearbeiten, schließen oder löschen.
- `VOR_ORT` und `HYBRID` benötigen einen Standort.
- Aktive, nicht gelöschte Anzeigendetails sind öffentlich sichtbar.
- Geschlossene, nicht gelöschte Anzeigen erscheinen nicht in der öffentlichen Liste. Ihre Details sind nur für den Eigentümer und Benutzer sichtbar, die bereits Teilnehmer einer Unterhaltung zu dieser Anzeige sind.
- Gelöschte Anzeigen werden per Soft Delete ausgeblendet. Ihr Detailabruf liefert für alle Benutzer `404 Not Found`.
- Eigene Anzeigen erscheinen nicht in der öffentlichen Anzeigenliste.

---

## 7. Technologie

Eine `Technologie` repräsentiert eine auswählbare Technologie oder einen Skill.

### Beispiele

- Java
- Spring Boot
- PostgreSQL
- Docker
- React
- TypeScript

### Wichtige Eigenschaften

- id
- name

### Beziehungen

- Eine Anzeige kann mehrere Technologien enthalten.
- Eine Technologie kann in mehreren Anzeigen verwendet werden.
- Ein Profil kann mehrere Technologien enthalten.
- Eine Technologie kann in mehreren Profilen verwendet werden.

Technologien werden aus einem kontrollierten serverseitigen Katalog ausgewählt. Freitext-Technologien sind im MVP nicht vorgesehen.

---

## 8. Unterhaltung

Eine `Unterhaltung` repräsentiert private Kommunikation im Kontext genau einer Anzeige.

### Wichtige Eigenschaften

- id
- erstelltAm
- aktualisiertAm

### Beziehungen

- Jede Unterhaltung gehört genau zu einer Anzeige.
- Jede Unterhaltung besteht aus dem Eigentümer der Anzeige und genau einem Interessenten.
- Eine Unterhaltung kann mehrere Nachrichten enthalten.

### Geschäftsregeln

- Eigentümer und Interessent dürfen nicht dieselbe Person sein.
- Für dieselbe Anzeige und denselben Interessenten existiert höchstens eine Unterhaltung.
- Nur die beiden Teilnehmer dürfen die Unterhaltung lesen und verwenden.
- Der Start-Endpoint darf nur bei aktiven, nicht gelöschten Anzeigen verwendet werden; nur dann wird eine bestehende Unterhaltung wiederverwendet.
- Bei geschlossenen oder gelöschten Anzeigen liefert der Start-Endpoint immer `409 Conflict`, auch bei bereits bestehender Unterhaltung.
- Bestehende Unterhaltungen bleiben nach dem Schließen nutzbar und werden direkt über die Unterhaltungs-Endpunkte geöffnet.

---

## 9. Nachricht

Eine `Nachricht` repräsentiert eine Textnachricht innerhalb einer Unterhaltung.

### Wichtige Eigenschaften

- id
- inhalt
- gesendetAm
- gelesen

### Beziehungen

- Jede Nachricht gehört genau zu einer Unterhaltung.
- Jede Nachricht besitzt genau einen Absender.

### Geschäftsregeln

- Nur Teilnehmer einer Unterhaltung dürfen Nachrichten senden.
- Im MVP werden nur Textnachrichten gespeichert.
- Eine neue Nachricht startet mit `gelesen = false`.

---

## 10. Beziehungen im Überblick

```text
Benutzer 1 ───────── 1 Profil
Benutzer 1 ───────── 0..* Anzeige
Kategorie 1 ──────── 0..* Anzeige
Anzeige 0..* ─────── 0..* Technologie
Profil 0..* ───────── 0..* Technologie
Anzeige 1 ─────────── 0..* Unterhaltung
Unterhaltung 1 ────── 0..* Nachricht
Benutzer 1 ────────── 0..* Nachricht (als Absender)
```

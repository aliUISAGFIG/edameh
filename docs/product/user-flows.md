# User Flows – Edameh

## Flow 1 – Registrierung und Anmeldung

```text
Startseite
  ↓
Registrieren
  ↓
E-Mail + Anzeigename + Passwort + Passwort bestätigen
  ↓
Validierung
  ├─ ungültig → Feldfehler anzeigen
  ├─ E-Mail vergeben → Konflikt anzeigen
  └─ gültig
       ↓
Benutzerkonto erstellen
       ↓
Leeres Profil erstellen
       ↓
Benutzer automatisch anmelden
       ↓
Anzeigenliste
```

### Anmeldung

```text
Startseite
  ↓
Anmelden
  ↓
E-Mail + Passwort
  ↓
Daten korrekt?
  ├─ Nein → Fehlermeldung
  └─ Ja → Session erstellen → Anzeigenliste
```

### Abmeldung

```text
Angemeldeter Benutzer
  ↓
Abmelden
  ↓
Session beenden
  ↓
Startseite
```

---

## Flow 2 – Anzeige veröffentlichen

```text
Angemeldeter Benutzer
  ↓
Anzeige aufgeben
  ↓
Formular ausfüllen
  ├─ Titel
  ├─ Anzeigentyp
  ├─ Kategorie
  ├─ Beschreibung
  ├─ Projektstand
  ├─ Technologien
  ├─ Arbeitsweise
  ├─ Standort, falls erforderlich
  └─ Projektlink optional
  ↓
Validierung
  ├─ Fehler → Formular mit Feldfehlern
  └─ gültig
       ↓
Anzeige erstellen
       ↓
Status ACTIVE
       ↓
Anzeigendetails
```

### Anzeigentypen

- `UNTERSTUETZUNG_GESUCHT`
- `PROJEKT_GESUCHT`

### Projektstände

- `IDEE_PLANUNG`
- `IN_ENTWICKLUNG`
- `PROTOTYP_VORHANDEN`

### Arbeitsweisen

- `REMOTE`
- `VOR_ORT`
- `HYBRID`

Bei `VOR_ORT` und `HYBRID` ist ein Standort erforderlich.

---

## Flow 3 – Anzeigen suchen und finden

```text
Nutzer öffnet Anzeigenliste
  ↓
Aktive öffentliche Anzeigen laden
  ↓
Suche / Filter optional
  ├─ Suchbegriff
  ├─ Kategorie
  ├─ Technologien
  ├─ Standort
  └─ Arbeitsweise
  ↓
Sortierung + Pagination
  ↓
Ergebnis vorhanden?
  ├─ Nein → „Keine passenden Anzeigen gefunden“
  └─ Ja → Ergebnisliste
              ↓
          Anzeige auswählen
              ↓
          Anzeigendetails
```

### Sichtbarkeitsregel

- Gäste sehen alle öffentlichen, aktiven und nicht gelöschten Anzeigen.
- Angemeldete Benutzer sehen in der öffentlichen Anzeigenliste nur aktive Anzeigen anderer Benutzer.
- In Anzeigenlisten erscheinen eigene Anzeigen ausschließlich unter „Meine Anzeigen“; der Detailabruf folgt den folgenden Zugriffsregeln.
- Geschlossene Anzeigen erscheinen nicht in der öffentlichen Liste.
- Gelöschte Anzeigen erscheinen weder öffentlich noch unter „Meine Anzeigen“.

### Zugriff auf Anzeigendetails

- `ACTIVE` und nicht gelöscht: öffentlich sichtbar.
- `CLOSED` und nicht gelöscht: nur für den Eigentümer und Benutzer sichtbar, die bereits Teilnehmer einer Unterhaltung zu dieser Anzeige sind.
- Soft-gelöscht: `GET /api/anzeigen/{id}` liefert für alle Benutzer `404 Not Found`.

### Suchsemantik

- `suchbegriff` durchsucht Titel und Beschreibung, Groß-/Kleinschreibung wird ignoriert.
- Mehrere ausgewählte `technologieIds` werden mit **AND** verknüpft: Eine Anzeige muss alle ausgewählten Technologien enthalten.
- `kategorieId` filtert exakt nach einer Kategorie.
- `arbeitsweise` filtert exakt nach einem Wert.
- `standort` wird als textueller, case-insensitiver Filter verwendet.
- Standard-Sortierung: neueste Anzeigen zuerst.

---

## Flow 4 – Kontakt aufnehmen und Nachrichten schreiben

```text
Nutzer befindet sich auf fremden Anzeigendetails
  ↓
Nachricht senden
  ↓
Angemeldet?
  ├─ Nein → Anmelden → zurück zur ausgewählten Anzeige
  └─ Ja
       ↓
Anzeige ACTIVE und nicht gelöscht?
  ├─ Nein → Start-Endpoint nicht verwenden; bei Aufruf immer 409 Conflict
  └─ Ja
       ↓
Besteht Unterhaltung für diese Anzeige + diesen Interessenten?
  ├─ Ja → bestehende Unterhaltung öffnen
  └─ Nein → Unterhaltung erstellen
               ↓
           Unterhaltung öffnen
               ↓
           Textnachricht senden
```

### Geschäftsregeln

- Ein Benutzer kann keine Unterhaltung zu seiner eigenen Anzeige starten.
- Für dieselbe Anzeige und denselben Interessenten existiert höchstens eine Unterhaltung.
- Nur Eigentümer und Interessent dürfen die Unterhaltung öffnen.
- Nur Teilnehmer dürfen Nachrichten lesen und senden.
- `POST /api/anzeigen/{anzeigeId}/unterhaltungen` darf nur bei `ACTIVE`, nicht gelöschten Anzeigen verwendet werden.
- Bei geschlossenen oder gelöschten Anzeigen liefert dieser Endpoint immer `409 Conflict`, auch wenn bereits eine Unterhaltung existiert. Eine Wiederverwendung ist nur bei aktiven, nicht gelöschten Anzeigen möglich.
- Bereits bestehende Unterhaltungen bleiben nach dem Schließen der Anzeige nutzbar.
- Bestehende Unterhaltungen werden über `GET /api/unterhaltungen` ausgewählt und direkt über `GET /api/unterhaltungen/{id}` geöffnet. Bei geschlossenen Anzeigen wird dafür nicht der Start-Endpoint aufgerufen.
- Im MVP werden ausschließlich Textnachrichten unterstützt.

---

## Flow 5 – Eigene Anzeigen verwalten

```text
Angemeldeter Benutzer
  ↓
Meine Anzeigen
  ↓
Eigene ACTIVE- und CLOSED-Anzeigen laden
  ↓
Anzeige auswählen
  ↓
Eigene Anzeigendetails
  ├─ bearbeiten
  ├─ schließen
  └─ löschen
```

### Anzeige bearbeiten

Nur der Eigentümer darf die Anzeige bearbeiten. Eigentümer und Status werden nicht über den normalen Bearbeitungs-Request geändert.

### Anzeige schließen

```text
ACTIVE Anzeige
  ↓
Schließen bestätigen
  ↓
Status = CLOSED
geschlossen_am setzen
  ↓
Aus öffentlicher Liste entfernen
  ↓
Unter „Meine Anzeigen“ behalten
```

Bestehende Unterhaltungen bleiben verfügbar; neue Unterhaltungen sind nicht mehr möglich.

### Anzeige löschen

Im MVP wird Soft Delete verwendet:

```text
Eigene Anzeige
  ↓
Löschen bestätigen
  ↓
geloescht_am setzen
  ↓
Anzeige für Benutzer ausblenden
```

Unterhaltungen und Nachrichten bleiben technisch erhalten.

---

## Flow 6 – Profil

```text
Angemeldeter Benutzer
  ↓
Mein Profil
  ↓
Profilinformationen laden
  ├─ Anzeigename
  ├─ Über mich
  ├─ Standort
  ├─ bevorzugte Arbeitsweise
  ├─ Technologien
  ├─ GitHub-Link optional
  ├─ LinkedIn-Link optional
  └─ berechnete Statistik
  ↓
Profil bearbeiten
  ↓
Änderungen validieren und speichern
```

Der Anzeigename darf zusammen mit den Profilinformationen über `PUT /api/profile/ich` bearbeitet werden. Er muss 3–50 Zeichen lang sein und wird weiterhin in `benutzer.anzeigename` gespeichert.

Andere Benutzer können ein öffentliches Profil über die Benutzer-ID ansehen. E-Mail-Adresse und andere Anmeldedaten werden dort nicht ausgegeben.

# Frontend-Vorgaben – Edameh

Dieses Dokument ergänzt die Mockups und den API Contract. Es verhindert, dass ein Frontend-Generator fehlende Produktentscheidungen selbst erfindet.

## 1. Verbindliche Quellen

Reihenfolge bei Konflikten:

1. `api-contract.md` für HTTP/API-Verhalten
2. `../product/mvp.md` für Feature-Umfang
3. `../product/user-flows.md` für Abläufe
4. Mockups für Layout und visuelle Gestaltung

## 2. Navigation

Für eingeloggte Benutzer:

- Start
- Anzeigen
- Nachrichten
- Meine Anzeigen
- Mein Profil über Benutzerbereich

Für Gäste werden geschützte Aktionen auf Anmeldung/Registrierung umgeleitet.

## 3. Öffentliche Anzeigen

Angemeldete Benutzer sehen in der öffentlichen Anzeigenliste keine eigenen Anzeigen.

In Anzeigenlisten erscheinen eigene Anzeigen nur unter „Meine Anzeigen“. Für den Detailabruf gelten die Regeln aus Abschnitt 5.

## 4. Meine Anzeigen

Jede Zeile kann anzeigen:

- Titel
- Kurzbeschreibung
- Kategorie
- Technologien
- Projektstand
- Arbeitsweise
- Standort, falls vorhanden
- Status
- Erstellungsdatum

Aktionen:

- Bearbeiten
- Schließen bei `ACTIVE`
- Löschen
  Arbeitsweise wird bei Anzeigen nicht als einzelnes Dropdown dargestellt.

Der Benutzer kann eine oder mehrere Optionen auswählen:

- Remote
- Vor Ort
- Hybrid

Neben jeder Option wird ein Info-Symbol angezeigt.

Tooltip-Texte:

Remote:
"Die Zusammenarbeit findet vollständig online statt."

Vor Ort:
"Die Zusammenarbeit findet persönlich an einem gemeinsamen Ort statt."

Hybrid:
"Die Zusammenarbeit kombiniert Remote- und Vor-Ort-Termine."
## 5. Anzeigendetails

Zugriff:

- `ACTIVE` und nicht gelöscht: öffentlich sichtbar.
- `CLOSED` und nicht gelöscht: nur für den Eigentümer und Benutzer sichtbar, die bereits Teilnehmer einer Unterhaltung zu dieser Anzeige sind.
- Soft-gelöscht: Der Detailabruf liefert für alle Benutzer `404 Not Found`.

### Gast

- Details nur bei `ACTIVE`, nicht gelöschten Anzeigen sichtbar
- „Jetzt anmelden“
- „Registrieren“

### Angemeldeter Benutzer bei fremder Anzeige

- „Nachricht senden“ über den Start-Endpoint nur bei `ACTIVE`, nicht gelöschten Anzeigen
- Bei `CLOSED` können berechtigte Teilnehmer ihre bestehende Unterhaltung direkt über die Unterhaltungs-Endpunkte öffnen.

### Eigentümer

- „Anzeige bearbeiten“
- „Anzeige schließen“ nur bei `ACTIVE`
- „Anzeige löschen“
- kein „Nachricht senden“

## 6. Mein Profil

Angezeigt werden:

- Initialen statt hochgeladenem Profilbild
- Anzeigename
- Standort
- Über mich
- bevorzugte Arbeitsweise
- Technologien
- GitHub / LinkedIn optional
- Anzahl aktiver Anzeigen
- Anzahl Unterhaltungen
- Mitglied seit

Die Statistik wird vom Backend berechnet.

Der Anzeigename ist in der Profilbearbeitung änderbar. `PUT /api/profile/ich` übermittelt dazu `anzeigename` mit 3–50 Zeichen; gespeichert wird der Wert weiterhin in `benutzer.anzeigename`.

## 7. Nachrichten

Bestehende Unterhaltungen werden über `GET /api/unterhaltungen` ausgewählt und direkt über `GET /api/unterhaltungen/{id}` geöffnet. Der Start-Endpoint `POST /api/anzeigen/{anzeigeId}/unterhaltungen` liefert bei `CLOSED` oder gelöschten Anzeigen immer `409 Conflict`, auch bei bereits bestehender Unterhaltung. Er darf dort nicht zum Öffnen verwendet werden.

Im MVP:

- Textnachrichten
- Liste der Unterhaltungen
- letzte Nachricht
- Zeitstempel
- ungelesene Anzahl
- gelesen/ungelesen

Nicht implementieren:

- Dateianhänge
- Bilder
- Audio
- Video
- Typing Indicator
- Online-Status
- WebSocket

Das Büroklammer-/Attachment-Symbol aus dem Mockup wird im MVP ausgeblendet oder deaktiviert.

## 8. Notification-Bell

Die Notification-Bell aus den Mockups besitzt im MVP kein eigenes Benachrichtigungssystem.

Sie wird entweder:

- ausgeblendet, oder
- rein visuell/deaktiviert dargestellt.

Es wird dafür kein zusätzlicher Backend-Endpoint erfunden.

## 9. Profilbild

Profilbild-Upload ist nicht Teil des MVP.

Avatar-Darstellung:

- Initialen des Anzeigenamens
- deterministische Standarddarstellung im Frontend

Das Kamera-Symbol aus dem Mockup ist im MVP nicht funktional und sollte vorzugsweise entfernt werden.

## 10. Form-Validierung

Das Frontend darf für UX dieselben Grenzen wie das Backend prüfen, aber das Backend bleibt maßgeblich.

Bei `VALIDATION_ERROR` werden `fieldErrors` direkt den passenden Formularfeldern zugeordnet.

## 11. API-Aufrufe

Bei Session-Authentifizierung:

```js
fetch(url, {
  credentials: "include"
})
```

Für `POST`, `PUT`, `PATCH`, `DELETE` wird zusätzlich der CSRF-Token im Header `X-XSRF-TOKEN` gesendet.

## 12. Keine erfundenen Endpoints

Wenn für eine UI-Funktion kein Endpoint im `api-contract.md` existiert, darf das Frontend diese Funktion nicht eigenständig als funktionales Feature implementieren.

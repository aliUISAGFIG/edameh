# Frontend – kontrollierte Designüberarbeitung

Stand: 30.09.2026. Grundlage ist die vorhandene React-SPA, kein Architekturwechsel.

## Befund und erhaltene Grundlagen

Das vorhandene Designsystem besteht aus Inter, Tailwind-Tokens für hell/dunkel,
violetter Primärfarbe, Radix-Primitives und gemeinsamen Komponenten für Buttons,
Felder, Mehrfachauswahl, Seitenüberschriften, Skeletons, Fehler und Leerzustände.
Diese Komponenten werden weiterverwendet. Feature-Struktur, Lazy Loading,
TanStack Query, React Hook Form/Zod, Motion und MSW bleiben erhalten.

Die Codeprüfung zeigte einen wiederholten großen Hero auf der Anzeigenroute,
kleine bzw. rein ikonische Aktionen, viele gleichgewichtige Karten und teilweise
fehlende Verknüpfungen zwischen Formularfeldern und ihren Fehlern/Hinweisen.
Kontaktaktionen standen mobil erst hinter der gesamten Projektbeschreibung.
Die Aktualisierung im Postfach lud bisher nur die Gesprächsübersicht neu.

## Umsetzung nach Flow

| Bereich | Änderung | Erhalten |
| --- | --- | --- |
| Start | Kürzere Einführung mit konkreter Erklärung von Edameh; dekorative schwebende Karten entfernt | Einstieg in Suche und Veröffentlichung |
| Anzeigenliste | Kompakter Seitentitel statt Hero; ruhiger Filterbereich, umbruchfähige Filterchips, lesbare Details-Aktion | URL-Filter, AND-Semantik, Sortierung, Pagination |
| Registrierung / Anmeldung | Sichtbare Hauptüberschrift auch mobil; Hinweise zu Name/Passwort; konsistente Feldfehler | Validierung, Session, Rücksprungziel |
| Anzeigendetails | Kontakt/Verwaltung direkt nach dem Titel im mobilen DOM; offene Textabschnitte statt weiterer Karten | Eigentümerrechte, CLOSED-/Soft-Delete-Regeln, Kontaktbeschränkung im Mock |
| Erstellen / Bearbeiten | Bestehende drei Formularabschnitte, klarer Seitentitel, Titelhinweis und mobile Aktionsleiste | Mehrfach-Arbeitsweisen, Standortvalidierung und Request-Shape |
| Meine Anzeigen | Erkennbare Statusauswahl mit aria-pressed; eigener Leerzustand für gefilterte Ergebnisse | Bearbeiten, Schließen, Löschen und Bestätigung |
| Profil / Bearbeitung | Ruhiger Profilkopf, weniger verschachtelte Statistikflächen, primäre Bearbeitungsaktion und Eingabehinweise | Initialen, vorhandene Felder, berechnete Statistik |
| Nachrichten | Begrenzter Bereich mit getrenntem Scrollen, sichtbarer Sendetext, beschrifteter Anzeigenlink, Rückweg auch bei Gesprächsfehlern | Textnachrichten, explizite Aktualisierung, vorhandene API-Reihenfolge |

„Aktualisieren“ invalidiert zusätzlich die bereits vorhandene Nachrichten-Query
des geöffneten Gesprächs. Es gibt kein Polling, keinen neuen Endpoint und kein
Echtzeitverhalten.

## Design und Zugänglichkeit

- Bestehende Radien und violette Identität bleiben; Panels ohne Standardschatten.
- Etwas stärkere Textkontraste, separate Eingaberänder und kontrastierende
  Beschriftung destruktiver Buttons im dunklen Design.
- Wichtige mobile Bedienelemente haben mindestens 44 px Höhe. Formulareingaben
  verwenden mobil 16 px Schrift; mehrspaltige Bereiche nutzen schrumpfbare Tracks.
- Formulare ordnen Fehler und Hinweise über aria-describedby und aria-invalid zu.
  Dialogbeschreibungen haben eindeutige IDs; Escape stellt den Auslöserfokus wieder her.
- Button-Feedback 150 ms, Feldübergänge 160 ms, Menüs/Dialoge 150–180 ms,
  Filter-/Navigations-Sheets 180–220 ms. Bestehende Seiteneinblendung bleibt.
  CSS berücksichtigt prefers-reduced-motion; MotionConfig bleibt auf „user“.

## Prüfung und Grenzen

Die responsive Codeprüfung betrifft mobile, Tablet-, Laptop- und Desktop-Layouts.
Sie ersetzt keine visuelle Prüfung. Die Browserfreigabe für die lokale Vorschau
wurde abgelehnt; deshalb konnten weder Desktop-/Mobile-Screenshots noch die
visuelle Abnahme beider Themes durchgeführt werden.

Automatische Prüfungen: ESLint, TypeScript strict, Vitest einschließlich bestehender
HTTP-/Flow-Tests und Produktionsbuild. Neue Regressionstests prüfen zugängliche
Feldhinweise, Dialogfokus, die kompakte Anzeigenroute und Nachrichtenaktualisierung.
Die abschließenden Ergebnisse stehen im Änderungsprotokoll von PROJECT_CONTEXT.md.

Nächste Designprüfung nach Browserfreigabe: 390 und 1280 px in beiden Themes,
zusätzlich 320/768/1024 px für Umbruch, Navigation, Formularaktionen und Postfach;
Tastaturbedienung, Filter-Sheet, Bestätigungsdialog sowie lange Texte prüfen.

## Bewusst unverändert

Keine neue Projekt-Dependency, keine neuen Assets, keine Backend-/Datenbank-/Flyway-
Änderungen und keine Änderungen an API-Client, DTOs, Validierung oder MSW-Handlern.
Benachrichtigungen, Uploads, Anhänge und Echtzeit-Chat bleiben außerhalb des MVP.
Neue leere Unterhaltungen und zusätzliche Nachrichtenseiten bleiben wie dokumentiert
ausgesetzt. Die zusätzlichen Detailanfragen der Anzeigenkarten bleiben erhalten,
da der Anzeigentyp im Listenvertrag fehlt.

Eine vorhandene Vertragsabweichung wurde nicht im Designauftrag korrigiert:
Eigenes Profil/Profilbearbeitung verwenden im Code `arbeitsweise`, während der
aktuelle API-Vertrag dort `arbeitsweisen` zeigt. Öffentliches Profil und bestehende
Frontend-Vorgaben verwenden die Einzelauswahl. Das benötigt eine separate fachliche
Abstimmung vor der Backend-Anbindung; hier wurden weder Shape noch Verhalten geändert.

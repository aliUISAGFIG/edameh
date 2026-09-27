\# Edameh – Arbeitsregeln



Dieses Repository gehört zum langfristigen Softwareprojekt Edameh.



\## Arbeitsweise



1\. Vor Änderungen zuerst die aktuelle Projektstruktur prüfen.

2\. Bestehende Architekturentscheidungen nicht ohne Begründung ändern.

3\. Bei fehlenden Informationen nicht raten.

4\. Nur die für die Aufgabe notwendigen Bereiche ändern.

5\. Kompatibilität zwischen Klassen und Modulen erhalten.

6\. Auswirkungen einer Änderung auf abhängige Klassen prüfen.

7\. Die aktuelle Version der Repository-Dateien als Referenz verwenden.

8\. Wichtige Architekturentscheidungen und größere Änderungen in `PROJECT\_CONTEXT.md` dokumentieren.

9\. Nach größeren Aufgaben den aktuellen Stand und den nächsten Schritt nennen.

10\. Bestehenden Code nicht ohne ausdrücklichen Grund vollständig neu schreiben.

11\. Bei entscheidenden Unklarheiten zuerst nachfragen.



\## Source of Truth



Vor relevanten Änderungen die passenden Dokumente lesen:



\- `docs/product/mvp.md`

\- `docs/product/user-flows.md`

\- `docs/design/api-contract.md`

\- `docs/design/domaenenmodell.md`

\- `docs/design/datenbankentwurf.md`

\- `docs/design/projektvorbereitung.md`

\- `docs/design/frontend-vorgaben.md`



\## API



`docs/design/api-contract.md` ist die verbindliche Source of Truth für die REST-API.



Keine neuen Endpoints, Enum-Werte oder Business Rules erfinden, ohne die Dokumentation entsprechend zu ändern.



\## Architektur



\- Modularer Monolith

\- Spring Boot

\- PostgreSQL

\- Maven

\- Flyway

\- Package by Feature


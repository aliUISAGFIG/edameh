export type Arbeitsweise = 'REMOTE' | 'VOR_ORT' | 'HYBRID';
export type Anzeigentyp = 'UNTERSTUETZUNG_GESUCHT' | 'PROJEKT_GESUCHT';
export type Projektstand = 'IDEE_PLANUNG' | 'IN_ENTWICKLUNG' | 'PROTOTYP_VORHANDEN';
export type Anzeigenstatus = 'ACTIVE' | 'CLOSED';
export interface Katalogeintrag {
  id: number;
  name: string;
}
export interface Person {
  id: number;
  anzeigename: string;
}
export interface Benutzer extends Person {
  eMail: string;
}
export interface Anmeldung {
  eMail: string;
  passwort: string;
}
export interface Registrierung extends Anmeldung {
  anzeigename: string;
  passwortBestaetigung: string;
}
export interface Profil {
  benutzerId: number;
  anzeigename: string;
  ueberMich: string | null;
  standort: string | null;
  arbeitsweise: Arbeitsweise | null;
  githubLink: string | null;
  linkedinLink: string | null;
  technologien: Katalogeintrag[];
}
export interface EigenesProfil extends Profil {
  statistik: { aktiveAnzeigen: number; unterhaltungen: number; mitgliedSeit: string };
}
export interface ProfilEingabe {
  anzeigename: string;
  ueberMich: string | null;
  standort: string | null;
  arbeitsweise: Arbeitsweise | null;
  githubLink: string | null;
  linkedinLink: string | null;
  technologieIds: number[];
}
export interface AnzeigeListe {
  id: number;
  titel: string;
  beschreibungKurz: string;
  kategorie: Katalogeintrag;
  technologien: Katalogeintrag[];
  projektstand: Projektstand;
  arbeitsweisen: Arbeitsweise[];
  standort: string | null;
  status: Anzeigenstatus;
  erstelltAm: string;
}
export interface OeffentlicheAnzeige extends AnzeigeListe {
  anzeigename: string;
}
export interface Anzeige extends Omit<AnzeigeListe, 'beschreibungKurz'> {
  eigentuemer: Person;
  beschreibung: string;
  anzeigentyp: Anzeigentyp;
  projektlink: string | null;
  aktualisiertAm: string;
}
export interface AnzeigeEingabe {
  titel: string;
  beschreibung: string;
  anzeigentyp: Anzeigentyp;
  kategorieId: number;
  projektstand: Projektstand;
  arbeitsweisen: Arbeitsweise[];
  standort: string | null;
  projektlink: string | null;
  technologieIds: number[];
}
export interface Seite<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
export interface UnterhaltungVorschau {
  id: number;
  anzeige: { id: number; titel: string };
  anderePerson: Person;
  letzteNachricht: { inhalt: string; gesendetAm: string };
  ungeleseneNachrichten: number;
}
export interface Nachricht {
  id: number;
  absender: Person;
  inhalt: string;
  gesendetAm: string;
  gelesen: boolean;
}
export interface ApiFehler {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
  fieldErrors: Record<string, string>;
}

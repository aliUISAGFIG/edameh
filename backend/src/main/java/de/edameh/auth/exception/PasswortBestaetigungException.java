package de.edameh.auth.exception;

public class PasswortBestaetigungException extends RuntimeException {
    public PasswortBestaetigungException() {
        super("Passwort und Passwortbestätigung stimmen nicht überein.");
    }
}

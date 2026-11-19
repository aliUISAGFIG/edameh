package de.edameh.auth.exception;

public class EmailBereitsRegistriertException extends RuntimeException {

    public EmailBereitsRegistriertException() {
        super("Diese E-Mail-Adresse ist bereits registriert.");
    }
}
